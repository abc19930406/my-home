import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// 管理員專用:驗證 Supabase access token 後,以請求者身分(RLS 生效)查詢目前
// 行程與收藏資料,並開放行程類寫入工具(add_spot/update_spot/reorder_day_spots/
// add_transport_route)。delete 類與收藏類工具本批不開放。

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_TOOL_ITERATIONS = 10;
const ANTHROPIC_TIMEOUT_MS = 30000;

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
  const mapsKey = import.meta.env.PUBLIC_GOOGLE_MAPS_KEY ?? '';

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

  // 步驟二:用「請求者的 token」建立 client,查詢與寫入時 RLS 皆生效(不使用 service role)
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  try {
    const { context, lookups } = await buildTripContext(supabase, tripId);
    const tools = buildToolDefinitions();
    const systemPrompt = buildSystemPrompt(context);
    const toolCtx = { supabase, tripId, mapsKey, lookups };

    let currentMessages: any[] = messages.map((m) => ({ role: m.role, content: m.content }));
    let finalReply: string | null = null;

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const anthropicRes = await callAnthropic(currentMessages, tools, systemPrompt, anthropicApiKey);
      if (!anthropicRes.ok) {
        console.error('Anthropic API error:', anthropicRes.status, await anthropicRes.text());
        return json(500, { error: 'AI 助手暫時無法回應' });
      }

      const data = await anthropicRes.json();
      if (data.stop_reason !== 'tool_use') {
        finalReply = extractText(data.content);
        break;
      }

      currentMessages.push({ role: 'assistant', content: data.content });
      const toolUseBlocks = (data.content ?? []).filter((b: any) => b.type === 'tool_use');
      const toolResults = [];
      for (const block of toolUseBlocks) {
        const result = await executeTool(block.name, block.input ?? {}, toolCtx);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.success,
        });
      }
      currentMessages.push({ role: 'user', content: toolResults });
    }

    if (finalReply === null) {
      finalReply = '操作過於複雜,請拆小,建議分成多個較簡單的指令分次進行。';
    }

    return json(200, { reply: finalReply });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return json(504, { error: 'AI 助手回應逾時' });
    }
    console.error('ai-assistant error:', err);
    return json(500, { error: 'AI 助手暫時無法回應' });
  }
};

