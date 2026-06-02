import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Базовая защита
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== 'debug123') {
    return NextResponse.json(
      { error: 'Access denied. Add ?secret=debug123' },
      { status: 403 }
    );
  }

  // Проверка всех критичных переменных окружения
  const config = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    
    database: {
      configured: !!process.env.DATABASE_URL,
      url: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
    },
    
    smtp: {
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      user: process.env.SMTP_USER || 'NOT SET',
      pass: process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
      // Проверяем длину пароля (App Password должен быть ~16 символов)
      passLength: process.env.SMTP_PASS?.length || 0,
    },
    
    jwt: {
      configured: !!process.env.JWT_SECRET,
      length: process.env.JWT_SECRET?.length || 0,
    },
    
    s3: {
      configured: !!(process.env.S3_URL && process.env.BUCKET_NAME && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_ACCESS_KEY),
      url: process.env.S3_URL || 'NOT SET',
      bucket: process.env.BUCKET_NAME || 'NOT SET',
    },
    
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      key: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
    },
    
    telegram: {
      configured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_ADMIN_USER_ID),
      botToken: process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'NOT SET',
      adminUserId: process.env.TELEGRAM_ADMIN_USER_ID || 'NOT SET',
    },
    
    finik: {
      configured: !!(process.env.FINIK_API_KEY && process.env.FINIK_ACCOUNT_ID && process.env.FINIK_PRIVATE_KEY),
      env: process.env.FINIK_ENV || 'NOT SET',
      apiKey: process.env.FINIK_API_KEY ? process.env.FINIK_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      accountId: process.env.FINIK_ACCOUNT_ID || 'NOT SET',
      privateKeyLength: process.env.FINIK_PRIVATE_KEY?.length || 0,
    },
    
    google: {
      oauth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      maps_configured: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    },
  };

  // Проверка на критичные проблемы
  const warnings: string[] = [];
  
  if (!config.smtp.configured) {
    warnings.push('⚠️ SMTP не настроен! Email отправка работать не будет.');
  }
  
  if (config.smtp.configured && config.smtp.passLength < 10) {
    warnings.push('⚠️ SMTP_PASS выглядит коротким. Должен быть App Password (~16 символов).');
  }
  
  if (!config.database.configured) {
    warnings.push('⚠️ DATABASE_URL не настроен!');
  }
  
  if (!config.jwt.configured || config.jwt.length < 32) {
    warnings.push('⚠️ JWT_SECRET слишком короткий или отсутствует!');
  }

  return NextResponse.json({
    config,
    warnings,
    status: warnings.length === 0 ? '✅ All OK' : '⚠️ Issues found',
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  });
}
