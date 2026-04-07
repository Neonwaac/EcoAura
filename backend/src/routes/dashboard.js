const express = require('express');
const { getDashboardSummary } = require('../utils/metrics');

const router = express.Router();

router.get('/', (_req, res) => {
  const summary = getDashboardSummary();
  res.json(summary);
});

module.exports = router;
