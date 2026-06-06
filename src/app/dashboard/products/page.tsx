import { getProducts } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';
import { getCurrentUser } from '@/app/actions/auth';
import { ProductsClient } from '@/components/products/products-client';
import { redirect } from 'next/navigation';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; material?: string; handleType?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const params = await searchParams;
  const page = parseInt(params.page || '1');

  const [{ products, total, pages }, categories] = await Promise.all([
    getProducts({
      search: params.search,
      categoryId: params.categoryId,
      material: params.material,
      handleType: params.handleType,
      page,
    }),
    getCategories(),
  ]);

  return (
    <ProductsClient
      products={products as Parameters<typeof ProductsClient>[0]['products']}
      categories={categories}
      total={total}
      pages={pages}
      currentPage={page}
      isAdmin={user.role === 'ADMIN'}
      searchParams={params}
    />
  );
}
