const { z } = require("zod");

exports.signinSchema = z.object({
    identifier: z.string(),
    password: z.string()
})