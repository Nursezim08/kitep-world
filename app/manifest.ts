import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nur-kitep - Интернет-магазин канцелярских товаров",
    short_name: "Nur-kitep",
    description: "Крупнейший интернет-магазин канцелярских товаров в Кыргызстане. Книги, школьные принадлежности, офисные товары.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#8b5cf6",
    theme_color: "#8b5cf6",
    orientation: "portrait",
    lang: "ru",
    dir: "ltr",
    categories: ["shopping", "books", "stationery", "education"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    shortcuts: [
      {
        name: "Каталог",
        short_name: "Каталог",
        description: "Просмотр каталога товаров",
        url: "/catalog",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Мои заказы",
        short_name: "Заказы",
        description: "Просмотр моих заказов",
        url: "/orders",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Корзина",
        short_name: "Корзина",
        description: "Моя корзина покупок",
        url: "/cart",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      }
    ],
    screenshots: [
      {
        src: "/screenshots/home.jpg",
        sizes: "540x720",
        type: "image/jpeg",
        form_factor: "narrow",
        label: "Главная страница Nur-kitep"
      },
      {
        src: "/screenshots/catalog.jpg",
        sizes: "1280x720",
        type: "image/jpeg",
        form_factor: "wide",
        label: "Каталог товаров"
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  };
}
