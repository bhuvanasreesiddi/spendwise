const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon = 'Tag', color = '#6366f1' } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    const existing = await Category.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      type,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    let category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const oldName = category.name;

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();

    // If name changed, update all existing transactions with this category name
    if (name && name.trim() !== oldName) {
      await Transaction.updateMany(
        { userId: req.user._id, category: oldName },
        { category: name.trim() }
      );
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, userId: req.user._id });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Reassign all associated transactions to 'Others'
    await Transaction.updateMany(
      { userId: req.user._id, category: category.name },
      { category: 'Others' }
    );

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted and associated transactions reassigned to Others',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
