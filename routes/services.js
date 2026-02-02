const express = require("express");
const router = express.Router()

const {
    imageToPdf
} = require("../controllers/imgConversion")

router.post("/img-to-pdf", imageToPdf);

module.exports = router;