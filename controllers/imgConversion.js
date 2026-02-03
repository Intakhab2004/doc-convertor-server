const fs = require("fs/promises")
const fsSync = require("fs")
const path = require("path")
const sharp = require("sharp")
const { PDFDocument } = require("pdf-lib")
const poppler = require("pdf-poppler")
const archiver = require("archiver")
const File = require("../models/File")
const { fileValidation } = require("../helpers/fileTypeValidator")
const { uploadBufferToCloudinary, uploadFileToCloudinary } = require("../helpers/fileUploader")
const formatPageNumber = require("../helpers/formatPages")
require("../helpers/cleanupTask")

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
    try{
        const pages = req.body.pages;
        const file = req.files.file;
        const fileName = file.name;

        if(!file){
            console.log("File not provided");
            return res.status(402).json({
                success: false,
                message: "Please provide a file"
            })
        }

        // Validating the type of the file
        const isValid = await fileValidation(file.tempFilePath, "pdf_to_img");
        if(!isValid){
            return res.status(401).json({
                success: false,
                message: "File type not supported"
            })
        }

        // Converting the page numbers coming from the user input into formatted array
        const pageNumbers = formatPageNumber(pages);

        // Creating the files for storing the converted images and zip files for temporary storage
        const baseDir = path.join("/tmp", Date.now().toString());     // It creates a folder "tmp/03022026"
        const imageDir = path.join(baseDir, "images");               // It creates a folder "tmp/03022026/images"
        const zipFileDir = path.join(baseDir, "images.zip");         // It creates a file "tmp/03022026/images.zip"

        await fs.mkdir(baseDir, {recursive: true});
        await fs.mkdir(imageDir, { recursive: true });

        // Converting pdf to images
        await poppler.convert(
            file.tempFilePath, 
            {
                format: "png",
                out_dir: imageDir,
                out_prefix: "page",
                scale: 1200
            }
        )

        // Filter the pages according the user needs
        if(pageNumbers){
            const files = await fs.readdir(imageDir);
            for(const file of files){
                const pageNo = Number(file.match(/\d+/)[0]);
                if(!pageNumbers.includes(pageNo)){
                    await fs.rm(path.join(imageDir, file), {force: true});
                }
            }
        }

        // Create a zip folder for the images
        const archive = archiver("zip", {zlib: {level: 9}});
        archive.pipe(fsSync.createWriteStream(zipFileDir));
        archive.directory(imageDir, false);
        await archive.finalize();

        // Upload the zip file to cloudinary
        const uploadResponse = await uploadFileToCloudinary(zipFileDir, process.env.FOLDER_NAME, fileName);

        // Deleting the temporary folder that stores the images and zip file
        await fs.rm(baseDir, {recursive: true, force: true});

        // Creating entry in the DB
        const newFile = await File.create({
            output: {
                publicId: uploadResponse.public_id,
                url: uploadResponse.secure_url,
                format: uploadResponse.format
            }
        })

        // Send response to the client
        return res.status(200).json({
            success: true,
            message: "Pdf converted successfully",
            file_url: uploadResponse.secure_url,
            file_id: newFile._id
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


exports.imgToDocx = async(req, res) => {

}