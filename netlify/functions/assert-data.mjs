import { getStore } from '@netlify/blobs';

const STORE_NAME = 'assert-student-data-v15-clean';
const DATA_KEY = 'students.json';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function getCode(request) {
  return (
    request.headers.get('x-assert-bk-code') ||
    request.headers.get('X-Assert-Bk-Code') ||
    ''
  );
}

function validCode(request) {
  const configured = process.env.ASSERT_BK_CODE || '';
  return Boolean(configured) && getCode(request) === configured;
}

async function readRecords(store) {
  const data = await store.get(DATA_KEY, { type: 'json' });
  return Array.isArray(data) ? data : [];
}

export default async (request) => {
  try {
    const store = getStore(STORE_NAME);
    const method = request.method || 'GET';

    if (method === 'GET') {
      if (!validCode(request)) {
        return json({ error: 'Unauthorized' }, 401);
      }

      return json({
        records: await readRecords(store),
      });
    }

    if (method === 'POST') {
      if (!validCode(request)) {
        return json({ error: 'Unauthorized' }, 401);
      }

      let payload;

      try {
        payload = await request.json();
      } catch {
        return json({ error: 'Invalid JSON' }, 400);
      }

      const record = payload?.record;

      if (!record || typeof record !== 'object') {
        return json({ error: 'Missing record' }, 400);
      }

      const player = String(record.player || '').trim();

      if (!player) {
        return json({ error: 'Missing player' }, 400);
      }

      const records = await readRecords(store);

      const key = String(record.key || player)
        .trim()
        .toLowerCase();

      const normalized = {
        ...record,
        key,
        player,
      };

      const index = records.findIndex(
        (item) =>
          String(item?.key || item?.player || '')
            .trim()
            .toLowerCase() === key
      );

      if (index >= 0) {
        records[index] = {
          ...records[index],
          ...normalized,
          updatedAt: new Date().toISOString(),
        };
      } else {
        records.push({
          ...normalized,
          updatedAt: new Date().toISOString(),
        });
      }

      await store.setJSON(DATA_KEY, records);

      return json({ ok: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('ASSERT data function error:', error);

    return json(
      {
        error: 'Server error',
      },
      500
    );
  }
};
