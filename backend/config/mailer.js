const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVotingEmail = async (to, token) => {
  const votingLink = `${process.env.FRONTEND_URL}/vote.html?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Secure Voting Link",
    html: `
      <h2>Your document has been approved</h2>
      <p>You can now vote using your secure one-time voting link.</p>
      <p>
        <a href="${votingLink}" style="display:inline-block;padding:12px 18px;background:#1f3c88;color:#fff;text-decoration:none;border-radius:8px;">
          Open Voting Page
        </a>
      </p>
      <p>Or copy this link:</p>
      <p>${votingLink}</p>
      <p>This link can be used only once.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVotingEmail };