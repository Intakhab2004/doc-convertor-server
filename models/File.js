const mongoose = require("mongoose")

const fileSchema = new mongoose.Schema({
    output: {
        publicId: String,
        url: String,
        format: String
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 60 * 60 * 1000)
    }
})

const fileModel = mongoose.model("File", fileSchema);
module.exports = fileModel;