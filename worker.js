// Sorell — SoundCloud API Proxy
// Deployed at jakobadamik11.workers.dev

const SC_CLIENT_ID = 'xNt8bvz9YLecDp6ujjONhKy8iqWsP6wo';

// Allow all origins (safe for a read-only music API proxy)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(request) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const scPath = url.pathname.replace(/^\/api/, '');
    const scUrl = new URL('https://api-v2.soundcloud.com' + scPath);

    url.searchParams.forEach((v, k) => scUrl.searchParams.set(k, v));
    scUrl.searchParams.set('client_id', SC_CLIENT_ID);
    scUrl.searchParams.set('app_version', '1731589474');
    scUrl.searchParams.set('app_locale', 'en');

    try {
      const scRes = await fetch(scUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Origin': 'https://soundcloud.com',
          'Referer': 'https://soundcloud.com/',
        },
      });

      const body = await scRes.text();
      return new Response(body, {
        status: scRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          ...CORS_HEADERS,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  },
};
