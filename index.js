const express = require("express")
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/auth")
const cors = require("cors");
require("dotenv").config();

const app = express();

// Mounting middleware
app.use(express.json());
app.use(cors());

// Mounting api-url on app 
app.use("/api/v1/user", authRoutes)

// Starting the server
const PORT = process.env.PORT || 5000;
const startServer = async() => {
    try{
        await dbConnect();
        app.listen(PORT, () => {
            console.log(`App is up and running at port number ${PORT}`);
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
    }
}
startServer()

// Default Route
app.get("/", (_, res) => {
    console.log("Server is up and running");
    return res.status(200).json({
        success: true,
        message: "Server is running"
    })
})

