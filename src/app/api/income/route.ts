import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error("GET /api/income error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, source, amount, notes, documentUrl, documentPublicId } = await req.json();

    if (!date || !source || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const income = await prisma.income.create({
      data: {
        date: new Date(date),
        source,
        amount: parseFloat(amount),
        notes,
        documentUrl,
        documentPublicId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error("POST /api/income error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}