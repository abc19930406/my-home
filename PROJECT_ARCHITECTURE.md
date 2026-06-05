# PROJECT_ARCHITECTURE.md
# The Corner Table — 專案架構說明

> 每次開始新任務前，請先完整閱讀本文件與 PROJECT_PROGRESS.md。

---

## 專案基本資訊

- **網站名稱**：The Corner Table
- **網站網址**：https://my-home-blond-tau.vercel.app
- **GitHub**：https://github.com/abc19930406/my-home
- **本地路徑**：/Users/wangyusheng/Desktop/my-home
- **開發者**：非技術背景，由 Claude + Antigravity 協作開發

---

## 技術棧

| 項目 | 技術 |
|------|------|
| 框架 | Astro v6.3.1 |
| 樣式 | Tailwind CSS v4 |
| 資料庫 | Supabase（PostgreSQL + Auth + Storage） |
| 部署 | Vercel |
| 輸出模式 | `output: 'server'` + `@astrojs/vercel` 適配器 |

---

## 目錄結構

```
my-home/
├── public/
│   ├── manifest.json            # PWA 設定
│   └── icons/                   # PWA 圖示
├── src/
│   ├── pages/
│   │   ├── index.astro          # 首頁（prerender = true）
│   │   ├── login.astro          # 登入頁（prerender = true）
│   │   ├── admin.astro          # 管理後台（prerender = true）
│   │   ├── posts/
│   │   │   ├── index.astro      # 短文列表（prerender = true）
│   │   │   └── [id].astro       # 單篇短文（SSR，無 prerender）
│   │   ├── quotes/
│   │   │   └── index.astro      # 語錄收藏（prerender = true）
│   │   ├── polaroid.astro       # 底片日記（prerender = true）
│   │   ├── ledger.astro         # 記帳系統（prerender = true）
│   │   ├── japan.astro          # 日本收藏（prerender = true）
│   │   ├── travel.astro         # 旅行地圖（prerender = true）
│   │   └── api/
│   │       ├── explore.ts       # 探索日本 Serverless（prerender = false）
│   │       └── exchange-rate.ts # 匯率 API（prerender = false）
│   ├── layouts/
│   │   └── Layout.astro         # 共用 Layout（含 Supabase CDN 注入）
│   ├── styles/
│   │   ├── japan.css
│   │   └── travel.css
│   └── data/
│       └── links.ts             # 首頁卡片資料
├── astro.config.mjs             # 含 Vite plugin 移除 modulepreload
├── .env                         # 本地環境變數（git ignore）
└── package.json
```

---

## 架構重要規則

### 靜態 vs 動態頁面
- 所有頁面預設為 `output: 'server'`（動態）
- 靜態頁面必須明確加上 `export const prerender = true`
- API 路由必須加上 `export const prerender = false`
- 單篇短文 `/posts/[id].astro` 為 SSR（無 prerender）

