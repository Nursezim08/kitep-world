import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import RegisterSW from "./register-sw";
import InstallPWA from "./components/InstallPWA";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nur-kitep.store'),
  title: {
    default: "Nur-kitep - Интернет-магазин канцелярских товаров в Кыргызстане | Книги, тетради, ручки с доставкой",
    template: "%s | Nur-kitep"
  },
  description: "Nur-kitep - крупнейший интернет-магазин канцелярских товаров в Кыргызстане. Книги, школьные принадлежности, офисные товары. Самовывоз из 10+ филиалов. ✓ Низкие цены ✓ Широкий ассортимент ✓ Гарантия качества",
  keywords: [
    "канцелярские товары Кыргызстан",
    "канцелярия Бишкек",
    "школьные принадлежности",
    "книги Бишкек",
    "тетради купить",
    "ручки оптом",
    "офисные товары",
    "Nur-kitep",
    "канцтовары онлайн",
    "школьные товары Кыргызстан",
    "учебники Бишкек",
    "краски для детей",
    "рюкзаки школьные",
    "пеналы купить"
  ],
  authors: [{ name: "Nur-kitep" }],
  creator: "Nur-kitep",
  publisher: "Nur-kitep",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  themeColor: "#8b5cf6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nur-kitep",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: "ky_KG",
    url: "https://nur-kitep.store",
    siteName: "Nur-kitep",
    title: "Nur-kitep - Интернет-магазин канцелярских товаров в Кыргызстане",
    description: "Крупнейший интернет-магазин канцелярских товаров в Кыргызстане. Книги, школьные принадлежности, офисные товары. Самовывоз из 10+ филиалов.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Nur-kitep - Канцелярский магазин",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nur-kitep - Интернет-магазин канцелярских товаров",
    description: "Книги, школьные принадлежности, офисные товары с самовывозом в Кыргызстане",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${nunito.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nur-kitep" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="canonical" href="https://nur-kitep.store" />
      </head>
      <body className="min-h-full flex flex-col">
        <RegisterSW />
        <InstallPWA />
        {children}
      </body>
    </html>
  );
}
