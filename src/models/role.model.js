const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

roleSchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  }
);

module.exports = mongoose.model('Role', roleSchema);
