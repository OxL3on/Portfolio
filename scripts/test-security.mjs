import fs from 'fs';
import path from 'path';

function getTestPasscode() {
  if (process.env.ADMIN_MASTER_PASSCODE) return process.env.ADMIN_MASTER_PASSCODE;
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/ADMIN_MASTER_PASSCODE=([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch (e) {}
  return 'default-fallback-unconfigured';
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, name, details = '') {
  if (condition) {
    results.passed++;
    results.tests.push({ status: 'PASS', name, details });
    console.log(`[PASS] ${name}`);
  } else {
    results.failed++;
    results.tests.push({ status: 'FAIL', name, details });
    console.error(`[FAIL] ${name} - ${details}`);
  }
}

async function runSecurityTestSuite() {
  console.log(`\n==============================================`);
  console.log(`RUNNING FULL-SCOPE SECURITY & PENETRATION SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`==============================================\n`);

  // -----------------------------------------------------------------
  // 1. PUBLIC READ ACCESS VERIFICATION
  // -----------------------------------------------------------------
  console.log(`\n--- 1. Testing Public Read Access (Must remain accessible) ---`);
  const publicEndpoints = [
    '/api/maininfo',
    '/api/projects',
    '/api/blogs',
    '/api/skills',
    '/api/education',
    '/api/certifications',
    '/api/achievements',
    '/api/contact',
    '/api/journey'
  ];

  for (const ep of publicEndpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep}`);
      assert(res.status === 200, `Public read ${ep} returns 200`, `Status: ${res.status}`);
    } catch (e) {
      assert(false, `Public read ${ep} returns 200`, e.message);
    }
  }

  // -----------------------------------------------------------------
  // 2. UNAUTHENTICATED WRITE REJECTION (CWE-306 Access Control)
  // -----------------------------------------------------------------
  console.log(`\n--- 2. Testing Unauthenticated Write Protection (Must return 401) ---`);
  const writeEndpoints = [
    { method: 'POST', path: '/api/maininfo', body: { name: 'Hacked' } },
    { method: 'POST', path: '/api/projects', body: { title: 'Hacked Project' } },
    { method: 'PUT', path: '/api/projects', body: { id: 'proj-1', title: 'Hacked' } },
    { method: 'DELETE', path: '/api/projects?id=proj-1' },
    { method: 'POST', path: '/api/blogs', body: { title: 'Hacked Blog', slug: 'hacked' } },
    { method: 'PUT', path: '/api/blogs', body: { id: 'blog-1', title: 'Hacked' } },
    { method: 'DELETE', path: '/api/blogs?id=blog-1' },
    { method: 'POST', path: '/api/skills', body: { title: 'Hacked Skill' } },
    { method: 'PUT', path: '/api/skills', body: { id: 'skill-1', title: 'Hacked' } },
    { method: 'DELETE', path: '/api/skills?id=skill-1' },
    { method: 'POST', path: '/api/education', body: { degree: 'Hacked' } },
    { method: 'PUT', path: '/api/education', body: { id: 'edu-1', degree: 'Hacked' } },
    { method: 'DELETE', path: '/api/education?id=edu-1' },
    { method: 'POST', path: '/api/certifications', body: { title: 'Hacked' } },
    { method: 'PUT', path: '/api/certifications', body: { id: 'cert-1', title: 'Hacked' } },
    { method: 'DELETE', path: '/api/certifications?id=cert-1' },
    { method: 'POST', path: '/api/achievements', body: { title: 'Hacked' } },
    { method: 'PUT', path: '/api/achievements', body: { id: 'ach-1', title: 'Hacked' } },
    { method: 'DELETE', path: '/api/achievements?id=ach-1' },
    { method: 'POST', path: '/api/contact', body: [{ name: 'Hacked', link: 'https://evil.com' }] },
    { method: 'POST', path: '/api/journey', body: { title: 'Hacked' } },
    { method: 'PUT', path: '/api/journey', body: { title: 'Hacked' } },
    { method: 'DELETE', path: '/api/journey?title=test' },
    { method: 'POST', path: '/api/upload', body: {} }
  ];

  for (const item of writeEndpoints) {
    try {
      const options = {
        method: item.method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (item.body && item.method !== 'GET') {
        options.body = JSON.stringify(item.body);
      }
      const res = await fetch(`${BASE_URL}${item.path}`, options);
      assert(res.status === 401, `Unauthenticated ${item.method} ${item.path} rejected with 401`, `Got: ${res.status}`);
    } catch (e) {
      assert(false, `Unauthenticated ${item.method} ${item.path} rejected with 401`, e.message);
    }
  }

  // -----------------------------------------------------------------
  // 3. AUTHENTICATION BYPASS & CREDENTIAL SECURITY
  // -----------------------------------------------------------------
  console.log(`\n--- 3. Testing Authentication Bypass Exploits ---`);

  // Test 3.1: Email-only authentication bypass payload
  try {
    const bypassIp = `198.51.${Math.floor(Math.random() * 200) + 10}.1`;
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': bypassIp },
      body: JSON.stringify({ email: 'leonislamofficial123@gmail.com' })
    });
    assert(res.status === 400 || res.status === 401, `Email-only login bypass rejected`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `Email-only login bypass rejected`, e.message);
  }

  // Test 3.2: Forged JWT / session token
  try {
    const forgedToken = 'fakeToken12345.99999999999.invalidSignature';
    const res = await fetch(`${BASE_URL}/api/maininfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${forgedToken}`,
        'X-Forwarded-For': `198.51.${Math.floor(Math.random() * 200) + 10}.2`
      },
      body: JSON.stringify({ name: 'Tampered' })
    });
    assert(res.status === 401, `Forged HMAC token rejected with 401`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `Forged HMAC token rejected with 401`, e.message);
  }

  // Test 3.3: Empty or invalid passcode
  try {
    const invalidAuthIp = `198.51.${Math.floor(Math.random() * 200) + 10}.3`;
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': invalidAuthIp },
      body: JSON.stringify({ passcode: 'WrongPassword999!' })
    });
    assert(res.status === 401, `Incorrect passcode rejected with 401`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `Incorrect passcode rejected with 401`, e.message);
  }

  // -----------------------------------------------------------------
  // 4. AUTHENTICATED ADMIN FLOWS & SERVER-VALIDATED SESSIONS
  // -----------------------------------------------------------------
  console.log(`\n--- 4. Testing Legitimate Admin Authentication & Cookie-Only Sessions ---`);
  let adminCookie = '';

  try {
    const activePasscode = getTestPasscode();
    const adminLoginIp = `198.51.${Math.floor(Math.random() * 200) + 10}.4`;
    const res = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': adminLoginIp },
      body: JSON.stringify({ passcode: activePasscode })
    });
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie') || '';

    assert(res.status === 200 && data.success === true, `Admin login with rotated master passcode succeeds`, `Status: ${res.status}`);
    assert(setCookie.includes('admin_session') && setCookie.includes('HttpOnly'), `Response sets HttpOnly admin_session cookie`, setCookie);
    assert(!data.adminUser?.token, `Response does NOT leak bearer token to client code`);

    adminCookie = setCookie.split(';')[0];
  } catch (e) {
    assert(false, `Admin login with master passcode succeeds`, e.message);
  }

  // Test 4.2: Authorized write using HttpOnly cookie
  if (adminCookie) {
    try {
      const res = await fetch(`${BASE_URL}/api/maininfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookie
        },
        body: JSON.stringify({ siteTitle: 'LEON' })
      });
      assert(res.status === 200, `Authorized write using HttpOnly session cookie succeeds`, `Status: ${res.status}`);
    } catch (e) {
      assert(false, `Authorized write using HttpOnly session cookie succeeds`, e.message);
    }
  }

  // -----------------------------------------------------------------
  // 5. FILE UPLOAD SECURITY (CWE-434, CWE-79 Stored XSS)
  // -----------------------------------------------------------------
  console.log(`\n--- 5. Testing File Upload Validation & Stored XSS Defense ---`);

  // Test 5.1: Malicious SVG with embedded script
  try {
    const svgPayload = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const form = new FormData();
    form.append('file', new Blob([svgPayload], { type: 'image/svg+xml' }), 'xss.svg');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Cookie': adminCookie
      },
      body: form
    });
    assert(res.status === 400, `SVG upload rejected (Stored XSS prevention)`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `SVG upload rejected (Stored XSS prevention)`, e.message);
  }

  // Test 5.2: Malicious script disguised with .php or .sh
  try {
    const phpPayload = Buffer.from('<?php echo "evil"; ?>');
    const form = new FormData();
    form.append('file', new Blob([phpPayload], { type: 'application/x-php' }), 'shell.php');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Cookie': adminCookie
      },
      body: form
    });
    assert(res.status === 400, `Executable PHP upload rejected`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `Executable PHP upload rejected`, e.message);
  }

  // Test 5.3: Fake image extension with non-image bytes (MIME spoofing)
  try {
    const fakePayload = Buffer.from('NOT AN IMAGE CONTENT AT ALL');
    const form = new FormData();
    form.append('file', new Blob([fakePayload], { type: 'image/png' }), 'fake.png');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Cookie': adminCookie
      },
      body: form
    });
    assert(res.status === 400, `Fake PNG with invalid magic bytes rejected`, `Status: ${res.status}`);
  } catch (e) {
    assert(false, `Fake PNG with invalid magic bytes rejected`, e.message);
  }

  // Test 5.4: Valid PNG image with genuine magic bytes (0x89504E47)
  try {
    // 1x1 valid PNG buffer
    const validPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82
    ]);
    const form = new FormData();
    form.append('file', new Blob([validPng], { type: 'image/png' }), 'valid-test.png');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Cookie': adminCookie
      },
      body: form
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, `Valid PNG image upload succeeds via HttpOnly cookie`, `Status: ${res.status}`);
    assert(data.url && !data.url.includes('..'), `Upload filename sanitized without path traversal`, `URL: ${data.url}`);
  } catch (e) {
    assert(false, `Valid PNG image upload succeeds`, e.message);
  }

  // -----------------------------------------------------------------
  // 6. SECURITY HEADERS VERIFICATION
  // -----------------------------------------------------------------
  console.log(`\n--- 6. Testing HTTP Security Headers ---`);
  try {
    const res = await fetch(`${BASE_URL}/`);
    const headers = res.headers;

    assert(headers.get('x-frame-options') === 'DENY', `X-Frame-Options: DENY present`);
    assert(headers.get('x-content-type-options') === 'nosniff', `X-Content-Type-Options: nosniff present`);
    assert(Boolean(headers.get('content-security-policy')), `Content-Security-Policy header present`);
    assert(Boolean(headers.get('referrer-policy')), `Referrer-Policy header present`);
    assert(Boolean(headers.get('permissions-policy')), `Permissions-Policy header present`);
  } catch (e) {
    assert(false, `HTTP Security Headers present`, e.message);
  }

  // -----------------------------------------------------------------
  // 7. SESSION REVOCATION, PERSISTENCE & CSRF TESTS
  // -----------------------------------------------------------------
  console.log(`\n--- 7. Testing Session Revocation, Persistence & CSRF Defense ---`);
  try {
    // 1. Verify HttpOnly cookie works before revocation
    const checkRes = await fetch(`${BASE_URL}/api/maininfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookie
      },
      body: JSON.stringify({ siteTitle: 'LEON' })
    });
    assert(checkRes.status === 200, `Active HttpOnly cookie verified functional before revocation`);

    // 2. Cross-Site Request Forgery (CSRF) origin attack simulation
    const csrfRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://malicious-attacker.com',
        'Host': 'localhost:3000'
      },
      body: JSON.stringify({ passcode: getTestPasscode() })
    });
    assert(csrfRes.status === 403, `Cross-Origin state-changing request blocked with 403 Forbidden`, `Status: ${csrfRes.status}`);

    // 2b. Cross-Site Request Forgery on authenticated data modification endpoint
    const csrfDataRes = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookie,
        'Origin': 'https://malicious-attacker.com',
        'Host': 'localhost:3000'
      },
      body: JSON.stringify({ title: 'Hacked Project' })
    });
    assert(csrfDataRes.status === 401 || csrfDataRes.status === 403, `Cross-Origin data mutation rejected with 401/403`, `Status: ${csrfDataRes.status}`);

    // 3. Perform logout via DELETE /api/admin/auth
    const logoutRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'DELETE',
      headers: {
        'Cookie': adminCookie
      }
    });
    assert(logoutRes.status === 200, `Admin logout succeeds and clears session`);

    // 4. Verify revoked session cookie is rejected
    const revokedCheckRes = await fetch(`${BASE_URL}/api/maininfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookie
      },
      body: JSON.stringify({ siteTitle: 'LEON' })
    });
    assert(revokedCheckRes.status === 401, `Revoked session cookie is immediately rejected with 401`);
  } catch (e) {
    assert(false, `Session Revocation Test failed`, e.message);
  }

  // -----------------------------------------------------------------
  // 8. BRUTE-FORCE RATE LIMITING TEST (Sliding Window Defense)
  // -----------------------------------------------------------------
  console.log(`\n--- 8. Testing Rate Limiting / Brute-Force Defense ---`);
  try {
    let got429 = false;
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.88' },
        body: JSON.stringify({ passcode: `wrong-attempt-${i}` })
      });
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    assert(got429, `Rate limiter triggers HTTP 429 Too Many Requests after threshold`);
  } catch (e) {
    assert(false, `Rate limiter test failed`, e.message);
  }

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log(`\n==============================================`);
  console.log(`TEST SUITE COMPLETE`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Total:  ${results.passed + results.failed}`);
  console.log(`==============================================\n`);

  if (results.failed > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite();
