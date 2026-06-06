import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
