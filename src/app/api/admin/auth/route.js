import { NextResponse } from 'next/server';
import { getAdminSettings, saveAdminSettings } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  createAdminSession,
  validateAdminSession,
  revokeSession,
  revokeAllSessions,
  checkRateLimit,
  clearRateLimit,
  getClientIp,
  validateSameOrigin
} from '@/lib/auth';

// Check if current session is authenticated
export async function GET(req) {
  const session = await validateAdminSession(req);
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
    if (!validateSameOrigin(req)) {
      return NextResponse.json({ error: 'Cross-origin requests are forbidden' }, { status: 403 });
    }

    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000);
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
        const adminSettings = await getAdminSettings();
        const adminEmail = (adminSettings?.adminEmail || "leonislamofficial123@gmail.com").toLowerCase();

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
            name: adminUser.name,
            role: adminUser.role,
            email: adminUser.email
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

    const adminSettings = await getAdminSettings();
    let activePasscode = adminSettings?.passcode || '';

    // Check against existing database hash or environment variable initialization
    let isValid = false;
    let needsUpgrade = false;

    if (activePasscode) {
      const result = verifyPassword(passcode.trim(), activePasscode);
      isValid = result.valid;
      needsUpgrade = result.needsUpgrade;
    }

    // Support ADMIN_MASTER_PASSCODE from environment variables (e.g. Vercel deployment initialization)
    if (!isValid && process.env.ADMIN_MASTER_PASSCODE && passcode.trim() === process.env.ADMIN_MASTER_PASSCODE.trim()) {
      isValid = true;
      needsUpgrade = true; // Upgrade/sync the hash into the database
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid secret passcode' }, { status: 401 });
    }

    await clearRateLimit(`auth:${ip}`);

    // Persist or upgrade passcode to strong scrypt hash in persistent database
    if (needsUpgrade) {
      const hashed = hashPassword(passcode.trim());
      await saveAdminSettings({
        ...adminSettings,
        passcode: hashed
      });
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
        name: adminUser.name,
        role: adminUser.role
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
    console.error('Auth POST error:', error);
    return NextResponse.json({ error: 'Auth service error' }, { status: 500 });
  }
}

// Update master passcode
export async function PUT(req) {
  try {
    if (!validateSameOrigin(req)) {
      return NextResponse.json({ error: 'Cross-origin requests are forbidden' }, { status: 403 });
    }

    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`auth_put:${ip}`, 5, 15 * 60 * 1000);
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

    const adminSettings = await getAdminSettings();
    const activePasscode = adminSettings?.passcode || '';

    let isCurrentValid = false;
    if (activePasscode) {
      const { valid } = verifyPassword(currentPasscode.trim(), activePasscode);
      isCurrentValid = valid;
    }
    if (!isCurrentValid && process.env.ADMIN_MASTER_PASSCODE && currentPasscode.trim() === process.env.ADMIN_MASTER_PASSCODE.trim()) {
      isCurrentValid = true;
    }

    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 403 });
    }

    // Hash the new passcode securely
    const hashedNew = hashPassword(newPasscode.trim());

    await saveAdminSettings({
      ...adminSettings,
      passcode: hashedNew,
      ...(newEmail && typeof newEmail === 'string' ? { adminEmail: newEmail.trim() } : {})
    });

    // Revoke all existing sessions across serverless instances and create a fresh one
    await revokeAllSessions();
    const freshSession = createAdminSession({ name: 'MD Leon Islam', role: 'Administrator' });

    const response = NextResponse.json({
      success: true,
      message: 'Admin passcode updated successfully'
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
    console.error('Auth PUT error:', error);
    return NextResponse.json({ error: 'Failed to update passcode' }, { status: 500 });
  }
}

// Logout and revoke session
export async function DELETE(req) {
  try {
    if (!validateSameOrigin(req)) {
      return NextResponse.json({ error: 'Cross-origin requests are forbidden' }, { status: 403 });
    }
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
      await revokeSession(token);
    }
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.delete('admin_session');
    return response;
  } catch (e) {
    return NextResponse.json({ success: true });
  }
}
