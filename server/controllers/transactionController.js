const Transaction = require('../models/Transaction');

// @desc    Get transactions with search, filter & pagination
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const {
      search,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId: req.user._id };

    if (type && type !== 'All') {
      query.type = type.toLowerCase();
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: transactions,
      total,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({ success: false, message: 'Title, amount, type and category are required' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      title: title.trim(),
      amount: parseFloat(amount),
      type: type.toLowerCase(),
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, date, description } = req.body;

    if (title) transaction.title = title.trim();
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (type) transaction.type = type.toLowerCase();
    if (category) transaction.category = category.trim();
    if (date) transaction.date = new Date(date);
    if (description !== undefined) transaction.description = description.trim();

    await transaction.save();

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
