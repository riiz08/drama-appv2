"use server";

import { Status } from "@/app/generated/prisma";
import { prisma } from "@/lib/db";
import { CreateDramaInput } from "@/types";

// Create new drama
export async function createDrama(data: CreateDramaInput) {
  try {
    const drama = await prisma.drama.create({
      data: {
        ...data,
        releaseDate: new Date(data.releaseDate),
        status: data.status as Status,
      },
    });

    return { success: true, drama };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create drama",
    };
  }
}

// Update drama
export async function updateDrama(id: string, data: Partial<CreateDramaInput>) {
  try {
    const updateData: any = { ...data };

    if (data.releaseDate) {
      updateData.releaseDate = new Date(data.releaseDate);
    }

    if (data.status) {
      updateData.status = data.status as Status;
    }

    const drama = await prisma.drama.update({
      where: { id },
      data: updateData,
    });

    return { success: true, drama };
  } catch (error) {
    return {
      success: false,
      error: "Failed to update drama",
    };
  }
}

// Delete drama
export async function deleteDrama(id: string) {
  try {
    await prisma.drama.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete drama",
    };
  }
}

// Toggle popular status
export async function togglePopular(id: string) {
  try {
    const drama = await prisma.drama.findUnique({
      where: { id },
      select: { isPopular: true },
    });

    if (!drama) {
      return { success: false, error: "Drama not found" };
    }

    const updated = await prisma.drama.update({
      where: { id },
      data: { isPopular: !drama.isPopular },
    });

    return { success: true, drama: updated };
  } catch (error) {
    return {
      success: false,
      error: "Failed to toggle popular status",
    };
  }
}
