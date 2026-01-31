const express = require("express")
const router = express.Router()

const { 
    signUp,
    verifyOtp,
    signIn,
    refreshToken,
    resendOtp,
    uniqueUsername,
    logout
 } = require("../controllers/auth")

router.post("/sign-up", signUp);
router.post("/verify-otp", verifyOtp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);
router.post("/resend-otp", resendOtp);
router.get("/unique-username", uniqueUsername);
router.post("/logout", logout);

module.exports = router;