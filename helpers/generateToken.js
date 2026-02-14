const jwt = require("jsonwebtoken")

exports.generateAccessToken = ( payload ) => {
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: "3d"});
    return token;
}


exports.generateRefreshToken = ( payload ) => {
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "21d"});
    return token;
}
