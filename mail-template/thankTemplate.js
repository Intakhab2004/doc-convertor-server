const thankYouTemplate = (name) => {
    return `
        <div style="font-family:Arial, sans-serif; background:#f4f4f4; padding:30px;">
            <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center;">
                <h1 style="color:#4A90E2; margin-bottom:10px;">
                    DocMaster
                </h1>
                <p style="color:#888; margin-top:0; margin-bottom:20px;">
                    Thank You for Reaching Out 💙
                </p>

                <p style="font-size:16px; color:#333;">
                    Hello <strong>${name || "there"}</strong>,
                </p>

                <p style="font-size:15px; color:#555; line-height:1.6;">
                    Thank you for taking the time to contact us. We truly appreciate you reaching out and sharing your message with us.
                </p>

                <p style="font-size:15px; color:#555; line-height:1.6;">
                    Our support team has received your request and will review it carefully. We’ll get back to you as soon as possible with the help you need.
                </p>

                <div style="margin:30px 0;">
                    <span style="display:inline-block; font-size:16px; font-weight:bold; color:#4A90E2; border:2px dashed #4A90E2; padding:12px 24px; border-radius:8px; background:#f9f9f9;">
                        We're here to help 😊
                    </span>
                </div>

                <p style="font-size:14px; color:#888; margin-top:20px;">
                    If you have any additional details to share, feel free to reply to this email.
                </p>

                <p style="font-size:12px; color:#aaa; margin-top:20px;">
                    &copy; 2026 DocConvertor. All rights reserved.
                </p>
            </div>
        </div>
    `
}

module.exports = thankYouTemplate;