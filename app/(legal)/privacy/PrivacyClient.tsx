'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyClient() {
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
                <Shield className="text-white" size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Политика конфиденциальности
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
                  Настоящая Политика конфиденциальности регулирует порядок обработки и защиты персональных данных пользователей интернет-магазина <strong>Nur-kitep</strong> (далее – «Сервис»).
                </p>
                <p>
                  Мы обязуемся защищать вашу конфиденциальность в соответствии с Законом Кыргызской Республики «О персональных данных» от 14 апреля 2008 года № 58.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                2. Какие данные мы собираем
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>При использовании нашего Сервиса мы можем собирать следующие категории данных:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Регистрационные данные:</strong> имя, адрес электронной почты, номер телефона</li>
                  <li><strong>Профиль:</strong> предпочтения, история покупок</li>
                  <li><strong>Платежная информация:</strong> детали оплаты (обрабатывается платежными системами)</li>
                  <li><strong>Данные доставки:</strong> адрес, контактная информация</li>
                  <li><strong>Технические данные:</strong> IP-адрес, тип устройства, браузер, файлы cookie</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                3. Цели обработки данных
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Мы используем ваши персональные данные для:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Регистрации и управления учетной записью</li>
                  <li>Обработки и выполнения заказов</li>
                  <li>Связи с вами по вопросам заказов и обслуживания</li>
                  <li>Улучшения качества работы Сервиса</li>
                  <li>Персонализации предложений и рекомендаций</li>
                  <li>Соблюдения законодательных требований</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                4. Правовые основания обработки
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Обработка ваших персональных данных осуществляется на следующих правовых основаниях:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Ваше согласие</strong> на обработку персональных данных</li>
                  <li><strong>Исполнение договора,</strong> стороной которого вы являетесь</li>
                  <li><strong>Соблюдение правовых обязательств</strong> оператора</li>
                  <li><strong>Законные интересы</strong> оператора или третьих лиц</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                5. Защита данных
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Мы применяем современные технические и организационные меры для защиты ваших данных:</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-green-900">🔒 Меры безопасности:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                    <li>Шифрование данных (SSL/TLS)</li>
                    <li>Ограничение доступа к персональным данным</li>
                    <li>Регулярное тестирование систем безопасности</li>
                    <li>Мониторинг несанкционированного доступа</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                6. Передача данных третьим лицам
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>Мы можем передавать ваши данные следующим категориям получателей:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Платежные системы</strong> (для обработки платежей)</li>
                  <li><strong>Провайдеры хостинга</strong> (для хранения данных)</li>
                  <li><strong>Email-сервисы</strong> (для отправки уведомлений)</li>
                </ul>
                <p className="text-sm text-gray-600 italic">
                  Все третьи лица обязаны соблюдать конфиденциальность и безопасность ваших данных.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                7. Срок хранения данных
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Активный аккаунт:</strong> до удаления учетной записи</li>
                  <li><strong>Заказы:</strong> 3 года с даты выполнения заказа</li>
                  <li><strong>Логи и технические данные:</strong> 6 месяцев</li>
                </ul>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                8. Ваши права
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>В соответствии с законодательством КР, вы имеете следующие права:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-blue-900 text-sm">
                    <li><strong>Право на доступ</strong> к своим персональным данным</li>
                    <li><strong>Право на исправление</strong> неточных данных</li>
                    <li><strong>Право на удаление</strong> («право на забвение»)</li>
                    <li><strong>Право на ограничение обработки</strong></li>
                    <li><strong>Право на возражение</strong> против обработки</li>
                    <li><strong>Право на отзыв согласия</strong> в любое время</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                9. Cookie-файлы
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Мы используем cookie-файлы для улучшения работы Сервиса, анализа посещаемости и персонализации контента.
                </p>
                <p>
                  Вы можете настроить использование cookie в настройках вашего браузера, однако это может ограничить функциональность Сервиса.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                10. Дети
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-900">
                    ⚠️ Наш Сервис не предназначен для лиц младше 18 лет. Мы сознательно не собираем персональные данные детей.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                11. Изменения политики
              </h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности.
                </p>
                <p>
                  О существенных изменениях мы уведомим вас по электронной почте или через уведомление в Сервисе.
                </p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                12. Контактная информация
              </h2>
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  По вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам:
                </p>
                <div className="space-y-2 text-gray-800">
                  <p><strong>Email:</strong> privacy@nur-kitep.kg</p>
                  <p><strong>Телефон:</strong> +996 XXX XXX XXX</p>
                  <p><strong>Адрес:</strong> Кыргызская Республика, г. Бишкек, [адрес]</p>
                  <p className="text-sm text-gray-600 mt-4">
                    Мы обязуемся рассмотреть ваш запрос в течение 30 дней с момента получения.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
