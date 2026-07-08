import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/cloudinary";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const income = await prisma.income.updateMany({
    where: { id, userId: session.user.id },
    data: {
      date: new Date(data.date),
      source: data.source,
      amount: parseFloat(data.amount),
      notes: data.notes,
    },
  });

  return NextResponse.json(income);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const income = await prisma.income.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!income) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (income.documentPublicId) {
    try { await deleteFile(income.documentPublicId); } catch {}
  }

  await prisma.income.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}