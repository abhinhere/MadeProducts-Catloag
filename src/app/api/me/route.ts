import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('dummy_auth');
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { email: authCookie.value },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(dbUser);
}
