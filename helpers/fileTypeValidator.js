const { fileTypeFromFile } = require("file-type")

exports.fileValidation = async(file, checkType) => {
    try{
        const fileType = await fileTypeFromFile(file);
        if(!fileType || !fileType.mime) return false;

        if(checkType === "img_to_pdf"){
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
            return allowedTypes.includes(fileType.mime);
        }

        if(checkType === "pdf_to_img"){
            return fileType.mime === "application/pdf" ? true : false;
        }

        return false;
    }
    catch(error){
        console.log("Something went wrong while checking file type: ", error);
        return false;
    }
}




