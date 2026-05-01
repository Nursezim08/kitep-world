import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  console.log('Google OAuth initiated');
  console.log('Client ID:', clientId ? 'Present' : 'Missing');
  console.log('Redirect URI:', redirectUri);

  if (!clientId) {
    console.error('Google Client ID is missing');
    return NextResponse.json(
      { error: 'Google OAuth не настроен' },
      { status: 500 }
    );
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  console.log('Redirecting to Google:', googleAuthUrl.toString());

  return NextResponse.redirect(googleAuthUrl.toString());
}
