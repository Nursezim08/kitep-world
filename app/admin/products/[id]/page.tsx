import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  const { id } = await params;

  return <ProductDetailClient user={user} productId={id} />;
}
