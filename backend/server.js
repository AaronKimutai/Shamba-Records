require('dotenv').config();
console.log("Evn var:", process.env.MONGO_URI);
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const errorHandler = require('./middleware/errorHandler');
const app = express();
app.use(cors({
    origin: 'http://localhost: 5173',
    credentials: true
}));
const morgan =require('morgan');
const logger = require('./utils/logger');
app.use(morgan('dev'));
// parsing json data
app.use(express.json());
connectDB();
// middleware
app.use('/users', userRoutes);
app.use('/fields', fieldRoutes);
app.use(errorHandler);
// 
process.on('unhandledRejection', (reason)=>{
    logger.error({message: reason.message, 
        stack: reason.stack.split("\n")[0]
    });
});
process.on('uncaughtException', (error)=>{
    logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        setTimeout(() => process.exit(1), 1000);
});

// main route
app.use('/', (req, res) => {
    res.send("Welcome to Shamba Records API");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    logger.info(`Server is running on PORT:${PORT}`);
})


