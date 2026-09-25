export const prerender = false;

const SUPPORTED = ['JPY', 'THB', 'VND'];

export async function GET({ url }: { url: URL }) {
  const from = (url.searchParams.get('from') || 'JPY').toUpperCase();
  if (!SUPPORTED.includes(from)) {
    return new Response(JSON.stringify({ error: 'Unsupported currency' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  const lower = from.toLowerCase();

  const apis = [
    `https://open.er-api.com/v6/latest/${from}`,
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${lower}.json`,
    `https://api.frankfurter.app/latest?from=${from}&to=TWD`
  ];

  for (const apiUrl of apis) {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) continue;
      const data = await res.json();

      let rate = null;
      if (data.rates?.TWD) rate = data.rates.TWD;
      else if (data[lower]?.twd) rate = data[lower].twd;

      // 不做任何四捨五入：VND 約 0.00125，需保留完整精度
      if (typeof rate === 'number' && rate > 0) {
        return new Response(JSON.stringify({ rate, from }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      continue;
    }
  }

  return new Response(JSON.stringify({ error: 'Failed to fetch rate' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
