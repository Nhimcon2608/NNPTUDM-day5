const mongoose = require('mongoose');
const Role = require('../models/role.model');
const User = require('../models/user.model');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickUserFields(payload = {}) {
  return {
    ...(payload.username !== undefined ? { username: payload.username } : {}),
    ...(payload.password !== undefined ? { password: payload.password } : {}),
    ...(payload.email !== undefined ? { email: payload.email } : {}),
    ...(payload.fullName !== undefined ? { fullName: payload.fullName } : {}),
    ...(payload.avatarUrl !== undefined ? { avatarUrl: payload.avatarUrl } : {}),
    ...(payload.status !== undefined ? { status: payload.status } : {}),
    ...(payload.role !== undefined ? { role: payload.role } : {}),
    ...(payload.loginCount !== undefined ? { loginCount: payload.loginCount } : {}),
  };
}

function handleError(res, error) {
  if (error?.code === 11000) {
    return res.status(409).json({
      message: 'Username or email already exists.',
      details: error.keyValue,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid user data.',
      details: Object.values(error.errors).map((item) => item.message),
    });
  }

  return res.status(500).json({ message: 'Internal server error.' });
}

async function validateRole(roleId) {
  if (!roleId) {
    return null;
  }

  if (!isValidObjectId(roleId)) {
    return { error: 'Invalid role id.' };
  }

  const role = await Role.findOne({ _id: roleId, deletedAt: null });
  if (!role) {
    return { error: 'Role not found.' };
  }

  return role;
}

async function createUser(req, res) {
  try {
    const userData = pickUserFields(req.body);
    const roleCheck = await validateRole(userData.role);
    if (roleCheck?.error) {
      return res.status(400).json({ message: roleCheck.error });
    }

    const user = await User.create(userData);
    const createdUser = await User.findById(user._id).select('-password').populate('role');

    return res.status(201).json(createdUser);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getUsers(req, res) {
  try {
    const filter = { deletedAt: null };

    if (req.query.username) {
      filter.username = {
        $regex: escapeRegExp(req.query.username),
        $options: 'i',
      };
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('role')
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const user = await User.findOne({ _id: id, deletedAt: null })
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = pickUserFields(req.body);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const roleCheck = await validateRole(updateData.role);
    if (roleCheck?.error) {
      return res.status(400).json({ message: roleCheck.error });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(user);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    )
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ message: 'User soft deleted successfully.', user });
  } catch (error) {
    return handleError(res, error);
  }
}

async function enableUser(req, res) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required.' });
    }

    const user = await User.findOneAndUpdate(
      {
        email: email.toLowerCase(),
        username,
        deletedAt: null,
      },
      { status: true },
      { new: true }
    )
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email and username.' });
    }

    return res.json({ message: 'User enabled successfully.', user });
  } catch (error) {
    return handleError(res, error);
  }
}

async function disableUser(req, res) {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: 'Email and username are required.' });
    }

    const user = await User.findOneAndUpdate(
      {
        email: email.toLowerCase(),
        username,
        deletedAt: null,
      },
      { status: false },
      { new: true }
    )
      .select('-password')
      .populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email and username.' });
    }

    return res.json({ message: 'User disabled successfully.', user });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
};
