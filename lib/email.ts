import nodemailer from 'nodemailer';

// Генерация 6-значного кода верификации
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Создание транспорта для отправки email через Gmail SMTP
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true для порта 465, false для других портов
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// HTML шаблон для email верификации
function getVerificationEmailTemplate(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Код верификации Nur-Kitep</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                    Nur-Kitep
                  </h1>
                  <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">
                    Книги и канцелярия
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">
                    Добро пожаловать!
                  </h2>
                  <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    Спасибо за регистрацию в Nur-Kitep. Для завершения регистрации введите код верификации:
                  </p>
                  
                  <!-- Verification Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Ваш код верификации
                          </p>
                          <p style="color: #8b5cf6; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${code}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                    ⏱️ Код действителен в течение <strong>10 минут</strong>
                  </p>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6;">
                    🔒 Никому не сообщайте этот код
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 13px;">
                    Если вы не регистрировались на Nur-Kitep, просто проигнорируйте это письмо.
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                    © ${new Date().getFullYear()} Nur-Kitep. Все права защищены.
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

// HTML шаблон для сброса пароля
function getPasswordResetEmailTemplate(code: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Сброс пароля Nur-Kitep</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                    Nur-Kitep
                  </h1>
                  <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">
                    Книги и канцелярия
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">
                    Сброс пароля
                  </h2>
                  <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    Вы запросили сброс пароля. Используйте код ниже для подтверждения:
                  </p>
                  
                  <!-- Reset Code -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                            Код для сброса пароля
                          </p>
                          <p style="color: #8b5cf6; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            ${code}
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="color: #6b7280; margin: 30px 0 0 0; font-size: 14px; line-height: 1.6;">
                    ⏱️ Код действителен в течение <strong>10 минут</strong>
                  </p>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6;">
                    🔒 Никому не сообщайте этот код
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 13px;">
                    Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 13px;">
                    © ${new Date().getFullYear()} Nur-Kitep. Все права защищены.
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

// Отправка email с кодом верификации
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // Проверка наличия необходимых переменных окружения
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP credentials not configured. Email will be logged to console only.');
      console.log('='.repeat(50));
      console.log('📧 EMAIL VERIFICATION CODE (Development Mode)');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Code: ${code}`);
      console.log('='.repeat(50));
      return true;
    }

    const transporter = createTransporter();

    // Настройки письма
    const mailOptions = {
      from: {
        name: 'Nur-Kitep',
        address: process.env.SMTP_USER,
      },
      to: email,
      subject: 'Код верификации Nur-Kitep',
      text: `Ваш код верификации: ${code}\n\nКод действителен в течение 10 минут.\n\nЕсли вы не регистрировались на Nur-Kitep, просто проигнорируйте это письмо.`,
      html: getVerificationEmailTemplate(code),
    };

    // Отправка email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`📧 To: ${email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    // В режиме разработки выводим код в консоль как fallback
    console.log('='.repeat(50));
    console.log('📧 EMAIL VERIFICATION CODE (Fallback)');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log('='.repeat(50));
    
    return false;
  }
}

// Отправка email с кодом для сброса пароля
export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  try {
    // Проверка наличия необходимых переменных окружения
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP credentials not configured. Email will be logged to console only.');
      console.log('='.repeat(50));
      console.log('📧 PASSWORD RESET CODE (Development Mode)');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`Code: ${code}`);
      console.log('='.repeat(50));
      return true;
    }

    const transporter = createTransporter();

    // Настройки письма
    const mailOptions = {
      from: {
        name: 'Nur-Kitep',
        address: process.env.SMTP_USER,
      },
      to: email,
      subject: 'Сброс пароля Nur-Kitep',
      text: `Ваш код для сброса пароля: ${code}\n\nКод действителен в течение 10 минут.\n\nЕсли вы не запрашивали сброс пароля, просто проигнорируйте это письмо.`,
      html: getPasswordResetEmailTemplate(code),
    };

    // Отправка email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent successfully:', info.messageId);
    console.log(`📧 To: ${email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    
    // В режиме разработки выводим код в консоль как fallback
    console.log('='.repeat(50));
    console.log('📧 PASSWORD RESET CODE (Fallback)');
    console.log('='.repeat(50));
    console.log(`To: ${email}`);
    console.log(`Code: ${code}`);
    console.log('='.repeat(50));
    
    return false;
  }
}
