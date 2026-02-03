const express = require("express");
const router = express.Router()

const {
    imageToPdf,
    pdfToImage
} = require("../controllers/imgConversion")

router.post("/img-to-pdf", imageToPdf);
router.post("/pdf-to-img", pdfToImage);

module.exports = router;