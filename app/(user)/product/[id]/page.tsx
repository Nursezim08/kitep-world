import { redirect } from 'next/navigation';
import { checkUserAccess } from '@/lib/auth';
import { getPrismaClient } from '@/lib/prisma';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prisma = getPrismaClient();

  try {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        product_translations: true,
        categories: {
          include: {
            category_translations: true,
          },
        },
        product_images: {
          take: 1,
        },
      },
    });

    if (!product) {
      return {
        title: 'Товар не найден',
      };
    }

    const ruTranslation = product.product_translations.find((t) => t.locale === 'ru');
    const categoryRuTranslation = product.categories?.category_translations.find((t) => t.locale === 'ru');
    const productName = ruTranslation?.name || 'Товар';
    const productDescription = ruTranslation?.description || '';
    const categoryName = categoryRuTranslation?.name || 'Канцелярия';
    const productImage = product.product_images[0]?.image_url || '/placeholder-product.jpg';

    return {
      title: `${productName} - ${categoryName} | Nur-kitep`,
      description: productDescription || `${productName} по выгодной цене в интернет-магазине Nur-kitep. ✓ Гарантия качества ✓ Самовывоз из филиалов ✓ Быстрое оформление заказа`,
      keywords: [
        productName,
        `купить ${productName.toLowerCase()}`,
        categoryName,
        product.brand || '',
        'канцтовары',
        'Кыргызстан',
        'Бишкек',
      ].filter(Boolean),
      openGraph: {
        title: `${productName} | Nur-kitep`,
        description: productDescription || `${productName} - ${categoryName}`,
        url: `https://nur-kitep.store/product/${id}`,
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: productName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} | Nur-kitep`,
        description: productDescription || `${productName} по выгодной цене`,
        images: [productImage],
      },
    };
  } catch (error) {
    console.error('Ошибка генерации метаданных товара:', error);
    return {
      title: 'Товар | Nur-kitep',
    };
  }
}

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
