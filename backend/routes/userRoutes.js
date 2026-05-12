const {registerUser, loginUser, getUsers, updateUser} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// register user
router.post('/register', registerUser);
// login user 
router.post('/login', loginUser);
// get users
router.get('/',  getUsers);
// update user
router.put('/:id', authMiddleware, updateUser);

module.exports = router;