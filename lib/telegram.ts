import { prisma } from './prisma';

export async function sendTelegramCode(userId: string, code: string): Promise<boolean> {
  try {
    console.log('[Telegram] Starting to send code for userId:', userId);
    
    // Получаем настройки из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminUserId = process.env.TELEGRAM_ADMIN_USER_ID;

    console.log('[Telegram] Bot token exists:', !!botToken);
    console.log('[Telegram] Admin user ID exists:', !!adminUserId);

    // DEV MODE: Если настройки не заданы, выводим код в консоль
    if (!botToken || !adminUserId || adminUserId === 'YOUR_TELEGRAM_ID_HERE') {
      console.warn('[Telegram] WARNING: Bot token or admin user ID not configured');
      console.warn('[Telegram] DEV MODE: Outputting code to console instead');
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔐 ADMIN VERIFICATION CODE (DEV MODE)');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📧 User ID: ${userId}`);
      console.log(`🔢 CODE: ${code}`);
      console.log(`⏱  Valid for: 5 minutes`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log('⚠️  To enable Telegram notifications:');
      console.log('   1. Open Telegram and find @userinfobot');
      console.log('   2. Send any message to get your Telegram ID');
      console.log('   3. Add to .env: TELEGRAM_ADMIN_USER_ID="your_id"');
      console.log('   4. Bot token already configured: @nur_kitep_bot');
      console.log('');
      return true; // Возвращаем true в dev режиме
    }

    // Получаем информацию о пользователе для персонализации сообщения
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { full_name: true, email: true },
    });

    console.log('[Telegram] User found:', !!user);

    if (!user) {
      console.error('[Telegram] ERROR: User not found');
      return false;
    }

    console.log('[Telegram] Sending message to chat_id:', adminUserId);

    const message = `🔐 *Код подтверждения входа в админ-панель*\n\n👤 Пользователь: ${user.full_name}\n📧 Email: ${user.email}\n\n🔢 Ваш код: \`${code}\`\n\n⏱ Код действителен 5 минут.\n\n_Если это были не вы, проигнорируйте это сообщение._`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('[Telegram] Sending to Telegram API...');

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: adminUserId,
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
