const assert = require('node:assert/strict');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  let data = null;

  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  return { response, data };
}

async function login(email, password) {
  const { response, data } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  assert.equal(response.status, 200, `Login failed for ${email}: expected 200, got ${response.status}`);
  assert.equal(data?.success, true, `Login success flag false for ${email}`);
  assert.ok(data?.data?.token, `Missing token for ${email}`);

  return data.data.token;
}

async function run() {
  const unauthorized = await request('/api/dashboard/summary');
  assert.equal(unauthorized.response.status, 401, 'Expected 401 for summary without token');

  const receptionistToken = await login('receptionist@example.com', 'receptionist123');
  const managerToken = await login('manager@example.com', 'manager123');

  const receptionistSummary = await request('/api/dashboard/summary', {
    headers: { Authorization: `Bearer ${receptionistToken}` },
  });
  assert.equal(receptionistSummary.response.status, 200, 'Receptionist cannot access /dashboard/summary');
  assert.equal(receptionistSummary.data?.success, true, 'Receptionist summary success flag false');

  const managerSummary = await request('/api/dashboard/manager-summary', {
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  assert.equal(managerSummary.response.status, 200, 'Manager cannot access /dashboard/manager-summary');
  assert.equal(managerSummary.data?.success, true, 'Manager summary success flag false');

  const forbiddenForReceptionist = await request('/api/dashboard/manager-summary', {
    headers: { Authorization: `Bearer ${receptionistToken}` },
  });
  assert.equal(
    forbiddenForReceptionist.response.status,
    403,
    'Receptionist must not access /dashboard/manager-summary'
  );

  const managerProfile = await request('/api/auth/profile', {
    headers: { Authorization: `Bearer ${managerToken}` },
  });
  assert.equal(managerProfile.response.status, 200, 'Manager profile request failed');
  assert.equal(managerProfile.data?.data?.role, 'manager', 'Manager profile role mismatch');

  const receptionistProfile = await request('/api/auth/profile', {
    headers: { Authorization: `Bearer ${receptionistToken}` },
  });
  assert.equal(receptionistProfile.response.status, 200, 'Receptionist profile request failed');
  assert.equal(receptionistProfile.data?.data?.role, 'receptionist', 'Receptionist profile role mismatch');

  console.log('PASS role-based API test suite');
}

run().catch((error) => {
  console.error('FAIL role-based API test suite');
  console.error(error);
  process.exit(1);
});
