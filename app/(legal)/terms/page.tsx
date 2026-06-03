'use client';

import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-violet-100 to-violet-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-100 rounded-xl">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Условия использования
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm sm:prose-base max-w-none">
            {/* 1. Общие положения */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Общие положения</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Настоящие Условия использования (далее – «Условия») регулируют отношения между 
                  пользователями и администрацией интернет-магазина Nur-Kitep (далее – «Сервис», 
                  «мы», «наш»).
                </p>
                <p>
                  Оператором Сервиса является: <strong>[Название юридического лица]</strong>, 
                  зарегистрированное в соответствии с законодательством Кыргызской Республики, 
                  ИНН: <strong>[ИНН]</strong>.
                </p>
                <div className="bg-violet-50 border-l-4 border-violet-500 p-4 rounded-r-xl">
                  <p className="font-semibold">Важно:</p>
                  <p className="mt-2">
                    Используя Сервис, вы подтверждаете, что прочитали, поняли и согласны соблюдать 
                    настоящие Условия. Если вы не согласны с Условиями, пожалуйста, не используйте Сервис.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Определения */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Определения</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Сервис</strong> – интернет-магазин Nur-Kitep, доступный по адресу nur-kitep.kg</p>
                <p><strong>Пользователь</strong> – любое лицо, использующее Сервис</p>
                <p><strong>Покупатель</strong> – пользователь, совершающий покупку товаров через Сервис</p>
                <p><strong>Товар</strong> – канцелярские товары, книги и другая продукция, представленная в каталоге</p>
                <p><strong>Заказ</strong> – запрос Покупателя на приобретение товаров</p>
                <p><strong>Договор</strong> – договор купли-продажи между Покупателем и Оператором</p>
              </div>
            </section>

            {/* 3. Регистрация */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Регистрация и аккаунт</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1. Требования к пользователям:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Возраст: не менее 18 лет</li>
                  <li>Дееспособность: полная дееспособность по законодательству КР</li>
                  <li>Согласие с настоящими Условиями и Политикой конфиденциальности</li>
                </ul>

                <p className="mt-4"><strong>3.2. При регистрации вы обязуетесь:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Предоставить достоверную и актуальную информацию</li>
                  <li>Сохранять конфиденциальность учетных данных</li>
                  <li>Немедленно уведомлять нас о несанкционированном доступе</li>
                  <li>Не передавать аккаунт третьим лицам</li>
                </ul>

                <p className="mt-4"><strong>3.3. Мы оставляем за собой право:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Отказать в регистрации без объяснения причин</li>
                  <li>Приостановить или удалить аккаунт при нарушении Условий</li>
                  <li>Запросить дополнительную информацию для верификации</li>
                </ul>
              </div>
            </section>

            {/* 4. Оформление заказа */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Оформление и выполнение заказа</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1. Процесс оформления:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Выбор товаров и добавление в корзину</li>
                  <li>Заполнение контактных данных</li>
                  <li>Выбор способа оплаты</li>
                  <li>Выбор филиала для самовывоза</li>
                  <li>Подтверждение заказа</li>
                </ul>

                <p className="mt-4"><strong>4.2. Принятие заказа:</strong></p>
                <p>
                  Заказ считается принятым после успешной оплаты и получения уведомления на email. 
                  В этот момент заключается договор купли-продажи между вами и Оператором.
                </p>

                <p className="mt-4"><strong>4.3. Отказ в выполнении заказа:</strong></p>
                <p>Мы можем отказать в выполнении заказа в следующих случаях:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Товар отсутствует на складе</li>
                  <li>Некорректные контактные данные</li>
                  <li>Подозрение в мошенничестве</li>
                  <li>Технические проблемы с обработкой платежа</li>
                </ul>

                <p className="mt-4"><strong>4.4. Получение заказа:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Заказ выдается в выбранном филиале</li>
                  <li>Для получения необходимо предъявить 5-значный код из личного кабинета</li>
                  <li>Заказ хранится в филиале 7 календарных дней</li>
                  <li>После истечения срока хранения заказ аннулируется с возвратом средств</li>
                </ul>
              </div>
            </section>

            {/* 5. Цены и оплата */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Цены и оплата</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>5.1. Цены:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Все цены указаны в кыргызских сомах (KGS)</li>
                  <li>Цены включают НДС (если применимо)</li>
                  <li>Цены могут быть изменены без предварительного уведомления</li>
                  <li>Цена фиксируется в момент оформления заказа</li>
                </ul>

                <p className="mt-4"><strong>5.2. Способы оплаты:</strong></p>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Банковские карты (Visa, Mastercard)</li>
                    <li>Электронные кошельки (Finik Pay)</li>
                    <li>Мобильные платежи</li>
                  </ul>
                </div>

                <p className="mt-4"><strong>5.3. Безопасность платежей:</strong></p>
                <p>
                  Обработка платежей осуществляется через защищенные платежные шлюзы. 
                  Мы не храним данные вашей банковской карты.
                </p>
              </div>
            </section>

            {/* 6. Возврат и обмен */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Возврат и обмен товаров</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1. Условия возврата:</strong></p>
                <p>
                  В соответствии с Законом КР «О защите прав потребителей», вы можете вернуть товар 
                  надлежащего качества в течение <strong>14 календарных дней</strong> с момента получения.
                </p>

                <p className="mt-4"><strong>6.2. Требования к возвращаемому товару:</strong></p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl">
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Товар не был в употреблении</li>
                    <li>Сохранены товарный вид, упаковка, ярлыки</li>
                    <li>Сохранен чек или другой документ об оплате</li>
                  </ul>
                </div>

                <p className="mt-4"><strong>6.3. Товары, не подлежащие возврату:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Канцелярские товары надлежащего качества (согласно закону КР)</li>
                  <li>Книги и печатная продукция</li>
                  <li>Товары индивидуального пользования (если распакованы)</li>
                </ul>

                <p className="mt-4"><strong>6.4. Процедура возврата:</strong></p>
                <ol className="space-y-2 list-decimal list-inside ml-4">
                  <li>Свяжитесь с нами по email или телефону</li>
                  <li>Предоставьте номер заказа и причину возврата</li>
                  <li>Получите подтверждение и инструкции</li>
                  <li>Доставьте товар в указанный филиал</li>
                  <li>Получите возврат средств в течение 10 рабочих дней</li>
                </ol>

                <p className="mt-4"><strong>6.5. Товары ненадлежащего качества:</strong></p>
                <p>
                  При обнаружении брака или несоответствия описанию, вы вправе потребовать замену, 
                  ремонт или возврат денег в течение гарантийного срока или срока годности товара.
                </p>
              </div>
            </section>

            {/* 7. Гарантии */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Гарантии и ответственность</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1. Наши гарантии:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Товары соответствуют описанию в каталоге</li>
                  <li>Товары надлежащего качества</li>
                  <li>Защита персональных данных</li>
                  <li>Обработка заказов в разумные сроки</li>
                </ul>

                <p className="mt-4"><strong>7.2. Ограничение ответственности:</strong></p>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                  <p>Мы НЕ несем ответственность за:</p>
                  <ul className="space-y-2 list-disc list-inside mt-2">
                    <li>Перерывы в работе Сервиса по техническим причинам</li>
                    <li>Действия третьих лиц (платежных систем, провайдеров)</li>
                    <li>Косвенные убытки и упущенную выгоду</li>
                    <li>Ущерб от неправильного использования товаров</li>
                  </ul>
                </div>

                <p className="mt-4"><strong>7.3. Максимальная ответственность:</strong></p>
                <p>
                  Наша максимальная ответственность ограничена стоимостью конкретного заказа, 
                  по которому возникли претензии.
                </p>
              </div>
            </section>

            {/* 8. Интеллектуальная собственность */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Интеллектуальная собственность</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>8.1. Права на контент:</strong></p>
                <p>
                  Все материалы Сервиса (тексты, изображения, логотипы, дизайн) защищены авторским 
                  правом и принадлежат Оператору или его партнерам.
                </p>

                <p className="mt-4"><strong>8.2. Запрещается:</strong></p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Копировать, воспроизводить, распространять контент без разрешения</li>
                  <li>Использовать товарные знаки и логотипы Сервиса</li>
                  <li>Создавать производные работы на основе контента Сервиса</li>
                  <li>Извлекать данные автоматизированными средствами (парсинг)</li>
                </ul>

                <p className="mt-4"><strong>8.3. Разрешенное использование:</strong></p>
                <p>
                  Вы можете просматривать и использовать Сервис исключительно в личных некоммерческих целях.
                </p>
              </div>
            </section>

            {/* 9. Запрещенные действия */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Запрещенные действия</h2>
              <div className="space-y-3 text-gray-700">
                <p>При использовании Сервиса запрещается:</p>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Нарушать законодательство Кыргызской Республики</li>
                    <li>Размещать вредоносный код или вирусы</li>
                    <li>Осуществлять DDoS-атаки или перегружать серверы</li>
                    <li>Обходить системы безопасности</li>
                    <li>Создавать фальшивые аккаунты</li>
                    <li>Использовать ботов и автоматизированные скрипты</li>
                    <li>Оставлять ложные отзывы</li>
                    <li>Мошенничество и подделка платежей</li>
                    <li>Нарушать права других пользователей</li>
                  </ul>
                </div>
                <p className="mt-3 font-semibold">
                  При нарушении этих правил мы заблокируем ваш аккаунт и можем обратиться в правоохранительные органы.
                </p>
              </div>
            </section>

            {/* 10. Изменение условий */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Изменение условий</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Мы оставляем за собой право изменять настоящие Условия в любое время. 
                  Изменения вступают в силу с момента публикации на сайте.
                </p>
                <p>
                  О существенных изменениях мы уведомим вас по электронной почте или через уведомление 
                  на сайте за 7 календарных дней до вступления изменений в силу.
                </p>
                <p>
                  Продолжение использования Сервиса после вступления изменений в силу означает ваше 
                  согласие с обновленными Условиями.
                </p>
              </div>
            </section>

            {/* 11. Разрешение споров */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Разрешение споров</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>11.1. Претензионный порядок:</strong></p>
                <p>
                  До обращения в суд стороны обязуются урегулировать спор в претензионном порядке. 
                  Срок ответа на претензию – 30 календарных дней.
                </p>

                <p className="mt-4"><strong>11.2. Применимое право:</strong></p>
                <p>
                  Настоящие Условия регулируются законодательством Кыргызской Республики.
                </p>

                <p className="mt-4"><strong>11.3. Подсудность:</strong></p>
                <p>
                  Споры, не урегулированные в претензионном порядке, подлежат рассмотрению в судах 
                  Кыргызской Республики по месту нахождения Оператора.
                </p>
              </div>
            </section>

            {/* 12. Прочие условия */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">12. Прочие условия</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>12.1. Полнота соглашения:</strong></p>
                <p>
                  Настоящие Условия, Политика конфиденциальности и другие политики Сервиса составляют 
                  полное соглашение между вами и Оператором.
                </p>

                <p className="mt-4"><strong>12.2. Делимость:</strong></p>
                <p>
                  Если какое-либо положение Условий признано недействительным, остальные положения 
                  сохраняют силу.
                </p>

                <p className="mt-4"><strong>12.3. Язык:</strong></p>
                <p>
                  Официальным языком Условий является русский язык.
                </p>
              </div>
            </section>

            {/* 13. Контакты */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">13. Контактная информация</h2>
              <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6">
                <p className="text-gray-700 mb-3">
                  По всем вопросам, связанным с Условиями использования, вы можете связаться с нами:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Оператор:</strong> [Название юридического лица]</p>
                  <p><strong>ИНН:</strong> [ИНН]</p>
                  <p><strong>Юридический адрес:</strong> [Адрес]</p>
                  <p><strong>Email:</strong> support@nur-kitep.kg</p>
                  <p><strong>Телефон:</strong> +996 XXX XXX XXX</p>
                  <p><strong>Время работы:</strong> Пн-Пт, 9:00-18:00</p>
                </div>
                <div className="mt-6 pt-4 border-t border-violet-200">
                  <p className="text-sm text-gray-600">
                    <strong>Документы:</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <Link 
                      href="/privacy"
                      className="text-violet-600 hover:text-violet-700 text-sm font-semibold underline"
                    >
                      Политика конфиденциальности
                    </Link>
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
