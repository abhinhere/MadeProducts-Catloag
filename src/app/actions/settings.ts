'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: { id: '1', companyName: 'Made Products' },
  });
}

export async function updateSettings(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const data = {
    companyName: formData.get('companyName') as string || 'Made Products',
    companyPhone: formData.get('companyPhone') as string || null,
    companyWhatsapp: formData.get('companyWhatsapp') as string || null,
    companyAddress: formData.get('companyAddress') as string || null,
    shareFooter: formData.get('shareFooter') as string || null,
  };

  await prisma.settings.upsert({
    where: { id: '1' },
    update: data,
    create: { id: '1', ...data },
  });

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { success: true };
}
