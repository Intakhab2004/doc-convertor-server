const User = require("../models/User")
const OTP = require("../models/OTP")
const PersonalDetails = require("../models/PersonalDetails")
const bcrypt = require("bcryptjs")
const { signupSchema } = require("../schemas/signupSchema")
const { mailSender } = require("../config/mailConfig")


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
        const mailResponse = await mailSender({email: userData.email, username: userData.username, otp});
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