import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ==========================================
// 1. SERVER SECRET & PERSISTENCE
// ==========================================
const SECRET_FILE = path.join(process.cwd(), 'src/data/.session_secret');

function getServerSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) {
    return process.env.SESSION_SECRET;
  }
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const existing = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (existing.length >= 32) return existing;
    }
    const newSecret = crypto.randomBytes(32).toString('hex');
    const dir = path.dirname(SECRET_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SECRET_FILE, newSecret, { mode: 0o600 });
    return newSecret;
  } catch (err) {
    // Fallback in-memory
    if (!global.__portfolio_server_secret) {
      global.__portfolio_server_secret = crypto.randomBytes(32).toString('hex');
    }
    return global.__portfolio_server_secret;
  }
}

const SERVER_SECRET = getServerSecret();

// ==========================================
// 2. PASSWORD HASHING (scrypt + salt)
// ==========================================
export function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export function verifyPassword(inputPassword, storedHash) {
  if (!inputPassword || !storedHash) {
    return { valid: false, needsUpgrade: false };
  }

  // If hash is scrypt format: scrypt$<salt>$<hash>
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return { valid: false, needsUpgrade: false };
    const salt = parts[1];
    const originalHash = parts[2];
    const originalBuffer = Buffer.from(originalHash, 'hex');
    const derivedKey = crypto.scryptSync(inputPassword, salt, 64);
    
    if (originalBuffer.length !== derivedKey.length) {
      return { valid: false, needsUpgrade: false };
    }
    const valid = crypto.timingSafeEqual(originalBuffer, derivedKey);
    return { valid, needsUpgrade: false };
  }

  // Plaintext fallback (timing-safe comparison with automatic upgrade)
  const inputBuf = Buffer.from(inputPassword);
  const storedBuf = Buffer.from(storedHash);
  let valid = false;
  if (inputBuf.length === storedBuf.length) {
    valid = crypto.timingSafeEqual(inputBuf, storedBuf);
  } else {
    // Timing attack prevention
    crypto.timingSafeEqual(inputBuf, inputBuf);
    valid = false;
  }
  return { valid, needsUpgrade: valid };
}

// ==========================================
// 3. CRYPTOGRAPHIC SESSION MANAGEMENT
// ==========================================
const activeSessions = globalThis.__adminActiveSessions || (globalThis.__adminActiveSessions = new Map());

export function createAdminSession(adminUser = { name: 'MD Leon Islam', role: 'Administrator' }) {
  const tokenId = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours
  const payload = `${tokenId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');
  const signedToken = `${payload}.${signature}`;

  activeSessions.set(tokenId, {
    createdAt: timestamp,
    expiresAt,
    adminUser
  });

  return {
    signedToken,
    expiresAt,
    adminUser
  };
}

export function validateAdminSession(req) {
  try {
    let token = '';

    // 1. Try HttpOnly Cookie
    if (req.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get('admin_session')?.value || '';
    }
    
    // 2. Try Authorization Bearer Header
    if (!token && req.headers) {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else {
        token = req.headers.get('x-admin-token') || '';
      }
    }

    if (!token) {
      return { isValid: false, authenticated: false, error: 'Unauthorized: Missing authentication session token' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      // Legacy token compatibility check (if active in session registry)
      if (activeSessions.has(token)) {
        const session = activeSessions.get(token);
        if (Date.now() < session.expiresAt) {
          return { isValid: true, authenticated: true, adminUser: session.adminUser };
        }
      }
      return { isValid: false, authenticated: false, error: 'Unauthorized: Malformed session token' };
    }

    const [tokenId, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      activeSessions.delete(tokenId);
      return { isValid: false, authenticated: false, error: 'Unauthorized: Session has expired' };
    }

    // Verify HMAC signature with timing-safe comparison
    const payload = `${tokenId}.${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', SERVER_SECRET).update(payload).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { isValid: false, authenticated: false, error: 'Unauthorized: Invalid session signature' };
    }

    // Verify session has not been revoked or invalidated
    if (!activeSessions.has(tokenId)) {
      return { isValid: false, authenticated: false, error: 'Unauthorized: Session has been revoked or logged out' };
    }

    const session = activeSessions.get(tokenId);
    return {
      isValid: true,
      authenticated: true,
      adminUser: session.adminUser || { name: 'MD Leon Islam', role: 'Administrator' }
    };
  } catch (err) {
    return { isValid: false, authenticated: false, error: 'Unauthorized: Authentication verification failed' };
  }
}

export function revokeSession(token) {
  if (!token) return;
  const tokenId = token.split('.')[0];
  activeSessions.delete(tokenId);
}

export function revokeAllSessions() {
  activeSessions.clear();
}

// ==========================================
// 4. RATE LIMITING (Sliding Window in-memory)
// ==========================================
const rateLimitMap = globalThis.__adminRateLimitMap || (globalThis.__adminRateLimitMap = new Map());

export function checkRateLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = rateLimitMap.get(key) || [];
  timestamps = timestamps.filter(ts => ts > windowStart);

  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfter)
    };
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);

  // Periodic cleanup
  if (rateLimitMap.size > 10000) {
    for (const [k, tsList] of rateLimitMap.entries()) {
      const valid = tsList.filter(t => t > windowStart);
      if (valid.length === 0) rateLimitMap.delete(k);
      else rateLimitMap.set(k, valid);
    }
  }

  return {
    allowed: true,
    remaining: maxAttempts - timestamps.length,
    retryAfterSeconds: 0
  };
}

export function clearRateLimit(key) {
  rateLimitMap.delete(key);
}

export function getClientIp(req) {
  if (!req || !req.headers) return '127.0.0.1';
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

// ==========================================
// 5. SAFE URL SANITIZATION (Anti-XSS)
// ==========================================
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.includes('\x00')
  ) {
    return '#';
  }

  // Allow relative, anchors, mailto, http, https
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  return '#';
}

// ==========================================
// 6. FILE UPLOAD SECURITY VALIDATOR
// ==========================================
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function validateImageUpload(buffer, originalFilename, maxBytes = 5 * 1024 * 1024) {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file payload' };
  }

  if (buffer.length > maxBytes) {
    return { valid: false, error: `File exceeds maximum allowed size of ${maxBytes / (1024 * 1024)}MB` };
  }

  const ext = path.extname(originalFilename || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Disallowed file extension "${ext}". Only JPG, PNG, WEBP, and GIF are permitted.` };
  }

  // Magic Bytes Check (File Signature Verification)
  // JPEG: FF D8 FF
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  // GIF: 47 49 46 38
  // WEBP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  let isImage = false;
  if (buffer.length >= 4) {
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    const isWebp = buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

    isImage = isJpeg || isPng || isGif || isWebp;
  }

  if (!isImage) {
    return { valid: false, error: 'File signature mismatch: The uploaded file is not a valid image.' };
  }

  // Prevent path traversal in generated name
  const safeExt = ext === '.jpeg' ? '.jpg' : ext;
  const safeFilename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${safeExt}`;

  return {
    valid: true,
    safeFilename,
    extension: safeExt,
    size: buffer.length
  };
}
