const express = require("express")
const dbConnect = require("./config/dbConnect")
const cors = require("cors")
const fileupload = require("express-fileupload")
const authRoutes = require("./routes/auth")
const servicesRoute = require("./routes/services")
const contactRoute = require("./routes/contact")
require("dotenv").config();

const app = express();

// Mounting middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))

// Mounting api-url on app 
app.use("/api/v1/user", authRoutes);
app.use("/api/v1/services", servicesRoute);
app.use("/api/v1/contact", contactRoute);

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

