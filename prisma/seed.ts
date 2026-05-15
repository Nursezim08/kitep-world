import { PrismaClient, CategoryStatus, ProductStatus, Locale } from '@prisma/client';

const prisma = new PrismaClient();

// Данные категорий (название на русском и кыргызском)
const categories = [
  {
    nameRu: 'Канцелярия',
    nameKg: 'Канцелярия',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Книги',
    nameKg: 'Китептер',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Тетради',
    nameKg: 'Дептерлер',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Ручки',
    nameKg: 'Калемдер',
    image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Карандаши',
    nameKg: 'Карандаштар',
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Папки и файлы',
    nameKg: 'Папкалар жана файлдар',
    image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Краски и кисти',
    nameKg: 'Боёктор жана кисточкалар',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Рюкзаки',
    nameKg: 'Рюкзактар',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Пеналы',
    nameKg: 'Пеналдар',
    image: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=512&h=512&fit=crop',
  },
  {
    nameRu: 'Офисная техника',
    nameKg: 'Офис техникасы',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=512&h=512&fit=crop',
  },
];

// Шаблоны товаров для каждой категории
const productTemplates = {
  'Канцелярия': [
    { nameRu: 'Степлер металлический', nameKg: 'Металл степлер', brand: 'Office Pro', price: 450 },
    { nameRu: 'Дырокол на 30 листов', nameKg: '30 барак тешкич', brand: 'Office Pro', price: 650 },
    { nameRu: 'Ножницы канцелярские', nameKg: 'Канцелярия кайчысы', brand: 'Scissors+', price: 180 },
    { nameRu: 'Клей ПВА 100мл', nameKg: 'ПВА желим 100мл', brand: 'Glue Master', price: 85 },
    { nameRu: 'Скотч прозрачный 50м', nameKg: 'Ачык скотч 50м', brand: 'Tape Pro', price: 120 },
    { nameRu: 'Линейка 30см', nameKg: 'Сызгыч 30см', brand: 'Ruler+', price: 45 },
    { nameRu: 'Корректор-ручка', nameKg: 'Корректор-калем', brand: 'White Out', price: 95 },
    { nameRu: 'Кнопки канцелярские 100шт', nameKg: 'Канцелярия кнопкалары 100шт', brand: 'Pin Master', price: 65 },
    { nameRu: 'Скрепки 100шт', nameKg: 'Скрепкалар 100шт', brand: 'Clip Pro', price: 55 },
    { nameRu: 'Стикеры цветные 100 листов', nameKg: 'Түстүү стикерлер 100 барак', brand: 'Sticky Notes', price: 150 },
  ],
  'Книги': [
    { nameRu: 'Война и мир - Л.Толстой', nameKg: 'Согуш жана тынчтык', brand: 'Классика', price: 850 },
    { nameRu: 'Преступление и наказание', nameKg: 'Кылмыш жана жаза', brand: 'Классика', price: 720 },
    { nameRu: 'Мастер и Маргарита', nameKg: 'Мастер жана Маргарита', brand: 'Классика', price: 680 },
    { nameRu: 'Гарри Поттер и философский камень', nameKg: 'Гарри Поттер', brand: 'Фэнтези', price: 950 },
    { nameRu: 'Атлас мира', nameKg: 'Дүйнө атласы', brand: 'География', price: 1200 },
    { nameRu: 'Энциклопедия для детей', nameKg: 'Балдар үчүн энциклопедия', brand: 'Детская', price: 1500 },
    { nameRu: 'Сказки народов мира', nameKg: 'Дүйнө элдеринин жомоктору', brand: 'Детская', price: 450 },
    { nameRu: 'Учебник математики 5 класс', nameKg: 'Математика окуу китеби 5-класс', brand: 'Учебная', price: 380 },
    { nameRu: 'Учебник русского языка 6 класс', nameKg: 'Орус тили окуу китеби 6-класс', brand: 'Учебная', price: 420 },
    { nameRu: 'Атлас по биологии', nameKg: 'Биология атласы', brand: 'Учебная', price: 320 },
  ],
  'Тетради': [
    { nameRu: 'Тетрадь 12 листов клетка', nameKg: 'Дептер 12 барак тор', brand: 'School+', price: 25 },
    { nameRu: 'Тетрадь 18 листов линия', nameKg: 'Дептер 18 барак сызык', brand: 'School+', price: 30 },
    { nameRu: 'Тетрадь 24 листа клетка', nameKg: 'Дептер 24 барак тор', brand: 'School+', price: 35 },
    { nameRu: 'Тетрадь 48 листов клетка', nameKg: 'Дептер 48 барак тор', brand: 'Premium', price: 55 },
    { nameRu: 'Тетрадь 96 листов клетка', nameKg: 'Дептер 96 барак тор', brand: 'Premium', price: 95 },
    { nameRu: 'Тетрадь для нот', nameKg: 'Нота дептери', brand: 'Music', price: 45 },
    { nameRu: 'Тетрадь для рисования А4', nameKg: 'Сүрөт тартуу дептери А4', brand: 'Art', price: 65 },
    { nameRu: 'Блокнот А5 80 листов', nameKg: 'Блокнот А5 80 барак', brand: 'Notes', price: 120 },
    { nameRu: 'Блокнот на спирали А4', nameKg: 'Спиралдуу блокнот А4', brand: 'Notes', price: 180 },
    { nameRu: 'Дневник школьный', nameKg: 'Мектеп күндөлүгү', brand: 'School+', price: 150 },
  ],
  'Ручки': [
    { nameRu: 'Ручка шариковая синяя', nameKg: 'Көк шарикалуу калем', brand: 'Pen Master', price: 35 },
    { nameRu: 'Ручка шариковая черная', nameKg: 'Кара шарикалуу калем', brand: 'Pen Master', price: 35 },
    { nameRu: 'Ручка гелевая синяя', nameKg: 'Көк гелдүү калем', brand: 'Gel Pro', price: 55 },
    { nameRu: 'Ручка гелевая черная', nameKg: 'Кара гелдүү калем', brand: 'Gel Pro', price: 55 },
    { nameRu: 'Ручка автоматическая', nameKg: 'Автоматтык калем', brand: 'Auto Pen', price: 85 },
    { nameRu: 'Набор ручек 10 цветов', nameKg: '10 түстүү калемдер топтому', brand: 'Color Set', price: 250 },
    { nameRu: 'Ручка перьевая', nameKg: 'Канаттуу калем', brand: 'Classic', price: 450 },
    { nameRu: 'Стержни для ручек 10шт', nameKg: 'Калем стержендери 10шт', brand: 'Refill', price: 120 },
    { nameRu: 'Ручка-маркер двусторонняя', nameKg: 'Эки жактуу маркер-калем', brand: 'Marker+', price: 95 },
    { nameRu: 'Ручка с логотипом', nameKg: 'Логотиптүү калем', brand: 'Premium', price: 180 },
  ],
  'Карандаши': [
    { nameRu: 'Карандаш простой HB', nameKg: 'Жөнөкөй карандаш HB', brand: 'Pencil Pro', price: 25 },
    { nameRu: 'Карандаш простой 2B', nameKg: 'Жөнөкөй карандаш 2B', brand: 'Pencil Pro', price: 25 },
    { nameRu: 'Набор карандашей 12 цветов', nameKg: '12 түстүү карандаштар', brand: 'Color Pencil', price: 280 },
    { nameRu: 'Набор карандашей 24 цвета', nameKg: '24 түстүү карандаштар', brand: 'Color Pencil', price: 480 },
    { nameRu: 'Карандаш механический 0.5мм', nameKg: 'Механикалык карандаш 0.5мм', brand: 'Mech Pro', price: 120 },
    { nameRu: 'Карандаш механический 0.7мм', nameKg: 'Механикалык карандаш 0.7мм', brand: 'Mech Pro', price: 120 },
    { nameRu: 'Грифели для механических карандашей', nameKg: 'Механикалык карандаш грифелдери', brand: 'Refill', price: 85 },
    { nameRu: 'Точилка для карандашей', nameKg: 'Карандаш учургуч', brand: 'Sharpen', price: 45 },
    { nameRu: 'Ластик белый', nameKg: 'Ак өчүргүч', brand: 'Eraser+', price: 20 },
    { nameRu: 'Ластик цветной', nameKg: 'Түстүү өчүргүч', brand: 'Eraser+', price: 25 },
  ],
  'Папки и файлы': [
    { nameRu: 'Папка-скоросшиватель А4', nameKg: 'Папка-тез тигүүчү А4', brand: 'Folder Pro', price: 85 },
    { nameRu: 'Папка с файлами 20 листов', nameKg: '20 барактуу файлдуу папка', brand: 'Folder Pro', price: 180 },
    { nameRu: 'Папка с файлами 40 листов', nameKg: '40 барактуу файлдуу папка', brand: 'Folder Pro', price: 280 },
    { nameRu: 'Папка-конверт А4', nameKg: 'Папка-конверт А4', brand: 'Envelope', price: 65 },
    { nameRu: 'Файлы А4 100шт', nameKg: 'А4 файлдар 100шт', brand: 'File Master', price: 250 },
    { nameRu: 'Папка-регистратор А4', nameKg: 'Папка-регистратор А4', brand: 'Register', price: 320 },
    { nameRu: 'Папка на молнии А4', nameKg: 'Молниялуу папка А4', brand: 'Zip Folder', price: 150 },
    { nameRu: 'Папка-портфель А4', nameKg: 'Папка-портфель А4', brand: 'Brief Case', price: 450 },
    { nameRu: 'Разделители для папок 5шт', nameKg: 'Папка бөлгүчтөр 5шт', brand: 'Divider', price: 95 },
    { nameRu: 'Обложки для тетрадей 10шт', nameKg: 'Дептер мукабалары 10шт', brand: 'Cover', price: 120 },
  ],
  'Краски и кисти': [
    { nameRu: 'Акварель 12 цветов', nameKg: 'Акварель 12 түс', brand: 'Water Color', price: 280 },
    { nameRu: 'Акварель 24 цвета', nameKg: 'Акварель 24 түс', brand: 'Water Color', price: 480 },
    { nameRu: 'Гуашь 6 цветов', nameKg: 'Гуашь 6 түс', brand: 'Gouache Pro', price: 320 },
    { nameRu: 'Гуашь 12 цветов', nameKg: 'Гуашь 12 түс', brand: 'Gouache Pro', price: 550 },
    { nameRu: 'Кисти для рисования набор 6шт', nameKg: 'Сүрөт тартуу кисточкалары 6шт', brand: 'Brush Set', price: 380 },
    { nameRu: 'Палитра для красок', nameKg: 'Боёк палитрасы', brand: 'Palette', price: 120 },
    { nameRu: 'Стакан-непроливайка', nameKg: 'Төгүлбөгөн стакан', brand: 'No Spill', price: 180 },
    { nameRu: 'Пальчиковые краски 6 цветов', nameKg: 'Манжа боёктор 6 түс', brand: 'Finger Paint', price: 420 },
    { nameRu: 'Краски акриловые 12 цветов', nameKg: 'Акрил боёктор 12 түс', brand: 'Acrylic', price: 650 },
    { nameRu: 'Мольберт настольный', nameKg: 'Столдук мольберт', brand: 'Easel', price: 1200 },
  ],
  'Рюкзаки': [
    { nameRu: 'Рюкзак школьный для младших классов', nameKg: 'Кичи класстар үчүн рюкзак', brand: 'School Bag', price: 2500 },
    { nameRu: 'Рюкзак школьный для старших классов', nameKg: 'Улуу класстар үчүн рюкзак', brand: 'School Bag', price: 3200 },
    { nameRu: 'Рюкзак ортопедический', nameKg: 'Ортопедиялык рюкзак', brand: 'Ortho Back', price: 4500 },
    { nameRu: 'Рюкзак спортивный', nameKg: 'Спорттук рюкзак', brand: 'Sport Bag', price: 2800 },
    { nameRu: 'Рюкзак для ноутбука', nameKg: 'Ноутбук рюкзагы', brand: 'Laptop Bag', price: 3500 },
    { nameRu: 'Рюкзак туристический 30л', nameKg: 'Туристтик рюкзак 30л', brand: 'Hiking', price: 5500 },
    { nameRu: 'Рюкзак-мешок', nameKg: 'Рюкзак-капчык', brand: 'Sack Bag', price: 850 },
    { nameRu: 'Рюкзак детский с игрушкой', nameKg: 'Оюнчуктуу балдар рюкзагы', brand: 'Kids Bag', price: 1800 },
    { nameRu: 'Рюкзак на колесиках', nameKg: 'Дөңгөлөктүү рюкзак', brand: 'Trolley Bag', price: 6500 },
    { nameRu: 'Сумка-рюкзак трансформер', nameKg: 'Трансформер сумка-рюкзак', brand: 'Transform', price: 4200 },
  ],
  'Пеналы': [
    { nameRu: 'Пенал школьный на молнии', nameKg: 'Молниялуу мектеп пеналы', brand: 'Pencil Case', price: 350 },
    { nameRu: 'Пенал-тубус', nameKg: 'Пенал-тубус', brand: 'Tube Case', price: 280 },
    { nameRu: 'Пенал с наполнением', nameKg: 'Толтурулган пенал', brand: 'Full Set', price: 1200 },
    { nameRu: 'Пенал силиконовый', nameKg: 'Силикон пенал', brand: 'Silicone', price: 420 },
    { nameRu: 'Пенал-книжка', nameKg: 'Пенал-китеп', brand: 'Book Case', price: 480 },
    { nameRu: 'Пенал металлический', nameKg: 'Металл пенал', brand: 'Metal Case', price: 550 },
    { nameRu: 'Пенал с кодовым замком', nameKg: 'Код кулпулуу пенал', brand: 'Lock Case', price: 650 },
    { nameRu: 'Пенал-косметичка', nameKg: 'Пенал-косметичка', brand: 'Beauty Case', price: 380 },
    { nameRu: 'Пенал для красок', nameKg: 'Боёк пеналы', brand: 'Paint Case', price: 450 },
    { nameRu: 'Пенал-органайзер', nameKg: 'Пенал-органайзер', brand: 'Organizer', price: 720 },
  ],
  'Офисная техника': [
    { nameRu: 'Калькулятор настольный', nameKg: 'Столдук калькулятор', brand: 'Calc Pro', price: 850 },
    { nameRu: 'Калькулятор инженерный', nameKg: 'Инженердик калькулятор', brand: 'Engineer', price: 1200 },
    { nameRu: 'Ламинатор А4', nameKg: 'Ламинатор А4', brand: 'Laminate', price: 4500 },
    { nameRu: 'Пленка для ламинирования 100шт', nameKg: 'Ламинация үчүн пленка 100шт', brand: 'Film', price: 650 },
    { nameRu: 'Уничтожитель бумаг', nameKg: 'Кагаз жок кылгыч', brand: 'Shredder', price: 8500 },
    { nameRu: 'Брошюратор', nameKg: 'Брошюратор', brand: 'Bind Pro', price: 12000 },
    { nameRu: 'Пружины для брошюровки 100шт', nameKg: 'Брошюровка пружиналары 100шт', brand: 'Coil', price: 850 },
    { nameRu: 'Нумератор автоматический', nameKg: 'Автоматтык нумератор', brand: 'Number', price: 2500 },
    { nameRu: 'Датер', nameKg: 'Датер', brand: 'Date Stamp', price: 1800 },
    { nameRu: 'Печать для документов', nameKg: 'Документ мөөрү', brand: 'Stamp Pro', price: 3500 },
  ],
};

