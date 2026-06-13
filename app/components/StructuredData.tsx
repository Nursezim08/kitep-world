'use client';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Product' | 'BreadcrumbList';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Готовые шаблоны для разных типов страниц

export function OrganizationSchema() {
  return (
    <StructuredData
      type="Organization"
      data={{
        name: 'Nur-kitep',
        url: 'https://nur-kitep.kg',
        logo: 'https://nur-kitep.kg/logonur.png',
        description: 'Крупнейший интернет-магазин канцелярских товаров в Кыргызстане',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Бишкек',
          addressCountry: 'KG',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+996-XXX-XXX-XXX',
          contactType: 'customer service',
          availableLanguage: ['Russian', 'Kyrgyz'],
        },
        sameAs: [
          'https://instagram.com/nur-kitep',
          'https://t.me/nur_kitep',
        ],
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <StructuredData
      type="WebSite"
      data={{
        name: 'Nur-kitep',
        url: 'https://nur-kitep.kg',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://nur-kitep.kg/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku?: string;
  brand?: string;
  category?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'KGS',
  sku,
  brand,
  category,
  availability = 'InStock',
  rating,
  reviewCount,
}: ProductSchemaProps) {
  const productData: any = {
    name,
    description,
    image,
    sku: sku || undefined,
    brand: brand ? { '@type': 'Brand', name: brand } : undefined,
    category,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    },
  };

  if (rating && reviewCount) {
    productData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <StructuredData type="Product" data={productData} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <StructuredData
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}
