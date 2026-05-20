import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await checkUserAccess();

  if (!access.allowed) {
    redirect(access.redirectTo!);
  }

  const { id } = await params;

  return <ProductDetailClient user={access.user!} productId={id} />;
}
