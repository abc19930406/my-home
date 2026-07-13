import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// 管理員專用、唯讀:驗證 Supabase access token 後,以請求者身分(RLS 生效)
// 查詢目前行程與收藏資料,組成精簡 context 交給 Anthropic API 回答問題。
// 本階段不提供任何寫入工具(tools 參數不出現)。

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const POST: APIRoute = async ({ request }) => {
  const json = (status: number, body: object) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
  // 過渡期容錯:比照 /api/trigger-deploy,ADMIN_EMAIL(後端)尚未設定時退回 PUBLIC_ADMIN_EMAIL
  const adminEmail =
    import.meta.env.ADMIN_EMAIL || import.meta.env.PUBLIC_ADMIN_EMAIL || '';
  const anthropicApiKey = import.meta.env.ANTHROPIC_API_KEY ?? '';

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !adminEmail) {
    return json(401, { error: 'unauthorized' });
  }

  // 步驟一:用 anon client 驗證 token 對應的身分,email 須與後端 ADMIN_EMAIL 相符
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData?.user?.email || userData.user.email !== adminEmail) {
    return json(401, { error: 'unauthorized' });
  }

  if (!anthropicApiKey) {
    return json(500, { error: 'ANTHROPIC_API_KEY not configured' });
  }

  let body: { messages?: ChatMessage[]; tripId?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'invalid request body' });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const tripId = typeof body.tripId === 'string' ? body.tripId : '';
  if (messages.length === 0) {
    return json(400, { error: 'messages required' });
  }

  // 步驟二:用「請求者的 token」建立 client,查詢時 RLS 生效(不使用 service role)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  try {
    const context = await buildTripContext(supabase, tripId);
    const systemPrompt = buildSystemPrompt(context);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let anthropicRes: Response;
    try {
      anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 2048,
          system: systemPrompt,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!anthropicRes.ok) {
      console.error('Anthropic API error:', anthropicRes.status, await anthropicRes.text());
      return json(500, { error: 'AI 助手暫時無法回應' });
    }

    const data = await anthropicRes.json();
    const reply = (data.content ?? [])
      .filter((block: { type: string }) => block.type === 'text')
      .map((block: { text: string }) => block.text)
      .join('\n');

    return json(200, { reply: reply || '(無回應內容)' });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return json(504, { error: 'AI 助手回應逾時' });
    }
    console.error('ai-assistant error:', err);
    return json(500, { error: 'AI 助手暫時無法回應' });
  }
};

async function buildTripContext(supabase: any, tripId: string) {
  if (!tripId) {
    return { trip: null, days: [], transport_routes: [], japan_items: [] };
  }

  const [
    { data: trip },
    { data: tripDays },
    { data: spots },
    { data: spotTypes },
    { data: spotSubtypes },
    { data: japanItems },
    { data: wishlistItems },
  ] = await Promise.all([
    supabase.from('trips').select('id, name, emoji').eq('id', tripId).maybeSingle(),
    supabase.from('trip_days').select('id, day_number').eq('trip_id', tripId).order('day_number', { ascending: true }),
    supabase.from('spots').select('id, name, note, spot_type_id, spot_subtype_id').eq('trip_id', tripId),
    supabase.from('spot_types').select('id, name, is_chain_store'),
    supabase.from('spot_subtypes').select('id, name, is_chain_store'),
    supabase.from('japan_items').select('id, name, category_id, owner_wishlist, owner_quantity, trip_id').or(`trip_id.eq.${tripId},trip_id.is.null`),
    supabase.from('wishlist_items').select('japan_item_id, quantity'),
  ]);

  const spotList = spots ?? [];
  const spotById = new Map<any, any>(spotList.map((s: any) => [s.id, s]));
  const typeById = new Map<any, any>((spotTypes ?? []).map((t: any) => [t.id, t]));
  const subtypeById = new Map<any, any>((spotSubtypes ?? []).map((st: any) => [st.id, st]));

  const { data: daySpots } = tripDays && tripDays.length > 0
    ? await supabase
        .from('day_spots')
        .select('day_id, spot_id, order_index')
        .in('day_id', tripDays.map((d: any) => d.id))
        .order('order_index', { ascending: true })
    : { data: [] };

  const days = (tripDays ?? []).map((day: any) => ({
    day_number: day.day_number,
    spots: (daySpots ?? [])
      .filter((ds: any) => ds.day_id === day.id)
      .map((ds: any) => {
        const spot = spotById.get(ds.spot_id);
        if (!spot) return null;
        const type = spot.spot_type_id ? typeById.get(spot.spot_type_id) : null;
        const subtype = spot.spot_subtype_id ? subtypeById.get(spot.spot_subtype_id) : null;
        return {
          order: ds.order_index,
          name: spot.name,
          note: spot.note || undefined,
          type: type?.name,
          subtype: subtype?.name,
          is_chain_store: Boolean(type?.is_chain_store || subtype?.is_chain_store),
        };
      })
      .filter(Boolean),
  }));

  const tripSpotIds = new Set(spotList.map((s: any) => s.id));
  const { data: routes } = tripSpotIds.size > 0
    ? await supabase
        .from('spot_transport_routes')
        .select('origin_spot_id, destination_spot_id, mode, duration_minutes, cost, note')
        .in('origin_spot_id', Array.from(tripSpotIds))
    : { data: [] };

  const transport_routes = (routes ?? [])
    .filter((r: any) => tripSpotIds.has(r.destination_spot_id))
    .map((r: any) => ({
      origin: spotById.get(r.origin_spot_id)?.name,
      destination: spotById.get(r.destination_spot_id)?.name,
      mode: r.mode,
      duration_minutes: r.duration_minutes ?? undefined,
      cost: r.cost ?? undefined,
      note: r.note ?? undefined,
    }));

  const wishlistByItem = new Map<string, number[]>();
  (wishlistItems ?? []).forEach((w: any) => {
    const key = String(w.japan_item_id);
    if (!wishlistByItem.has(key)) wishlistByItem.set(key, []);
    wishlistByItem.get(key)!.push(w.quantity);
  });

  const japan_items = (japanItems ?? []).map((item: any) => ({
    name: item.name,
    scope: item.trip_id ? 'trip' : 'general',
    owner_wishlist: item.owner_wishlist,
    owner_quantity: item.owner_wishlist ? item.owner_quantity : undefined,
    friend_wishlist_quantities: wishlistByItem.get(String(item.id)) ?? [],
  }));

  return {
    trip: trip ? { name: trip.name, emoji: trip.emoji } : null,
    days,
    transport_routes,
    japan_items,
  };
}

function buildSystemPrompt(context: unknown): string {
  return [
    '你是「The Corner Table」網站 /trip 頁面的行程與收藏助手,以繁體中文回答。',
    '你只能依據下方提供的 JSON 資料回答問題;資料中沒有的內容,一律誠實說明「目前資料中沒有這項資訊」,不得編造或推測。',
    '回答請精簡扼要,不需要重複使用者的問題。',
    '',
    '目前資料:',
    JSON.stringify(context),
  ].join('\n');
}
