import psycopg2
from pymongo import MongoClient

# ---------- CONFIG POSTGRES ----------
PG_CONFIG = {
    "host": "localhost",         # adapte si besoin
    "port": 5432,
    "database": "salesdb",       # ta base Postgres
    "user": "postgres",          # ton user Postgres
    "password": "Wpharell2000@",  # <--- à changer
}

# ---------- CONFIG MONGO ----------
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "salesdb_mongo"
MONGO_COLLECTION = "ventes"


def extract_from_postgres():
    """Lit les ventes depuis PostgreSQL."""
    conn = psycopg2.connect(**PG_CONFIG)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, produit, quantite, prix_unitaire, date_vente
        FROM ventes
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    ventes = []
    for r in rows:
        vente = {
            "id": r[0],                    # id Postgres
            "produit": r[1],
            "quantite": r[2],
            "prix_unitaire": float(r[3]),
            "date_vente": r[4].isoformat()
        }
        ventes.append(vente)
    return ventes


def transform(ventes):
    """Ajoute le montant_total = quantite * prix_unitaire."""
    for v in ventes:
        v["montant_total"] = v["quantite"] * v["prix_unitaire"]
    return ventes


def load_into_mongo(ventes):
    """Charge les données dans MongoDB (collection ventes)."""
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    col = db[MONGO_COLLECTION]

    # Ici on fait un upsert par id pour éviter les doublons
    for v in ventes:
        col.update_one(
            {"id": v["id"]},     # critère
            {"$set": v},         # données à mettre à jour
            upsert=True
        )

    client.close()


def main():
    print("Extraction depuis PostgreSQL…")
    ventes = extract_from_postgres()
    print(f"{len(ventes)} lignes extraites")

    print("Transformation…")
    ventes = transform(ventes)

    print("Chargement dans MongoDB…")
    load_into_mongo(ventes)
    print("✅ ETL terminé !")


if __name__ == "__main__":
    main()
