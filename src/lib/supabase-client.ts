import { createClient } from '@supabase/supabase-js';

// 此檔案專供「前端瀏覽器環境」與「編譯期」使用
// 絕對不會引入任何會導致 SSR 崩潰的伺服器端套件 (如 @supabase/ssr)

// 取得環境變數 (相容 Vite 靜態替換 與 Node.js process.env)
function getEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return import.meta.env[key] || '';
}

const supabaseUrl = getEnv('PUBLIC_SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseKey = getEnv('PUBLIC_SUPABASE_ANON_KEY') || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);
