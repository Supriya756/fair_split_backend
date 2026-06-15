/**
 * Calculates net balances and generates the minimum transactions (settlements)
 * required to settle all debts in a group.
 * 
 * @param {Array} members - Array of user objects (each containing _id and name)
 * @param {Array} expenses - Array of expense objects from the database
 * @returns {Object} - { netBalances, settlements }
 */
function calculateBalances(members, expenses) {
  const balances = {};
  const userMap = {}; // Maps ID string to name for readable outputs
  
  members.forEach(member => {
    const memberId = member._id.toString();
    balances[memberId] = 0;
    userMap[memberId] = member.name || memberId;
  });

  // Calculate net balances based on expenses
  expenses.forEach(expense => {
    const payerId = expense.paidBy._id ? expense.paidBy._id.toString() : expense.paidBy.toString();
    const amount = expense.amount;

    // Credit the payer
    if (balances[payerId] !== undefined) {
      balances[payerId] += amount;
    }

    // Debit each participant in splits
    expense.splits.forEach(split => {
      const participantId = split.user._id ? split.user._id.toString() : split.user.toString();
      if (balances[participantId] !== undefined) {
        balances[participantId] -= split.amount;
      }
    });
  });

  // Format balances nicely (round to 2 decimal places to prevent floating-point errors)
  const netBalances = {};
  for (const userId in balances) {
    netBalances[userId] = Math.round(balances[userId] * 100) / 100;
  }

  // Separate debtors and creditors
  const debtors = [];
  const creditors = [];

  for (const userId in netBalances) {
    const balance = netBalances[userId];
    if (balance < 0) {
      debtors.push({ userId, name: userMap[userId], amount: Math.abs(balance) });
    } else if (balance > 0) {
      creditors.push({ userId, name: userMap[userId], amount: balance });
    }
  }

  // Sort by amount descending to greedily settle the largest debts first
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    const settlementAmount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(settlementAmount * 100) / 100;

    if (roundedAmount > 0) {
      settlements.push({
        from: { id: debtor.userId, name: debtor.name },
        to: { id: creditor.userId, name: creditor.name },
        amount: roundedAmount
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    // Move to next debtor/creditor if their balance is fully settled (epsilon < 0.005)
    if (debtor.amount < 0.005) {
      dIndex++;
    }
    if (creditor.amount < 0.005) {
      cIndex++;
    }
  }

  return {
    netBalances,
    settlements
  };
}

module.exports = { calculateBalances };
