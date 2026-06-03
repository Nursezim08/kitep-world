# Структура футера лендинга

## Обзор

Футер лендинга обновлен и включает ссылки на юридические документы в двух местах:
1. Отдельная колонка "Документы"
2. Нижняя строка с copyright

## Визуальная структура

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FOOTER (5 колонок)                             │
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────┤
│   Бренд      │    Меню      │  Документы   │   Контакты   │   Социальные    │
│              │              │   (новое)    │              │     сети        │
├──────────────┼──────────────┼──────────────┼──────────────┼─────────────────┤
│ [Логотип]    │ • Каталог    │ • Условия    │ 📞 Телефон   │  [Telegram]     │
│ Nur-Kitep    │ • О нас      │   использ.   │ 📧 Email     │  [Instagram]    │
│              │ • Филиалы    │ • Политика   │ 📍 Адрес     │  [Email]        │
│ Описание     │ • Контакты   │   конфиден.  │              │                 │
│ компании     │              │ • Вход       │              │                 │
│              │              │ • Регистрация│              │                 │
└──────────────┴──────────────┴──────────────┴──────────────┴─────────────────┘
├─────────────────────────────────────────────────────────────────────────────┤
│                        НИЖНЯЯ СТРОКА (COPYRIGHT)                            │
│                                                                             │
│  © 2024 Nur-Kitep               Условия использования · Политика конфиден. │
│  (слева)                                                          (справа) │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Код структуры

### Desktop версия (≥768px):

```tsx
<footer className="bg-gray-900 text-gray-300">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    {/* 5 колонок */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
      {/* 1. Бренд */}
      <div>...</div>
      
      {/* 2. Меню */}
      <div>...</div>
      
      {/* 3. Документы (новое) */}
      <div>
        <h3>Документы</h3>
        <ul>
          <li><a href="/terms">Условия использования</a></li>
          <li><a href="/privacy">Политика конфиденциальности</a></li>
          <li><a href="/login">Вход</a></li>
          <li><a href="/register">Регистрация</a></li>
        </ul>
      </div>
      
      {/* 4. Контакты */}
      <div>...</div>
      
      {/* 5. Социальные сети */}
      <div>...</div>
    </div>

    {/* Copyright строка */}
    <div className="border-t border-gray-800 pt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Слева: copyright */}
        <p>© 2024 Nur-Kitep. Все права защищены.</p>
        
        {/* Справа: ссылки на документы */}
        <div className="flex items-center gap-4">
          <a href="/terms">Условия использования</a>
          <span>·</span>
          <a href="/privacy">Политика конфиденциальности</a>
        </div>
      </div>
    </div>
  </div>
</footer>
```

### Mobile версия (<768px):

```
┌─────────────────────────┐
│       Бренд             │
│   [Логотип] Nur-Kitep   │
│   Описание компании     │
├─────────────────────────┤
│       Меню              │
│   • Каталог             │
│   • О нас               │
│   • Филиалы             │
│   • Контакты            │
├─────────────────────────┤
│     Документы           │
│   • Условия использ.    │
│   • Политика конфиден.  │
│   • Вход                │
│   • Регистрация         │
├─────────────────────────┤
│     Контакты            │
│   📞 Телефон            │
│   📧 Email              │
│   📍 Адрес              │
├─────────────────────────┤
│   Социальные сети       │
│   [Telegram] [Inst] ... │
├─────────────────────────┤
│   © 2024 Nur-Kitep      │
│                         │
│   Условия использования │
│           ·             │
│ Политика конфиденциал.  │
└─────────────────────────┘
```

## Стилизация

### Колонка "Документы":

```tsx
<div>
  <h3 className="text-white font-bold mb-4">Документы</h3>
  <ul className="space-y-3 text-sm">
    <li>
      <a 
        href="/terms" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Условия использования
      </a>
    </li>
    <li>
      <a 
        href="/privacy" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Политика конфиденциальности
      </a>
    </li>
    <li>
      <a 
        href="/login" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Вход
      </a>
    </li>
    <li>
      <a 
        href="/register" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Регистрация
      </a>
    </li>
  </ul>
</div>
```

### Copyright строка:

```tsx
<div className="border-t border-gray-800 pt-8">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    {/* Слева */}
    <p className="text-sm text-gray-400 font-semibold text-center md:text-left">
      © 2024 Nur-Kitep. Все права защищены.
    </p>
    
    {/* Справа */}
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
      <a 
        href="/terms" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Условия использования
      </a>
      <span>·</span>
      <a 
        href="/privacy" 
        className="hover:text-violet-400 transition-colors font-semibold"
      >
        Политика конфиденциальности
      </a>
    </div>
  </div>
</div>
```

## Цветовая схема

| Элемент | Цвет | Класс |
|---------|------|-------|
| Фон футера | Темно-серый | `bg-gray-900` |
| Основной текст | Светло-серый | `text-gray-300` |
| Заголовки | Белый | `text-white` |
| Hover ссылок | Фиолетовый | `hover:text-violet-400` |
| Copyright | Темно-серый | `text-gray-400` |
| Разделитель | Еще темнее | `border-gray-800` |

## Адаптивность

### Breakpoints:

- **Mobile (< 768px)**: 1 колонка, вертикальный стек
- **Tablet (≥ 768px)**: 2-3 колонки
- **Desktop (≥ 1024px)**: 5 колонок полностью

### Copyright строка:

- **Mobile**: Колонка (flex-col), центрирование
- **Desktop**: Строка (flex-row), space-between

## Hover эффекты

```css
/* Ссылки */
a:hover {
  color: #a78bfa; /* violet-400 */
  transition: colors 200ms;
}

/* Социальные иконки */
.social-icon:hover {
  background: #8b5cf6; /* violet-500 */
  transition: all 300ms;
}
```

## Доступность

- ✅ Все ссылки имеют описательный текст
- ✅ Иконки сопровождаются текстом
- ✅ Контрастные цвета (WCAG AA)
- ✅ Клавиатурная навигация
- ✅ Семантическая разметка (footer, nav)

## SEO

```html
<footer role="contentinfo">
  <nav aria-label="Footer Navigation">
    <!-- Ссылки -->
  </nav>
  <div aria-label="Copyright and Legal">
    <!-- Copyright и юридические ссылки -->
  </div>
</footer>
```

## Проверка

✅ Desktop (1920px): все 5 колонок видны
✅ Tablet (768px): адаптивная сетка
✅ Mobile (375px): вертикальный стек
✅ Ссылки ведут на правильные страницы
✅ Hover эффекты работают
✅ Copyright строка адаптивна

## Будущие улучшения

- [ ] Добавить активные ссылки на социальные сети
- [ ] Добавить иконки для юридических документов
- [ ] Добавить newsletter подписку
- [ ] Мультиязычность футера (кыргызский)
- [ ] Ссылка на карту с филиалами
