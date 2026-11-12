import asyncio
from sqlalchemy import text
from app.database import engine, AsyncSessionLocal, Base
from app.models.administrative import AdministrativeDistrict, AdministrativeTahasil, AdministrativeVillage


# Authoritative Odisha 30 Districts (LGD Codes & Headquarters)
ODISHA_30_DISTRICTS = [
    {"name": "Angul", "code": "ANG", "lgd": "343", "hq": "Angul"},
    {"name": "Balangir", "code": "BLG", "lgd": "344", "hq": "Balangir"},
    {"name": "Balasore", "code": "BLS", "lgd": "345", "hq": "Balasore"},
    {"name": "Bargarh", "code": "BRG", "lgd": "346", "hq": "Bargarh"},
    {"name": "Bhadrak", "code": "BHD", "lgd": "347", "hq": "Bhadrak"},
    {"name": "Boudh", "code": "BOD", "lgd": "348", "hq": "Boudh"},
    {"name": "Cuttack", "code": "CUT", "lgd": "349", "hq": "Cuttack"},
    {"name": "Deogarh", "code": "DEO", "lgd": "350", "hq": "Deogarh"},
    {"name": "Dhenkanal", "code": "DHK", "lgd": "351", "hq": "Dhenkanal"},
    {"name": "Gajapati", "code": "GAJ", "lgd": "352", "hq": "Paralakhemundi"},
    {"name": "Ganjam", "code": "GNJ", "lgd": "353", "hq": "Chhatrapur"},
    {"name": "Jagatsinghpur", "code": "JAG", "lgd": "354", "hq": "Jagatsinghpur"},
    {"name": "Jajpur", "code": "JAJ", "lgd": "355", "hq": "Jajpur"},
    {"name": "Jharsuguda", "code": "JHG", "lgd": "356", "hq": "Jharsuguda"},
    {"name": "Kalahandi", "code": "KAL", "lgd": "357", "hq": "Bhawanipatna"},
    {"name": "Kandhamal", "code": "KND", "lgd": "358", "hq": "Phulbani"},
    {"name": "Kendrapara", "code": "KEN", "lgd": "359", "hq": "Kendrapara"},
    {"name": "Kendujhar", "code": "KJR", "lgd": "360", "hq": "Kendujhar"},
    {"name": "Khordha", "code": "KHD", "lgd": "361", "hq": "Bhubaneswar"},
    {"name": "Koraput", "code": "KOR", "lgd": "362", "hq": "Koraput"},
    {"name": "Malkangiri", "code": "MLK", "lgd": "363", "hq": "Malkangiri"},
    {"name": "Mayurbhanj", "code": "MAY", "lgd": "364", "hq": "Baripada"},
    {"name": "Nabarangpur", "code": "NAB", "lgd": "365", "hq": "Nabarangpur"},
    {"name": "Nayagarh", "code": "NAY", "lgd": "366", "hq": "Nayagarh"},
    {"name": "Nuapada", "code": "NUA", "lgd": "367", "hq": "Nuapada"},
    {"name": "Puri", "code": "PRI", "lgd": "368", "hq": "Puri"},
    {"name": "Rayagada", "code": "RAY", "lgd": "369", "hq": "Rayagada"},
    {"name": "Sambalpur", "code": "SAM", "lgd": "370", "hq": "Sambalpur"},
    {"name": "Subarnapur", "code": "SUB", "lgd": "371", "hq": "Sonepur"},
    {"name": "Sundargarh", "code": "SUN", "lgd": "372", "hq": "Sundargarh"},
]

