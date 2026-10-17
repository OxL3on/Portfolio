import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  validateAdminSession,
  validateImageUpload,
  checkRateLimit,
  getClientIp
} from '@/lib/auth';
import { uploadToSupabaseStorage } from '@/lib/supabase-server';

export async function POST(req) {
  try {
    // 1. Enforce Server-Side Admin Authentication
    const session = await validateAdminSession(req);
    if (!session.isValid) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required for asset uploads' }, { status: 401 });
    }

    // 2. Rate Limiting for Uploads
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`upload:${ip}`, 30, 10 * 60 * 1000);
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

    const targetFileName = validation.safeFilename;
    const isProd = process.env.NODE_ENV === 'production';
    const isSupabaseConfigured = Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));

    // Priority 1: Persistent Supabase Storage Upload
    if (isSupabaseConfigured) {
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf'
      };
      const contentType = mimeTypes[validation.extension] || 'application/octet-stream';
      const uploadResult = await uploadToSupabaseStorage(buffer, targetFileName, contentType);
      
      if (!uploadResult.success) {
        return NextResponse.json({ error: `Supabase Storage upload failed: ${uploadResult.error}` }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        url: uploadResult.publicUrl,
        name: file.name,
        size: validation.size
      });
    }

    if (isProd) {
      return NextResponse.json(
        { error: 'Persistent storage configuration missing: SUPABASE_URL and SUPABASE_SECRET_KEY are required in production.' },
        { status: 500 }
      );
    }

    // Local Development Fallback: Write safe image to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, targetFileName);
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
