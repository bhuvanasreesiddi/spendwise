const Category = require('../models/Category');

const defaultCategories = [
  // Expense Categories
  { name: 'Food', type: 'expense', icon: 'Utensils', color: '#f59e0b', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: 'Car', color: '#3b82f6', isDefault: true },
  { name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: 'Film', color: '#a855f7', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#ef4444', isDefault: true },
  { name: 'Bills', type: 'expense', icon: 'Receipt', color: '#06b6d4', isDefault: true },
  { name: 'Others', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', isDefault: true },

  // Income Categories
  { name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { name: 'Freelancing', type: 'income', icon: 'Laptop', color: '#059669', isDefault: true },
  { name: 'Business', type: 'income', icon: 'TrendingUp', color: '#14b8a6', isDefault: true },
  { name: 'Investments', type: 'income', icon: 'PiggyBank', color: '#6366f1', isDefault: true },
  { name: 'Gifts', type: 'income', icon: 'Gift', color: '#f43f5e', isDefault: true },
  { name: 'Others', type: 'income', icon: 'Coins', color: '#64748b', isDefault: true },
];

const seedDefaultCategories = async (userId) => {
  const categoriesToSeed = defaultCategories.map((c) => ({
    ...c,
    userId,
  }));
  await Category.insertMany(categoriesToSeed);
};

module.exports = { seedDefaultCategories, defaultCategories };
