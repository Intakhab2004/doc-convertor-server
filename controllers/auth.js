const User = require("../models/User")
const OTP = require("../models/OTP")
const PersonalDetails = require("../models/PersonalDetails")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { signupSchema, usernameSchema } = require("../schemas/signupSchema")
const { signinSchema } = require("../schemas/signinSchema")
const { otpVerifySchema } = require("../schemas/otpSchema")
const { mailSender } = require("../config/mailConfig")
const { generateAccessToken, generateRefreshToken } = require("../helpers/generateToken")
const otpTemplate = require("../mail-template/otpTemplate");


exports.resendOtp = async(req, res) => {
    const { userId } = req.body;
    if(!userId){
        console.log("User is not provided");
        return res.status(402).json({
            success: false,
            message: "Please provide the userId"
        })
    }

    try{
        // Checking if the user exists or not
        const user = await User.findById(userId);
        if(!user){
            return res.status(403).json({
                success: false,
                message: "User does not exists"
            })
        }

        if(user?.isVerified){
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            })
        }

        // Deleting all the OTP before setting the new one
        await OTP.deleteMany({userId});

        // Generating otp and saving it in the database
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();
        await OTP.create({
            userId: userId, 
            email: user.email, 
            username: user.username, 
            otp: otp
        })

        // Sending otp to user via mail
        const mailResponse = await mailSender({
            email: user.email, 
            subject: "DocMaster | Verification Code", 
            emailBody: otpTemplate(otp, user.username)
        })
        if(!mailResponse.success){
            console.log("Something went wrong while sending the mail");
            return res.status(400).json({
                success: false,
                message: "Error while sending mail"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Otp resent successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.uniqueUsername = async(req, res) => {
    const username = req.query.username.trim();

    // Zod validation
    const validationResult = usernameSchema.safeParse(username);
    if(!validationResult.success){
        console.log("Validation failed: ", validationResult.error.issues);
        return res.status(403).json({
            success: false,
            message: "Please provide the valid username"
        })
    }

    try{
        const existingUsername = await User.findOne({username: validationResult.data});
        if(existingUsername){
            console.log("User already exists with this username");
            return res.status(400).json({
                success: false,
                message: "Username is taken"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Username is available"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.signUp = async(req, res) => {
    try{
        const { username, email, password, confirmPassword } = req.body;

        const signupQuerySchema = {    // This object for validating user input using zod.
            username,
            email,
            password, 
            confirmPassword
        }

        // Zod validation
        const validationResult = signupSchema.safeParse(signupQuerySchema);
        if(!validationResult.success){
            console.error("Validation failed: ", validationResult.error.issues);
            return res.status(400).json({
                success: false,
                message: "Please fill all the details correctly",
                errors: validationResult.error.issues
            })
        }

        const userData = validationResult.data;   // Parsed user data

        //OTP generation and password hashing
        const otp = Math.floor(Math.random() * 900000 + 100000).toString()
        const hashedpassword = await bcrypt.hash(userData.password, 10);

        // Checking if user already exists
        let existingUser = await User.findOne({
            $or: [
                {username: userData.username},
                {email: userData.email}
            ]
        })

        if(existingUser){
            if(existingUser?.isVerified){
                if(existingUser.username === userData.username){
                    console.log("User exists with the provided username");
                    return res.status(409).json({
                        success: false,
                        message: `User already exists with username: ${existingUser.username}`
                    })
                }
                else{
                    console.log("User already exists with the provided email");
                    return res.status(409).json({
                        success: false,
                        message: `User already exists with email: ${existingUser.email}`
                    })
                }
            }

            existingUser.username = userData.username;
            existingUser.email = userData.email;
            existingUser.password = hashedpassword;
            existingUser.avatar.imgUrl = "";
            existingUser.avatar.publicId = "";

            await existingUser.save();
        }
        else{
            const userDetails = await PersonalDetails.create({});

            existingUser = new User({
                username: userData.username,
                email: userData.email,
                password: hashedpassword,
                avatar: {
                    imgUrl: "",
                    publicId: ""
                },
                personalDetails: userDetails._id
            })
            await existingUser.save();
        }

        // Creating entry of OTP in DB
        await OTP.deleteMany({userId: existingUser._id})
        await OTP.create({
            userId: existingUser._id, 
            email: userData.email, 
            username: userData.username, 
            otp: otp
        });

        // Sending verification mail
        const mailResponse = await mailSender({
            email: userData.email, 
            subject: "DocMaster | Verification Code", 
            emailBody: otpTemplate(otp, userData.username)
        })
        if(!mailResponse.success){
            console.log("Something went wrong while sending the mail");
            return res.status(400).json({
                success: false,
                message: "Error while sending mail"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Account created successfully",
            userId: existingUser._id
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.verifyOtp = async(req, res) => {
    const { userId, otp } = req.body;

    // Zod validation
    const validationResult = otpVerifySchema.safeParse({userId, otp});
    if(!validationResult.success){
        console.log("Input validation failed: ", validationResult.error.issues);
        return res.status(400).json({
            success: false,
            message: "Please fill all the details carefully",
            errors: validationResult.error.issues
        })
    }

    const data = validationResult.data;

    try{
        // Checking if the user exists or not
        const user = await User.findById(data.userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User does not exists"
            })
        }

        if(user && user.isVerified){
            return res.status(400).json({
                success: false,
                message: "User is already verified"
            })
        }

        // Verifying the otp
        const dbOtp = await OTP.findOne({userId: data.userId});
        if(!dbOtp){
            return res.status(402).json({
                success: false,
                message: "OTP expired, Please generate a new OTP"
            })
        }

        if(dbOtp.otp !== data.otp){
            return res.status(403).json({
                success: false,
                message: "Invalid OTP, Please give a valid OTP"
            })
        }

        // Making the user as verified user
        user.isVerified = true;
        await user.save();

        // Revoking the OTP from DB
        await OTP.findByIdAndDelete(dbOtp._id);

        return res.status(200).json({
            success: true,
            message: "Account verified successfully, You can login now with your credentials"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.signIn = async(req, res) => {
    const { identifier, password } = req.body;

    // Zod validation
    const validationResult = signinSchema.safeParse({identifier, password});
    if(!validationResult.success){
        console.log("Validation failed: ", validationResult.error.issues);
        return res.status(400).json({
            success: false,
            message: "Please fill all the details carefully",
            errors: validationResult.error.issues
        })
    }

    const data = validationResult.data;

    try{
        // Checking if the user exists and verified or not
        const user = await User.findOne({
            $or: [
                {username: data.identifier},
                {email: data.identifier}
            ]
        })

        if(!user){
            console.log("User does not exists.");
            return res.status(404).json({
                success: false,
                message: "User does not exists with the given credentials"
            })
        }

        if(user && !user.isVerified){
            return res.status(403).json({
                success: false,
                message: "Please verify the account before login"
            })
        }

        // Verifying the password
        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword){
            return res.status(400).json({
                success: false,
                message: "Incorrect password, Please give the valid password"
            })
        }

        // Creating refresh & access tokens
        const accessToken = generateAccessToken({id: user._id, email: user.email, username: user.username});
        const refreshToken = generateRefreshToken({id: user._id, email: user.email, username: user.username});

        user.password = undefined;
        const cookiesOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }

        res.cookie("refreshToken", refreshToken, cookiesOptions).status(200).json({
            success: true,
            message: "User logged in successfully",
            user,
            accessToken
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.refreshToken = async(req, res) => {
    try{
        const token = req.cookies?.refreshToken;
        if(!token){
            console.log("Refresh token expires");
            return res.status(401).json({
                success: false,
                message: "Refresh token expired, Please login again"
            })
        }

        let user;

        // Verifying token
        try{
            const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
            user = verifiedToken
        }
        catch(error){
            return res.status.json({
                success: false,
                message: "Something went wrong while verifying token"
            })
        }

        // Creating new refresh & access tokens
        const newAccessToken = generateAccessToken({id: user._id, email: user.email, username: user.username});
        const newRefreshToken = generateRefreshToken({id: user._id, email: user.email, username: user.username});

        const cookiesOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }

        res.cookie("refreshToken", newRefreshToken, cookiesOptions).status(200).json({
            success: true,
            message: "Token refreshed successfully",
            newAccessToken
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.logout = async(_, res) => {
    try{
        res.clearCookie("refreshToken", {
            httpOnly: true
        })

        res.status(200).json({
            success: true, 
            message: "User logged out successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}