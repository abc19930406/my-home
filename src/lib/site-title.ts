import { supabase } from './supabase-client';

export const DEFAULT_SITE_TITLE = 'The Corner Table';

// 站名唯一資料來源：status(id=1).site_title(首頁管理員編輯的那份)。
// 讀取失敗、無資料或空白一律回退預設，不回傳空字串。
// 60 秒記憶：建置時 15 個頁面共用一次查詢；SSR 頁面(posts/[id])也不必每次請求都查。
let cache: { value: string; at: number } | null = null;

export async function getSiteTitle(): Promise<string> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  let value = DEFAULT_SITE_TITLE;
  try {
    const { data, error } = await supabase.from('status').select('site_title').eq('id', 1).single();
    if (!error && data?.site_title?.trim()) value = data.site_title.trim();
  } catch {
    // 讀取失敗使用預設值
  }
  cache = { value, at: Date.now() };
  return value;
}
