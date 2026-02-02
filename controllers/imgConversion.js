const File = require("../models/File")
const fs = require("fs/promises")
const sharp = require("sharp")
const { PDFDocument } = require("pdf-lib")
const { fileValidation } = require("../helpers/fileTypeValidator")
const { uploadBufferToCloudinary } = require("../helpers/fileUploader")

exports.imageToPdf = async(req, res) => {
    const file = req.files.image;
    if(!file){
        console.log("Please provide a file");
        return res.status(400).json({
            success: false,
            message: "Please provide a file"
        })
    }
    const fileName = file.name;

    try{
        // Validating the type of the file
        const isValid = await fileValidation(file.tempFilePath, "img_to_pdf");
        if(!isValid){
            console.log("File type is not supported");
            return res.status(401).json({
                success: false,
                message: "File type not supported for the chosen service"
            })
        }

        // Converting the file into buffer to 
        const imageBuffer = await fs.readFile(file.tempFilePath);

        // Convert the image buffer to png format buffer to generalize it, than png -> pdf
        const pngBuffer = await sharp(imageBuffer).png().toBuffer();

        // Converting pngBuffer to pdf file
        const pdfDoc = await PDFDocument.create();
        const pngImage = await pdfDoc.embedPng(pngBuffer);

        // Setting the height and width of the file
        const pageWidth = 595;   // for A4 size page
        const pageHeight = 842;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        const scale = Math.min(
            pageWidth / pngImage.width,
            pageHeight / pngImage.height
        );

        const imgWidth = pngImage.width * scale;
        const imgHeight = pngImage.height * scale;

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        page.drawImage(pngImage, {
            x,
            y,
            width: imgWidth,
            height: imgHeight,
        })
        const pdfBuffer = await pdfDoc.save();

        // Uploading the converted the file to cloudinary
        const uploadResponse = await uploadBufferToCloudinary(pdfBuffer, process.env.FOLDER_NAME, fileName)

        // Creating entry of file in the DB
        const newPdf = await File.create({
            output: {
                publicId: uploadResponse.public_id,
                url: uploadResponse.secure_url,
                format: uploadResponse.format
            }
        });

        // Send the downloadable url and object_id in response
        return res.status(200).json({
            success: true,
            message: "File converted successful",
            file_url: uploadResponse.secure_url,
            file_id: newPdf._id
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


exports.pdfToImage = async(req, res) => {
    
}


exports.imgToDocx = async(req, res) => {

}