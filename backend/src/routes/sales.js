const express = require('express');
const db = require('../db');
const { getProductStock } = require('../utils/metrics');

const router = express.Router();

function getOrCreateCustomerId(customerName) {
  const normalizedName = customerName.trim();
  let customer = db
    .prepare('SELECT id, name FROM customers WHERE LOWER(name) = LOWER(?) LIMIT 1')
    .get(normalizedName);

  if (!customer) {
    const insertedCustomer = db.prepare('INSERT INTO customers (name) VALUES (?)').run(normalizedName);
    customer = { id: insertedCustomer.lastInsertRowid, name: normalizedName };
  }

  return customer.id;
}

router.get('/', (_req, res) => {
  const rows = db
    .prepare(`
      SELECT
        s.id,
        s.product_id,
        p.name AS product_name,
        s.customer_id,
        c.name AS customer_name,
        s.quantity,
        s.unit_price,
        s.payment_method,
        s.payment_status,
        s.created_at
      FROM sales s
      INNER JOIN products p ON p.id = s.product_id
      INNER JOIN customers c ON c.id = s.customer_id
      ORDER BY datetime(s.created_at) DESC, s.id DESC
    `)
    .all();

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const saleId = Number(req.params.id);
  if (Number.isNaN(saleId)) {
    return res.status(400).json({ error: 'Venta invalida.' });
  }

  const row = db
    .prepare(
      `
      SELECT
        s.id,
        s.product_id,
        p.name AS product_name,
        s.customer_id,
        c.name AS customer_name,
        s.quantity,
        s.unit_price,
        s.payment_method,
        s.payment_status,
        s.created_at
      FROM sales s
      INNER JOIN products p ON p.id = s.product_id
      INNER JOIN customers c ON c.id = s.customer_id
      WHERE s.id = ?
    `
    )
    .get(saleId);

  if (!row) {
    return res.status(404).json({ error: 'Venta no encontrada.' });
  }

  return res.json(row);
});

router.post('/', (req, res) => {
  const { product_id, customer_name, quantity, unit_price, payment_method, payment_status } = req.body;

  const productId = Number(product_id);
  const qty = Number(quantity);
  const requestedUnitPrice = Number(unit_price);

  if (Number.isNaN(productId) || Number.isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Producto y cantidad son obligatorios.' });
  }

  if (!customer_name || typeof customer_name !== 'string') {
    return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
  }

  if (!payment_method || !payment_status) {
    return res.status(400).json({ error: 'Metodo y estado de pago son obligatorios.' });
  }

  const product = db.prepare('SELECT id, sale_price FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const stock = getProductStock(productId);
  if (qty > stock) {
    return res.status(400).json({ error: `Stock insuficiente. Disponible: ${stock}` });
  }

  const finalUnitPrice = Number.isNaN(requestedUnitPrice) ? Number(product.sale_price) : requestedUnitPrice;
  if (finalUnitPrice < 0) {
    return res.status(400).json({ error: 'El precio unitario no puede ser negativo.' });
  }

  const saveSale = db.transaction(() => {
    const customerId = getOrCreateCustomerId(customer_name);

    const sale = db
      .prepare(
        `
          INSERT INTO sales (
            product_id,
            customer_id,
            quantity,
            unit_price,
            payment_method,
            payment_status
          ) VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(productId, customerId, qty, finalUnitPrice, payment_method, payment_status);

    return {
      id: sale.lastInsertRowid,
      customer_id: customerId,
    };
  });

  try {
    const saved = saveSale();
    return res.status(201).json(saved);
  } catch (_error) {
    return res.status(500).json({ error: 'No se pudo registrar la venta.' });
  }
});

router.put('/:id', (req, res) => {
  const saleId = Number(req.params.id);
  const { product_id, customer_name, quantity, unit_price, payment_method, payment_status } = req.body;

  const productId = Number(product_id);
  const qty = Number(quantity);
  const price = Number(unit_price);

  if (Number.isNaN(saleId) || Number.isNaN(productId) || Number.isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Datos de venta invalidos.' });
  }

  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'El precio unitario no puede ser negativo.' });
  }

  if (!customer_name || typeof customer_name !== 'string') {
    return res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
  }

  if (!payment_method || !payment_status) {
    return res.status(400).json({ error: 'Metodo y estado de pago son obligatorios.' });
  }

  const currentSale = db.prepare('SELECT id, product_id, quantity FROM sales WHERE id = ?').get(saleId);
  if (!currentSale) {
    return res.status(404).json({ error: 'Venta no encontrada.' });
  }

  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const stockAvailable =
    productId === Number(currentSale.product_id)
      ? getProductStock(productId) + Number(currentSale.quantity)
      : getProductStock(productId);

  if (qty > stockAvailable) {
    return res.status(400).json({ error: `Stock insuficiente. Disponible: ${stockAvailable}` });
  }

  try {
    const saveEdit = db.transaction(() => {
      const customerId = getOrCreateCustomerId(customer_name);
      db.prepare(
        `
          UPDATE sales
          SET product_id = ?, customer_id = ?, quantity = ?, unit_price = ?, payment_method = ?, payment_status = ?
          WHERE id = ?
        `
      ).run(productId, customerId, qty, price, payment_method, payment_status, saleId);
    });

    saveEdit();
    return res.json({ ok: true });
  } catch (_error) {
    return res.status(500).json({ error: 'No se pudo actualizar la venta.' });
  }
});

router.delete('/:id', (req, res) => {
  const saleId = Number(req.params.id);
  if (Number.isNaN(saleId)) {
    return res.status(400).json({ error: 'Venta invalida.' });
  }

  const result = db.prepare('DELETE FROM sales WHERE id = ?').run(saleId);
  if (!result.changes) {
    return res.status(404).json({ error: 'Venta no encontrada.' });
  }

  return res.json({ ok: true });
});

module.exports = router;
