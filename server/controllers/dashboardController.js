const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// Helper to get start and end dates of a month
const getMonthRange = (year, month) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// @desc    Get dashboard summary cards and stats
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Lifetime totals
    const allTransactions = await Transaction.find({ userId });
    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach((t) => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    const totalBalance = totalIncome - totalExpense;
    const totalSavings = totalBalance > 0 ? totalBalance : 0;

    // Current Month range
    const currentRange = getMonthRange(currentYear, currentMonth);
    const prevRange = getMonthRange(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1);

    // Current month transactions
    const currTrans = await Transaction.find({
      userId,
      date: { $gte: currentRange.start, $lte: currentRange.end },
    });

    let currIncome = 0;
    let currExpense = 0;
    currTrans.forEach((t) => {
      if (t.type === 'income') currIncome += t.amount;
      if (t.type === 'expense') currExpense += t.amount;
    });

    // Previous month transactions
    const prevTrans = await Transaction.find({
      userId,
      date: { $gte: prevRange.start, $lte: prevRange.end },
    });

    let prevIncome = 0;
    let prevExpense = 0;
    prevTrans.forEach((t) => {
      if (t.type === 'income') prevIncome += t.amount;
      if (t.type === 'expense') prevExpense += t.amount;
    });

    // Month-over-month percentage changes
    const calcChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    const incomeChange = calcChange(currIncome, prevIncome);
    const expenseChange = calcChange(currExpense, prevExpense);
    const balanceChange = calcChange(currIncome - currExpense, prevIncome - prevExpense);
    const savingsChange = balanceChange;

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    const savingsRate = currIncome > 0 ? Math.round(((currIncome - currExpense) / currIncome) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalBalance: { amount: totalBalance, change: balanceChange },
          totalIncome: { amount: totalIncome, change: incomeChange },
          totalExpense: { amount: totalExpense, change: expenseChange },
          totalExpenses: { amount: totalExpense, change: expenseChange },
          totalSavings: { amount: totalSavings, change: savingsChange },
          savings: { amount: totalSavings, savingsRate: Math.max(0, savingsRate), change: savingsChange },
        },
        currentMonth: {
          income: currIncome,
          expense: currExpense,
          net: currIncome - currExpense,
          balance: currIncome - currExpense,
          savingsRate: Math.max(0, savingsRate),
        },
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly income vs expense comparison for chart
// @route   GET /api/dashboard/monthly
// @access  Private
exports.getMonthly = async (req, res) => {
  try {
    const userId = req.user._id;
    const monthsCount = parseInt(req.query.months, 10) || 6;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const result = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const range = getMonthRange(d.getFullYear(), d.getMonth());

      const monthlyTrans = await Transaction.find({
        userId,
        date: { $gte: range.start, $lte: range.end },
      });

      let income = 0;
      let expense = 0;
      monthlyTrans.forEach((t) => {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      });

      result.push({
        month: monthNames[d.getMonth()],
        income,
        expense,
        net: income - expense,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get spending breakdown by category
// @route   GET /api/dashboard/categories
// @access  Private
exports.getCategoriesBreakdown = async (req, res) => {
  try {
    const userId = req.user._id;
    const type = req.query.type || 'expense';

    const matchQuery = { userId, type };

    const transactions = await Transaction.find(matchQuery);
    const userCategories = await Category.find({ userId });
    const categoryMap = {};

    userCategories.forEach((c) => {
      categoryMap[c.name] = { color: c.color, icon: c.icon };
    });

    let totalAmount = 0;
    const breakdown = {};

    transactions.forEach((t) => {
      totalAmount += t.amount;
      if (!breakdown[t.category]) {
        breakdown[t.category] = {
          name: t.category,
          amount: 0,
          count: 0,
          color: (categoryMap[t.category] && categoryMap[t.category].color) || '#6366f1',
          icon: (categoryMap[t.category] && categoryMap[t.category].icon) || 'Tag',
        };
      }
      breakdown[t.category].amount += t.amount;
      breakdown[t.category].count += 1;
    });

    const result = Object.values(breakdown).map((item) => ({
      ...item,
      amount: Math.round(item.amount * 100) / 100,
      percentage: totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0,
    }));

    result.sort((a, b) => b.amount - a.amount);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
