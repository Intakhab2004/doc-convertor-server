const { z } = require("zod")

const usernameSchema = z.string()
                                .min(1, {message: "Username is required"})
                                .min(2, {message: "Username must be of atleast 2 characters"})
                                .max(20, {message: "Username must be no longer than 20 characters"})


const signupSchema = z.object({
    username: usernameSchema,

    email: z.email("The email you have provided is Invalid")
                  .min(1, "Email is required"),

    password: z.string()
                       .min(1, "Password is required")
                       .min(6, "Password must be of atleast 6 characters"),

    confirmPassword: z.string()
                              .min(1, "Password is required")
                              .min(6, "Password must be of atleast 6 characters")
})
.refine((data) => data.password === data.confirmPassword, {
    message: "Passwords not matching",
    path: ["confirmPassword"]
})

module.exports = {
    usernameSchema,
    signupSchema
}