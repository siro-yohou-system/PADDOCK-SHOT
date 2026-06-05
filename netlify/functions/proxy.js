const GAS_URL = 'https://script.google.com/macros/s/AKfycbzYtVIadSYxQGbAG1qoj8yTqPbO--7fEUsdSzBIlLyWwMDvtf_Mu64eol3FsyBsMkms/exec';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const qs = event.queryStringParameters || {};

    if (event.httpMethod === 'GET' || !event.body) {
      const query = new URLSearchParams(qs).toString();
      const url = query ? GAS_URL + '?' + query : GAS_URL;
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      return { statusCode: 200, headers, body: await res.text() };
    }

    const bodyStr = event.body;

    const res1 = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr).toString()
      },
      body: bodyStr,
      redirect: 'manual'
    });

    console.log('status:', res1.status);
    console.log('location:', res1.headers.get('location'));

    if (res1.status === 302 || res1.status === 301) {
      const location = res1.headers.get('location');
      console.log('redirecting to:', location);
      const res2 = await fetch(location, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr).toString()
        },
        body: bodyStr
      });
      const text = await res2.text();
      console.log('final response:', text.slice(0, 200));
      return { statusCode: 200, headers, body: text };
    }

    // リダイレクトなしの場合
    const text = await res1.text();
    console.log('direct response:', text.slice(0, 200));
    return { statusCode: 200, headers, body: text };

  } catch (err) {
    console.error('proxy error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
