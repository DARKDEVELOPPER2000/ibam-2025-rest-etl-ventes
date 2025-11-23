from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

import psycopg2
from pymongo import MongoClient

# ---------- CONFIG POSTGRES ----------
PG_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "salesdb",      # ta base Postgres
    "user": "postgres",         # ton user Postgres
    "password": "Wpharell2000@",  # <-- le même que dans ton script ETL
}

# ---------- CONFIG MONGO ----------
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "salesdb_mongo"
MONGO_COLLECTION = "ventes"


def extract_from_postgres(**context):
    """Task Airflow : lire les ventes depuis PostgreSQL."""
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
            "id": r[0],
            "produit": r[1],
            "quantite": r[2],
            "prix_unitaire": float(r[3]),
            "date_vente": r[4].isoformat()
        }
        ventes.append(vente)

    # le return va dans XCom automatiquement
    return ventes


def transform_ventes(**context):
    """Task Airflow : ajouter montant_total."""
    ti = context["ti"]
    ventes = ti.xcom_pull(task_ids="extract")

    for v in ventes:
        v["montant_total"] = v["quantite"] * v["prix_unitaire"]

    return ventes


def load_into_mongo(**context):
    """Task Airflow : charger dans MongoDB."""
    ti = context["ti"]
    ventes = ti.xcom_pull(task_ids="transform")

    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    col = db[MONGO_COLLECTION]

    # upsert par id pour éviter les doublons
    for v in ventes:
        col.update_one(
            {"id": v["id"]},
            {"$set": v},
            upsert=True
        )

    client.close()


# --------- Définition du DAG ---------
with DAG(
    dag_id="etl_ventes_to_mongo",
    start_date=datetime(2024, 1, 1),
    schedule_interval="@daily",   # une fois par jour
    catchup=False,
    tags=["etl", "ventes"],
) as dag:

    extract_task = PythonOperator(
        task_id="extract",
        python_callable=extract_from_postgres,
    )

    transform_task = PythonOperator(
        task_id="transform",
        python_callable=transform_ventes,
    )

    load_task = PythonOperator(
        task_id="load",
        python_callable=load_into_mongo,
    )

    # Ordre des tâches
    extract_task >> transform_task >> load_task
