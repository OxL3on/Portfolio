import { NextResponse } from 'next/server';
import { getLocalData, saveLocalData } from '@/lib/db';

export async function POST(req) {
  try {
    const { passcode, email } = await req.json();
    const data = getLocalData();
    const activePasscode = data.adminSettings?.passcode || 'luffy111000';

    // Check passcode strictly against configured passcode
    const isValidPasscode = Boolean(passcode && passcode.trim() === activePasscode.trim());
    const isValidEmail = email && (email === data.adminSettings?.adminEmail || email === 'leonislamofficial123@gmail.com');

    if (isValidPasscode || isValidEmail) {
      // Create session payload
      return NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        adminUser: {
          name: 'MD Leon Islam',
          role: 'Administrator',
          token: `luffy_admin_session_${Date.now()}`
        }
      });
    }

    return NextResponse.json({ error: 'Invalid secret passcode or email' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { currentPasscode, newPasscode, newEmail } = await req.json();
    const data = getLocalData();
    const activePasscode = data.adminSettings?.passcode || 'luffy111000';

    if (!currentPasscode || currentPasscode.trim() !== activePasscode.trim()) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 403 });
    }

    if (!newPasscode || newPasscode.trim().length < 4) {
      return NextResponse.json({ error: 'New passcode must be at least 4 characters' }, { status: 400 });
    }

    saveLocalData((prev) => ({
      ...prev,
      adminSettings: {
        ...prev.adminSettings,
        passcode: newPasscode.trim(),
        ...(newEmail ? { adminEmail: newEmail.trim() } : {})
      }
    }));

    return NextResponse.json({ success: true, message: 'Admin passcode updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update passcode' }, { status: 500 });
  }
}
