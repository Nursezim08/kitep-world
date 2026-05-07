import { NextRequest, NextResponse } from 'next/server';

// Список городов Кыргызстана
const KYRGYZSTAN_CITIES = [
  { id: 1, name: 'Бишкек', region: 'Чуйская область', lat: 42.8746, lon: 74.5698 },
  { id: 2, name: 'Ош', region: 'Ошская область', lat: 40.5283, lon: 72.7985 },
  { id: 3, name: 'Джалал-Абад', region: 'Джалал-Абадская область', lat: 40.9333, lon: 72.9833 },
  { id: 4, name: 'Каракол', region: 'Иссык-Кульская область', lat: 42.4906, lon: 78.3936 },
  { id: 5, name: 'Токмок', region: 'Чуйская область', lat: 42.8417, lon: 75.2950 },
  { id: 6, name: 'Кара-Балта', region: 'Чуйская область', lat: 42.8142, lon: 73.8486 },
  { id: 7, name: 'Нарын', region: 'Нарынская область', lat: 41.4286, lon: 76.0000 },
  { id: 8, name: 'Талас', region: 'Таласская область', lat: 42.5228, lon: 72.2428 },
  { id: 9, name: 'Балыкчы', region: 'Иссык-Кульская область', lat: 42.4603, lon: 76.1897 },
  { id: 10, name: 'Кант', region: 'Чуйская область', lat: 42.8908, lon: 74.8508 },
  { id: 11, name: 'Узген', region: 'Ошская область', lat: 40.7697, lon: 73.3008 },
  { id: 12, name: 'Кара-Суу', region: 'Ошская область', lat: 40.7042, lon: 72.8706 },
  { id: 13, name: 'Кызыл-Кия', region: 'Баткенская область', lat: 40.2569, lon: 72.1281 },
  { id: 14, name: 'Сулюкта', region: 'Баткенская область', lat: 39.9358, lon: 69.5672 },
  { id: 15, name: 'Майлуу-Суу', region: 'Джалал-Абадская область', lat: 41.2833, lon: 72.4667 },
  { id: 16, name: 'Кок-Жангак', region: 'Джалал-Абадская область', lat: 41.0333, lon: 72.8167 },
  { id: 17, name: 'Таш-Кумыр', region: 'Джалал-Абадская область', lat: 41.3500, lon: 72.2167 },
  { id: 18, name: 'Шопоков', region: 'Чуйская область', lat: 42.8333, lon: 74.1167 },
  { id: 19, name: 'Кемин', region: 'Чуйская область', lat: 42.7833, lon: 75.7000 },
  { id: 20, name: 'Орловка', region: 'Чуйская область', lat: 42.5333, lon: 74.4500 },
  { id: 21, name: 'Айдаркен', region: 'Баткенская область', lat: 39.9500, lon: 71.3333 },
  { id: 22, name: 'Исфана', region: 'Баткенская область', lat: 39.8333, lon: 69.5333 },
  { id: 23, name: 'Кербен', region: 'Джалал-Абадская область', lat: 40.5167, lon: 72.4500 },
  { id: 24, name: 'Ноокат', region: 'Ошская область', lat: 39.9167, lon: 72.6167 },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ cities: KYRGYZSTAN_CITIES });
    }

    // Фильтруем города по запросу (поиск без учета регистра)
    const searchQuery = query.toLowerCase().trim();
    const filteredCities = KYRGYZSTAN_CITIES.filter((city) =>
      city.name.toLowerCase().includes(searchQuery)
    );

    return NextResponse.json({ cities: filteredCities });
  } catch (error) {
    console.error('Ошибка поиска городов:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска городов' },
      { status: 500 }
    );
  }
}
