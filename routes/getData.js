const express = require("express")
const router = express.Router();


const {
    getDownloadLink
} = require("../controllers/getData");


router.get("/get-download-link/:fileId", getDownloadLink);

module.exports = router;