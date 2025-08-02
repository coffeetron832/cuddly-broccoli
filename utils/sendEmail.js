// /utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // tu correo
    pass: process.env.EMAIL_PASS, // tu token de app o contraseña
  },
});

async function sendVerificationEmail(toEmail, code) {
  const mailOptions = {
    from: `"VidLine" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verificación de correo - VidLine",
    html: `
      <h2>¡Hola!</h2>
      <p>Tu código de verificación es:</p>
      <h1 style="color: #333;">${code}</h1>
      <p>Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Correo enviado a ${toEmail}`);
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    throw err;
  }
}

module.exports = sendVerificationEmail;
