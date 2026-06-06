import { getProduct } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { getCurrentUser } from '@/app/actions/auth';
import { ProductForm } from '@/components/products/product-form';
import { notFound, redirect } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard/products');

  const { id } = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories}
      product={product as Parameters<typeof ProductForm>[0]['product']}
    />
  );
}
