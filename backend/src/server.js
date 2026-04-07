require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

require('./db');

const productsRouter = require('./routes/products');
const purchasesRouter = require('./routes/purchases');
const salesRouter = require('./routes/sales');
const customersRouter = require('./routes/customers');
const reportsRouter = require('./routes/reports');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/customers', customersRouter);
app.use('/api/reports', reportsRouter);

const frontendDistPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(port, () => {
  console.log(`EcoAura API ejecutandose en puerto ${port}`);
});
