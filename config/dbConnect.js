const mongoose = require("mongoose");
require("dotenv").config();


const dbConnect = async() => {
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected to server successfully");
    }
    catch(error){
        console.log("Something went wrong while connecting to database");
        console.error("An error occured: ", error);
        
        process.exit(1);
    }
}

module.exports = dbConnect;