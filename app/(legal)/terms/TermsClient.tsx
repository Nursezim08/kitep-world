'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-violet-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">На главную</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-violet-100 overflow-hidden">
          {/* Title */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 sm:px-8 py-8 sm:py-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Условия использования
              </h1>
            </div>
            <p className="text-violet-100 text-sm sm:text-base">
              Дата вступления в силу: 10 мая 2026 года
            </p>
          </div>

          {/* Body */}
          <div className="px-6 sm:px-8 py-8 sm:py-10 space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                1. Общие положения
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Настоящие Условия использования (далее – «Условия») регулируют взаимоотношения между оператором интернет-магазина <strong>Nur-kitep</strong> (далее – «Оператор», «Мы») и пользователем Сервиса (далее – «Пользователь», «Вы»).
                </p>
                <p>
                  Используя наш Сервис, вы соглашаетесь с настоящими Условиями в полном объеме.
                </p>
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <p className="text-violet-900 text-sm">
                    <strong>Важно:</strong> Если вы не согласны с какими-либо положениями Условий, пожалуйста, не используйте наш Сервис.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                2. Определения
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Сервис</strong> – интернет-магазин Nur-kitep, доступный по адресу nur-kitep.store</li>
                  <li><strong>Пользователь</strong> – физическое лицо, использующее Сервис</li>
                  <li><strong>Товар</strong> – канцелярские товары, представленные в каталоге</li>
                  <li><strong>Заказ</strong> – оформленная заявка на приобретение товаров</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                3. Регистрация и учетная запись
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Для использования полного функционала Сервиса необходимо создать учетную запись.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-blue-900">Требования к регистрации:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                    <li>Возраст 18 лет и старше</li>
                    <li>Достоверная контактная информация</li>
                    <li>Уникальный адрес электронной почты</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600">
                  Вы несете ответственность за сохранение конфиденциальности своих учетных данных.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                4. Оформление и получение заказа
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p><strong>Процесс оформления:</strong></p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Выбор товаров и добавление в корзину</li>
                  <li>Оформление заказа с указанием контактных данных</li>
                  <li>Выбор филиала для самовывоза</li>
                  <li>Оплата заказа через платежную систему</li>
                  <li>Получение кода подтверждения</li>
                </ol>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-green-900 mb-2">✅ Получение заказа:</p>
                  <p className="text-green-800 text-sm">
                    Заказ готов к получению в течение 2-24 часов после оплаты. Назовите код подтверждения менеджеру при получении. Заказ хранится в филиале 7 дней.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                5. Цены и оплата
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Все цены указаны в сомах (KGS) и включают НДС (если применимо).</p>
                <p><strong>Способы оплаты:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Банковские карты (Visa, Mastercard, Элкарт)</li>
                  <li>Электронные кошельки</li>
                  <li>Онлайн-банкинг</li>
                </ul>
                <p className="text-sm text-gray-600">
                  Оплата производится через защищенную платежную систему. Мы не храним данные ваших платежных карт.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                6. Возврат и обмен товаров
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Вы можете вернуть или обменять товар в течение <strong>14 дней</strong> с момента получения.</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-900 mb-2">Условия возврата:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800 text-sm">
                    <li>Товар не был в употреблении</li>
                    <li>Сохранена упаковка и товарный вид</li>
                    <li>Наличие чека или подтверждения заказа</li>
                  </ul>
                </div>
                <p><strong>Невозвратные товары:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Товары личной гигиены</li>
                  <li>Товары, изготовленные на заказ</li>
                  <li>Цифровые товары после активации</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                7. Гарантии и ответственность
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p><strong>Мы гарантируем:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Качество товаров соответствует описанию</li>
                  <li>Соблюдение сроков подготовки заказа</li>
                  <li>Защиту ваших персональных данных</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Ограничение ответственности:</p>
                  <p className="text-red-800 text-sm">
                    Мы не несем ответственности за ущерб, возникший в результате неправильного использования товара или несоблюдения условий хранения.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                8. Интеллектуальная собственность
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Все материалы Сервиса (тексты, изображения, логотипы, дизайн) защищены авторским правом и принадлежат Оператору или его партнерам.
                </p>
                <p className="text-sm text-gray-600">
                  Запрещается копирование, распространение или использование материалов Сервиса без письменного разрешения.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                9. Запрещенные действия
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>При использовании Сервиса запрещается:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Нарушать права других пользователей</li>
                  <li>Распространять вредоносное ПО</li>
                  <li>Использовать автоматизированные средства (боты)</li>
                  <li>Совершать мошеннические действия</li>
                  <li>Предоставлять ложную информацию</li>
                </ul>
                <p className="text-sm text-red-600">
                  Нарушение этих правил может привести к блокировке учетной записи без предварительного уведомления.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                10. Изменение условий
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Мы оставляем за собой право изменять настоящие Условия в любое время.
                </p>
                <p>
                  О существенных изменениях мы уведомим вас за <strong>7 дней</strong> до вступления их в силу.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                11. Разрешение споров
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  В случае возникновения споров стороны обязуются предпринять попытку их досудебного урегулирования.
                </p>
                <p>
                  Претензии направляются на адрес: <strong>support@nur-kitep.kg</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Срок рассмотрения претензии: <strong>30 дней</strong> с момента получения.
                </p>
                <p>
                  При невозможности досудебного урегулирования споры подлежат рассмотрению в судебном порядке по месту нахождения Оператора в соответствии с законодательством Кыргызской Республики.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                12. Прочие условия
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Настоящие Условия составляют полное соглашение между сторонами</li>
                  <li>Недействительность отдельных положений не влечет недействительность Условий в целом</li>
                  <li>Настоящие Условия регулируются законодательством Кыргызской Республики</li>
                </ul>
              </div>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                13. Контактная информация
              </h2>
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  По всем вопросам, связанным с использованием Сервиса, обращайтесь:
                </p>
                <div className="space-y-2 text-gray-800">
                  <p><strong>Оператор:</strong> [Название юридического лица]</p>
                  <p><strong>ИНН:</strong> [ИНН]</p>
                  <p><strong>Адрес:</strong> Кыргызская Республика, г. Бишкек, [адрес]</p>
                  <p><strong>Email:</strong> support@nur-kitep.kg</p>
                  <p><strong>Телефон:</strong> +996 XXX XXX XXX</p>
                  <div className="mt-4 pt-4 border-t border-violet-200">
                    <p className="text-sm text-gray-600">
                      📄 <Link href="/privacy" className="text-violet-600 hover:text-violet-700 underline">Политика конфиденциальности</Link>
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
