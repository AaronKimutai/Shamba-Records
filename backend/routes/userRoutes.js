const {registerUser, loginUser, getUsers, updateUser} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const {userCreationValidation, userUpdateValidation} = require('../middleware/expressValidator');

// register user
router.post('/register', userCreationValidation, registerUser);
// login user 
router.post('/login', loginUser);
// get users
router.get('/',  getUsers);
// update user
router.put('/:id', authMiddleware, userUpdateValidation, updateUser);

module.exports = router;