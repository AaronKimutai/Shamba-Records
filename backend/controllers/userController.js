const User = require('../models/User');
const js = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

// create a new user
const registerUser = async(req, res, next)=>{
    const {name, email, password, role} = req.body;
    try {
        const user = await User.findOne({email});
        if(user){
           logger.warn(`User ${email} attempted to register but already exists`);
           return res.status(400).json("User already exists");
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashPassword,
            role
        })
        logger.info(`User ${newUser.email} created successfully`);
        res.status(201).json("User created successfully");
    } catch (error) {
       logger.error({message: error.message, stack: error.stack.split("\n")[0]});
       next(error);
    }
}

const loginUser = async(req, res, next)=>{
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json("User does not exist. Please register first");
            logger.warn(`User ${email} attempted to login but does not exist`);
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json("Invalid password");
            logger.warn(`User ${email} attempted to login with invalid password`);
        }
        const token = js.sign({
            id: user._id, // payload
            role: user.role
        },
        process.env.JWT_SECRETKEY,
        {expiresIn: '2h'}
    );
    logger.info(`User ${user.email} logged in successfully`);
    res.status(200).json({message: "Login successful", token});
    } catch (error) {
        logger.error({message: error.message, 
            stack: error.stack.split("\n")[0]
        });
        next(error);
    }
}
// get users
const getUsers = async(req, res, next)=>{
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}

// update user
const updateUser = async(req, res, next)=>{
    try {
        const {name, email, password, role} = req.body;
        const existingUser = req.user;
        if(name !==undefined){
            existingUser.name = name;
        }
        if(email !==undefined){
            existingUser.email = email;
        }
        if(password !==undefined){
            const hashPassword = await bcrypt.hash(password, 10);
            existingUser.password = hashPassword;
        }
        await existingUser.save({new: true});
        res.status(200).json("User updated successfully");
        logger.info(`User ${existingUser.email} updated successfully`);
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    updateUser
};