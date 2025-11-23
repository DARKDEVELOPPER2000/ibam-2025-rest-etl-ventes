# IBAM 2025 – Application RESTful de ventes avec ETL et monitoring

Ce projet met en place une chaîne complète de données autour des ventes :

- Base relationnelle **PostgreSQL** pour stocker les ventes.
- Processus **ETL Python** pour charger les données dans **MongoDB**.
- API **RESTful Node.js / Express** pour exposer les ventes (CRUD).
- Monitoring de l’API avec **Prometheus + Grafana**.
- Un fichier **DAG Apache Airflow** décrivant l’ETL (configuration demandée dans l’énoncé).

> Projet réalisé dans le cadre du module  
> **« Développement de base de composants et services web – IBAM 2025 »**.

---

## 1. Architecture générale

```text
PostgreSQL (salesdb.ventes)
        │
        │  ETL Python  (etl/etl_pg_to_mongo.py)
        ▼
MongoDB (salesdb_mongo.ventes)
        │
        │  API Node / Express (api/server.js)
        ▼
Clients (Postman, navigateur) + Monitoring (Prometheus + Grafana)
```

Un DAG Airflow (`airflow/etl_ventes_to_mongo_dag.py`) décrit le même ETL
sous forme de tâches `extract -> transform -> load`.

---

## 2. Prérequis

- Git  
- **Python 3.10+**  
- **Node.js 18+**  
- **PostgreSQL** (port par défaut 5432)  
- **MongoDB** (port par défaut 27017)  
- **Prometheus** (binaire `prometheus`)  
- **Grafana** (service ou Docker)

> Airflow n’est pas nécessaire pour lancer les tests, mais le DAG est fourni
> pour répondre à la consigne de l’énoncé.

---

## 3. Installation de la base PostgreSQL

1. Créer la base `salesdb` (si elle n’existe pas) :

```sql
CREATE DATABASE salesdb;
```

2. Exécuter le script SQL fourni :

```bash
psql -U postgres -d salesdb -f sql/init_salesdb.sql
```

Ce script :

- crée la table `ventes`  
- insère quelques lignes de test (Laptop, Phone, Tablet, etc.)

---

## 4. Exécution de l’ETL (PostgreSQL → MongoDB)

Tout le code ETL se trouve dans le dossier `etl/`.

```bash
cd etl
python -m venv venv
venv\Scripts\activate      # sous Windows
# source venv/bin/activate # sous Linux / macOS

pip install -r requirements.txt
```

Éditer ensuite le fichier `etl_pg_to_mongo.py` pour vérifier
la configuration Postgres :

```python
PG_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "salesdb",
    "user": "postgres",
    "password": "VOTRE_MOT_DE_PASSE_ICI",
}
```

Puis exécuter l’ETL :

```bash
python etl_pg_to_mongo.py
```

Résultat attendu :

- Les ventes de PostgreSQL sont lues.  
- Le champ `montant_total = quantite * prix_unitaire` est calculé.  
- Les documents sont insérés / mis à jour dans MongoDB :
  - base : `salesdb_mongo`
  - collection : `ventes`

Vous pouvez vérifier dans MongoDB Compass.

---

## 5. Lancer l’API REST Node / Express

Tout le code de l’API se trouve dans le dossier `api/`.

```bash
cd api
npm install
npm start
```

L’API écoute sur `http://localhost:4000`.

### Endpoints principaux

- `GET /` – ping de l’API.  
- `GET /ventes` – liste des ventes (provenant de MongoDB).  
- `GET /ventes/:id` – détail d’une vente.  
- `POST /ventes` – ajout d’une vente.  
- `PUT /ventes/:id` – modification d’une vente.  
- `DELETE /ventes/:id` – suppression d’une vente.  
- `GET /metrics` – métriques Prometheus de l’API.

Ces routes peuvent être testées avec **Postman** ou tout autre client HTTP.

---

## 6. Monitoring avec Prometheus et Grafana

### 6.1. Prometheus

Le fichier de configuration se trouve dans `monitoring/prometheus.yml`.

Lancer Prometheus depuis ce dossier :

```bash
cd monitoring
prometheus --config.file=prometheus.yml
```

Prometheus est disponible sur : `http://localhost:9090`.

Le job `node-sales-api` scrute les métriques exposées par l’API :

```yaml
- job_name: "node-sales-api"
  static_configs:
    - targets: ["localhost:4000"]
      labels:
        app: "sales-api"
```

### 6.2. Grafana

1. Démarrer Grafana et ouvrir `http://localhost:3000`.  
2. Ajouter une **datasource Prometheus** :
   - Type : Prometheus  
   - URL : `http://localhost:9090`  
3. Importer le dashboard :

   - Aller dans **Dashboards → New → Import**.  
   - Choisir le fichier `monitoring/dashboard_grafana.json`.  
   - Sélectionner la datasource Prometheus et valider.

Le dashboard affiche notamment :

- Les requêtes HTTP par méthode et code (`GET /ventes`, 200, 404, etc.).  
- Le taux de requêtes (req/s) via `rate(http_request_duration_seconds_count[5m])`.  
- La mémoire utilisée par le process Node via `process_resident_memory_bytes`.

---

## 7. DAG Apache Airflow (optionnel / configuration)

Le dossier `airflow/` contient le fichier :

- `etl_ventes_to_mongo_dag.py`

Ce DAG décrit le même ETL que le script Python, sous forme de 3 tâches :

- `extract` : lecture des ventes dans PostgreSQL.  
- `transform` : calcul du `montant_total`.  
- `load` : upsert des données dans MongoDB.

Sur une installation Airflow fonctionnelle, il suffirait :

1. De copier ce fichier dans le répertoire `dags/` d’Airflow.  
2. D’activer le DAG `etl_ventes_to_mongo` dans l’interface web.  
3. De lancer un run manuel ou de laisser le `schedule_interval="@daily"`.

Dans le cadre de ce projet, **les tests sont réalisés via le script Python**
(`etl/etl_pg_to_mongo.py`), le DAG est fourni comme **configuration Airflow**
conforme à l’énoncé du sujet IBAM 2025.

---
