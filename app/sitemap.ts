import { MetadataRoute } from 'next';
import { getPrismaClient } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = getPrismaClient();
  const baseUrl = 'https://nur-kitep.store';

  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Динамические страницы категорий
  let categories: MetadataRoute.Sitemap = [];
  try {
    const categoriesData = await prisma.category.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    categories = categoriesData.map((category) => ({
      url: `${baseUrl}/catalog?category=${category.id}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Ошибка при загрузке категорий для sitemap:', error);
  }

  // Динамические страницы товаров
  let products: MetadataRoute.Sitemap = [];
  try {
    const productsData = await prisma.product.findMany({
      where: {
        status: 'active',
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 5000, // Ограничение для sitemap
    });

    products = productsData.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Ошибка при загрузке товаров для sitemap:', error);
  }

  return [...staticPages, ...categories, ...products];
}
