import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // ex: hajaravahatra@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // le mot de passe d'application (16 caractères)
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: `"YNAB" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your YNAB password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3F2734;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below:</p>
          <a href="${resetUrl}" style="background: #F57A00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    console.log("[Gmail] Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("[Gmail] Failed to send email:", error);
    throw error;
  }
}