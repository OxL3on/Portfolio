import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  validateAdminSession,
  validateImageUpload,
  checkRateLimit,
  getClientIp
} from '@/lib/auth';

export async function POST(req) {
  try {
    // 1. Enforce Server-Side Admin Authentication
    const session = validateAdminSession(req);
    if (!session.isValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required for asset uploads' }, { status: 401 });
    }

    // 2. Rate Limiting for Uploads
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`upload:${ip}`, 30, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please wait a few minutes before uploading again.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const targetType = formData.get('targetType'); // 'avatar', 'cover', 'logo', 'general'

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Deep Image Validation (size, extension allowlist, and magic bytes verification)
    const validation = validateImageUpload(buffer, file.name, 5 * 1024 * 1024);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const targetFileName = validation.safeFilename;
    const filePath = path.join(uploadDir, targetFileName);

    // Write safe image to public/uploads
    fs.writeFileSync(filePath, buffer);

    // Sync designated static fallbacks safely
    if (targetType === 'avatar') {
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/profile.jpg'), buffer);
      } catch (err) {}
    } else if (targetType === 'cover') {
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/china-mountains.jpg'), buffer);
      } catch (err) {}
    } else if (targetType === 'logo') {
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/logo.png'), buffer);
      } catch (err) {}
    }

    return NextResponse.json({
      success: true,
      url: `/uploads/${targetFileName}`,
      name: file.name,
      size: validation.size
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