# Authoritative Tahasils and Mouzas / Villages
TAHASIL_VILLAGES_CATALOG = {
    "Cuttack": {
        "Baranga": [
            "Mundali", "Naraj", "Madhupatna", "Ramdaspur", "Trisulia", 
            "Belagachhia", "Kurangpradhan", "Nagari", "Kalyanpur", "Brajabiharpur"
        ],
        "Cuttack Sadar": [
            "Choudwar", "Jagatpur", "Bidyadharpur", "Telengapentha", "Paramahansa", 
            "Naya Bazar", "Chauliaganj", "Kandarpur", "Sankarpur"
        ],
        "Athagarh": [
            "Radhanagar", "Dorada", "Gobindapur", "Samsarpur", "Ghantisa", "Khuntuni"
        ],
        "Banki": [
            "Banki", "Charchika", "Pathapur", "Talabasta", "Kalapathar"
        ],
        "Salipur": [
            "Salipur", "Machhagan", "Balichandrapur", "Kusunpur", "Nischintakoili"
        ],
        "Tangi-Choudwar": [
            "Tangi", "Manguli", "Kotsahi", "Bhatimunda", "Safipur"
        ],
        "Badamba": [
            "Badamba", "Maniabandha", "Gopinathpur", "Bhattarika"
        ],
        "Niali": [
            "Niali", "Madhaba", "Kasarda", "Pokharigaon"
        ]
    },
    "Khordha": {
        "Bhubaneswar": [
            "Patia", "Chandaka", "Jatni", "Mendhasal", "Baramunda", 
            "Raghunathpur", "Khandagiri", "Nayapalli", "Tamando"
        ],
        "Balianta": [
            "Bhingarpur", "Pratapsasan", "Satyabhamapur", "Benupur", "Purusottampur"
        ],
        "Jatni": [
            "Kudiary", "Kantabad", "Bachhara", "Harirajpur"
        ],
        "Khordha": [
            "Gurujanga", "Bajpur", "Tapang", "Mukundaprasad"
        ]
    },
    "Puri": {
        "Puri": [
            "Baliguali", "Sipasarubali", "Samang", "Gopinathpur", "Chhaitana"
        ],
        "Pipili": [
            "Dandamukundapur", "Teisipur", "Govindpur", "Khandayatpur", "Saraswatipur"
        ],
        "Nimapada": [
            "Alanda", "Bhaunri", "Antuar", "Sagada", "Dhanua"
        ],
        "Brahmagiri": [
            "Alarnath", "Satapada", "Rebana", "Nuagaon"
        ]
    },
    "Balasore": {
        "Balasore": [
            "Remuna", "Mandarpur", "Patripal", "Baleshwar Sadar", "Sahadevkhunta"
        ],
        "Remuna": [
            "Gopinathpur", "Kalyani", "Nuapadhi", "Khantapada"
        ],
        "Soro": [
            "Soro", "Anantapur", "Chapolia", "Mangalpur"
        ],
        "Jaleswar": [
            "Jaleswar", "Raibania", "Sugalo", "Laxmannath"
        ]
    },
    "Sambalpur": {
        "Sambalpur": [
            "Burla", "Hirakud", "Dhanupali", "Khetrajpur", "Ainthapali"
        ],
        "Rengali": [
            "Rengali", "Lapanga", "Nishankuda", "Salad"
        ]
    },
    "Ganjam": {
        "Chhatrapur": [
            "Chhatrapur", "Agasthi Nuagam", "Aryapalli", "Bipulingi"
        ],
        "Brahmapur": [
            "Ankushpur", "Golanthara", "Lathi", "Haladiapadara"
        ]
    }
}


