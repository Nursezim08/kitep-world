import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env файл
dotenv.config({ path: resolve(__dirname, '../.env') });

console.log('🔍 Проверка SMTP настроек...\n');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '****' : 'НЕ НАСТРОЕН');
console.log('');

async function testEmail() {
  try {
    console.log('📧 Создание SMTP транспорта...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    console.log('✅ Транспорт создан');
    console.log('');

    console.log('🔗 Проверка подключения к SMTP серверу...');
    await transporter.verify();
    console.log('✅ Подключение успешно!');
    console.log('');

    console.log('📨 Отправка тестового письма...');
    const testEmail = process.env.SMTP_USER;
    
    const info = await transporter.sendMail({
      from: {
        name: 'Nur-Kitep Test',
        address: process.env.SMTP_USER,
      },
      to: testEmail,
      subject: 'Тест SMTP - Nur-Kitep',
      text: 'Это тестовое письмо для проверки SMTP настроек.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #8b5cf6;">✅ SMTP работает!</h2>
          <p>Это тестовое письмо подтверждает, что отправка email через Gmail SMTP настроена правильно.</p>
          <p><strong>Время отправки:</strong> ${new Date().toLocaleString('ru-RU')}</p>
        </div>
      `,
    });

    console.log('✅ Письмо отправлено успешно!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Проверьте почту:', testEmail);
    console.log('');
    console.log('🎉 SMTP настроен правильно!');

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error('');
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 РЕШЕНИЕ:');
      console.log('1. Убедитесь что включена двухфакторная аутентификация в Google');
      console.log('2. Создайте App Password (пароль приложения):');
      console.log('   https://myaccount.google.com/apppasswords');
      console.log('3. Замените SMTP_PASS в .env файле на новый App Password');
    } else if (error.message.includes('timeout')) {
      console.log('💡 РЕШЕНИЕ:');
      console.log('1. Проверьте интернет соединение');
      console.log('2. Убедитесь что порт 587 не заблокирован фаерволом');
    } else {
      console.log('💡 Проверьте:');
      console.log('1. SMTP_USER и SMTP_PASS в .env файле');
      console.log('2. Интернет соединение');
      console.log('3. Настройки безопасности Gmail');
    }
  }
}

testEmail();
