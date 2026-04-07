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
    COALESCE(tp.total_cost, 0) AS total_purchase_cost,
    CASE
      WHEN COALESCE(tp.total_purchased, 0) > 0 THEN COALESCE(tp.total_cost, 0) / tp.total_purchased
      ELSE 0
    END AS avg_unit_cost,
    CASE
      WHEN COALESCE(tp.total_purchased, 0) > 0 THEN COALESCE(ts.total_sold, 0) * (COALESCE(tp.total_cost, 0) / tp.total_purchased)
      ELSE 0
    END AS estimated_cost_of_goods,
    COALESCE(ts.revenue, 0) -
      CASE
        WHEN COALESCE(tp.total_purchased, 0) > 0 THEN COALESCE(ts.total_sold, 0) * (COALESCE(tp.total_cost, 0) / tp.total_purchased)
        ELSE 0
      END AS profit
  FROM products p
  LEFT JOIN (
    SELECT
      product_id,
      SUM(quantity) AS total_purchased,
      SUM((quantity * purchase_price) + shipping_cost) AS total_cost
    FROM purchases
    GROUP BY product_id
  ) tp ON p.id = tp.product_id
  LEFT JOIN (
    SELECT
      product_id,
      SUM(quantity) AS total_sold,
      SUM(quantity * unit_price) AS revenue
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
        COALESCE(SUM(quantity * unit_price), 0) AS total_sales,
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
