import { NextRequest, NextResponse } from 'next/server';

// Список районов по городам и областям
const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Бишкек': ['Ленинский', 'Октябрьский', 'Первомайский', 'Свердловский'],
  'Ош': ['Сулайман-Тоо', 'Ак-Буура'],
  'Чуйская область': [
    'Аламединский',
    'Ысык-Атинский',
    'Кеминский',
    'Московский',
    'Панфиловский',
    'Сокулукский',
    'Жайылский',
  ],
  'Иссык-Кульская область': [
    'Ак-Суйский',
    'Жети-Огузский',
    'Тонский',
    'Тюпский',
    'Иссык-Кульский',
  ],
  'Нарынская область': [
    'Ак-Талинский',
    'Ат-Башинский',
    'Жумгальский',
    'Кочкорский',
    'Нарынский',
  ],
  'Таласская область': ['Бакай-Атинский', 'Кара-Бууринский', 'Манасский', 'Таласский'],
  'Ошская область': [
    'Алайский',
    'Араванский',
    'Кара-Кулджинский',
    'Кара-Суйский',
    'Ноокатский',
    'Узгенский',
    'Чон-Алайский',
  ],
  'Джалал-Абадская область': [
    'Аксыйский',
    'Ала-Букинский',
    'Базар-Коргонский',
    'Ноокенский',
    'Сузакский',
    'Тогуз-Тороуский',
    'Токтогульский',
    'Чаткальский',
  ],
  'Баткенская область': ['Баткенский', 'Кадамжайский', 'Лейлекский'],
};

// Маппинг городов к их областям/регионам
const CITY_TO_REGION: Record<string, string> = {
  'Бишкек': 'Бишкек',
  'Ош': 'Ош',
  'Токмок': 'Чуйская область',
  'Кара-Балта': 'Чуйская область',
  'Кант': 'Чуйская область',
  'Шопоков': 'Чуйская область',
  'Кемин': 'Чуйская область',
  'Орловка': 'Чуйская область',
  'Каракол': 'Иссык-Кульская область',
  'Балыкчы': 'Иссык-Кульская область',
  'Нарын': 'Нарынская область',
  'Талас': 'Таласская область',
  'Узген': 'Ошская область',
  'Кара-Суу': 'Ошская область',
  'Ноокат': 'Ошская область',
  'Джалал-Абад': 'Джалал-Абадская область',
  'Майлуу-Суу': 'Джалал-Абадская область',
  'Кок-Жангак': 'Джалал-Абадская область',
  'Таш-Кумыр': 'Джалал-Абадская область',
  'Кербен': 'Джалал-Абадская область',
  'Кызыл-Кия': 'Баткенская область',
  'Сулюкта': 'Баткенская область',
  'Айдаркен': 'Баткенская область',
  'Исфана': 'Баткенская область',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const query = searchParams.get('q');

    // Если указан город, возвращаем районы для этого города/области
    if (city) {
      const region = CITY_TO_REGION[city] || city;
      const districts = DISTRICTS_BY_REGION[region] || [];

      // Если есть поисковый запрос, фильтруем
      if (query && query.trim()) {
        const searchQuery = query.toLowerCase().trim();
        const filteredDistricts = districts
          .filter((district) => district.toLowerCase().includes(searchQuery))
          .map((district, index) => ({
            id: index + 1,
            name: district,
            region: region,
          }));
        return NextResponse.json({ districts: filteredDistricts });
      }

      // Возвращаем все районы для города/области
      const districtsList = districts.map((district, index) => ({
        id: index + 1,
        name: district,
        region: region,
      }));
      return NextResponse.json({ districts: districtsList });
    }

    // Если город не указан, возвращаем все районы (с фильтрацией если есть запрос)
    const allDistricts: Array<{ id: number; name: string; region: string }> = [];
    let id = 1;

    Object.entries(DISTRICTS_BY_REGION).forEach(([region, districts]) => {
      districts.forEach((district) => {
        if (!query || district.toLowerCase().includes(query.toLowerCase().trim())) {
          allDistricts.push({
            id: id++,
            name: district,
            region: region,
          });
        }
      });
    });

    return NextResponse.json({ districts: allDistricts });
  } catch (error) {
    console.error('Ошибка поиска районов:', error);
    return NextResponse.json({ error: 'Ошибка поиска районов' }, { status: 500 });
  }
}
