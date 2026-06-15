const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { calculateBalances } = require('../utils/balanceCalculator');

exports.addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, group, splits } = req.body;

    if (!description || !amount || !paidBy || !group || !splits) {
      return res.status(400).json({ error: 'Description, amount, paidBy, group, and splits are required' });
    }

    // Verify group exists
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Create and save expense
    const expense = new Expense({
      description,
      amount,
      paidBy,
      group,
      splits
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email')
      .populate('splits.user', 'name email');
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    // Verify group exists and get members
    const groupDoc = await Group.findById(groupId).populate('members', 'name email');
    if (!groupDoc) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Fetch all expenses for this group
    const expenses = await Expense.find({ group: groupId });

    // Calculate balances
    const result = calculateBalances(groupDoc.members, expenses);

    res.status(200).json({
      groupId: groupDoc._id,
      groupName: groupDoc.name,
      netBalances: result.netBalances,
      settlements: result.settlements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
