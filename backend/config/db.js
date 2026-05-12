const mongoose = require('mongoose');

const connectDB = async () =>{
    try {
         await mongoose.connect(process.env.MONGO_URI);
         console.log('Mongodb connection sucessful');
    } catch (error) {
       console.log({message: "Mongodb connection failed", error});
       process.exit(1);
    }

}

module.exports = connectDB;