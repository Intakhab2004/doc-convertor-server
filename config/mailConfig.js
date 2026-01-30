// const nodemailer = require("nodemailer");
const axios = require("axios");
const otpTemplate = require("../mail-template/otpTemplate");


// exports.mailSender = async({email, username, otp}) => {
//     try{
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.MAIL_USER,
//                 pass: process.env.MAIL_PASS
//             }
//         })

//         const mailOptions = {
//             from: `DocConvertor ${process.env.MAIL_USER}`,
//             to: email,
//             subject: "DocConvertor | Verification Code",
//             html: otpTemplate(otp, username)
//         }

//         const mailResponse = await transporter.sendMail(mailOptions);

//         if(mailResponse.accepted.length > 0){
//             return {
//                 success: true,
//                 status: 200,
//                 message: "Verification code sent successfully"
//             }
//         }

//         return {
//             success: false,
//             status: 402,
//             message: "Something went wrong while sending mail"
//         }
//     }
//     catch(error){
//         console.log("An error occured while sending mail: ", error.message);
//         return {
//             success: false,
//             status: 500,
//             message: "Internal server error"
//         }
//     }
// }



exports.mailSender = async({email, username, otp}) => {
    url = "https://api.brevo.com/v3/smtp/email";
    body = {
        sender: {
            name: "DocConvertor",
            email: process.env.BREVO_MAIL_USER
        },
        to: [{ email }],
        subject: "DocConvertor | Verification Code",
        htmlContent: otpTemplate(username, otp)
    }
    try{
        await axios.post(
            url,
            body,
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        )

        return {
            success: true,
            status: 200,
            message: "Verification code sent successfully"
        }
    }
    catch(error){
        console.log("An error occured while sending mail: ", error.message);
        return {
            success: false,
            status: 500,
            message: "Internal server error"
        }
    }
}
