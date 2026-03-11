const mongoose = require('mongoose');
const Role = require('../models/role.model');
const User = require('../models/user.model');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function pickRoleFields(payload = {}) {
  return {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.description !== undefined ? { description: payload.description } : {}),
  };
}

function handleError(res, error) {
  if (error?.code === 11000) {
    return res.status(409).json({
      message: 'Role name already exists.',
      details: error.keyValue,
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Invalid role data.',
      details: Object.values(error.errors).map((item) => item.message),
    });
  }

  return res.status(500).json({ message: 'Internal server error.' });
}

async function createRole(req, res) {
  try {
    const role = await Role.create(pickRoleFields(req.body));
    return res.status(201).json(role);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getRoles(req, res) {
  try {
    const roles = await Role.find({ deletedAt: null }).sort({ createdAt: -1 });
    return res.json(roles);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getRoleById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid role id.' });
    }

    const role = await Role.findOne({ _id: id, deletedAt: null });

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    return res.json(role);
  } catch (error) {
    return handleError(res, error);
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const updateData = pickRoleFields(req.body);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid role id.' });
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    return res.json(role);
  } catch (error) {
    return handleError(res, error);
  }
}

async function deleteRole(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid role id.' });
    }

    const role = await Role.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    return res.json({ message: 'Role soft deleted successfully.', role });
  } catch (error) {
    return handleError(res, error);
  }
}

async function getUsersByRoleId(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid role id.' });
    }

    const role = await Role.findOne({ _id: id, deletedAt: null });

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    const users = await User.find({ role: id, deletedAt: null })
      .select('-password')
      .populate('role');

    return res.json(users);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getUsersByRoleId,
};
