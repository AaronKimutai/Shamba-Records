const JS = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// authentication middleware
const  authMiddleware = async(req, res, next)=>{
    const authHeader = req.headers.authorization;
    try {
        let token;
        if(authHeader && authHeader.startsWith('Bearer')){
            token = authHeader.split(' ')[1];
        }
        if(!token){
            logger.warn("Unauthorized access attempt without token");
            return res.status(401).json("Unauthorized access. No token provided");
        }
        const decoded = JS.verify(token, process.env.JWT_SECRETKEY);
        const user = await User.findById(decoded.id);
        if(!user){
            logger.warn("Unauthorized access attempt with invalid token");
            return res.status(401).json("Unauthorized access. User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        logger.error({message: error.message, 
            stack: error.stack.split("\n")[0]
        });
        next(error);
    }
}

module.exports = authMiddleware;

