-- init_salesdb.sql
-- Initialisation de la base de ventes pour le projet IBAM 2025

-- ⚠️ À exécuter dans la base "salesdb"
-- Exemple :
--   psql -U postgres -d salesdb -f init_salesdb.sql

-- 1) Table des ventes
DROP TABLE IF EXISTS ventes;

CREATE TABLE ventes (
    id            SERIAL PRIMARY KEY,
    produit       VARCHAR(100) NOT NULL,
    quantite      INTEGER      NOT NULL,
    prix_unitaire NUMERIC(10,2) NOT NULL,
    date_vente    TIMESTAMP    NOT NULL
);

-- 2) Données de test
INSERT INTO ventes (produit, quantite, prix_unitaire, date_vente) VALUES
    ('Laptop',  2, 500.00, '2024-01-10 10:00:00'),
    ('Phone',   1, 300.00, '2024-01-11 14:30:00'),
    ('Tablet',  5, 200.00, '2024-01-12 16:45:00'),
    ('Monitor', 3, 150.00, '2024-01-13 09:15:00'),
    ('Mouse',  10,  20.00, '2024-01-14 11:00:00'),
    ('Keyboard',4,  35.00, '2024-01-15 15:20:00');

