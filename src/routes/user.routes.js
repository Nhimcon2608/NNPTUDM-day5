const express = require('express');
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  enableUser,
  disableUser,
} = require('../controllers/user.controller');

const router = express.Router();

router.post('/', createUser);
router.post('/enable', enableUser);
router.post('/disable', disableUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
