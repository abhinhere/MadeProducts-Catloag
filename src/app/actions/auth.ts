'use server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { error: 'Invalid email or password format' };
  }

  const { email, password } = result.data;

  // Dummy Authentication Check - Allow any DB user with default password
  if (password === 'Abhin2004#') {
    // If it's the admin, ensure they exist
    if (email === 'abhinchelakkal@gmail.com') {
      await prisma.user.upsert({
        where: { email: 'abhinchelakkal@gmail.com' },
        update: { role: 'ADMIN', active: true },
        create: {
          id: 'dummy-admin-id',
          supabaseId: 'dummy-admin-id',
          email: 'abhinchelakkal@gmail.com',
          name: 'Abhin',
          role: 'ADMIN',
          active: true
        }
      });
      (await cookies()).set('dummy_auth', 'abhinchelakkal@gmail.com', { secure: process.env.NODE_ENV === 'production', httpOnly: true, path: '/' });
      redirect('/dashboard');
    }

    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (dbUser && dbUser.active) {
      (await cookies()).set('dummy_auth', dbUser.email, { secure: process.env.NODE_ENV === 'production', httpOnly: true, path: '/' });
      redirect('/dashboard');
    } else {
      return { error: 'Your account does not exist or is inactive.' };
    }
  }

  return { error: 'Invalid credentials. Please try again.' };
}

export async function logout() {
  (await cookies()).delete('dummy_auth');
  redirect('/auth/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('dummy_auth');
  if (!authCookie?.value) return null;

  return prisma.user.findUnique({
    where: { email: authCookie.value },
  });
}
