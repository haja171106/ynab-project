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

  const expense = await prisma.expense.updateMany({
    where: { id, userId: session.user.id },
    data: {
      date: new Date(data.date),
      categoryId: data.categoryId,
      amount: parseFloat(data.amount),
      description: data.description,
    },
  });

  return NextResponse.json(expense);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const expense = await prisma.expense.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (expense.receiptPublicId) {
    try { await deleteFile(expense.receiptPublicId); } catch {}
  }

  await prisma.expense.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}