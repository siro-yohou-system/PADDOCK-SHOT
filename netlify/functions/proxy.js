const GAS_URL = 'https://script.google.com/macros/s/AKfycbyl95PFSRL3ml3OjZOCrhuFIKqUhOUrBaKv0Y6ZgfzAJfIWyHs8ZmFstXhWj3aiH6Q2mg/exec';

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
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr).toString()  // ← 追加
      },
      body: bodyStr,
      redirect: 'follow'
    });

    const text = await res.text();
    console.log('GAS POST response:', text.slice(0, 300));
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
