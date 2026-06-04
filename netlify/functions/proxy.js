// netlify/functions/proxy.js 修正版
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwFtdsZ77zgFgME271dn7OUCvTho_bnQ0PTJPdgAmqSg981-osYiEucDn7d_Xcu18Ly/exec';

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

    // GET リクエスト
    if (event.httpMethod === 'GET' || !event.body) {
      const query = new URLSearchParams(qs).toString();
      const url = query ? GAS_URL + '?' + query : GAS_URL;
      const res = await fetch(url, { method: 'GET', redirect: 'follow' });
      return { statusCode: 200, headers, body: await res.text() };
    }

    // POST リクエスト：JSONのままGASに転送（base64を壊さない）
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },  // ← これだけ変更
      body: event.body,  // ← パースせずそのまま転送
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
