export const prerender = false;

export async function POST({ request }) {
  try {
    const { query } = await request.json();
    
    const serpApiKey = import.meta.env.SERPAPI_KEY;
    if (!serpApiKey) {
      console.error("❌ Missing SERPAPI_KEY environment variable.");
      return new Response(JSON.stringify({ items: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(query + ' 日本')}&hl=zh-tw&gl=jp&num=5&api_key=${serpApiKey}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const items = searchData.shopping_results?.map(r => ({
      name: r.title || "無標題",
      description: r.price ? `價格：${r.price}　${r.source || ''}` : (r.snippet || ''),
      source: r.source || r.link || "外部連結",
      link: r.link || "#",
      thumbnail: r.thumbnail || ''
    })) ?? [];

    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ items: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