async function callAnthropic(messages: any[], tools: any[], systemPrompt: string, apiKey: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);
  try {
    return await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2048,
        system: systemPrompt,
        tools,
        messages,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function extractText(content: any[]): string {
  const text = (content ?? [])
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('\n');
  return text || '(無回應內容)';
}

// ==========================================
// Context 組裝(附 ID 供工具精確定位)
// ==========================================

async function buildTripContext(supabase: any, tripId: string) {
  const emptyLookups = {
    spotTypesByName: new Map<string, any>(),
    spotSubtypesByName: new Map<string, any>(),
    tripDayIdByNumber: new Map<number, any>(),
  };

  if (!tripId) {
    return {
      context: { trip: null, spots: [], days: [], transport_routes: [], japan_items: [] },
      lookups: emptyLookups,
    };
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
    supabase.from('spots').select('id, name, note, spot_type_id, spot_subtype_id, status').eq('trip_id', tripId),
    supabase.from('spot_types').select('id, name, is_chain_store'),
    supabase.from('spot_subtypes').select('id, name, is_chain_store'),
    supabase.from('japan_items').select('id, name, category_id, owner_wishlist, owner_quantity, trip_id').or(`trip_id.eq.${tripId},trip_id.is.null`),
    supabase.from('wishlist_items').select('japan_item_id, quantity'),
  ]);

  const spotList = spots ?? [];
  const spotById = new Map<string, any>(spotList.map((s: any) => [String(s.id), s]));
  const typeById = new Map<any, any>((spotTypes ?? []).map((t: any) => [t.id, t]));
  const subtypeById = new Map<any, any>((spotSubtypes ?? []).map((st: any) => [st.id, st]));
  const spotTypesByName = new Map<string, any>((spotTypes ?? []).map((t: any) => [t.name, t.id]));
  const spotSubtypesByName = new Map<string, any>((spotSubtypes ?? []).map((st: any) => [st.name, st.id]));

  const { data: daySpots } = tripDays && tripDays.length > 0
    ? await supabase
        .from('day_spots')
        .select('day_id, spot_id, order_index')
        .in('day_id', tripDays.map((d: any) => d.id))
        .order('order_index', { ascending: true })
    : { data: [] };

  const tripDayIdByNumber = new Map<number, any>((tripDays ?? []).map((d: any) => [d.day_number, d.id]));

  const spotsOut = spotList.map((s: any) => {
    const type = s.spot_type_id ? typeById.get(s.spot_type_id) : null;
    const subtype = s.spot_subtype_id ? subtypeById.get(s.spot_subtype_id) : null;
    return {
      spot_id: s.id,
      name: s.name,
      note: s.note || undefined,
      type: type?.name,
      subtype: subtype?.name,
      is_chain_store: Boolean(type?.is_chain_store || subtype?.is_chain_store),
      status: s.status,
    };
  });

  const days = (tripDays ?? []).map((day: any) => ({
    day_id: day.id,
    day_number: day.day_number,
    spot_ids_in_order: (daySpots ?? [])
      .filter((ds: any) => ds.day_id === day.id)
      .map((ds: any) => ds.spot_id),
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
      origin_spot_id: r.origin_spot_id,
      destination_spot_id: r.destination_spot_id,
      origin_name: spotById.get(String(r.origin_spot_id))?.name,
      destination_name: spotById.get(String(r.destination_spot_id))?.name,
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
    context: {
      trip: trip ? { name: trip.name, emoji: trip.emoji } : null,
      spots: spotsOut,
      days,
      transport_routes,
      japan_items,
    },
    lookups: { spotTypesByName, spotSubtypesByName, tripDayIdByNumber },
  };
}

function buildSystemPrompt(context: unknown): string {
  return [
    '你是「The Corner Table」網站 /trip 頁面的行程與收藏助手,以繁體中文回答。',
    '你只能依據下方提供的 JSON 資料回答問題;資料中沒有的內容,一律誠實說明「目前資料中沒有這項資訊」,不得編造或推測。',
    '回答請精簡扼要,不需要重複使用者的問題。',
    '你有工具可以新增/修改景點、調整某天景點順序、新增景點間的交通方式。執行任何寫入工具前,若使用者的訊息沒有明確要求該操作,先用文字確認,不要自行猜測執行。',
    '每次工具執行成功後,在回覆中明確描述做了什麼(例如:「已將『熊本城』加入 Day 3 第 2 順位」);工具若回傳失敗,如實告知使用者失敗原因,不得謊報成功。',
    '所有 spot_id、day_number 等識別資訊必須直接使用下方資料中出現的值,不可自行編造。',
    '',
    '目前資料:',
    JSON.stringify(context),
  ].join('\n');
}

// ==========================================
// 工具定義
// ==========================================

function buildToolDefinitions() {
  return [
    {
      name: 'add_spot',
      description:
        '新增一個景點到目前行程。address 必填,系統會自動地理編碼取得座標與 place_id;若提供 day_number 會同時把景點加入該天的行程(可選 position 指定 1-based 順位,省略則加到最後)。',
      input_schema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '景點名稱' },
          address: { type: 'string', description: '完整地址,用於地理編碼(必填)' },
          type_name: { type: 'string', description: '景點主類型名稱,須為目前資料中已存在的類型名稱' },
          subtype_name: { type: 'string', description: '景點子類型名稱,須為目前資料中已存在的子類型名稱' },
          open_hours: { type: 'string', description: '開放時間' },
          price: { type: 'string', description: '價格' },
          note: { type: 'string', description: '備註' },
          status: { type: 'string', enum: ['want', 'visited'], description: '想去/已去,預設 want' },
          day_number: { type: 'integer', description: '要加入的天數,例如 1 代表 Day 1,省略則不加入任何一天' },
          position: { type: 'integer', description: '加入該天的第幾順位(1-based),省略則加到最後' },
        },
        required: ['name', 'address'],
      },
    },
    {
      name: 'update_spot',
      description: '修改已存在景點的資訊。spot_id 必須是目前資料中出現過的值。只會更新有提供的欄位。',
      input_schema: {
        type: 'object',
        properties: {
          spot_id: { type: 'string', description: '景點 ID,取自目前資料' },
          name: { type: 'string' },
          address: { type: 'string', description: '若提供會重新地理編碼座標' },
          type_name: { type: 'string' },
          subtype_name: { type: 'string' },
          open_hours: { type: 'string' },
          price: { type: 'string' },
          note: { type: 'string' },
          status: { type: 'string', enum: ['want', 'visited'] },
        },
        required: ['spot_id'],
      },
    },
    {
      name: 'reorder_day_spots',
      description:
        '調整某一天景點的順序。ordered_spot_ids 必須包含該天目前全部景點的 spot_id(順序可不同),不能新增或刪減景點。',
      input_schema: {
        type: 'object',
        properties: {
          day_number: { type: 'integer', description: '天數,例如 1 代表 Day 1' },
          ordered_spot_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '該天景點的新順序,由 spot_id 組成',
          },
        },
        required: ['day_number', 'ordered_spot_ids'],
      },
    },
    {
      name: 'add_transport_route',
      description: '新增兩個景點之間的交通方式。origin_spot_id/destination_spot_id 必須是目前資料中出現過的值。',
      input_schema: {
        type: 'object',
        properties: {
          origin_spot_id: { type: 'string' },
          destination_spot_id: { type: 'string' },
          mode: { type: 'string', description: '交通方式,例如電車、巴士、步行、計程車' },
          duration_minutes: { type: 'integer' },
          cost: { type: 'string' },
          note: { type: 'string' },
          timetable_url: { type: 'string' },
          subway_map_category: { type: 'string' },
        },
        required: ['origin_spot_id', 'destination_spot_id', 'mode'],
      },
    },
  ];
}

