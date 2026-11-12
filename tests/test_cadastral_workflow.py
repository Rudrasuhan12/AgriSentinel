import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def run_cadastral_tests():
    print("=" * 70)
    print("AGRISENTINEL COMPLETE GIS PARCEL REGISTRATION & VIEWER TEST SUITE")
    print("=" * 70)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=15.0) as client:
        # Test 1: Authenticated Session
        login_res = await client.post("/api/auth/login", json={
            "identifier": "farmer@agrisentinel.local",
            "password": "FarmerPass@2026"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("✓ Test 1: Authenticated Farmer session established.")

        # Test 2: Load complete official Odisha districts
        dist_res = await client.get("/api/administrative/districts")
        assert dist_res.status_code == 200, f"Districts failed: {dist_res.text}"
        districts = dist_res.json()
        assert len(districts) == 30, f"Expected 30 Odisha districts, got {len(districts)}"
        cuttack = next(d for d in districts if d["district_name"] == "Cuttack")
        assert cuttack["lgd_code"] == "349"
        print(f"✓ Test 2: Loaded all {len(districts)} official Odisha districts with LGD codes.")

        # Test 3: Load Tahasils dynamically for selected district
        tah_res = await client.get("/api/administrative/tahasils?district=Cuttack")
        assert tah_res.status_code == 200
        tahasils = tah_res.json()
        assert len(tahasils) >= 8
        assert "Baranga" in [t["tahasil_name"] for t in tahasils]
        print(f"✓ Test 3: Loaded {len(tahasils)} verified Tahasils for Cuttack District.")

        # Test 4: Load Villages for Tahasil & Search administrative names
        vil_res = await client.get("/api/administrative/villages?tahasil=Baranga")
        assert vil_res.status_code == 200
        villages = vil_res.json()
        assert len(villages) >= 10
        assert "Mundali" in [v["village_name"] for v in villages]

        # Search filter test
        search_res = await client.get("/api/administrative/villages?tahasil=Baranga&search=Mund")
        assert search_res.status_code == 200
        search_results = search_res.json()
        assert len(search_results) == 1
        assert search_results[0]["village_name"] == "Mundali"
        print(f"✓ Test 4: Loaded {len(villages)} revenue mouzas for Baranga Tahasil with search filter working.")

        # Test 5: Find valid cadastral plot (Plot 640/2536 in Mundali, Baranga, Cuttack)
        lookup_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Mundali",
            "khata_number": "299/611",
            "plot_number": "640/2536"
        })
        assert lookup_res.status_code == 200
        lookup_data = lookup_res.json()
        assert lookup_data["success"] is True
        assert lookup_data["parcel"]["plot_number"] == "640/2536"
        assert lookup_data["parcel"]["geometry"]["type"] == "Polygon"
        assert len(lookup_data["parcel"]["bbox"]) == 4
        print(f"✓ Test 5: Cadastral plot 640/2536 resolved with exact bounding box {lookup_data['parcel']['bbox']}.")

        # Test 6: Handle non-existent plot
        inv_plot_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Mundali",
            "khata_number": "299/611",
            "plot_number": "999999"
        })
        assert inv_plot_res.status_code == 200
        assert inv_plot_res.json()["success"] is False
        assert inv_plot_res.json()["fallback_allowed"] is True
        print("✓ Test 6: Non-existent plot gracefully triggers manual digitization fallback.")

        # Test 7: Administrative hierarchy isolation
        iso_res = await client.post("/api/cadastral/lookup", headers=headers, json={
            "state": "Odisha",
            "district": "Cuttack",
            "tahasil": "Baranga",
            "village": "Naraj",
            "khata_number": "299/611",
            "plot_number": "640/2536"
        })
        assert iso_res.status_code == 200
        assert iso_res.json()["success"] is False
        print("✓ Test 7: Hierarchy isolation verified (plot 640/2536 not returned in wrong village Naraj).")

        # Test 8: Degenerate Polygon Rejection (< 3 points)
        bad_res = await client.post("/api/farmer/parcels", headers=headers, json={
            "khata_number": "100/1",
            "plot_number": "TEST-DEGEN",
            "district": "Cuttack",
            "sub_district": "Baranga",
            "village": "Mundali",
            "area_acres": 1.0,
            "geojson_geometry": {
                "type": "Polygon",
                "coordinates": [[[85.88, 20.46], [85.89, 20.47], [85.88, 20.46]]]
            }
        })
        assert bad_res.status_code == 400
        assert "minimum 3 distinct boundary vertices required" in bad_res.json()["detail"]
        print("✓ Test 8: Degenerate 2-point polygon correctly rejected with 400 Bad Request.")

        # Test 9: Get Farmer Parcels List
        parcels_res = await client.get("/api/farmer/parcels", headers=headers)
        assert parcels_res.status_code == 200
        parcels_list = parcels_res.json()
        assert len(parcels_list) > 0
        target_parcel = next((p for p in parcels_list if p["plot_number"] == "640/2536"), parcels_list[0])
        parcel_id = target_parcel["id"]
        print(f"✓ Test 9: Retrieved {len(parcels_list)} farmer parcels; testing target parcel {target_parcel['parcel_code']}.")

        # Test 10: Retrieve Single Parcel Record by ID
        single_res = await client.get(f"/api/farmer/parcels/{parcel_id}", headers=headers)
        assert single_res.status_code == 200
        p_detail = single_res.json()
        assert p_detail["id"] == parcel_id
        assert p_detail["geojson_geometry"] is not None
        assert p_detail["bbox"] is not None
        assert p_detail["area_acres"] > 0
        print(f"✓ Test 10: Single parcel {p_detail['parcel_code']} loaded with full geometry and bounding box.")

        # Test 11: Export Raw GeoJSON Feature for GIS viewer
        geom_res = await client.get(f"/api/farmer/parcels/{parcel_id}/geometry", headers=headers)
        assert geom_res.status_code == 200
        feat = geom_res.json()
        assert feat["type"] == "Feature"
        assert feat["geometry"]["type"] == "Polygon"
        assert "parcel_code" in feat["properties"]
        print("✓ Test 11: Raw GeoJSON Feature exported successfully with spatial properties.")

        # Test 12: Duplicate Registration Prevention
        dup_res = await client.post("/api/farmer/parcels", headers=headers, json={
            "khata_number": target_parcel["khata_number"],
            "plot_number": target_parcel["plot_number"],
            "district": target_parcel["district"],
            "sub_district": target_parcel["sub_district"],
            "village": target_parcel["village"],
            "area_acres": target_parcel["area_acres"],
            "geojson_geometry": target_parcel["geojson_geometry"],
        })
        assert dup_res.status_code == 409
        assert "already registered" in dup_res.json()["detail"]
        print(f"✓ Test 12: Duplicate registration for Plot #{target_parcel['plot_number']} prevented with 409 Conflict.")

        # Test 13: Area Discrepancy Integrity
        assert p_detail["recorded_area_acres"] is not None
        assert p_detail["calculated_area_acres"] is not None
        print(f"✓ Test 13: Area provenance verified (Recorded: {p_detail['recorded_area_acres']} Ac, Calculated: {p_detail['calculated_area_acres']} Ac).")

        # Test 14: Unauthorized Access Prevention
        unauth_res = await client.get(f"/api/farmer/parcels/{parcel_id}")
        assert unauth_res.status_code in [401, 403]
        print("✓ Test 14: Security perimeter verified: unauthenticated requests blocked.")

    print("=" * 70)
    print("ALL 14 CADASTRAL & GEOSPATIAL INTEGRATION TESTS PASSED CLEANLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_cadastral_tests())
