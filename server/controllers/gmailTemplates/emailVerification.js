// emailTemplate.js
const emailVerificationTemplate = (code, username) => `
<div style="font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: #f9f9f9;
        text-align: center; ">
        <h2 style="color: #333;"><u>Verify Your Email Address</u></h2>
        <h3>Dear ${username}...</h3>
        <p style="color: #555; font-size: 16px;">
            To complete your registration, please use the verification code below:
        </p>
        <h1 style="font-size: 24px;
            color: #007bff; /* Blue text color */
            background-color: #e7f1ff; /* Light blue background */
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;">
            ${code}
        </h1>
        <p style="color: red">
            " Ignore this, if you don't request any verification! "
        </p>
        <h3 style="color: #555;">Thank you...<br>TopnTech Solutions</h3>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        <div style="font-size: 12px; color: #999;">
            <p>This email was sent to you because you signed up on Universal Farmer.</p>
            <p>If you're having trouble viewing this email, please check your email settings.</p>
        </div>
    </div>
`;

module.exports = emailVerificationTemplate;
