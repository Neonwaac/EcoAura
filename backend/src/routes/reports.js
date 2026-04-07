const express = require('express');
const db = require('../db');
const { getDashboardSummary } = require('../utils/metrics');

const router = express.Router();

router.get('/sales', (_req, res) => {
  const rows = db
    .prepare(`
      SELECT
        s.id,
        s.created_at,
        p.name AS producto,
        c.name AS cliente,
        s.quantity AS cantidad,
        s.unit_price AS precio_unitario,
        (s.quantity * s.unit_price) AS total,
        s.payment_method AS metodo_pago,
        s.payment_status AS estado_pago
      FROM sales s
      INNER JOIN products p ON p.id = s.product_id
      INNER JOIN customers c ON c.id = s.customer_id
      ORDER BY datetime(s.created_at) DESC, s.id DESC
    `)
    .all();

  const totalVentas = rows.reduce((sum, row) => sum + Number(row.total || 0), 0);

  res.json({
    generated_at: new Date().toISOString(),
    total_registros: rows.length,
    total_ventas: totalVentas,
    rows,
  });
});

router.get('/summary', (_req, res) => {
  const summary = getDashboardSummary();
  res.json(summary);
});

module.exports = router;
