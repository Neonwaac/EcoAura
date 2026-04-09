const db = require('../db');

const productMetricsQuery = `
  SELECT
    p.id,
    p.name,
    p.sale_price,
    COALESCE(tp.total_purchased, 0) AS total_purchased,
    COALESCE(ts.total_sold, 0) AS total_sold,
    COALESCE(tp.total_purchased, 0) - COALESCE(ts.total_sold, 0) AS stock,
    COALESCE(ts.revenue, 0) AS revenue,
    COALESCE(ts.full_paid_units, 0) AS full_paid_units,
    COALESCE(ts.partial_collected, 0) AS partial_collected,
    COALESCE(tp.total_cost, 0) AS total_purchase_cost,
    COALESCE(tp.total_purchase_cost_no_shipping, 0) AS total_purchase_cost_no_shipping,
    CASE
      WHEN COALESCE(tp.total_purchased, 0) > 0 THEN COALESCE(tp.total_purchase_cost_no_shipping, 0) / tp.total_purchased
      ELSE 0
    END AS avg_unit_cost,
    CASE
      WHEN COALESCE(tp.total_purchased, 0) > 0 THEN COALESCE(ts.full_paid_units, 0) * (COALESCE(tp.total_purchase_cost_no_shipping, 0) / tp.total_purchased)
      ELSE 0
    END AS estimated_cost_of_goods,
    CASE
      WHEN COALESCE(tp.total_purchased, 0) > 0 THEN
        (COALESCE(ts.full_paid_units, 0) * p.sale_price) -
        (COALESCE(ts.full_paid_units, 0) * (COALESCE(tp.total_purchase_cost_no_shipping, 0) / tp.total_purchased)) +
        COALESCE(ts.partial_collected, 0)
      ELSE COALESCE(ts.partial_collected, 0)
    END AS profit
  FROM products p
  LEFT JOIN (
    SELECT
      product_id,
      SUM(quantity) AS total_purchased,
      SUM((quantity * purchase_price) + shipping_cost) AS total_cost,
      SUM(quantity * purchase_price) AS total_purchase_cost_no_shipping
    FROM purchases
    GROUP BY product_id
  ) tp ON p.id = tp.product_id
  LEFT JOIN (
    SELECT
      product_id,
      SUM(quantity) AS total_sold,
      SUM(COALESCE(amount_paid, 0)) AS revenue,
      SUM(CASE WHEN payment_status = 'Pagado' THEN quantity ELSE 0 END) AS full_paid_units,
      SUM(CASE WHEN payment_status = 'Parcial' THEN COALESCE(amount_paid, 0) ELSE 0 END) AS partial_collected
    FROM sales
    GROUP BY product_id
  ) ts ON p.id = ts.product_id
`;

function getAllProductMetrics() {
  return db.prepare(`${productMetricsQuery} ORDER BY p.name ASC`).all();
}

function getDashboardSummary() {
  const totals = db
    .prepare(`
      SELECT
        COALESCE(SUM(COALESCE(amount_paid, 0)), 0) AS total_sales,
        COALESCE(SUM(quantity), 0) AS units_sold
      FROM sales
    `)
    .get();

  const byProduct = getAllProductMetrics();

  const unitsAvailable = byProduct.reduce((acc, product) => acc + Number(product.stock || 0), 0);
  const totalProfit = byProduct.reduce((acc, product) => acc + Number(product.profit || 0), 0);

  return {
    totalSales: Number(totals.total_sales || 0),
    totalProfit,
    unitsSold: Number(totals.units_sold || 0),
    unitsAvailable,
    byProduct,
  };
}

function getProductStock(productId) {
  const row = db
    .prepare(`
      SELECT
        COALESCE((SELECT SUM(quantity) FROM purchases WHERE product_id = ?), 0) -
        COALESCE((SELECT SUM(quantity) FROM sales WHERE product_id = ?), 0) AS stock
    `)
    .get(productId, productId);

  return Number(row?.stock || 0);
}

module.exports = {
  getAllProductMetrics,
  getDashboardSummary,
  getProductStock,
};
