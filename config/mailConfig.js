const nodemailer = require("nodemailer");
const otpTemplate = require("../mail-template/otpTemplate");


exports.mailSender = async({email, username, otp}) => {
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        const mailOptions = {
            from: `DocConvertor ${process.env.MAIL_USER}`,
            to: email,
            subject: "DocConvertor | Verification Code",
            html: otpTemplate(otp, username)
        }

        const mailResponse = await transporter.sendMail(mailOptions);

        if(mailResponse.accepted.length > 0){
            return {
                success: true,
                status: 200,
                message: "Verification code sent successfully"
            }
        }

        return {
            success: false,
            status: 402,
            message: "Something went wrong while sending mail"
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