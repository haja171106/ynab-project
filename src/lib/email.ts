import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
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

  if (error) {
    console.error("[Resend] Failed to send email:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("[Resend] Email sent successfully:", data?.id);
  return data;
}