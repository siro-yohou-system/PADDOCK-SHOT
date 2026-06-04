// netlify/functions/proxy.js
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
    let params = {};

    // POSTボディを解析
    if (event.body) {
      try {
        params = JSON.parse(event.body);
      } catch(_) {
        // JSON解析失敗時はURLエンコードとして試みる
        const urlParams = new URLSearchParams(event.body);
        urlParams.forEach((v, k) => { params[k] = v; });
      }
    }

    // GETパラメータをマージ
    Object.assign(params, event.queryStringParameters || {});

    console.log('params keys:', Object.keys(params).join(','));
    console.log('action:', params.action);

    const query = new URLSearchParams(params).toString();
    const url = GAS_URL + '?' + query;

    console.log('url length:', url.length);

    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await response.text();

    console.log('GAS response:', text.slice(0, 200));

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
