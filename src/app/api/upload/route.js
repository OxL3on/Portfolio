import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const targetType = formData.get('targetType'); // 'avatar', 'cover', 'logo', 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name || 'image.png') || '.png';
    const timestamp = Date.now();

    let relativePath = '';
    let targetFileName = '';

    // Handle dedicated system replacement or general upload
    if (targetType === 'avatar') {
      targetFileName = `avatar_${timestamp}${ext}`;
      // Also update public/profile.jpg for instant fallback compatibility
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/profile.jpg'), buffer);
      } catch (err) {}
    } else if (targetType === 'cover') {
      targetFileName = `cover_${timestamp}${ext}`;
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/china-mountains.jpg'), buffer);
      } catch (err) {}
    } else if (targetType === 'logo') {
      targetFileName = `logo_${timestamp}${ext}`;
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public/logo.png'), buffer);
      } catch (err) {}
    } else {
      targetFileName = `upload_${timestamp}${ext}`;
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, targetFileName);
    fs.writeFileSync(filePath, buffer);

    relativePath = `/uploads/${targetFileName}`;

    return NextResponse.json({
      success: true,
      url: relativePath,
      name: file.name,
      size: buffer.length
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'File upload failed', details: error.message }, { status: 500 });
  }
}
