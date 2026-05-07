import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProductsClient from './ProductsClient';

export default async function ProductsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return <ProductsClient user={user} />;
}
