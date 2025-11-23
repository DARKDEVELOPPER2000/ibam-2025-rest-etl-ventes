// server.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const promBundle = require('express-prom-bundle');   // 👈 new
const salesRoutes = require('./routes/salesRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = 'mongodb://localhost:27017/salesdb_mongo';

// ------ Middlewares globaux ------
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // 👉 logs texte dans la console

// 👉 Middleware métriques Prometheus
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promClient: {
    collectDefaultMetrics: {},
  },
});
app.use(metricsMiddleware);
// -> expose automatiquement /metrics au format Prometheus

// Routes
app.get('/', (req, res) => {
  res.send('API ventes OK');
});
app.use('/ventes', salesRoutes);

// Connexion Mongo + démarrage
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  });
