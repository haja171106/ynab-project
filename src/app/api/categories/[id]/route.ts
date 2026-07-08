import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;
  const { id } = await params;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  await prisma.category.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Deleted",
  });
}