const { z } = require("zod")

exports.contactSchema = z.object({
    name: z.string()
                   .min(1, "Name is required")
                   .min(2, "Name must be of atleast 2 character")
                   .max(50, "Name must not be more than 50 characters"),

    email: z.email("Invalid email address")
                  .min(1, {message: "Email is required"}),

    subject: z.string()
                      .min(1, "Subject is required")
                      .min(5, "Write atleast few words of subject"),

    message: z.string()
                      .min(1, "Message is required")
                      .min(10, "Message must be of atleast 10 characters")
})