#!/usr/bin/env node

/**
 * Скрипт для тестирования отправки email менеджеру
 * 
 * Использование:
 * node scripts/test-manager-email.mjs manager@example.com
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения
dotenv.config({ path: resolve(__dirname, '..', '.env') });

// Генерация тестового кода
function generateTestCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// HTML шаблон
function getEmailTemplate(code) {
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <title>Тестовый код</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Nur-Kitep</h1>
                  <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 14px;">Тест отправки email</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Тестовый код</h2>
                  <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">
                    Это тестовое письмо для проверки отправки кодов менеджеру.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px;">
                          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">ТЕСТОВЫЙ КОД</p>
                          <p style="color: #3b82f6; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${code}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px;">
                    ✅ Если вы видите это письмо, отправка email работает корректно!
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                    © ${new Date().getFullYear()} Nur-Kitep. Тестовое письмо.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

async function testEmail(recipientEmail) {
  console.log('🧪 Начало тестирования отправки email...\n');

  // Проверка переменных окружения
  console.log('📋 Проверка конфигурации:');
  console.log('  SMTP_USER:', process.env.SMTP_USER || '❌ НЕ НАСТРОЕН');
  console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ Настроен' : '❌ НЕ НАСТРОЕН');
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('\n❌ ОШИБКА: SMTP учетные данные не настроены в .env файле!\n');
    console.log('Добавьте в .env:');
    console.log('  SMTP_USER="your-email@gmail.com"');
    console.log('  SMTP_PASS="your-app-password"\n');
    process.exit(1);
  }

  // Создание транспорта
  console.log('\n📧 Создание SMTP транспорта...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
    requireTLS: true,
    logger: true,
    debug: true,
  });

  console.log('✅ Транспорт создан\n');

  // Генерация тестового кода
  const testCode = generateTestCode();
  console.log('🔢 Сгенерирован тестовый код:', testCode);

  // Настройки письма
  const mailOptions = {
    from: {
      name: 'Nur-Kitep (TEST)',
      address: process.env.SMTP_USER,
    },
    to: recipientEmail,
    subject: '🧪 Тест отправки кода для менеджера Nur-Kitep',
    text: `Тестовый код: ${testCode}\n\nЕсли вы видите это письмо, отправка email работает корректно!`,
    html: getEmailTemplate(testCode),
  };

  console.log('\n📨 Отправка письма на:', recipientEmail);
  console.log('⏳ Ожидание (максимум 20 секунд)...\n');

  try {
    // Отправка с таймаутом
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут: письмо не отправлено за 20 секунд')), 20000)
    );
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    
    console.log('✅ УСПЕХ! Письмо отправлено!');
    console.log('\n📊 Детали отправки:');
    console.log('  Message ID:', info.messageId);
    console.log('  Response:', info.response);
    console.log('  Accepted:', info.accepted);
    console.log('  Rejected:', info.rejected);
    
    console.log('\n✨ Проверьте почтовый ящик:', recipientEmail);
    console.log('💡 Если письмо не пришло, проверьте папку "Спам"\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ ОШИБКА при отправке письма!\n');
    console.error('Тип ошибки:', error.constructor.name);
    console.error('Сообщение:', error.message);
    
    if (error.code) {
      console.error('Код ошибки:', error.code);
    }
    if (error.responseCode) {
      console.error('SMTP Response Code:', error.responseCode);
    }
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    if (error.command) {
      console.error('SMTP Command:', error.command);
    }
    
    console.log('\n📚 Возможные причины и решения:');
    
    if (error.message.includes('Invalid login')) {
      console.log('  ❌ Неверный App Password для Gmail');
      console.log('  ✅ Решение: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
      console.log('  ❌ Хостинг блокирует порт 587');
      console.log('  ✅ Решение: свяжитесь с поддержкой Timeweb');
    } else if (error.message.includes('timeout')) {
      console.log('  ❌ Таймаут соединения');
      console.log('  ✅ Решение: проверьте интернет или файрвол');
    }
    
    console.log('\n📖 Подробная документация: EMAIL_TROUBLESHOOTING.md\n');
    
    return false;
  }
}

// Получение email из аргументов
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Укажите email получателя!\n');
  console.log('Использование:');
  console.log('  node scripts/test-manager-email.mjs manager@example.com\n');
  process.exit(1);
}

// Валидация email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Неверный формат email:', recipientEmail, '\n');
  process.exit(1);
}

// Запуск теста
testEmail(recipientEmail)
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Непредвиденная ошибка:', error);
    process.exit(1);
  });
