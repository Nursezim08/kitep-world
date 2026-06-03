'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Политика конфиденциальности
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
                  Настоящая Политика конфиденциальности (далее – «Политика») разработана в соответствии 
                  с Законом Кыргызской Республики «О персональных данных» от 14 апреля 2008 года № 58 
                  и определяет порядок обработки персональных данных пользователей интернет-магазина 
                  Nur-Kitep (далее – «Сервис»).
                </p>
                <p>
                  Оператором персональных данных является: <strong>[Название юридического лица]</strong>, 
                  зарегистрированное по адресу: <strong>[Юридический адрес]</strong>, 
                  ИНН: <strong>[ИНН]</strong>.
                </p>
                <p>
                  Используя Сервис, вы соглашаетесь с условиями настоящей Политики. Если вы не согласны 
                  с какими-либо положениями Политики, пожалуйста, не используйте Сервис.
                </p>
              </div>
            </section>

            {/* 2. Какие данные мы собираем */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Какие данные мы собираем</h2>
              <div className="space-y-3 text-gray-700">
                <p>Мы можем собирать следующие категории персональных данных:</p>
                <div className="bg-violet-50 border-l-4 border-violet-500 p-4 rounded-r-xl">
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong>Регистрационные данные:</strong> имя, фамилия, адрес электронной почты, номер телефона</li>
                    <li><strong>Данные профиля:</strong> фотография профиля, предпочтения, история заказов</li>
                    <li><strong>Платежная информация:</strong> данные для обработки платежей (через защищенные платежные шлюзы)</li>
                    <li><strong>Данные доставки:</strong> адрес доставки, информация о получателе</li>
                    <li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, cookie-файлы</li>
                    <li><strong>Данные об использовании:</strong> история просмотров, поисковые запросы, действия на сайте</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Цели обработки данных */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Цели обработки персональных данных</h2>
              <div className="space-y-3 text-gray-700">
                <p>Мы обрабатываем ваши персональные данные для следующих целей:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Регистрация и идентификация пользователя</li>
                  <li>Обработка и выполнение заказов</li>
                  <li>Обработка платежей и предотвращение мошенничества</li>
                  <li>Связь с клиентами (уведомления о заказах, ответы на вопросы)</li>
                  <li>Улучшение качества сервиса и пользовательского опыта</li>
                  <li>Персонализация контента и рекомендаций</li>
                  <li>Проведение маркетинговых акций (с вашего согласия)</li>
                  <li>Соблюдение законодательства Кыргызской Республики</li>
                </ul>
              </div>
            </section>

            {/* 4. Правовые основания */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Правовые основания обработки</h2>
              <div className="space-y-3 text-gray-700">
                <p>Обработка персональных данных осуществляется на основании:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><strong>Вашего согласия</strong> – при регистрации и использовании Сервиса</li>
                  <li><strong>Договора</strong> – для выполнения обязательств по договору купли-продажи</li>
                  <li><strong>Закона</strong> – для соблюдения требований законодательства КР</li>
                  <li><strong>Законных интересов</strong> – для обеспечения безопасности и улучшения Сервиса</li>
                </ul>
              </div>
            </section>

            {/* 5. Как мы защищаем данные */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Защита персональных данных</h2>
              <div className="space-y-3 text-gray-700">
                <p>Мы применяем следующие меры защиты:</p>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Шифрование данных при передаче (SSL/TLS)</li>
                    <li>Шифрование паролей и чувствительных данных в базе данных</li>
                    <li>Ограничение доступа к персональным данным (только уполномоченные сотрудники)</li>
                    <li>Регулярный мониторинг и аудит безопасности</li>
                    <li>Защита от несанкционированного доступа и утечек</li>
                    <li>Резервное копирование данных</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. Передача данных третьим лицам */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Передача данных третьим лицам</h2>
              <div className="space-y-3 text-gray-700">
                <p>Мы можем передавать ваши персональные данные следующим категориям получателей:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><strong>Платежные системы</strong> – для обработки платежей (Finik Pay и другие)</li>
                  <li><strong>Службы доставки</strong> – для доставки заказов</li>
                  <li><strong>Хостинг-провайдеры</strong> – для хранения данных на серверах</li>
                  <li><strong>Email-сервисы</strong> – для отправки уведомлений</li>
                  <li><strong>Аналитические сервисы</strong> – для анализа использования Сервиса (с анонимизацией)</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl mt-4">
                  <p className="font-semibold">Важно:</p>
                  <p className="mt-2">
                    Мы НЕ продаем и НЕ передаем ваши персональные данные третьим лицам для маркетинговых целей 
                    без вашего явного согласия.
                  </p>
                </div>
              </div>
            </section>

            {/* 7. Срок хранения */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Срок хранения персональных данных</h2>
              <div className="space-y-3 text-gray-700">
                <p>Мы храним ваши персональные данные в течение:</p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li><strong>Активный аккаунт:</strong> до момента удаления аккаунта</li>
                  <li><strong>История заказов:</strong> 3 года с момента последнего заказа (для бухгалтерского учета)</li>
                  <li><strong>Технические логи:</strong> 6 месяцев</li>
                  <li><strong>Маркетинговые данные:</strong> до момента отзыва согласия</li>
                </ul>
                <p className="mt-3">
                  После истечения срока хранения данные подлежат удалению или анонимизации.
                </p>
              </div>
            </section>

            {/* 8. Ваши права */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Ваши права</h2>
              <div className="space-y-3 text-gray-700">
                <p>В соответствии с законодательством КР вы имеете право:</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                  <ul className="space-y-2 list-disc list-inside">
                    <li><strong>Доступ:</strong> получить информацию о том, какие данные мы обрабатываем</li>
                    <li><strong>Исправление:</strong> исправить неточные или неполные данные</li>
                    <li><strong>Удаление:</strong> запросить удаление ваших персональных данных («право на забвение»)</li>
                    <li><strong>Ограничение обработки:</strong> ограничить обработку в определенных случаях</li>
                    <li><strong>Возражение:</strong> возразить против обработки данных в маркетинговых целях</li>
                    <li><strong>Портируемость:</strong> получить ваши данные в структурированном формате</li>
                    <li><strong>Отзыв согласия:</strong> отозвать согласие на обработку в любое время</li>
                  </ul>
                </div>
                <p className="mt-4">
                  Для реализации своих прав свяжитесь с нами: <strong>privacy@nur-kitep.kg</strong>
                </p>
              </div>
            </section>

            {/* 9. Cookie-файлы */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Cookie-файлы</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Мы используем cookie-файлы для улучшения работы Сервиса. Cookie помогают нам:
                </p>
                <ul className="space-y-2 list-disc list-inside ml-4">
                  <li>Запоминать ваши предпочтения и настройки</li>
                  <li>Поддерживать сеанс входа в систему</li>
                  <li>Анализировать использование Сервиса</li>
                  <li>Персонализировать контент и рекламу</li>
                </ul>
                <p className="mt-3">
                  Вы можете отключить cookie в настройках браузера, однако это может ограничить 
                  функциональность Сервиса.
                </p>
              </div>
            </section>

            {/* 10. Дети */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Дети</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Сервис не предназначен для лиц младше 18 лет. Мы не собираем намеренно персональные 
                  данные детей без согласия родителей или законных представителей.
                </p>
                <p>
                  Если вам стало известно, что ребенок предоставил нам свои данные, пожалуйста, 
                  свяжитесь с нами для их удаления.
                </p>
              </div>
            </section>

            {/* 11. Изменения в политике */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">11. Изменения в Политике</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Мы оставляем за собой право вносить изменения в настоящую Политику. При внесении 
                  существенных изменений мы уведомим вас по электронной почте или через уведомление 
                  на сайте.
                </p>
                <p>
                  Продолжение использования Сервиса после внесения изменений означает ваше согласие 
                  с обновленной Политикой.
                </p>
              </div>
            </section>

            {/* 12. Контакты */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">12. Контактная информация</h2>
              <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-6">
                <p className="text-gray-700 mb-3">
                  По всем вопросам, связанным с обработкой персональных данных, вы можете связаться с нами:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> privacy@nur-kitep.kg</p>
                  <p><strong>Телефон:</strong> +996 XXX XXX XXX</p>
                  <p><strong>Адрес:</strong> [Физический адрес офиса]</p>
                  <p><strong>Время работы:</strong> Пн-Пт, 9:00-18:00</p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Мы обязуемся ответить на ваш запрос в течение 30 календарных дней.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
