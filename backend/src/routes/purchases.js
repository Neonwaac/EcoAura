const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (_req, res) => {
  const rows = db
    .prepare(`
      SELECT
        pu.id,
        pu.product_id,
        p.name AS product_name,
        pu.quantity,
        pu.purchase_price,
        pu.shipping_cost,
        pu.created_at
      FROM purchases pu
      INNER JOIN products p ON p.id = pu.product_id
      ORDER BY datetime(pu.created_at) DESC, pu.id DESC
    `)
    .all();

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const purchaseId = Number(req.params.id);
  if (Number.isNaN(purchaseId)) {
    return res.status(400).json({ error: 'Compra invalida.' });
  }

  const row = db
    .prepare(
      `
      SELECT
        pu.id,
        pu.product_id,
        p.name AS product_name,
        pu.quantity,
        pu.purchase_price,
        pu.shipping_cost,
        pu.created_at
      FROM purchases pu
      INNER JOIN products p ON p.id = pu.product_id
      WHERE pu.id = ?
    `
    )
    .get(purchaseId);

  if (!row) {
    return res.status(404).json({ error: 'Compra no encontrada.' });
  }

  return res.json(row);
});

router.post('/', (req, res) => {
  const { product_id, quantity, purchase_price, shipping_cost } = req.body;

  const productId = Number(product_id);
  const qty = Number(quantity);
  const purchasePrice = Number(purchase_price);
  const shipping = Number(shipping_cost ?? 0);

  if ([productId, qty, purchasePrice, shipping].some((n) => Number.isNaN(n))) {
    return res.status(400).json({ error: 'Datos de compra invalidos.' });
  }

  if (qty <= 0 || purchasePrice < 0 || shipping < 0) {
    return res.status(400).json({ error: 'Verifica cantidad, precio y envio.' });
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const result = db
    .prepare(
      'INSERT INTO purchases (product_id, quantity, purchase_price, shipping_cost) VALUES (?, ?, ?, ?)'
    )
    .run(productId, qty, purchasePrice, shipping);

  return res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const purchaseId = Number(req.params.id);
  const { product_id, quantity, purchase_price, shipping_cost } = req.body;

  const productId = Number(product_id);
  const qty = Number(quantity);
  const purchasePrice = Number(purchase_price);
  const shipping = Number(shipping_cost ?? 0);

  if ([purchaseId, productId, qty, purchasePrice, shipping].some((n) => Number.isNaN(n))) {
    return res.status(400).json({ error: 'Datos de compra invalidos.' });
  }

  if (qty <= 0 || purchasePrice < 0 || shipping < 0) {
    return res.status(400).json({ error: 'Verifica cantidad, precio y envio.' });
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const result = db
    .prepare(
      `
      UPDATE purchases
      SET product_id = ?, quantity = ?, purchase_price = ?, shipping_cost = ?
      WHERE id = ?
    `
    )
    .run(productId, qty, purchasePrice, shipping, purchaseId);

  if (!result.changes) {
    return res.status(404).json({ error: 'Compra no encontrada.' });
  }

  return res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const purchaseId = Number(req.params.id);
  if (Number.isNaN(purchaseId)) {
    return res.status(400).json({ error: 'Compra invalida.' });
  }

  const result = db.prepare('DELETE FROM purchases WHERE id = ?').run(purchaseId);
  if (!result.changes) {
    return res.status(404).json({ error: 'Compra no encontrada.' });
  }

  return res.json({ ok: true });
});

module.exports = router;
