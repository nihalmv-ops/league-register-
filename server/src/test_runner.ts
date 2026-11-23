import http from 'http';
import { EventEmitter } from 'events';
import { Duplex } from 'stream';
import app from './app';
import { config } from './config/env';

// Lightweight in-process test invoker (zero socket requirement)
function createMultipartBody(
  fields: Record<string, string>,
  fileField: { name: string; filename: string; contentType: string; data: Buffer } | null
) {
  const boundary = '----WebKitFormBoundaryTest' + Math.random().toString(36).substring(2);
  const chunks: Buffer[] = [];

  for (const [key, val] of Object.entries(fields)) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
      )
    );
  }

  if (fileField) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.contentType}\r\n\r\n`
      )
    );
    chunks.push(fileField.data);
    chunks.push(Buffer.from('\r\n'));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(chunks);

  return {
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': String(body.length),
    },
    body,
  };
}

function callExpress(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body: Buffer | string | null = null
): Promise<{ status: number; headers: Record<string, any>; data: any }> {
  return new Promise((resolve) => {
    let bodyBuffer: Buffer | null = null;
    if (body) {
      bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
    }

    const socket = new Duplex({
      read() {},
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    (socket as any).remoteAddress = '127.0.0.1';
    (socket as any).encrypted = false;

    const req: any = new http.IncomingMessage(socket as any);
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = {
      host: 'localhost:5000',
      'user-agent': 'TestRunner/1.0',
      ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])),
    };
    if (bodyBuffer && !req.headers['content-length']) {
      req.headers['content-length'] = String(bodyBuffer.length);
    }

    const res: any = new EventEmitter();
    const resHeaders: Record<string, any> = {};
    const chunks: Buffer[] = [];
    res.statusCode = 200;

    res.setHeader = (key: string, val: any) => {
      resHeaders[key.toLowerCase()] = val;
    };
    res.getHeader = (key: string) => resHeaders[key.toLowerCase()];
    res.removeHeader = (key: string) => {
      delete resHeaders[key.toLowerCase()];
    };
    res.writeHead = (status: number, hdrs?: Record<string, any>) => {
      res.statusCode = status;
      if (hdrs) Object.assign(resHeaders, hdrs);
    };
    res.write = (chunk: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = (chunk: any) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const resBuffer = Buffer.concat(chunks);
      let data: any;
      try {
        data = JSON.parse(resBuffer.toString('utf-8'));
      } catch {
        data = resBuffer.toString('utf-8');
      }
      resolve({ status: res.statusCode, headers: resHeaders, data });
    };

    setImmediate(() => {
      if (bodyBuffer) {
        req.push(bodyBuffer);
      }
      req.push(null);
      req.complete = true;
    });

    app(req, res);
  });
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    if (detail) console.error(`     Detail: ${detail}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PROJECT PHASE 2 COMPREHENSIVE TEST SUITE');
  console.log('======================================================\n');

  try {
    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const health = await callExpress('GET', '/api/health');
    assert(health.status === 200, 'Health endpoint responds with HTTP 200');
    assert(health.data.success === true, 'Health check returns success: true');

    // 2. Security Check - Unauthorized Admin Access
    console.log('\n--- 2. Security & Authorization Checks ---');
    const unauthPlayers = await callExpress('GET', '/api/players');
    assert(unauthPlayers.status === 401, 'Accessing /api/players without JWT returns 401 Unauthorized');

    const invalidAuth = await callExpress('GET', '/api/players', {
      Authorization: 'Bearer invalid.token.value',
    });
    assert(invalidAuth.status === 401, 'Accessing with bogus JWT returns 401 Unauthorized');

    // 3. Admin Authentication
    console.log('\n--- 3. Admin Authentication ---');
    const badLogin = await callExpress(
      'POST',
      '/api/auth/login',
      { 'content-type': 'application/json' },
      JSON.stringify({ email: config.adminEmail, password: 'WrongPassword123' })
    );
    assert(badLogin.status === 401, 'Admin login with invalid password returns 401');

    const goodLogin = await callExpress(
      'POST',
      '/api/auth/login',
      { 'content-type': 'application/json' },
      JSON.stringify({ email: config.adminEmail, password: config.adminPassword })
    );
    assert(goodLogin.status === 200, 'Admin login with valid credentials returns 200 OK');
    assert(typeof goodLogin.data.data?.token === 'string', 'Login returns valid signed JWT token');
    const adminToken = goodLogin.data.data.token;

    // 4. Player Registration Validation Checks
    console.log('\n--- 4. Player Registration Validation Checks ---');

    // 4a. Missing Photo
    const noPhotoData = createMultipartBody(
      {
        fullName: 'Test Player',
        dateOfBirth: '2000-01-01',
        phoneNumber: '+1 555 999 1111',
        email: 'testplayer@premierfootball.org',
        playingPosition: 'Forward',
      },
      null
    );
    const missingPhotoRes = await callExpress(
      'POST',
      '/api/players/register',
      noPhotoData.headers,
      noPhotoData.body
    );
    assert(missingPhotoRes.status === 400, 'Registration without photo returns 400 Bad Request');
    assert(missingPhotoRes.data?.error?.code === 'PHOTO_REQUIRED', 'Error code is PHOTO_REQUIRED');

    // 4b. Missing Position
    const dummyImage = Buffer.from('FAKE-PNG-IMAGE-BUFFER-DATA-FOR-TESTING');
    const noPosData = createMultipartBody(
      {
        fullName: 'Test Player',
        dateOfBirth: '2000-01-01',
        phoneNumber: '+1 555 999 1111',
        email: 'testplayer@premierfootball.org',
      },
      { name: 'photo', filename: 'photo.png', contentType: 'image/png', data: dummyImage }
    );
    const missingPosRes = await callExpress(
      'POST',
      '/api/players/register',
      noPosData.headers,
      noPosData.body
    );
    assert(missingPosRes.status === 400, 'Registration without position returns 400 Bad Request');

    // 4c. Invalid Email
    const badEmailData = createMultipartBody(
      {
        fullName: 'Test Player',
        dateOfBirth: '2000-01-01',
        phoneNumber: '+1 555 999 1111',
        email: 'not-an-email',
        playingPosition: 'Midfielder',
      },
      { name: 'photo', filename: 'photo.png', contentType: 'image/png', data: dummyImage }
    );
    const badEmailRes = await callExpress(
      'POST',
      '/api/players/register',
      badEmailData.headers,
      badEmailData.body
    );
    assert(badEmailRes.status === 400, 'Registration with invalid email format returns 400 Bad Request');

    // 5. Successful Player Registration (All Fields, and Optional Email)
    console.log('\n--- 5. Successful Player Registration (With & Without Email) ---');
    const validPlayerData = createMultipartBody(
      {
        fullName: 'Kylian Mbappe',
        dateOfBirth: '1998-12-20',
        phoneNumber: '+33 612 345 678',
        email: 'kylian.mbappe@league-test.org',
        playingPosition: 'Forward',
      },
      { name: 'photo', filename: 'avatar.jpg', contentType: 'image/jpeg', data: dummyImage }
    );
    const regRes = await callExpress(
      'POST',
      '/api/players/register',
      validPlayerData.headers,
      validPlayerData.body
    );
    assert(regRes.status === 201, 'Valid player registration returns 201 Created');
    assert(typeof regRes.data.data?.registrationId === 'string', 'Registration generates unique registrationId');
    assert(regRes.data.data?.registrationId.startsWith('PLR-'), 'Registration ID starts with PLR-');
    assert(regRes.data.data?.status === 'PENDING', 'New registration status defaults to PENDING');

    const createdRegId = regRes.data.data.registrationId;

    // 5b. Registration Without Email (Email is Optional)
    const noEmailPlayerData = createMultipartBody(
      {
        fullName: 'Erling Haaland',
        dateOfBirth: '2000-07-21',
        phoneNumber: '+47 987 65 432',
        playingPosition: 'Forward',
      },
      { name: 'photo', filename: 'haaland.png', contentType: 'image/png', data: dummyImage }
    );
    const noEmailRes = await callExpress(
      'POST',
      '/api/players/register',
      noEmailPlayerData.headers,
      noEmailPlayerData.body
    );
    assert(noEmailRes.status === 201, 'Registration without email succeeds (Email is optional)');
    assert(typeof noEmailRes.data.data?.registrationId === 'string', 'No-email registration generates unique registrationId');

    // 5c. Second Registration Without Email (Ensures no unique null index conflict)
    const secondNoEmailData = createMultipartBody(
      {
        fullName: 'Lamine Yamal',
        dateOfBirth: '2007-07-13',
        phoneNumber: '+34 600 111 222',
        playingPosition: 'Forward',
      },
      { name: 'photo', filename: 'yamal.png', contentType: 'image/png', data: dummyImage }
    );
    const secondNoEmailRes = await callExpress(
      'POST',
      '/api/players/register',
      secondNoEmailData.headers,
      secondNoEmailData.body
    );
    assert(secondNoEmailRes.status === 201, 'Second registration without email succeeds without duplicate conflict');

    // 6. Duplicate Registration Checks
    console.log('\n--- 6. Duplicate Registration Prevention ---');
    // Same email
    const duplicateEmailData = createMultipartBody(
      {
        fullName: 'Kylian Imposter',
        dateOfBirth: '1998-12-20',
        phoneNumber: '+33 699 999 999',
        email: 'kylian.mbappe@league-test.org', // Duplicate email
        playingPosition: 'Forward',
      },
      { name: 'photo', filename: 'avatar.jpg', contentType: 'image/jpeg', data: dummyImage }
    );
    const dupEmailRes = await callExpress(
      'POST',
      '/api/players/register',
      duplicateEmailData.headers,
      duplicateEmailData.body
    );
    assert(dupEmailRes.status === 409, 'Registration with existing email returns 409 Conflict');
    assert(dupEmailRes.data.error?.code === 'DUPLICATE_EMAIL', 'Error code is DUPLICATE_EMAIL');

    // Same phone number
    const duplicatePhoneData = createMultipartBody(
      {
        fullName: 'Kylian Phone Clone',
        dateOfBirth: '1998-12-20',
        phoneNumber: '+33 612 345 678', // Duplicate phone
        email: 'other.player@league-test.org',
        playingPosition: 'Forward',
      },
      { name: 'photo', filename: 'avatar.jpg', contentType: 'image/jpeg', data: dummyImage }
    );
    const dupPhoneRes = await callExpress(
      'POST',
      '/api/players/register',
      duplicatePhoneData.headers,
      duplicatePhoneData.body
    );
    assert(dupPhoneRes.status === 409, 'Registration with existing phone number returns 409 Conflict');
    assert(dupPhoneRes.data.error?.code === 'DUPLICATE_PHONE', 'Error code is DUPLICATE_PHONE');

    // 7. Public Application Status Check
    console.log('\n--- 7. Public Status Check ---');
    const statusByRegId = await callExpress('GET', `/api/players/status/${createdRegId}`);
    assert(statusByRegId.status === 200, 'Status lookup by registration ID returns 200 OK');
    assert(statusByRegId.data.data?.status === 'PENDING', 'Status lookup confirms status is PENDING');
    assert(statusByRegId.data.data?.displayName.includes('*'), 'Player name is masked for public privacy protection');

    const statusByEmail = await callExpress('GET', '/api/players/status/kylian.mbappe@league-test.org');
    assert(statusByEmail.status === 200, 'Status lookup by email returns 200 OK');

    const notFoundStatus = await callExpress('GET', '/api/players/status/PLR-9999-000000');
    assert(notFoundStatus.status === 404, 'Status lookup for nonexistent registration returns 404 Not Found');

    // 8. Admin Management & Approval Workflow
    console.log('\n--- 8. Admin Management & Approval Workflow ---');
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    const allPlayersRes = await callExpress('GET', '/api/players', authHeaders);
    assert(allPlayersRes.status === 200, 'Authenticated admin can retrieve all player applications');
    assert(Array.isArray(allPlayersRes.data.data?.players), 'Response contains array of players');

    const targetPlayer = allPlayersRes.data.data.players.find(
      (p: any) => p.registrationId === createdRegId
    );
    assert(Boolean(targetPlayer), `Newly registered player found in admin roster (${createdRegId})`);

    const playerId = targetPlayer?._id || targetPlayer?.id;

    // 8a. Admin Approval
    const approveRes = await callExpress('PATCH', `/api/players/${playerId}/approve`, authHeaders);
    assert(approveRes.status === 200, 'Admin can APPROVE player application');
    assert(approveRes.data.data?.status === 'APPROVED', 'Player status updated to APPROVED');
    assert(approveRes.data.data?.auctionStatus === 'upcoming', 'Approved player is assigned to auction pool');

    // Verify status check now reflects APPROVED
    const updatedStatus = await callExpress('GET', `/api/players/status/${createdRegId}`);
    assert(updatedStatus.data.data?.status === 'APPROVED', 'Public status check confirms status is now APPROVED');

    // 8b. Admin Rejection with Reason
    const rejectRes = await callExpress(
      'PATCH',
      `/api/players/${playerId}/reject`,
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({ reason: 'Failed medical assessment' })
    );
    assert(rejectRes.status === 200, 'Admin can REJECT player application');
    assert(rejectRes.data.data?.status === 'REJECTED', 'Player status updated to REJECTED');
    assert(rejectRes.data.data?.rejectionReason === 'Failed medical assessment', 'Rejection reason is recorded');

    // Verify rejection shows in public check
    const rejectedStatus = await callExpress('GET', `/api/players/status/${createdRegId}`);
    assert(rejectedStatus.data.data?.status === 'REJECTED', 'Public status check confirms status is REJECTED');
    assert(rejectedStatus.data.data?.rejectionReason === 'Failed medical assessment', 'Public status displays reason');

    // 9. Admin Statistics
    console.log('\n--- 9. Admin Registration Statistics ---');
    const statsRes = await callExpress('GET', '/api/players/stats', authHeaders);
    assert(statsRes.status === 200, 'Admin can retrieve registration statistics');
    assert(typeof statsRes.data.data?.summary?.total === 'number', 'Summary contains total count');
    assert(typeof statsRes.data.data?.byPosition?.Forward === 'number', 'Position distribution contains Forward count');

    console.log('\n======================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Unexpected test error:', err);
    failedCount++;
  } finally {
    process.exit(failedCount > 0 ? 1 : 0);
  }
}

runTests();
