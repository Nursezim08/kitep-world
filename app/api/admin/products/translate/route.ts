import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Название обязательно для перевода' },
        { status: 400 }
      );
    }

    // Формируем промпт для OpenAI
    const prompt = `Переведи следующий текст с русского языка на кыргызский язык. Верни результат строго в JSON формате без дополнительных пояснений.

Название: ${name}
${description ? `Описание: ${description}` : ''}

Формат ответа:
{
  "name_kg": "перевод названия на кыргызский",
  ${description ? '"description_kg": "перевод описания на кыргызский"' : '"description_kg": ""'}
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Ты профессиональный переводчик с русского на кыргызский язык. Отвечай только в формате JSON без дополнительного текста.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const translationText = completion.choices[0].message.content;
    if (!translationText) {
      throw new Error('Не удалось получить перевод от OpenAI');
    }

    const translation = JSON.parse(translationText);

    return NextResponse.json({
      success: true,
      translations: {
        kg: {
          name: translation.name_kg || '',
          description: translation.description_kg || '',
        },
      },
    });
  } catch (error) {
    console.error('Ошибка перевода:', error);
    return NextResponse.json(
      { error: 'Не удалось выполнить перевод' },
      { status: 500 }
    );
  }
}
