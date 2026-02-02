const cloudinary = require("../config/cloudinaryConfig")

async function uploadFileToCloudinary(file, folder){
    return await cloudinary.uploader.upload(
        file,
        {
            folder: folder,
            resource_type: "auto"
        }
    )
}

async function uploadBufferToCloudinary(buffer, folder, fileName){
    return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: folder,
                format: "pdf",
                use_filename: true,
                unique_filename: false,
                public_id: fileName.replace(/\.[^/.]+$/, "")
            },
            (err, result) => {
                if(err){
                    return reject(err);
                }
                resolve(result)
            }
        )
        uploadStream.end(buffer);
    })
}

module.exports = {
    uploadFileToCloudinary,
    uploadBufferToCloudinary
};
