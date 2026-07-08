import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[forgot-password] received:", JSON.stringify(rawEmail), "normalized:", email, "found:", !!user);

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ message: "If this email exists, a reset link has been sent." });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({ data: { email, token, expires } });

    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      console.error("[forgot-password] Failed to send email:", emailError);
    }

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}