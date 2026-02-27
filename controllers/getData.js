const File = require("../models/File")



exports.getDownloadLink = async(req, res) => {
    try{
        const { fileId } = req.params
        if(!fileId){
            console.log("File id is not provided");
            return res.status(403).json({
                success: false,
                message: "Please provide file id"
            })
        }

        const file = await File.findById(fileId);
        if(!file){
            console.log("File not exists");
            return res.status(404).json({
                success: false,
                message: "File not exists"
            })
        }

        return res.status(200).json({
            success: true,
            downloadLink: file.output?.url
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