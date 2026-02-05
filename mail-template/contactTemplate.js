const supportTemplate = ({ name, email, subject, message }) => {
    return `
        <div style="font-family:Arial, sans-serif; background:#f4f4f4; padding:30px;">
            <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <h1 style="color:#4A90E2; margin-bottom:10px; text-align:center;">
                    DocMaster
                </h1>
                <p style="color:#888; margin-top:0; margin-bottom:20px; text-align:center;">
                    New Support Request
                </p>

                <p style="font-size:16px; color:#333;">
                    Hello Support Team,
                </p>

                <p style="font-size:15px; color:#555;">
                    You have received a new support request from a user. Details are below:
                </p>

                <div style="margin-top:25px;">
                    <p style="font-size:14px; color:#555; margin-bottom:6px;">
                        <strong>Name:</strong> ${name}
                    </p>

                    <p style="font-size:14px; color:#555; margin-bottom:6px;">
                        <strong>Email:</strong> ${email}
                    </p>

                    <p style="font-size:14px; color:#555; margin-bottom:6px;">
                        <strong>Subject:</strong> ${subject}
                    </p>
                </div>

                <div style="margin-top:20px;">
                    <p style="font-size:14px; color:#555; margin-bottom:8px;">
                        <strong>Message:</strong>
                    </p>

                    <div style="background:#f9f9f9; border-left:4px solid #4A90E2; padding:15px; border-radius:6px; color:#333; white-space:pre-wrap;">
                        ${message}
                    </div>
                </div>

                <p style="font-size:14px; color:#888; margin-top:30px;">
                    Please respond to the user as soon as possible.
                </p>

                <p style="font-size:12px; color:#aaa; margin-top:20px; text-align:center;">
                    &copy; 2026 DocMaster. All rights reserved.
                </p>
            </div>
        </div>
    `
}

module.exports = supportTemplate;