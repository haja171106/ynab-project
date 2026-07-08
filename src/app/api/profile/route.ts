import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/cloudinary";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      currency: true,
      image: true,
      imagePublicId: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { firstName, lastName, phone, location, currency, image, imagePublicId } = await req.json();

  // Si une nouvelle image est uploadée, supprimer l'ancienne de Cloudinary
  if (imagePublicId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { imagePublicId: true },
    });

    if (existingUser?.imagePublicId) {
      try {
        await deleteFile(existingUser.imagePublicId);
        console.log("Old profile image deleted from Cloudinary:", existingUser.imagePublicId);
      } catch (e) {
        console.error("Failed to delete old image from Cloudinary:", e);
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      phone,
      location,
      currency,
      image,
      ...(imagePublicId && { imagePublicId }),
    },
  });

  return NextResponse.json(user);
}