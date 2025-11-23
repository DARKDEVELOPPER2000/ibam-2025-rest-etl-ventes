// models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    // id de la vente dans PostgreSQL (ETL)
    id: { type: Number, required: true, unique: true },

    produit: { type: String, required: true },
    quantite: { type: Number, required: true },
    prix_unitaire: { type: Number, required: true },
    montant_total: { type: Number, required: true },
    date_vente: { type: Date, required: true },
  },
  {
    timestamps: true,
    // ⚠️ très important : on dit à Mongoose d'utiliser
    // la collection EXISTANTE "ventes" (remplie par ton ETL)
    collection: 'ventes',
  }
);

module.exports = mongoose.model('Sale', saleSchema);
