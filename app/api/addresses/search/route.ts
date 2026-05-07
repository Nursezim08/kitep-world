import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const city = searchParams.get('city');
    const district = searchParams.get('district');

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ addresses: [] });
    }

    // Формируем поисковый запрос с учетом города и района
    let searchQuery = query.trim();
    if (city) {
      searchQuery = `${searchQuery}, ${city}`;
    }
    if (district) {
      searchQuery = `${searchQuery}, ${district}`;
    }
    searchQuery += ', Кыргызстан';

    // Используем Nominatim API (OpenStreetMap) для поиска адресов
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: searchQuery,
      format: 'json',
      addressdetails: '1',
      limit: '15',
      'accept-language': 'ru',
      countrycodes: 'kg',
      // Добавляем extratags для получения дополнительной информации
      extratags: '1',
    });

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Nur-Kitep-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка запроса к Nominatim API');
    }

    const data = await response.json();

    // Обрабатываем результаты
    const addresses = data
      .map((item: any) => {
        // Формируем читаемый адрес
        const address = item.address || {};
        const parts = [];

        // Добавляем улицу/проспект/бульвар
        if (address.road) {
          parts.push(address.road);
        } else if (address.street) {
          parts.push(address.street);
        } else if (address.pedestrian) {
          parts.push(address.pedestrian);
        }

        // Добавляем номер дома
        if (address.house_number) {
          parts.push(address.house_number);
        }

        // Добавляем корпус/строение если есть
        if (address.building) {
          parts.push(`корп. ${address.building}`);
        }

        // Если нет улицы, но есть название места (POI)
        if (parts.length === 0 && item.name) {
          parts.push(item.name);
        }

        // Если все еще пусто, используем display_name
        const formattedAddress = parts.length > 0 ? parts.join(', ') : item.display_name.split(',')[0];

        return {
          id: item.place_id,
          address: formattedAddress,
          fullAddress: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          type: item.type,
          addressType: item.addresstype,
          city: address.city || address.town || address.village || city || '',
          district: address.suburb || address.neighbourhood || district || '',
          // Дополнительные детали
          street: address.road || address.street || '',
          houseNumber: address.house_number || '',
          building: address.building || '',
        };
      })
      // Фильтруем дубликаты по адресу
      .filter((addr: any, index: number, self: any[]) => 
        index === self.findIndex((a) => a.address === addr.address)
      );

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Ошибка поиска адресов:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска адресов' },
      { status: 500 }
    );
  }
}
