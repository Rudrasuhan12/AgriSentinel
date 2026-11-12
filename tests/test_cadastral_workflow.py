import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def run_cadastral_tests():
    print("=" * 60)
    print("AGRISENTINEL CADASTRAL GIS TEST SUITE")
    print("=" * 60)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:
        # 1. Login Farmer
        login_res = await client.post("/api/auth/login", json={
            "identifier": "farmer@agrisentinel.local",
            "password": "FarmerPass@2026"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Test 1 Passed: Authenticated Farmer session established.")

        # 2. Hierarchy Endpoint
        hier_res = await client.get("/api/cadastral/hierarchy")
        assert hier_res.status_code == 200, f"Hierarchy failed: {hier_res.text}"
        hier_data = hier_res.json()
        assert len(hier_data["districts"]) > 0
        cuttack = next(d for d in hier_data["districts"] if d["name"] == "Cuttack")
        assert "Baranga" in [t["name"] for t in cuttack["tahasils"]]
        print("✓ Test 2 Passed: Administrative Hierarchy returned verified Odisha districts, tahasils & mouzas.")

        # 3. Valid Khata and Plot Lookup (Plot 640/2536, Khata 299/611 in Mundali, Baranga, Cuttack)
        valid_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Mundali",
            "khata_number": "299/611",
            "plot_number": "640/2536"
        })
        assert valid_res.status_code == 200, f"Valid lookup failed: {valid_res.text}"
        valid_data = valid_res.json()
        assert valid_data["success"] is True
        assert valid_data["parcel"]["plot_number"] == "640/2536"
        assert valid_data["parcel"]["geometry"]["type"] == "Polygon"
        assert len(valid_data["parcel"]["bbox"]) == 4
        assert valid_data["parcel"]["calculated_area_acres"] > 0
        assert len(valid_data["surrounding_parcels"]) > 0
        print(f"✓ Test 3 Passed: Cadastral plot 640/2536 resolved with {len(valid_data['surrounding_parcels'])} surrounding parcels.")

        # 4. Invalid Plot Number
        invalid_plot_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Mundali",
            "khata_number": "299/611",
            "plot_number": "999999"
        })
        assert invalid_plot_res.status_code == 200
        inv_data = invalid_plot_res.json()
        assert inv_data["success"] is False
        assert inv_data["fallback_allowed"] is True
        assert "No cadastral polygon found" in inv_data["message"]
        print("✓ Test 4 Passed: Non-existent plot gracefully triggers manual digitization fallback.")

        # 5. Correct plot in the wrong village (Plot 640/2536 in Naraj instead of Mundali)
        wrong_village_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Naraj",
            "khata_number": "299/611",
            "plot_number": "640/2536"
        })
        assert wrong_village_res.status_code == 200
        wv_data = wrong_village_res.json()
        assert wv_data["success"] is False
        print("✓ Test 5 Passed: Administrative hierarchy isolation verified (plot not found in wrong village).")

        # 6. Reject Invalid Polygon with < 3 points
        bad_poly_res = await client.post("/api/farmer/parcels", headers=headers, json={
            "khata_number": "500/1",
            "plot_number": "TEST-01",
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Baranga",
            "village": "Mundali",
            "primary_crop": "Paddy (Swarna MTU)",
            "area_acres": 2.0,
            "geojson_geometry": {
                "type": "Polygon",
                "coordinates": [[[85.881, 20.461], [85.882, 20.462], [85.881, 20.461]]] # only 2 distinct points!
            }
        })
        assert bad_poly_res.status_code == 400, f"Expected 400 for < 3 points, got {bad_poly_res.status_code}"
        assert "minimum 3 distinct boundary vertices required" in bad_poly_res.json()["detail"]
        print("✓ Test 6 Passed: Polygon geometry validation rejected degenerate 2-point polygon.")

        # 7. Successful Parcel Registration with Verified Cadastral Boundary
        reg_res = await client.post("/api/farmer/parcels", headers=headers, json={
            "khata_number": "299/611",
            "plot_number": "640/2536",
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Baranga",
            "village": "Mundali",
            "primary_crop": "Paddy (Swarna MTU-7029)",
            "area_acres": valid_data["parcel"]["recorded_area_acres"],
            "geojson_geometry": valid_data["parcel"]["geometry"],
            "cadastral_source": valid_data["parcel"]["source"]
        })
        assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
        reg_data = reg_res.json()
        assert reg_data["verification_status"] == "VERIFIED"
        assert reg_data["plot_number"] == "640/2536"
        print("✓ Test 7 Passed: Successfully persisted official cadastral parcel to PostGIS with VERIFIED status.")

        # 8. Duplicate Registration Prevention
        dup_res = await client.post("/api/farmer/parcels", headers=headers, json={
            "khata_number": "299/611",
            "plot_number": "640/2536",
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Baranga",
            "village": "Mundali",
            "primary_crop": "Paddy (Swarna MTU-7029)",
            "area_acres": valid_data["parcel"]["recorded_area_acres"],
            "geojson_geometry": valid_data["parcel"]["geometry"],
        })
        assert dup_res.status_code == 409, f"Expected 409 conflict, got {dup_res.status_code}"
        assert "already registered" in dup_res.json()["detail"]
        print("✓ Test 8 Passed: Duplicate parcel registration correctly prevented with 409 Conflict.")

        # 9. Unauthorized Request Prevention
        unauth_res = await client.post("/api/farmer/parcels", json={
            "khata_number": "299/611",
            "plot_number": "640/2536",
            "state": "Odisha",
            "district": "Cuttack",
            "sub_district": "Baranga",
            "village": "Mundali",
            "area_acres": 2.0
        })
        assert unauth_res.status_code == 401 or unauth_res.status_code == 403
        print("✓ Test 9 Passed: Security perimeter confirmed (unauthenticated requests blocked).")

    print("=" * 60)
    print("ALL 9 CRITICAL INTEGRATION TESTS PASSED CLEANLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_cadastral_tests())
