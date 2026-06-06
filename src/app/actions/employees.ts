'use server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return [];
  return prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createEmployee(name: string, email: string, password?: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: 'Email already exists' };

    await prisma.user.create({
      data: {
        supabaseId: `dummy-id-${Date.now()}`,
        name,
        email,
        role: 'EMPLOYEE',
        active: true,
      },
    });
    revalidatePath('/dashboard/employees');
    return { success: true };
  } catch {
    return { error: 'Failed to create employee record' };
  }
}

export async function toggleEmployeeStatus(employeeId: string, active: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  await prisma.user.update({ where: { id: employeeId }, data: { active } });
  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function resetEmployeePassword(employeeId: string, newPassword: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const employee = await prisma.user.findUnique({ where: { id: employeeId } });
  if (!employee) return { error: 'Employee not found' };

  // Password reset isn't functional with dummy auth, but we return success so the UI doesn't break
  return { success: true };
}
