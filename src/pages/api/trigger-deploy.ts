import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// 管理員專用:驗證 Supabase access token 後,由後端代為觸發 Vercel Deploy Hook。
// Hook 網址只存在於後端環境變數 VERCEL_DEPLOY_HOOK,不再暴露於前端。
export const POST: APIRoute = async ({ request }) => {
  const json = (status: number, body: object) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
  // 過渡期容錯:ADMIN_EMAIL(後端)尚未設定時,退回既有的 PUBLIC_ADMIN_EMAIL,
  // 確保部署當下管理功能不中斷;兩者皆無值時一律拒絕
  const adminEmail =
    import.meta.env.ADMIN_EMAIL || import.meta.env.PUBLIC_ADMIN_EMAIL || '';
  const deployHook = import.meta.env.VERCEL_DEPLOY_HOOK ?? '';

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !adminEmail) {
    return json(401, { error: 'unauthorized' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.email || data.user.email !== adminEmail) {
    return json(401, { error: 'unauthorized' });
  }

  if (!deployHook) {
    return json(500, { error: 'VERCEL_DEPLOY_HOOK not configured' });
  }

  try {
    const res = await fetch(deployHook, { method: 'POST' });
    if (!res.ok) return json(502, { error: 'deploy hook request failed' });
    return json(200, { ok: true });
  } catch {
    return json(502, { error: 'deploy hook request failed' });
  }
};
