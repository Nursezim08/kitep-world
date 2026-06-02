import { NextRequest, NextResponse } from "next/server";
import { sendManagerLoginEmail, sendVerificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Базовая проверка безопасности (можете убрать после теста)
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== 'test123') {
    return NextResponse.json(
      { error: 'Access denied. Add ?secret=test123' },
      { status: 403 }
    );
  }

  const email = request.nextUrl.searchParams.get('email');
  const type = request.nextUrl.searchParams.get('type') || 'manager';
  
  if (!email) {
    return NextResponse.json(
      { 
        error: 'Email parameter required',
        usage: '/api/test/email?email=test@example.com&type=manager&secret=test123',
        types: ['manager', 'verification']
      },
      { status: 400 }
    );
  }

  try {
    const code = "123456"; // Тестовый код
    let sent = false;

    console.log(`[Test Email] Sending ${type} email to ${email}...`);

    if (type === 'manager') {
      sent = await sendManagerLoginEmail(email, code);
    } else if (type === 'verification') {
      sent = await sendVerificationEmail(email, code);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "manager" or "verification"' },
        { status: 400 }
      );
    }

    console.log(`[Test Email] Result: ${sent ? 'SUCCESS' : 'FAILED'}`);

    return NextResponse.json({
      success: sent,
      message: sent 
        ? 'Email sent successfully! Check your inbox.' 
        : 'Failed to send email. Check server logs for details.',
      email: email,
      type: type,
      code: code, // Только для тестирования!
      timestamp: new Date().toISOString(),
      environment: {
        smtp_configured: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        smtp_user: process.env.SMTP_USER,
      }
    });

  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
