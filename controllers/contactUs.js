
const { contactSchema } = require("../schemas/contactSchema")
const supportTemplate = require("../mail-template/contactTemplate")
const thankYouTemplate = require("../mail-template/thankTemplate");
const { mailSender } = require("../config/mailConfig");


exports.contactUs = async (req, res) => {
    try{
        const { name, email, subject, message } = req.body;
        const contactQuerySchema = {
            name,
            email,
            subject,
            message
        }

        // Zod validation
        const validationResult = contactSchema.safeParse(contactQuerySchema);
        if(!validationResult.success){
            console.log("Validation failed: ", validationResult.error.issues);
            return res.status(402).json({
                success: false,
                message: "Please fill all the details correctly",
                errors: validationResult.error.issues
            })
        }

        const data = validationResult.data;

        // Send mail to the support team
        const mailResponse = await mailSender({
            email: process.env.SUPPORT_MAIL, 
            subject: "DocMaster | New Support Request", 
            emailBody: supportTemplate({ 
                name: data.name, 
                email: data.email, 
                subject: data.subject, 
                message: data.message 
            })
        })
        if(!mailResponse.success){
            console.log("Something went wrong while sending the support mail");
            return res.status(400).json({
                success: false,
                message: "Error while sending support mail"
            })
        }

        // Send mail to the user for thanking to get the message
        const response = await mailSender({
            email: data.email,
            subject: "DocMaster | Thank You for contacting Docmaster",
            emailBody: thankYouTemplate(data.name)
        })
        if(!response.success){
            console.log("Something went wrong while sending the thank you mail");
            return res.status(400).json({
                success: false,
                message: "Error while sending mail"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Support mail sent successfully"
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