export const prerender = false;

export async function GET() {
  const apis = [
    'https://open.er-api.com/v6/latest/JPY',
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json',
    'https://api.frankfurter.app/latest?from=JPY&to=TWD'
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      
      let rate = null;
      if (data.rates?.TWD) rate = data.rates.TWD;
      else if (data.jpy?.twd) rate = data.jpy.twd;
      
      if (rate && rate > 0) {
        return new Response(JSON.stringify({ rate }), {
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
