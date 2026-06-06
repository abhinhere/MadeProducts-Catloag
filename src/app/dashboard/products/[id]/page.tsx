import { getProduct } from '@/app/actions/products';
import { getSettings } from '@/app/actions/settings';
import { getCurrentUser } from '@/app/actions/auth';
import { ProductDetail } from '@/components/products/product-detail';
import { notFound, redirect } from 'next/navigation';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const { id } = await params;
  const [product, settings] = await Promise.all([getProduct(id), getSettings()]);

  if (!product) notFound();

  return (
    <ProductDetail
      product={product as Parameters<typeof ProductDetail>[0]['product']}
      settings={settings}
      isAdmin={user.role === 'ADMIN'}
    />
  );
}
