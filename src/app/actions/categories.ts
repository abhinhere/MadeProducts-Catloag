'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function createCategory(name: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };
  if (!name?.trim()) return { error: 'Category name is required' };

  try {
    const category = await prisma.category.create({ data: { name: name.trim() } });
    revalidatePath('/dashboard/categories');
    return { success: true, category };
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002') return { error: 'Category already exists' };
    return { error: 'Failed to create category' };
  }
}

export async function updateCategory(id: string, name: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.category.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002') return { error: 'Category already exists' };
    return { error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) return { error: `Cannot delete: ${count} products use this category` };

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch {
    return { error: 'Failed to delete category' };
  }
}