### Supabase CDN 載入方式（重要）
- **不能**在 `<script>` 裡直接 `import` CDN URL，Vite 會掃描並產生錯誤的 modulepreload
- **正確做法**：Layout.astro 用 `<script is:inline>` 動態注入：
  ```html
  <script is:inline>
    (function() {
      const s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
        window._supabaseCreateClient = createClient;
        window.dispatchEvent(new Event('supabase-ready'));
      `;
      document.head.appendChild(s);
    })();
  </script>
  ```
- 各頁面等待 Supabase 就緒：
  ```js
  const waitForSupabase = () => new Promise(resolve => {
    if (window._supabaseCreateClient) return resolve();
    window.addEventListener('supabase-ready', resolve, { once: true });
  });
  await waitForSupabase();
  const createClient = window._supabaseCreateClient;
  ```

### Script 寫法規則
- `<script define:vars={{ var1, var2 }}>` 用來把 frontmatter 變數傳入客戶端
- `define:vars` 內**不能**用 import 語法
- 必須用 `(async () => { ... })()` IIFE 包住所有非同步邏輯

### Google Maps 載入方式（重要）
靜態頁面（prerender = true）必須在 IIFE 裡動態建立 script 標籤：
```js
await new Promise((resolve, reject) => {
  if (window.google?.maps) { resolve(); return; }
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&loading=async&callback=__googleMapsReady`;
  script.async = true;
  window.__googleMapsReady = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});
```

### AdvancedMarkerElement 規則
- 需要地圖初始化時加上 `mapId: 'DEMO_MAP_ID'`
- 不能同時設 `styles`（會衝突）
- 點擊事件用 `'gmp-click'` 而非 `'click'`
- 需要 `gmpClickable: true`

### PWA
- `manifest.json` 保留（加入主畫面功能正常）
- **已移除 Service Worker**（避免快取問題）
- Layout.astro 有主動 unregister 舊 SW 的程式碼

### Vite 設定
- `astro.config.mjs` 有 Vite plugin 移除所有 `<link rel="modulepreload">` 標籤
- 避免 CDN 路徑被錯誤解析成相對路徑

### 日期處理
- 一律用本地時區，避免 UTC 偏移

### Modal 捲動鎖定
- 開啟：`document.body.classList.add('modal-open')`
- 關閉：`document.body.classList.remove('modal-open')`
- CSS：`body.modal-open { overflow: hidden; }`（不加 position: fixed）

### 私密頁面保護
```js
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = '/login?from=/page-name';
  return;
}
```

---

## Supabase 資料表

| 資料表 | 說明 |
|--------|------|
| posts | 短文（日噹） |
| post_images | 短文照片 |
| quotes | 語錄收藏 |
| status | 現在狀態（id=1 固定） |
| daily | Polaroid 底片日記 |
| transactions | 記帳明細（含 currency、amount_jpy、exchange_rate） |
| income_categories | 收入來源（動態管理） |
| expense_categories | 支出分類（動態管理） |
| japan_categories | 日本收藏分類（兩層） |
| japan_items | 日本收藏品項（含 owner_wishlist、owner_quantity） |
| allowed_users | 日本收藏白名單（email + display_name） |
| wishlist_items | 朋友/家人願望清單（含 quantity） |
| trips | 旅行行程 |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） |
| spot_types | 景點主類型 |
| spot_subtypes | 景點子類型（關聯 spot_types） |
| trip_days | 每日行程（關聯 trips） |
| day_spots | 每天景點安排（關聯 trip_days + spots） |

### status 資料表欄位
- id（固定為 1）
- reading、music、mood、doing（現在狀態四欄）
- japan_explore_public（boolean，控制探索日本搜尋的公開/私人）

### wishlist_items RLS policies
- SELECT：所有登入用戶可讀
- INSERT：用戶只能新增自己的記錄（auth.uid() = user_id）
- UPDATE：用戶只能更新自己的記錄（auth.uid() = user_id）
- DELETE：用戶只能刪除自己的記錄（auth.uid() = user_id）

### Storage Buckets
- post_images（PUBLIC）
- japan_images（PUBLIC）
- travel_images（PUBLIC）

---

## 外部服務

### SerpApi（探索日本搜尋）
- 每月 100 次免費搜尋
- 使用 Google Shopping 模式（engine=google_shopping）
- Key 存於 Vercel 後端環境變數 SERPAPI_KEY（不加 PUBLIC_ 前綴）
- API 路由：src/pages/api/explore.ts

### Google Maps Platform（旅行地圖）
- 專案：my-home（Google Cloud Console）
- 已啟用 API：Maps JavaScript API、Places API (New)、Geocoding API、Google OAuth
- API Key 名稱：Travel Map
- Key 存於 Vercel 環境變數：PUBLIC_GOOGLE_MAPS_KEY
- OAuth 同意畫面已設為「實際運作中」（正式版）

### 匯率 API（記帳系統）
- 後端 Serverless Function：src/pages/api/exchange-rate.ts
- 多重備援 API，由伺服器端呼叫避免 CORS 問題

### Google Custom Search JSON API
- ⚠️ 已於 2025 年對新用戶永久關閉，請勿嘗試申請，改用 SerpApi

---

## Vercel 環境變數

| 變數名稱 | 用途 | 類型 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 URL | 前端 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名 Key | 前端 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署的 Webhook URL | 前端 |
| SERPAPI_KEY | 探索日本搜尋 | 後端 |
| PUBLIC_GOOGLE_MAPS_KEY | Google Maps API Key | 前端 |
| PUBLIC_ADMIN_EMAIL | 管理者 email 判斷 | 前端 |

---

## 日本收藏多角色登入

| 身份 | 登入方式 | 可使用功能 |
|------|---------|-----------|
| 管理者 | 現有帳號（email/password） | 全部 |
| 朋友 | Google OAuth | /japan 願望清單 |
| 家人 | Email/Password（管理者建立）| /japan 願望清單 |

- 白名單：Supabase Table Editor → allowed_users → Insert row
- 新增家人帳號：Supabase Authentication → Users → Add user
- 白名單 email 比對用 `ilike`（大小寫不敏感）
- 朋友需用 Safari 或 Chrome，不能用 App 內建瀏覽器
- Google OAuth Callback URL：https://ltmrkdldmgysczfnidra.supabase.co/auth/v1/callback
- Supabase Site URL：https://my-home-blond-tau.vercel.app
- Redirect URLs：https://my-home-blond-tau.vercel.app/** 和 http://localhost:4321/**

---

## 視覺風格系統

| 頁面 | 主色調 | 背景色 |
|------|--------|--------|
| 首頁 | 深木奶油 | #2C1E14 |
| 日噹（/posts） | 日夜雙主題 | 深色/淺色切換 |
| 語錄（/quotes） | 牛皮紙 | #E8D5A8 |
| 底片日記（/polaroid） | 深木底片 | #1A1410 |
| 記帳（/ledger） | 白底 | white |
| 日本收藏（/japan） | 晨霧富士淡藍灰 | #E8EEF5 |
| 旅行地圖（/travel） | 日系清新暖木 | #FDFCF8 |
