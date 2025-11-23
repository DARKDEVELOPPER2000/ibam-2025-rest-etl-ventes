# ETL – PostgreSQL → MongoDB

Ce dossier contient le code de l’ETL qui transfère les données de ventes
depuis **PostgreSQL** vers **MongoDB**.

- Script principal : `etl_pg_to_mongo.py`
- Dépendances : `requirements.txt`

---

## 1. Rôle du script

Le script `etl_pg_to_mongo.py` :

1. Se connecte à la base **PostgreSQL** `salesdb`.
2. Lit toutes les lignes de la table `ventes` :
   - `id`, `produit`, `quantite`, `prix_unitaire`, `date_vente`.
3. Calcule pour chaque vente :

   ```text
   montant_total = quantite * prix_unitaire
