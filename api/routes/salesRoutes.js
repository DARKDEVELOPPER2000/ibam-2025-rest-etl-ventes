// routes/salesRoutes.js
const express = require('express');
const Sale = require('../models/Sale');

const router = express.Router();

/**
 * GET /ventes → liste de toutes les ventes (tri par date décroissante)
 */
router.get('/', async (req, res) => {
  try {
    const ventes = await Sale.find().sort({ date_vente: -1 });
    res.json(ventes);
  } catch (err) {
    console.error('[GET /ventes] Erreur :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /ventes/:id → une vente par _id MongoDB
 */
router.get('/:id', async (req, res) => {
  try {
    const vente = await Sale.findById(req.params.id);
    if (!vente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.json(vente);
  } catch (err) {
    console.error('[GET /ventes/:id] Erreur :', err);
    res.status(400).json({ error: 'Id invalide' });
  }
});

/**
 * POST /ventes → créer une vente
 */
router.post('/', async (req, res) => {
  try {
    // 1) Vérifier que le body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: 'Corps JSON manquant ou vide dans la requête.' });
    }

    const { id, produit, quantite, prix_unitaire, date_vente } = req.body;

    // 2) Vérifier les champs obligatoires
    if (
      id == null ||
      !produit ||
      quantite == null ||
      prix_unitaire == null ||
      !date_vente
    ) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    // 3) Calcul du montant_total
    const montant_total = Number(quantite) * Number(prix_unitaire);

    // 4) Création
    const sale = await Sale.create({
      id,
      produit,
      quantite,
      prix_unitaire,
      montant_total,
      date_vente,
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error('[POST /ventes] Erreur :', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /ventes/:id → modifier une vente (par _id MongoDB)
 */
router.put('/:id', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: 'Corps JSON manquant ou vide dans la requête.' });
    }

    const { produit, quantite, prix_unitaire, date_vente } = req.body;

    if (
      !produit ||
      quantite == null ||
      prix_unitaire == null ||
      !date_vente
    ) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    const montant_total = Number(quantite) * Number(prix_unitaire);

    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { produit, quantite, prix_unitaire, montant_total, date_vente },
      { new: true }
    );

    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }

    res.json(sale);
  } catch (err) {
    console.error('[PUT /ventes/:id] Erreur :', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /ventes/:id → supprimer une vente
 */
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(204).end();
  } catch (err) {
    console.error('[DELETE /ventes/:id] Erreur :', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
