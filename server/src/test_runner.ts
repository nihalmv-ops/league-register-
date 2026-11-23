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

    // ======================================================
    // PHASE 4: LIVE PLAYER AUCTION SYSTEM TEST SUITE
    // ======================================================

    // 10. Live Auction Initialization & Admin Controls
    console.log('\n--- 10. Live Auction Initialization & Admin Controls ---');
    const activeAuctionRes = await callExpress('GET', '/api/admin/auctions/active', authHeaders);
    assert(activeAuctionRes.status === 200, 'Admin can fetch active auction state');
    assert(Boolean(activeAuctionRes.data.data?.auction), 'Active auction object exists');

    const auctionId = activeAuctionRes.data.data.auction._id;

    // Start Auction
    const startRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/start`, authHeaders);
    assert(startRes.status === 200, 'Admin can start the live auction');
    assert(startRes.data.data?.auction?.status === 'live', 'Auction status becomes LIVE');

    // Pause Auction
    const pauseRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/pause`, authHeaders);
    assert(pauseRes.status === 200, 'Admin can pause the live auction');
    assert(pauseRes.data.data?.auction?.status === 'paused', 'Auction status becomes PAUSED');

    // Resume Auction
    const resumeRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/resume`, authHeaders);
    assert(resumeRes.status === 200, 'Admin can resume the live auction');
    assert(resumeRes.data.data?.auction?.status === 'live', 'Auction status resumes to LIVE');

    // 11. Select Next Approved Player for Podium
    console.log('\n--- 11. Select Next Approved Player for Podium ---');
    // First ensure player is APPROVED for draft
    await callExpress('PATCH', `/api/players/${playerId}/approve`, authHeaders);

    const nextPlayerRes = await callExpress(
      'PATCH',
      `/api/admin/auctions/${auctionId}/next-player`,
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({
        playerId,
        basePrice: 150000,
        countdownDuration: 30,
      })
    );
    assert(nextPlayerRes.status === 200, 'Admin can select approved player for bidding podium');
    assert(nextPlayerRes.data.data?.currentPlayer?.registrationId === createdRegId, 'Current player is loaded on stage');
    assert(nextPlayerRes.data.data?.auction?.basePrice === 150000, 'Base price set correctly');
    assert(nextPlayerRes.data.data?.auction?.isBiddingActive === false, 'Bidding is not active until admin starts clock');

    // Start Bidding Clock
    const startBiddingRes = await callExpress(
      'PATCH',
      `/api/admin/auctions/${auctionId}/start-bidding`,
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({ durationSeconds: 30 })
    );
    assert(startBiddingRes.status === 200, 'Admin can start the bidding floor');
    assert(startBiddingRes.data.data?.auction?.isBiddingActive === true, 'Bidding floor is now active');

    // 12. Team Manager Authentication & Security Checks
    console.log('\n--- 12. Team Manager Authentication ---');
    // Invalid credentials
    const badManagerRes = await callExpress(
      'POST',
      '/api/auth/manager/login',
      { 'content-type': 'application/json' },
      JSON.stringify({ email: 'manager.thunder@football.league', password: 'WrongPassword' })
    );
    assert(badManagerRes.status === 401, 'Manager login with wrong password rejected with 401');

    // Manager 1 Login (Thunder Strikers FC)
    const mgr1Res = await callExpress(
      'POST',
      '/api/auth/manager/login',
      { 'content-type': 'application/json' },
      JSON.stringify({ email: 'manager.thunder@football.league', password: 'Manager@123' })
    );
    assert(mgr1Res.status === 200, 'Manager 1 (Thunder Strikers FC) logs in successfully');
    assert(typeof mgr1Res.data.data?.token === 'string', 'Manager receives signed JWT token');
    assert(mgr1Res.data.data?.manager?.teamName === 'Thunder Strikers FC', 'Manager is mapped to Thunder Strikers FC');
    const mgr1Token = mgr1Res.data.data.token;
    const mgr1Headers = { Authorization: `Bearer ${mgr1Token}`, 'content-type': 'application/json' };

    // Manager 2 Login (Apex Predators)
    const mgr2Res = await callExpress(
      'POST',
      '/api/auth/manager/login',
      { 'content-type': 'application/json' },
      JSON.stringify({ email: 'manager.apex@football.league', password: 'Manager@123' })
    );
    assert(mgr2Res.status === 200, 'Manager 2 (Apex Predators) logs in successfully');
    const mgr2Token = mgr2Res.data.data.token;
    const mgr2Headers = { Authorization: `Bearer ${mgr2Token}`, 'content-type': 'application/json' };

    // Security: Admin token cannot access manager bidding route
    const adminAsManagerRes = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({ amount: 160000 })
    );
    assert(adminAsManagerRes.status === 403, 'Admin token cannot place manager bids (Role separation enforced)');

    // 13. Live Bidding Engine & Validations
    console.log('\n--- 13. Live Bidding Engine & Validations ---');
    // Bid below base price ($150,000)
    const lowBidRes = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr1Headers,
      JSON.stringify({ amount: 100000 })
    );
    assert(lowBidRes.status === 400, 'Bid below base price is rejected');

    // Valid Opening Bid by Thunder Strikers ($160,000)
    const bid1Res = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr1Headers,
      JSON.stringify({ amount: 160000 })
    );
    assert(bid1Res.status === 200, 'Valid opening bid by Manager 1 accepted');
    assert(bid1Res.data.data?.bid?.amount === 160000, 'Bid record matches $160,000');
    assert(bid1Res.data.data?.state?.auction?.currentHighestBid === 160000, 'Auction state updates highest bid to $160,000');
    assert(bid1Res.data.data?.state?.leadingTeam?.name === 'Thunder Strikers FC', 'Leading team is Thunder Strikers FC');

    // Sequential Opposing Bid by Manager 2 (Apex Predators) ($180,000)
    const bid2Res = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr2Headers,
      JSON.stringify({ amount: 180000 })
    );
    assert(bid2Res.status === 200, 'Manager 2 (Apex Predators) successfully outbids Manager 1');
    assert(bid2Res.data.data?.state?.auction?.currentHighestBid === 180000, 'Highest bid advances to $180,000');
    assert(bid2Res.data.data?.state?.leadingTeam?.name === 'Apex Predators', 'Leading team changes to Apex Predators');

    // Attempt Bid equal or lower than current highest ($170,000)
    const underBidRes = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr1Headers,
      JSON.stringify({ amount: 170000 })
    );
    assert(underBidRes.status === 400, 'Bid lower than current highest is rejected');

    // Attempt Bid exceeding team remaining budget ($5,000,000)
    const overBudgetRes = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr1Headers,
      JSON.stringify({ amount: 5000000 })
    );
    assert(overBudgetRes.status === 400, 'Bid exceeding franchise purse ceiling is rejected');

    // Counter Bid by Manager 1 ($220,000)
    const bid3Res = await callExpress(
      'POST',
      `/api/manager/auctions/${auctionId}/bid`,
      mgr1Headers,
      JSON.stringify({ amount: 220000 })
    );
    assert(bid3Res.status === 200, 'Counter bid of $220,000 by Thunder Strikers accepted');
    assert(bid3Res.data.data?.state?.leadingTeam?.name === 'Thunder Strikers FC', 'Thunder Strikers FC re-claims lead');

    // 14. SOLD Process: Winner Allocation & Purse Deduction
    console.log('\n--- 14. SOLD Process: Winner Allocation & Purse Deduction ---');
    const soldRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/sold`, authHeaders);
    assert(soldRes.status === 200, 'Admin declares SOLD successfully');
    assert(soldRes.data.data?.result?.resultStatus === 'SOLD', 'Auction result is recorded as SOLD');
    assert(soldRes.data.data?.result?.finalPrice === 220000, 'Final price recorded as $220,000');

    // Verify player is now SOLD in database
    const soldPlayerRes = await callExpress('GET', `/api/players/${playerId}`, authHeaders);
    assert(soldPlayerRes.data.data?.auctionStatus === 'sold', 'Player auctionStatus updated to sold');
    assert(soldPlayerRes.data.data?.soldPrice === 220000, 'Player soldPrice set to $220,000');
    assert(soldPlayerRes.data.data?.teamName === 'Thunder Strikers FC', 'Player teamName set to Thunder Strikers FC');

    // Verify winning team budget was automatically deducted
    const mgr1ProfileRes = await callExpress('GET', '/api/auth/manager/me', mgr1Headers);
    assert(
      mgr1ProfileRes.data.data?.team?.remainingBudget === 1500000 - 220000,
      'Winning team budget correctly deducted ($1,500,000 - $220,000 = $1,280,000)'
    );
    assert(mgr1ProfileRes.data.data?.team?.playersCount === 1, 'Winning team squad count incremented to 1');

    // Verify duplicate sale prevented
    const duplicateSoldRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/sold`, authHeaders);
    assert(duplicateSoldRes.status === 400, 'Cannot declare SOLD when lot is empty or already sold');

    // 15. UNSOLD Process
    console.log('\n--- 15. UNSOLD Process ---');
    // Ensure second player is APPROVED so they are eligible for the auction floor
    const approveHaalandRes = await callExpress('PATCH', '/api/players/mem-plr-002/approve', authHeaders);
    assert(approveHaalandRes.status === 200, 'Approved second player (Erling Haaland) for auction');

    // Bring Erling Haaland (PLR-2026-823532) on stage
    const haalandRes = await callExpress(
      'PATCH',
      `/api/admin/auctions/${auctionId}/next-player`,
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({ playerId: 'mem-plr-002', basePrice: 200000 })
    );
    assert(haalandRes.status === 200, 'Brought second player on stage');

    const unsoldRes = await callExpress('PATCH', `/api/admin/auctions/${auctionId}/unsold`, authHeaders);
    assert(unsoldRes.status === 200, 'Admin can declare lot UNSOLD');
    assert(unsoldRes.data.data?.result?.resultStatus === 'UNSOLD', 'Auction result recorded as UNSOLD');
    assert(unsoldRes.data.data?.result?.finalPrice === 0, 'UNSOLD final price is 0');

    // 16. Projector Live Screen Telemetry & Privacy Check
    console.log('\n--- 16. Projector Live Screen & Privacy Check ---');
    const projectorRes = await callExpress('GET', `/api/auctions/${auctionId}/live`);
    assert(projectorRes.status === 200, 'Projector live endpoint returns 200 OK');
    assert(Boolean(projectorRes.data.data?.auction), 'Projector receives active auction telemetry');

    // Privacy verification: no phone numbers or email addresses in projector data
    const projectorJson = JSON.stringify(projectorRes.data);
    assert(!projectorJson.includes('+33 612 345 678'), 'Private phone number is strictly NOT exposed in projector view');
    assert(!projectorJson.includes('kylian.mbappe@league-test.org'), 'Private email address is strictly NOT exposed in projector view');

    // 17. Team Squad Poster Generator Endpoints (Phase 5)
    console.log('\n--- 17. Phase 5 Team Squad Poster Generator ---');

    // 17a. Security check: unauthenticated requests to poster endpoints rejected
    const unauthTeamsRes = await callExpress('GET', '/api/admin/teams');
    assert(unauthTeamsRes.status === 401, 'Unauthorized request to /api/admin/teams returns 401');

    const unauthPosterRes = await callExpress('GET', '/api/admin/teams/team-1/poster-data');
    assert(unauthPosterRes.status === 401, 'Unauthorized request to /api/admin/teams/:id/poster-data returns 401');

    // 17b. Authenticated admin fetches teams list
    const adminTeamsRes = await callExpress('GET', '/api/admin/teams', authHeaders);
    assert(adminTeamsRes.status === 200, 'Admin can retrieve all tournament teams for studio');
    assert(Array.isArray(adminTeamsRes.data.data), 'Teams response contains array of franchises');
    assert(adminTeamsRes.data.data.length >= 8, 'Teams response contains all 8 tournament franchises');

    // 17c. Fetch squad poster data for Thunder Strikers FC
    const thunderPosterRes = await callExpress(
      'GET',
      '/api/admin/teams/team-1/poster-data?season=2026-27',
      authHeaders
    );
    assert(thunderPosterRes.status === 200, 'Admin can retrieve squad poster data for Thunder Strikers FC');
    assert(thunderPosterRes.data.data?.team?.name === 'Thunder Strikers FC', 'Team name matches Thunder Strikers FC');
    assert(Array.isArray(thunderPosterRes.data.data?.players), 'Poster data contains players array');
    assert(thunderPosterRes.data.data?.players.length > 0, 'Thunder Strikers squad has players');
    assert(thunderPosterRes.data.data?.season === '2026-27', 'Season matches 2026-27');

    // Verify Kylian Mbappe (sold to Thunder Strikers in Section 14) is included in squad!
    const squadPlayers = thunderPosterRes.data.data.players;
    const mbappeInSquad = squadPlayers.find((p: any) => p.fullName === 'Kylian Mbappe');
    assert(Boolean(mbappeInSquad), 'Kylian Mbappe (sold in auction) is correctly included in Thunder Strikers squad');
    assert(typeof mbappeInSquad?.age === 'number' && mbappeInSquad.age > 0, 'Player age is calculated from date of birth');
    assert(Boolean(mbappeInSquad?.photoUrl), 'Player has valid profile photo URL');

    // 17d. Fetch individual player cards dataset
    const thunderCardsRes = await callExpress(
      'GET',
      '/api/admin/teams/team-1/player-cards?season=2026-27',
      authHeaders
    );
    assert(thunderCardsRes.status === 200, 'Admin can retrieve player cards data');
    assert(Array.isArray(thunderCardsRes.data.data?.cards), 'Cards response contains array of cards');
    assert(thunderCardsRes.data.data?.totalCards > 0, 'Total cards count is positive');
    const firstCard = thunderCardsRes.data.data.cards[0];
    assert(Boolean(firstCard.fullName), 'Card contains player full name');
    assert(Boolean(firstCard.teamName), 'Card contains franchise team name');
    assert(Boolean(firstCard.playingPosition), 'Card contains playing position');

    // 17e. Log poster export activity
    const exportLogRes = await callExpress(
      'POST',
      '/api/admin/teams/team-1/poster-export',
      { ...authHeaders, 'content-type': 'application/json' },
      JSON.stringify({
        template: 'modern',
        format: 'PNG',
        dimensions: '1080x1350',
        count: 1,
      })
    );
    assert(exportLogRes.status === 200, 'Admin can log poster export event');
    assert(Boolean(exportLogRes.data.data?.exportId), 'Export event generates export tracking ID');

    // 17f. Nonexistent team handling
    const nonExistentTeamRes = await callExpress(
      'GET',
      '/api/admin/teams/non-existent-team-999/poster-data',
      authHeaders
    );
    assert(nonExistentTeamRes.status === 404, 'Poster data for non-existent team returns 404 Not Found');

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
