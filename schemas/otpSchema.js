const { z } = require("zod");

exports.otpVerifySchema = z.object({
    userId: z.string()
                     .min(1, "User id is not provided"),

    otp: z.string()
                  .min(1, "OTP is required")
                  .length(6, "OTP must be of 6 digits")
})