const express = require("express")
const router = express.Router()

const { 
    signUp,
    verifyOtp,
    signIn,
    refreshToken
 } = require("../controllers/auth")

router.post("/sign-up", signUp);
router.post("/verify-otp", verifyOtp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);

module.exports = router;