// ==========================================
// 工具執行
// ==========================================

interface ToolCtx {
  supabase: any;
  tripId: string;
  mapsKey: string;
  lookups: {
    spotTypesByName: Map<string, any>;
    spotSubtypesByName: Map<string, any>;
    tripDayIdByNumber: Map<number, any>;
  };
}

async function executeTool(name: string, input: any, ctx: ToolCtx): Promise<{ success: boolean; [key: string]: any }> {
  try {
    switch (name) {
      case 'add_spot':
        return await toolAddSpot(ctx, input);
      case 'update_spot':
        return await toolUpdateSpot(ctx, input);
      case 'reorder_day_spots':
        return await toolReorderDaySpots(ctx, input);
      case 'add_transport_route':
        return await toolAddTransportRoute(ctx, input);
      default:
        return { success: false, error: `未知工具:${name}` };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function geocodeAddress(address: string, mapsKey: string): Promise<{ lat: number; lng: number; place_id: string } | null> {
  if (!mapsKey) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    const r = data.results[0];
    return { lat: r.geometry.location.lat, lng: r.geometry.location.lng, place_id: r.place_id };
  } catch {
    return null;
  }
}

async function applyDaySpotOrder(supabase: any, dayId: string, orderedSpotIds: string[], existingRows: any[]) {
  const bySpotId = new Map<string, any>(existingRows.map((r) => [String(r.spot_id), r]));
  for (let i = 0; i < orderedSpotIds.length; i++) {
    const spotId = orderedSpotIds[i];
    const orderIndex = i + 1;
    const existing = bySpotId.get(String(spotId));
    if (existing) {
      const { data, error } = await supabase
        .from('day_spots')
        .update({ order_index: orderIndex })
        .eq('id', existing.id)
        .select();
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: '沒有權限或資料不存在(0 筆受影響)' };
    } else {
      const { data, error } = await supabase
        .from('day_spots')
        .insert({ day_id: dayId, spot_id: spotId, order_index: orderIndex })
        .select();
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: '加入該天失敗(0 筆受影響)' };
    }
  }
  return { success: true };
}

