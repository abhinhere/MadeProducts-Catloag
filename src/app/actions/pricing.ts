'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function upsertPriceSlab(productId: string, slabId: string | null, quantity: number, price: number, printingType?: string | null) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    if (slabId) {
      const existing = await prisma.priceSlab.findUnique({ where: { id: slabId } });
      if (existing) {
        await prisma.priceHistory.create({
          data: {
            productId,
            slabId,
            quantity: existing.quantity,
            oldPrice: existing.price,
            newPrice: price,
            changedById: user.id,
            action: 'UPDATE',
          },
        });
        await prisma.priceSlab.update({
          where: { id: slabId },
          data: { quantity, price, printingType },
        });
      }
    } else {
      const slab = await prisma.priceSlab.create({
        data: { productId, quantity, price, printingType },
      });
      await prisma.priceHistory.create({
        data: {
          productId,
          slabId: slab.id,
          quantity,
          newPrice: price,
          changedById: user.id,
          action: 'CREATE',
        },
      });
    }
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to save price slab' };
  }
}

export async function deletePriceSlab(productId: string, slabId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    const existing = await prisma.priceSlab.findUnique({ where: { id: slabId } });
    if (existing) {
      await prisma.priceHistory.create({
        data: {
          productId,
          slabId,
          quantity: existing.quantity,
          oldPrice: existing.price,
          newPrice: existing.price,
          changedById: user.id,
          action: 'DELETE',
        },
      });
    }
    await prisma.priceSlab.delete({ where: { id: slabId } });
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true };
  } catch {
    return { error: 'Failed to delete price slab' };
  }
}

export async function getPriceHistory(productId?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return [];

  return prisma.priceHistory.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: { select: { name: true } },
      changedBy: { select: { name: true } },
    },
    orderBy: { changedAt: 'desc' },
    take: 100,
  });
}
