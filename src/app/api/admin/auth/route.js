import { NextResponse } from 'next/server';
import { getLocalData, saveLocalData } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  createAdminSession,
  validateAdminSession,
  revokeSession,
  revokeAllSessions,
  checkRateLimit,
  clearRateLimit,
  getClientIp
} from '@/lib/auth';

// Check if current session is authenticated
export async function GET(req) {
  const session = validateAdminSession(req);
  if (!session.isValid) {
    return NextResponse.json({ authenticated: false, error: session.error }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    adminUser: session.adminUser
  });
}

// Authenticate with master passcode
export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const { passcode, firebaseIdToken } = body;

    // Support Firebase ID token verification for Google OAuth flow
    if (firebaseIdToken && typeof firebaseIdToken === 'string') {
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(firebaseIdToken)}`);
        if (!googleRes.ok) {
          return NextResponse.json({ error: 'Invalid Google identity token' }, { status: 401 });
        }
        const tokenInfo = await googleRes.json();
        const data = getLocalData();
        const adminEmail = (data.adminSettings?.adminEmail || "leonislamofficial123@gmail.com").toLowerCase();

        if (!tokenInfo.email || tokenInfo.email.toLowerCase() !== adminEmail) {
          return NextResponse.json({ error: 'Unauthorized: Google account is not the registered administrator' }, { status: 403 });
        }

        if (tokenInfo.email_verified !== "true" && tokenInfo.email_verified !== true) {
          return NextResponse.json({ error: 'Unverified Google email address' }, { status: 403 });
        }

        const adminUser = {
          name: tokenInfo.name || 'MD Leon Islam',
          role: 'Administrator',
          email: tokenInfo.email
        };
        const session = createAdminSession(adminUser);

        const response = NextResponse.json({
          success: true,
          message: 'Authenticated via Google OAuth',
          adminUser: {
            ...adminUser,
            token: session.signedToken
          }
        });

        response.cookies.set({
          name: 'admin_session',
          value: session.signedToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24
        });
        return response;
      } catch (err) {
        return NextResponse.json({ error: 'Firebase identity verification failed' }, { status: 500 });
      }
    }

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: 'Passcode is required' }, { status: 400 });
    }

    const data = getLocalData();
    const activePasscode = data.adminSettings?.passcode || 'luffy111000';

    const { valid, needsUpgrade } = verifyPassword(passcode.trim(), activePasscode);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid secret passcode' }, { status: 401 });
    }

    clearRateLimit(`auth:${ip}`);

    // Transparently upgrade plaintext passcode to strong scrypt hash
    if (needsUpgrade) {
      const hashed = hashPassword(passcode.trim());
      saveLocalData((prev) => ({
        ...prev,
        adminSettings: {
          ...prev.adminSettings,
          passcode: hashed
        }
      }));
    }

    const adminUser = {
      name: 'MD Leon Islam',
      role: 'Administrator'
    };
    const session = createAdminSession(adminUser);

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      adminUser: {
        ...adminUser,
        token: session.signedToken
      }
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: 'admin_session',
      value: session.signedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Auth service error' }, { status: 500 });
  }
}

// Update master passcode
export async function PUT(req) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`auth_put:${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many update attempts. Please retry later.` },
        { status: 429 }
      );
    }

    const { currentPasscode, newPasscode, newEmail } = await req.json();
    if (!currentPasscode || typeof currentPasscode !== 'string') {
      return NextResponse.json({ error: 'Current passcode is required' }, { status: 400 });
    }

    if (!newPasscode || typeof newPasscode !== 'string' || newPasscode.trim().length < 6) {
      return NextResponse.json({ error: 'New passcode must be at least 6 characters' }, { status: 400 });
    }

    const data = getLocalData();
    const activePasscode = data.adminSettings?.passcode || 'luffy111000';

    const { valid } = verifyPassword(currentPasscode.trim(), activePasscode);
    if (!valid) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 403 });
    }

    // Hash the new passcode securely
    const hashedNew = hashPassword(newPasscode.trim());

    saveLocalData((prev) => ({
      ...prev,
      adminSettings: {
        ...prev.adminSettings,
        passcode: hashedNew,
        ...(newEmail && typeof newEmail === 'string' ? { adminEmail: newEmail.trim() } : {})
      }
    }));

    // Revoke all existing sessions and create a fresh one for the admin
    revokeAllSessions();
    const freshSession = createAdminSession({ name: 'MD Leon Islam', role: 'Administrator' });

    const response = NextResponse.json({
      success: true,
      message: 'Admin passcode updated successfully',
      token: freshSession.signedToken
    });

    response.cookies.set({
      name: 'admin_session',
      value: freshSession.signedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update passcode' }, { status: 500 });
  }
}

// Logout and revoke session
export async function DELETE(req) {
  try {
    let token = req.cookies.get('admin_session')?.value;
    if (!token && req.headers) {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = req.headers.get('x-admin-token') || '';
      }
    }
    if (token) {
      revokeSession(token);
    }
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('admin_session');
    return response;
  } catch (e) {
    return NextResponse.json({ success: true });
  }
}
