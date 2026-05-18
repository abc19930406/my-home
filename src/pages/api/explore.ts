export const prerender = false;

export async function POST({ request }) {
  try {
    const { query } = await request.json();
    
    const googleKey = import.meta.env.GOOGLE_SEARCH_KEY;
    const googleCx = import.meta.env.GOOGLE_SEARCH_CX;
    
    if (!googleKey || !googleCx) {
      console.error("❌ Missing GOOGLE_SEARCH_KEY or GOOGLE_SEARCH_CX environment variables.");
      return new Response(JSON.stringify({ items: [], error: "Server Configuration Error" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(query + ' 日本 推薦')}&num=5&safe=off`;
    
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    console.log('Search URL:', searchUrl);
    console.log('Search response status:', searchRes.status);
    console.log('Search data:', JSON.stringify(searchData).substring(0, 500));
    
    const items = searchData.items?.map(i => ({
      name: i.title || "無標題",
      description: i.snippet || "無描述",
      source: i.displayLink || "外部連結",
      link: i.link || "#"
    })) ?? [];

    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in API explore endpoint:", error);
    return new Response(JSON.stringify({ items: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
