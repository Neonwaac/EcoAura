const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', 'data', 'ecoaura.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sale_price REAL NOT NULL CHECK (sale_price >= 0)
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    purchase_price REAL NOT NULL CHECK (purchase_price >= 0),
    shipping_cost REAL NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL CHECK (unit_price >= 0),
    unit_cost REAL NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    amount_paid REAL NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);
  CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
  CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
  CREATE INDEX IF NOT EXISTS idx_customer_name ON customers(name);
`);

const salesColumns = db.prepare("PRAGMA table_info('sales')").all();
const hasAmountPaid = salesColumns.some((col) => col.name === 'amount_paid');
const hasUnitCost = salesColumns.some((col) => col.name === 'unit_cost');

if (!hasAmountPaid) {
  db.exec('ALTER TABLE sales ADD COLUMN amount_paid REAL');
}

if (!hasUnitCost) {
  db.exec('ALTER TABLE sales ADD COLUMN unit_cost REAL');
}

db.exec(`
  UPDATE sales
  SET amount_paid =
    CASE
      WHEN payment_status = 'Pendiente' THEN 0
      WHEN payment_status = 'Pagado' THEN quantity * unit_price
      ELSE quantity * unit_price
    END
  WHERE amount_paid IS NULL
`);

db.exec(`
  UPDATE sales
  SET unit_cost = COALESCE((
    SELECT
      CASE
        WHEN SUM(pu.quantity) > 0 THEN SUM(pu.quantity * pu.purchase_price) / SUM(pu.quantity)
        ELSE 0
      END
    FROM purchases pu
    WHERE pu.product_id = sales.product_id
  ), 0)
  WHERE unit_cost IS NULL
`);

module.exports = db;
