import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('dummy_auth');
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: authCookie.value } });
  if (!dbUser || dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const productId = formData.get('productId') as string;

  if (!file || !productId) {
    return NextResponse.json({ error: 'Missing file or productId' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  const count = await prisma.productImage.count({ where: { productId } });
  const image = await prisma.productImage.create({
    data: { productId, imageUrl: publicUrl, sortOrder: count },
  });

  return NextResponse.json({ image });
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('dummy_auth');
  if (!authCookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: authCookie.value } });
  if (!dbUser || dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { imageId } = await request.json();
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  // Extract path from URL
  const urlParts = image.imageUrl.split('/product-images/');
  if (urlParts[1]) {
    await supabase.storage.from('product-images').remove([urlParts[1]]);
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}
