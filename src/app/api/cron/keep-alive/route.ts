import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure this route is evaluated on every request, not cached

export async function GET(request: Request) {
  // Verify that the request is coming from Vercel Cron (Optional but recommended)
  // To use this, add a CRON_SECRET environment variable in your Vercel project settings
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Perform a very lightweight query to keep the database connection active.
    // This resets the 7-day inactivity timer on Supabase free tier.
    await prisma.settings.findFirst();
    
    return NextResponse.json({ status: 'ok', message: 'Database pinged successfully' });
  } catch (error) {
    console.error('Failed to ping database:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to ping database' }, { status: 500 });
  }
}