async def seed_administrative_data():
    async with engine.begin() as conn:
        print("[Administrative] Ensuring tables and columns exist...")
        await conn.run_sync(Base.metadata.create_all)

        # Alter farmer_parcels to add new columns if missing
        alter_stmts = [
            "ALTER TABLE farmer_parcels ADD COLUMN IF NOT EXISTS recorded_area_acres double precision;",
            "ALTER TABLE farmer_parcels ADD COLUMN IF NOT EXISTS calculated_area_acres double precision;",
            "ALTER TABLE farmer_parcels ADD COLUMN IF NOT EXISTS farmer_entered_area double precision;",
            "ALTER TABLE farmer_parcels ADD COLUMN IF NOT EXISTS cadastral_reference varchar(100);"
        ]
        for s in alter_stmts:
            await conn.execute(text(s))
        print("[Administrative] Schema migrations verified.")

    async with AsyncSessionLocal() as session:
        print(f"[Administrative] Seeding {len(ODISHA_30_DISTRICTS)} official Odisha districts...")
        for dist in ODISHA_30_DISTRICTS:
            # Check or insert district
            existing = await session.execute(
                text("SELECT id FROM administrative_districts WHERE district_name = :name"),
                {"name": dist["name"]}
            )
            d_id = existing.scalar_one_or_none()
            if not d_id:
                ins = await session.execute(
                    text("""
                        INSERT INTO administrative_districts (id, state_code, district_name, district_code, lgd_code, headquarters)
                        VALUES (gen_random_uuid(), 'OD', :name, :code, :lgd, :hq)
                        RETURNING id
                    """),
                    {"name": dist["name"], "code": dist["code"], "lgd": dist["lgd"], "hq": dist["hq"]}
                )
                d_id = ins.scalar_one()

            # Seed tahasils and villages if in catalog
            if dist["name"] in TAHASIL_VILLAGES_CATALOG:
                tahasils_map = TAHASIL_VILLAGES_CATALOG[dist["name"]]
                for tahasil_name, villages in tahasils_map.items():
                    t_res = await session.execute(
                        text("SELECT id FROM administrative_tahasils WHERE district_name = :dname AND tahasil_name = :tname"),
                        {"dname": dist["name"], "tname": tahasil_name}
                    )
                    t_id = t_res.scalar_one_or_none()
                    if not t_id:
                        t_code = f"{dist['code'][:2]}-{tahasil_name[:3].upper()}"
                        ins_t = await session.execute(
                            text("""
                                INSERT INTO administrative_tahasils (id, district_id, district_name, tahasil_name, tahasil_code, lgd_code)
                                VALUES (gen_random_uuid(), :d_id, :dname, :tname, :tcode, :lgd)
                                RETURNING id
                            """),
                            {"d_id": d_id, "dname": dist["name"], "tname": tahasil_name, "tcode": t_code, "lgd": None}
                        )
                        t_id = ins_t.scalar_one()

                    for v_name in villages:
                        v_res = await session.execute(
                            text("SELECT id FROM administrative_villages WHERE tahasil_name = :tname AND village_name = :vname"),
                            {"tname": tahasil_name, "vname": v_name}
                        )
                        if not v_res.scalar_one_or_none():
                            await session.execute(
                                text("""
                                    INSERT INTO administrative_villages (id, tahasil_id, district_name, tahasil_name, village_name, mouza_code, revenue_circle, ri_circle)
                                    VALUES (gen_random_uuid(), :t_id, :dname, :tname, :vname, :mcode, :rc, :ri)
                                """),
                                {
                                    "t_id": t_id,
                                    "dname": dist["name"],
                                    "tname": tahasil_name,
                                    "vname": v_name,
                                    "mcode": f"{dist['code'][:2]}-{v_name[:4].upper()}",
                                    "rc": f"{tahasil_name} Circle",
                                    "ri": f"{v_name} RI"
                                }
                            )

            else:
                # Provide default Headquarters Tahasil and Sadar Village for the other districts
                t_res = await session.execute(
                    text("SELECT id FROM administrative_tahasils WHERE district_name = :dname AND tahasil_name = :tname"),
                    {"dname": dist["name"], "tname": f"{dist['name']} Sadar"}
                )
                t_id = t_res.scalar_one_or_none()
                if not t_id:
                    ins_t = await session.execute(
                        text("""
                            INSERT INTO administrative_tahasils (id, district_id, district_name, tahasil_name, tahasil_code, lgd_code)
                            VALUES (gen_random_uuid(), :d_id, :dname, :tname, :tcode, :lgd)
                            RETURNING id
                        """),
                        {"d_id": d_id, "dname": dist["name"], "tname": f"{dist['name']} Sadar", "tcode": f"{dist['code']}-SDR", "lgd": None}
                    )
                    t_id = ins_t.scalar_one()

                    await session.execute(
                        text("""
                            INSERT INTO administrative_villages (id, tahasil_id, district_name, tahasil_name, village_name, mouza_code, revenue_circle, ri_circle)
                            VALUES (gen_random_uuid(), :t_id, :dname, :tname, :vname, :mcode, :rc, :ri)
                        """),
                        {
                            "t_id": t_id,
                            "dname": dist["name"],
                            "tname": f"{dist['name']} Sadar",
                            "vname": f"{dist['hq']} Mouza",
                            "mcode": f"{dist['code']}-001",
                            "rc": "Sadar Circle",
                            "ri": "Central RI"
                        }
                    )

        await session.commit()
        print("[Administrative] Master data seeding completed successfully.")


if __name__ == "__main__":
    asyncio.run(seed_administrative_data())

