const mongoose = require('mongoose');

const DEFAULT_AVATAR_URL = 'https://i.sstatic.net/l60Hf.png';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      default: '',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: DEFAULT_AVATAR_URL,
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'loginCount must be an integer.',
      },
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

userSchema.index(
  { username: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  }
);

userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { deletedAt: null },
  }
);

module.exports = mongoose.model('User', userSchema);
