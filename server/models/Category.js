const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, name: 1, type: 1 });

module.exports = mongoose.model('Category', categorySchema);
