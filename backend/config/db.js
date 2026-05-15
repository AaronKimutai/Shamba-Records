const mongoose = require('mongoose');
const logger = require('../utils/logger');


const connectDB = async () =>{
    try {
         await mongoose.connect(process.env.MONGO_URI);
         logger.info('Mongodb connection sucessful');
    } catch (error) {
       logger.error({message: error.message, 
        stack: error.stack.split("\n")[0]
    });
       setTimeout(() => process.exit(1), 1000);
    }
}

module.exports = connectDB;