async function insertSpotIntoDay(supabase: any, dayId: string, spotId: string, position: number | undefined) {
  const { data: existing, error } = await supabase
    .from('day_spots')
    .select('id, spot_id, order_index')
    .eq('day_id', dayId)
    .order('order_index', { ascending: true });
  if (error) return { success: false, error: error.message };

  const currentIds = (existing ?? []).map((ds: any) => String(ds.spot_id));
  let insertAt = currentIds.length;
  if (position != null) {
    insertAt = Math.max(0, Math.min(currentIds.length, Number(position) - 1));
  }
  const newOrder = [...currentIds];
  newOrder.splice(insertAt, 0, String(spotId));
  return await applyDaySpotOrder(supabase, dayId, newOrder, existing ?? []);
}

async function toolAddSpot(ctx: ToolCtx, input: any) {
  const { supabase, tripId, mapsKey, lookups } = ctx;
  const name = String(input.name || '').trim();
  const address = String(input.address || '').trim();
  if (!name || !address) return { success: false, error: 'name 與 address 為必填' };

  const geo = await geocodeAddress(address, mapsKey);
  if (!geo) return { success: false, error: `無法解析地址「${address}」的座標,請提供更精確的地址` };

  const spotTypeId = input.type_name ? lookups.spotTypesByName.get(input.type_name) ?? null : null;
  const spotSubtypeId = input.subtype_name ? lookups.spotSubtypesByName.get(input.subtype_name) ?? null : null;

  const payload = {
    trip_id: tripId,
    name,
    place_id: geo.place_id,
    spot_type_id: spotTypeId,
    spot_subtype_id: spotSubtypeId,
    address,
    lat: geo.lat,
    lng: geo.lng,
    open_hours: input.open_hours || '',
    price: input.price || '',
    note: input.note || '',
    status: input.status === 'visited' ? 'visited' : 'want',
    rating: null,
    images: [],
  };

  const { data, error } = await supabase.from('spots').insert([payload]).select().single();
  if (error || !data) return { success: false, error: '新增景點失敗:' + (error?.message || '未知錯誤') };

  if (input.day_number == null) {
    return { success: true, spot_id: data.id, message: `已新增景點「${name}」` };
  }

  const dayId = lookups.tripDayIdByNumber.get(Number(input.day_number));
  if (!dayId) {
    return { success: true, spot_id: data.id, warning: `景點已建立,但找不到 Day ${input.day_number},未加入任何一天` };
  }

  const orderResult = await insertSpotIntoDay(supabase, dayId, data.id, input.position);
  if (!orderResult.success) {
    return { success: true, spot_id: data.id, warning: `景點已建立,但加入 Day ${input.day_number} 失敗:${orderResult.error}` };
  }

  return { success: true, spot_id: data.id, message: `已新增景點「${name}」,並加入 Day ${input.day_number}` };
}

async function toolUpdateSpot(ctx: ToolCtx, input: any) {
  const { supabase, tripId, mapsKey, lookups } = ctx;
  const spotId = input.spot_id ? String(input.spot_id) : '';
  if (!spotId) return { success: false, error: 'spot_id 為必填' };

  const { data: existingSpot, error: fetchError } = await supabase
    .from('spots')
    .select('id, trip_id, name')
    .eq('id', spotId)
    .maybeSingle();
  if (fetchError) return { success: false, error: fetchError.message };
  if (!existingSpot || String(existingSpot.trip_id) !== String(tripId)) {
    return { success: false, error: '找不到此景點,或此景點不屬於目前行程' };
  }

  const payload: Record<string, any> = {};
  if (input.name != null) payload.name = String(input.name).trim();
  if (input.open_hours != null) payload.open_hours = String(input.open_hours);
  if (input.price != null) payload.price = String(input.price);
  if (input.note != null) payload.note = String(input.note);
  if (input.status != null) payload.status = input.status === 'visited' ? 'visited' : 'want';
  if (input.type_name != null) payload.spot_type_id = lookups.spotTypesByName.get(input.type_name) ?? null;
  if (input.subtype_name != null) payload.spot_subtype_id = lookups.spotSubtypesByName.get(input.subtype_name) ?? null;
  if (input.address != null) {
    const geo = await geocodeAddress(String(input.address), mapsKey);
    if (!geo) return { success: false, error: `無法解析地址「${input.address}」的座標` };
    payload.address = String(input.address);
    payload.lat = geo.lat;
    payload.lng = geo.lng;
    payload.place_id = geo.place_id;
  }

  if (Object.keys(payload).length === 0) {
    return { success: false, error: '沒有提供任何要修改的欄位' };
  }

  const { data, error } = await supabase.from('spots').update(payload).eq('id', spotId).select();
  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: '更新失敗,沒有權限或資料不存在(0 筆受影響)' };

  return { success: true, message: `已更新景點「${existingSpot.name}」的資訊` };
}

