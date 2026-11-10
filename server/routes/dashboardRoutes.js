const express = require('express');
const router = express.Router();
const {
  getSummary,
  getMonthly,
  getCategoriesBreakdown,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.get('/monthly', getMonthly);
router.get('/categories', getCategoriesBreakdown);

module.exports = router;
