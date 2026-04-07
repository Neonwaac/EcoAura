const express = require('express');
const db = require('../db');
const { getAllProductMetrics } = require('../utils/metrics');

const router = express.Router();

router.get('/', (_req, res) => {
  const products = getAllProductMetrics();
  res.json(products);
});

router.get('/:id', (req, res) => {
  const productId = Number(req.params.id);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Producto invalido.' });
  }

  const product = getAllProductMetrics().find((item) => Number(item.id) === productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.json(product);
});

router.post('/', (req, res) => {
  const { name, sale_price } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
  }

  const price = Number(sale_price);
  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser un numero valido.' });
  }

  try {
    const result = db
      .prepare('INSERT INTO products (name, sale_price) VALUES (?, ?)')
      .run(name.trim(), price);

    return res.status(201).json({
      id: result.lastInsertRowid,
      name: name.trim(),
      sale_price: price,
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre.' });
    }

    return res.status(500).json({ error: 'No se pudo crear el producto.' });
  }
});

router.put('/:id/price', (req, res) => {
  const productId = Number(req.params.id);
  const price = Number(req.body.sale_price);

  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Producto invalido.' });
  }

  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser un numero valido.' });
  }

  const result = db.prepare('UPDATE products SET sale_price = ? WHERE id = ?').run(price, productId);

  if (!result.changes) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  return res.json({ ok: true });
});

router.put('/:id', (req, res) => {
  const productId = Number(req.params.id);
  const { name, sale_price } = req.body;

  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Producto invalido.' });
  }

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio.' });
  }

  const price = Number(sale_price);
  if (Number.isNaN(price) || price < 0) {
    return res.status(400).json({ error: 'El precio de venta debe ser un numero valido.' });
  }

  try {
    const result = db
      .prepare('UPDATE products SET name = ?, sale_price = ? WHERE id = ?')
      .run(name.trim(), price, productId);

    if (!result.changes) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    return res.json({ ok: true });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre.' });
    }

    return res.status(500).json({ error: 'No se pudo actualizar el producto.' });
  }
});

router.delete('/:id', (req, res) => {
  const productId = Number(req.params.id);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Producto invalido.' });
  }

  try {
    const result = db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    if (!result.changes) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    return res.json({ ok: true });
  } catch (_error) {
    return res.status(400).json({
      error: 'No se puede eliminar un producto con compras o ventas registradas.',
    });
  }
});

module.exports = router;
