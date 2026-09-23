import { getStore } from '@netlify/blobs';

const STORE_NAME = 'assert-student-data-v15-clean';
const DATA_KEY = 'students.json';

function json(body, status = 200) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}

function getCode(event) {
  return event.headers?.['x-assert-bk-code'] || event.headers?.['X-Assert-Bk-Code'] || '';
}

function validCode(event) {
  const configured = process.env.ASSERT_BK_CODE || '';
  return Boolean(configured) && getCode(event) === configured;
}

async function readRecords(store) {
  const data = await store.get(DATA_KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export default async (event) => {
  try {
    const store = getStore(STORE_NAME);
    const method = event.httpMethod || 'GET';

    if (method === 'GET') {
      if (!validCode(event)) return json({ error: 'Unauthorized' }, 401);
      return json({ records: await readRecords(store) });
    }

    if (method === 'POST') {
      let payload;
      try { payload = JSON.parse(event.body || '{}'); } catch { return json({ error: 'Invalid JSON' }, 400); }
      const record = payload?.record;
      if (!record || typeof record !== 'object') return json({ error: 'Missing record' }, 400);
      const player = String(record.player || '').trim();
      if (!player) return json({ error: 'Missing player' }, 400);

      const records = await readRecords(store);
      const key = String(record.key || player).trim().toLowerCase();
      const normalized = { ...record, key, player };
      const index = records.findIndex((item) => String(item?.key || item?.player || '').trim().toLowerCase() === key);
      if (index >= 0) records[index] = { ...records[index], ...normalized, updatedAt: new Date().toISOString() };
      else records.push({ ...normalized, updatedAt: new Date().toISOString() });

      await store.setJSON(DATA_KEY, records);
      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('ASSERT data function error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
