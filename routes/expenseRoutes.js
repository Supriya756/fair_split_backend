const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/', expenseController.addExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/group/:groupId/balances', expenseController.getGroupBalances);

module.exports = router;
