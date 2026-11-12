import os
import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"
TEST_DIR = os.path.join(os.path.dirname(__file__), "sample_patta")

async def run_patta_tests():
    print("=" * 70)
    print("AGRISENTINEL PATTA / ROR UPLOAD & AI AUTO-FILL TEST SUITE")
    print("=" * 70)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Login as Farmer
        login_res = await client.post("/api/auth/login", json={
            "identifier": "farmer@agrisentinel.local",
            "password": "FarmerPass@2026"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Test 1: Authenticated Farmer session verified.")

        # 2. Upload and Extract Patta Image (JPG)
        jpg_path = os.path.join(TEST_DIR, "odisha_patta_cuttack_sample.jpg")
        with open(jpg_path, "rb") as f:
            files = {"file": ("odisha_patta_cuttack_sample.jpg", f, "image/jpeg")}
            upload_res = await client.post("/api/documents/upload-patta", headers=headers, files=files)
        
        assert upload_res.status_code == 200, f"Patta JPG upload failed: {upload_res.text}"
        data = upload_res.json()
        assert data["success"] is True
        fields = data["extracted_fields"]
        assert fields["state"] == "Odisha"
        assert fields["district"] == "Cuttack"
        assert fields["tahasil"] == "Cuttack"
        assert "Andarpur" in fields["village"]
        assert fields["thana"] == "Madhupatna"
        assert fields["khata_number"] == "299/611"
        assert fields["plot_number"] == "640/2536"
        assert fields["land_classification"] == "Gharabari"
        assert abs(fields["area_acres"] - 0.0440) < 0.001
        assert abs(fields["area_hectares"] - 0.0178) < 0.001
        assert data["cadastral_polygon_found"] is True
        assert data["overall_confidence"] > 0.90
        print("✓ Test 2: Odisha Patta (JPG) uploaded, extracted with Deep Learning OCR, and matched to PostGIS.")

        # 3. Upload and Extract Scanned Patta PDF
        pdf_path = os.path.join(TEST_DIR, "odisha_patta_cuttack_sample.pdf")
        with open(pdf_path, "rb") as f:
            files = {"file": ("odisha_patta_cuttack_sample.pdf", f, "application/pdf")}
            pdf_res = await client.post("/api/documents/upload-patta", headers=headers, files=files)
        
        assert pdf_res.status_code == 200, f"Patta PDF upload failed: {pdf_res.text}"
        pdf_data = pdf_res.json()
        assert pdf_data["success"] is True
        pdf_fields = pdf_data["extracted_fields"]
        assert pdf_fields["district"] == "Cuttack"
        assert pdf_fields["khata_number"] == "299/611"
        assert pdf_fields["plot_number"] == "640/2536"
        assert pdf_data["cadastral_polygon_found"] is True
        print("✓ Test 3: Odisha Patta (PDF) processed via layout rendering & OCR pipeline with full fidelity.")

        # 4. List Farmer's Uploaded Patta Documents
        list_res = await client.get("/api/documents/patta", headers=headers)
        assert list_res.status_code == 200
        docs = list_res.json()
        assert len(docs) >= 2
        assert any(d["extracted_fields"]["plot_number"] == "640/2536" for d in docs)
        print(f"✓ Test 4: Farmer's document registry queried: {len(docs)} authentic Patta documents verified.")

        # 5. Review & Confirm Document
        doc_id = data["document_id"]
        confirm_res = await client.post(f"/api/documents/patta/{doc_id}/confirm", headers=headers, json={
            "verified_fields": fields
        })
        assert confirm_res.status_code == 200
        assert confirm_res.json()["success"] is True
        print("✓ Test 5: Farmer reviewed and confirmed document status in PostgreSQL.")

        # 6. Handshake with Cadastral Lookup
        # The extracted fields feed directly into cadastral lookup
        cad_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": fields["state"],
            "district": fields["district"],
            "tahasil": fields["tahasil"],
            "village": fields["village"],
            "khata_number": fields["khata_number"],
            "plot_number": fields["plot_number"]
        })
        assert cad_res.status_code == 200
        cad_data = cad_res.json()
        assert cad_data["success"] is True
        assert cad_data["parcel"]["plot_number"] == "640/2536"
        assert cad_data["parcel"]["geometry"]["type"] == "Polygon"
        print("✓ Test 6: Automated handshake between AI extracted Patta and PostGIS cadastral polygon verified.")

    print("\n" + "=" * 70)
    print("ALL 6 PATTA EXTRACTION & GIS HANDSHAKE INTEGRATION TESTS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_patta_tests())

