const cloudinary = require("../config/cloudinaryConfig")
const cron = require("node-cron")
const File = require("../models/File")


async function deleteFromCloudinary(publicId){
    try{
        await cloudinary.destroy(
            publicId,
            {
                resource_type: "raw"
            }
        )
    }
    catch(error){
        console.log("something went wrong while deleting from cloudinary: ", error);
        return ;
    }
}


cron.schedule("*/10 * * * *", async() => {
    try{
        const expiredServices = await File.find({
            expiresAt: {$lte: new Date()}
        })

        for(const service of expiredServices){
            await deleteFromCloudinary(service.output.publicId);
            await service.deleteOne();
        }
    }
    catch(error){
        console.log("Something went wrong while cleaning up");
        return ;
    }
})