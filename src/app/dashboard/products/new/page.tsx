import { getCategories } from '@/app/actions/categories';
import { getCurrentUser } from '@/app/actions/auth';
import { ProductForm } from '@/components/products/product-form';
import { redirect } from 'next/navigation';

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard/products');

  const categories = await getCategories();

  return <ProductForm categories={categories} />;
}