async function toolReorderDaySpots(ctx: ToolCtx, input: any) {
  const { supabase, lookups } = ctx;
  const dayId = lookups.tripDayIdByNumber.get(Number(input.day_number));
  if (!dayId) return { success: false, error: `找不到 Day ${input.day_number}` };

  const orderedSpotIds = Array.isArray(input.ordered_spot_ids) ? input.ordered_spot_ids.map(String) : [];
  if (orderedSpotIds.length === 0) return { success: false, error: 'ordered_spot_ids 不可為空' };

  const { data: existing, error } = await supabase.from('day_spots').select('id, spot_id').eq('day_id', dayId);
  if (error) return { success: false, error: error.message };
  const existingIds = (existing ?? []).map((r: any) => String(r.spot_id));

  const sameSet =
    existingIds.length === orderedSpotIds.length &&
    existingIds.every((id: string) => orderedSpotIds.includes(id)) &&
    orderedSpotIds.every((id: string) => existingIds.includes(id));
  if (!sameSet) {
    return { success: false, error: '提供的景點清單與該天目前實際景點不一致(數量或成員不符),請重新確認後再試' };
  }

  const result = await applyDaySpotOrder(supabase, dayId, orderedSpotIds, existing ?? []);
  if (!result.success) return result;
  return { success: true, message: `Day ${input.day_number} 的景點順序已更新` };
}

async function toolAddTransportRoute(ctx: ToolCtx, input: any) {
  const { supabase, tripId } = ctx;
  const originId = input.origin_spot_id ? String(input.origin_spot_id) : '';
  const destId = input.destination_spot_id ? String(input.destination_spot_id) : '';
  const mode = input.mode ? String(input.mode).trim() : '';
  if (!originId || !destId || !mode) return { success: false, error: 'origin_spot_id、destination_spot_id、mode 皆為必填' };
  if (originId === destId) return { success: false, error: '起點與終點不能相同' };

  const { data: bothSpots, error: fetchError } = await supabase
    .from('spots')
    .select('id, trip_id, name')
    .in('id', [originId, destId]);
  if (fetchError) return { success: false, error: fetchError.message };

  const origin = (bothSpots ?? []).find((s: any) => String(s.id) === originId);
  const dest = (bothSpots ?? []).find((s: any) => String(s.id) === destId);
  if (!origin || !dest || String(origin.trip_id) !== String(tripId) || String(dest.trip_id) !== String(tripId)) {
    return { success: false, error: '起點或終點不存在,或不屬於目前行程' };
  }

  const payload = {
    origin_spot_id: originId,
    destination_spot_id: destId,
    mode,
    duration_minutes: input.duration_minutes != null ? Number(input.duration_minutes) : null,
    cost: input.cost || null,
    note: input.note || null,
    timetable_url: input.timetable_url || null,
    subway_map_category: input.subway_map_category || null,
  };

  const { data, error } = await supabase.from('spot_transport_routes').insert([payload]).select();
  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) return { success: false, error: '新增交通方式失敗(0 筆受影響)' };

  return { success: true, message: `已新增「${origin.name}」到「${dest.name}」的交通方式(${mode})` };
}
