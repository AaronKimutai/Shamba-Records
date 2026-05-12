require('dotenv').config();
console.log("Evn var:", process.env.MONGO_URI);
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// parsing json data
app.use(express.json());
connectDB();
// middleware
app.use('/users', userRoutes);
app.use('/fields', fieldRoutes);
app.use(errorHandler);

// main route
app.use('/', (req, res) => {
    res.send("Welcome to Shamba Records API");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT${PORT}`);
})


