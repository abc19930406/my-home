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

    const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query + ' 日本 推薦')}&hl=zh-tw&gl=tw&num=5&api_key=${serpApiKey}`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    const items = searchData.organic_results?.map(r => ({
      name: r.title || "無標題",
      description: r.snippet || '',
      source: r.displayed_link || r.link || "外部連結",
      link: r.link || "#"
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
