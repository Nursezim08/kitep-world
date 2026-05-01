import { prisma } from './prisma';

export async function sendTelegramCode(userId: string, code: string): Promise<boolean> {
  try {
    console.log('[Telegram] Starting to send code for userId:', userId);
    
    // Получаем настройки из базы данных
    const [botTokenSetting, adminTelegramIdSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: 'ADMIN_TELEGRAM_BOT_TOKEN' } }),
      prisma.setting.findUnique({ where: { key: 'ADMIN_TELEGRAM_USER_ID' } }),
    ]);

    console.log('[Telegram] Bot token exists:', !!botTokenSetting?.value);
    console.log('[Telegram] Admin telegram ID exists:', !!adminTelegramIdSetting?.value);

    if (!botTokenSetting?.value || !adminTelegramIdSetting?.value) {
      console.error('[Telegram] ERROR: Bot token or admin user ID not configured in settings table');
      console.error('[Telegram] Bot token setting:', botTokenSetting);
      console.error('[Telegram] Admin ID setting:', adminTelegramIdSetting);
      return false;
    }

    // Получаем информацию о пользователе для персонализации сообщения
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true },
    });

    console.log('[Telegram] User found:', !!user);

    if (!user) {
      console.error('[Telegram] ERROR: User not found');
      return false;
    }

    const botToken = botTokenSetting.value;
    const chatId = adminTelegramIdSetting.value;

    console.log('[Telegram] Sending message to chat_id:', chatId);

    const message = `🔐 *Код подтверждения входа в админ-панель*\n\n👤 Пользователь: ${user.fullName}\n📧 Email: ${user.email}\n\n🔢 Ваш код: \`${code}\`\n\n⏱ Код действителен 5 минут.\n\n_Если это были не вы, проигнорируйте это сообщение._`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('[Telegram] Telegram API URL (without token):', telegramUrl.replace(botToken, '***'));

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    console.log('[Telegram] Telegram API response:', data);

    if (!data.ok) {
      console.error('[Telegram] ERROR: Telegram API returned error:', data);
      return false;
    }

    console.log('[Telegram] SUCCESS: Message sent successfully');
    return true;
  } catch (error) {
    console.error('[Telegram] EXCEPTION: Error sending Telegram message:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
