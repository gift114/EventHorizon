const nodemailer = require('nodemailer');
const ejs = require("ejs");
const path = require("path");

const templatesDir = path.join(__dirname, '../templates');

const sendEmail = async ({ to, subject, template, data, text }) => {
  const html = await ejs.renderFile(path.join(templatesDir, `${template}.ejs`), data);

  const port = Number(process.env.EMAIL_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
};

async function sendVerificationEmail({ to, name, rawToken }) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  await sendEmail({
    to,
    subject: 'Verify your EventHorizon account',
    template: 'verify-email', // you'll need src/templates/verify-email.ejs — see below
    data: { firstName: name, verificationUrl },
  });
}

module.exports = { sendEmail, sendVerificationEmail };