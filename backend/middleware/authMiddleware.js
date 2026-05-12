const JS = require('jsonwebtoken');
const User = require('../models/User');


const  authMiddleware = async(req, res, next)=>{
    const authHeader = req.headers.authorization;
    try {
        let token;
        if(authHeader && authHeader.startsWith('Bearer')){
            token = authHeader.split(' ')[1];
        }
        if(!token){
            return res.status(401).json("Unauthorized access. No token provided");
        }
        const decoded = JS.verify(token, process.env.JWT_SECRETKEY);
        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json("Unauthorized access. User not found");
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authMiddleware;

