const forgotPassowrdTemplate = (token) => `
<div style="font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: #f9f9f9; ">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555;">Dear User..</p>
        <p style="color: #555;">
            We received a request to reset your password. Click the button below to reset your password:
        </p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${token}" style="display: inline-block;
            margin: 20px 0;
            padding: 15px 30px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease, transform 0.2s ease;"
            onmouseover="this.style.backgroundColor='#0056b3'; this.style.transform='scale(1.05)';"
            onmouseout="this.style.backgroundColor='#007bff'; this.style.transform='scale(1)';" role="button"
            aria-label="Reset your password">
            Reset Password
        </a>
        <p style="color: red;">
            " Ignore this, if you don't request a password reset! "
        </p>
        <h3 style="color: #555;">Thank you...<br>TopnTech Solutions</h3>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">
            If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web
            browser:<br />
            <a href="${process.env.FRONTEND_URL}/reset-password/${token}"
                style="color: #007bff;">${process.env.FRONTEND_URL}/reset-password/${token}
            </a>
        </p>
    </div>
`;

module.exports = forgotPassowrdTemplate;
