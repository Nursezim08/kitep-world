import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    database: !!process.env.DATABASE_URL,
    jwt: !!process.env.JWT_SECRET,
    google: {
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set',
    },
    smtp: {
      configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
      user: process.env.SMTP_USER ? '✅ Set' : '❌ Not set',
      pass: process.env.SMTP_PASS ? '✅ Set' : '❌ Not set',
    },
    mode: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(config, { status: 200 });
}
