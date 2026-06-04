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
    // POSTボディがあればパラメータとして転送
    let params = {};
    if (event.httpMethod === 'POST' && event.body) {
      try { params = JSON.parse(event.body); } catch(_) {}
    }
    // GETパラメータもマージ
    Object.assign(params, event.queryStringParameters || {});

    const query = new URLSearchParams(params).toString();
    const url = query ? GAS_URL + '?' + query : GAS_URL;

    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await response.text();

    return { statusCode: 200, headers, body: text };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
