'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  width: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  gusset: z.coerce.number().optional().nullable(),
  gsm: z.coerce.number().int().optional().nullable(),
  material: z.string().optional().nullable(),
  handleType: z.string().optional().nullable(),
  printingType: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  moq: z.coerce.number().int().optional().nullable(),
});

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    categoryId: formData.get('categoryId') as string,
    description: formData.get('description') as string || undefined,
    width: formData.get('width') || undefined,
    height: formData.get('height') || undefined,
    gusset: formData.get('gusset') || undefined,
    gsm: formData.get('gsm') || undefined,
    material: formData.get('material') as string || undefined,
    handleType: formData.get('handleType') as string || undefined,
    printingType: formData.get('printingType') as string || undefined,
    color: formData.get('color') as string || undefined,
    moq: formData.get('moq') || undefined,
  };

  const result = productSchema.safeParse(rawData);
  if (!result.success) return { error: result.error.errors[0].message };

  try {
    const product = await prisma.product.create({ data: result.data });
    revalidatePath('/dashboard/products');
    return { success: true, productId: product.id };
  } catch (e) {
    return { error: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const rawData = {
    name: formData.get('name') as string,
    categoryId: formData.get('categoryId') as string,
    description: formData.get('description') as string || undefined,
    width: formData.get('width') || undefined,
    height: formData.get('height') || undefined,
    gusset: formData.get('gusset') || undefined,
    gsm: formData.get('gsm') || undefined,
    material: formData.get('material') as string || undefined,
    handleType: formData.get('handleType') as string || undefined,
    printingType: formData.get('printingType') as string || undefined,
    color: formData.get('color') as string || undefined,
    moq: formData.get('moq') || undefined,
  };

  const result = productSchema.safeParse(rawData);
  if (!result.success) return { error: result.error.errors[0].message };

  try {
    await prisma.product.update({ where: { id }, data: result.data });
    revalidatePath('/dashboard/products');
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true };
  } catch (e) {
    return { error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (e) {
    return { error: 'Failed to delete product' };
  }
}

export async function getProducts(params?: {
  search?: string;
  categoryId?: string;
  material?: string;
  handleType?: string;
  gsm?: string;
  page?: number;
  limit?: number;
}) {
  const { search, categoryId, material, handleType, gsm, page = 1, limit = 20 } = params || {};
  
  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  if (material) where.material = { contains: material, mode: 'insensitive' };
  if (handleType) where.handleType = { contains: handleType, mode: 'insensitive' };
  if (gsm) where.gsm = parseInt(gsm);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        priceSlabs: { orderBy: { quantity: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, pages: Math.ceil(total / limit) };
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      priceSlabs: { orderBy: { quantity: 'asc' } },
    },
  });
}