// Описания товаров (общие шаблоны)
const descriptions = {
  ru: [
    'Высокое качество и надежность. Идеально подходит для школы и офиса.',
    'Отличный выбор для повседневного использования. Проверенное качество.',
    'Профессиональное качество по доступной цене. Рекомендуем!',
    'Популярный товар среди покупателей. Отличное соотношение цены и качества.',
    'Надежный и долговечный. Подходит для интенсивного использования.',
  ],
  kg: [
    'Жогорку сапат жана ишенимдүүлүк. Мектеп жана офис үчүн эң сонун.',
    'Күнүмдүк колдонуу үчүн эң сонун тандоо. Текшерилген сапат.',
    'Кол жеткиликтүү баада профессионалдык сапат. Сунуштайбыз!',
    'Сатып алуучулар арасында популярдуу товар. Баанын жана сапаттын эң сонун катышы.',
    'Ишенимдүү жана узак мөөнөткө. Интенсивдүү колдонуу үчүн ылайыктуу.',
  ],
};

// Реальные изображения товаров по категориям
const categoryImages: Record<string, string[]> = {
  'Канцелярия': [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=800&fit=crop', // Степлер
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop', // Канцелярия
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop', // Ножницы
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=800&fit=crop', // Офис
  ],
  'Книги': [
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=800&fit=crop', // Книги
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&h=800&fit=crop', // Книга
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=800&fit=crop', // Стопка книг
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=800&fit=crop', // Библиотека
  ],
  'Тетради': [
    'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&h=800&fit=crop', // Тетрадь
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=800&fit=crop', // Блокнот
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop', // Записная книжка
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=800&fit=crop', // Дневник
  ],
  'Ручки': [
    'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&h=800&fit=crop', // Ручки
    'https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=800&h=800&fit=crop', // Перо
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&h=800&fit=crop', // Письмо
    'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=800&h=800&fit=crop', // Набор ручек
  ],
  'Карандаши': [
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=800&fit=crop', // Карандаши
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&h=800&fit=crop', // Цветные карандаши
    'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=800&fit=crop', // Рисование
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=800&fit=crop', // Карандаш
  ],
  'Папки и файлы': [
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&h=800&fit=crop', // Папки
    'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=800&h=800&fit=crop', // Файлы
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=800&fit=crop', // Документы
    'https://images.unsplash.com/photo-1554224311-beee460201f9?w=800&h=800&fit=crop', // Архив
  ],
  'Краски и кисти': [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop', // Краски
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=800&fit=crop', // Кисти
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop', // Палитра
    'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=800&h=800&fit=crop', // Рисование
  ],
  'Рюкзаки': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop', // Рюкзак
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=800&fit=crop', // Школьный рюкзак
    'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=800&h=800&fit=crop', // Спортивный рюкзак
    'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&h=800&fit=crop', // Туристический
  ],
  'Пеналы': [
    'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=800&h=800&fit=crop', // Пенал
    'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&h=800&fit=crop', // Школьные принадлежности
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop', // Канцелярия
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop', // Организация
  ],
  'Офисная техника': [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop', // Калькулятор
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=800&fit=crop', // Офис
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=800&fit=crop', // Техника
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=800&fit=crop', // Компьютер
  ],
};

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...\n');

  // Очистка существующих данных (опционально)
  console.log('🗑️  Очистка существующих данных...');
  await prisma.productImage.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  console.log('✅ Данные очищены\n');

  // Создание категорий
  console.log('📁 Создание категорий...');
  const createdCategories = [];

  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: {
        image: category.image,
        status: CategoryStatus.active,
        translations: {
          create: [
            {
              locale: Locale.ru,
              name: category.nameRu,
            },
            {
              locale: Locale.kg,
              name: category.nameKg,
            },
          ],
        },
      },
      include: {
        translations: true,
      },
    });

    createdCategories.push(createdCategory);
    console.log(`  ✓ ${category.nameRu}`);
  }

  console.log(`✅ Создано ${createdCategories.length} категорий\n`);

  // Создание товаров для каждой категории
  console.log('📦 Создание товаров...');
  let totalProducts = 0;

  for (const category of createdCategories) {
    const categoryNameRu = category.translations.find((t) => t.locale === Locale.ru)?.name || '';
    const templates = productTemplates[categoryNameRu as keyof typeof productTemplates];

    if (!templates) {
      console.log(`  ⚠️  Нет шаблонов для категории: ${categoryNameRu}`);
      continue;
    }

    console.log(`\n  📂 ${categoryNameRu}:`);

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const sku = `${categoryNameRu.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`;

      // Случайное описание
      const descRu = descriptions.ru[Math.floor(Math.random() * descriptions.ru.length)];
      const descKg = descriptions.kg[Math.floor(Math.random() * descriptions.kg.length)];

      const product = await prisma.product.create({
        data: {
          sku,
          categoryId: category.id,
          brand: template.brand,
          price: template.price,
          status: ProductStatus.active,
          translations: {
            create: [
              {
                locale: Locale.ru,
                name: template.nameRu,
                description: descRu,
              },
              {
                locale: Locale.kg,
                name: template.nameKg,
                description: descKg,
              },
            ],
          },
          images: {
            create: (categoryImages[categoryNameRu] || categoryImages['Канцелярия']).map((url) => ({
              imageUrl: url,
              status: 'active',
            })),
          },
        },
      });

      totalProducts++;
      console.log(`    ✓ ${template.nameRu} (${sku}) - ${template.price} сом`);
    }
  }

  console.log(`\n✅ Создано ${totalProducts} товаров\n`);
  console.log('🎉 Заполнение базы данных завершено!');
  console.log(`\n📊 Итого:`);
  console.log(`   - Категорий: ${createdCategories.length}`);
  console.log(`   - Товаров: ${totalProducts}`);
  console.log(`   - Изображений: ${totalProducts * 4} (реальные фото из Unsplash)`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
