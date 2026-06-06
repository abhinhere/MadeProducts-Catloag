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

export async function createEmployee(name: string, email: string, password: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return { error: 'Unauthorized' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: error.message };

  try {
    await prisma.user.create({
      data: {
        supabaseId: data.user.id,
        name,
        email,
        role: 'EMPLOYEE',
        active: true,
      },
    });
    revalidatePath('/dashboard/employees');
    return { success: true };
  } catch {
    await supabase.auth.admin.deleteUser(data.user.id);
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

  const supabase = await createClient();
  const { error } = await supabase.auth.admin.updateUserById(employee.supabaseId, {
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { success: true };
}
