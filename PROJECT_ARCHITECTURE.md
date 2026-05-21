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
├── src/
│   ├── pages/
│   │   ├── index.astro          # 首頁（export const prerender = true）
│   │   ├── login.astro          # 登入頁（prerender = true）
│   │   ├── admin.astro          # 管理後台（prerender = true）
│   │   ├── posts/
│   │   │   ├── index.astro      # 短文列表（prerender = true）
│   │   │   └── [id].astro       # 單篇短文（prerender = true）
│   │   ├── quotes/
│   │   │   └── index.astro      # 語錄收藏（prerender = true）
│   │   ├── polaroid.astro       # 底片日記（prerender = true）
│   │   ├── ledger.astro         # 記帳系統（prerender = true）
│   │   ├── japan.astro          # 日本收藏（prerender = true）
│   │   ├── travel.astro         # 旅行地圖（prerender = true）
│   │   └── api/
│   │       └── explore.ts       # 探索日本 Serverless（prerender = false）
│   ├── styles/
│   │   ├── japan.css
│   │   └── travel.css
│   └── data/
│       └── links.ts             # 首頁卡片資料
├── astro.config.mjs
├── .env                         # 本地環境變數（git ignore）
└── package.json
```

---

## 架構重要規則

### 靜態 vs 動態頁面
- 所有頁面預設為 `output: 'server'`（動態）
- 靜態頁面必須明確加上 `export const prerender = true`
- API 路由必須加上 `export const prerender = false`

### Script 寫法規則
- `<script define:vars={{ var1, var2 }}>` 用來把 frontmatter 變數傳入客戶端
- `define:vars` 內**不能**用 import 語法
- 必須用 `(async () => { ... })()` IIFE 包住所有非同步邏輯
- Supabase 在 script 裡用 CDN 動態匯入：
  ```js
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  ```

### Google Maps 載入方式（重要）
靜態頁面（prerender = true）**不能**用以下方式載入：
```html
<!-- ❌ 錯誤：build time 插值不會帶入 Key -->
<script src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}`}></script>
```
必須在 IIFE 裡動態建立 script 標籤：
```js
// ✅ 正確：runtime 動態載入
await new Promise((resolve, reject) => {
  if (window.google?.maps) { resolve(); return; }
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&loading=async&callback=__googleMapsReady`;
  script.async = true;
  window.__googleMapsReady = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});
```

### 日期處理
- 一律用本地時區，避免 UTC 偏移：
  ```js
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  ```

### Modal 捲動鎖定
- 開啟 Modal：`document.body.classList.add('modal-open')`
- 關閉 Modal：`document.body.classList.remove('modal-open')`
- CSS：`body.modal-open { overflow: hidden; position: fixed; width: 100%; }`

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

### 已建立的資料表

| 資料表 | 說明 |
|--------|------|
| posts | 短文（日噹） |
| post_images | 短文照片 |
| quotes | 語錄收藏 |
| status | 現在狀態（id=1 固定） |
| daily | Polaroid 底片日記 |
| transactions | 記帳明細 |
| japan_categories | 日本收藏分類（兩層） |
| japan_items | 日本收藏品項 |
| trips | 旅行行程 |
| spots | 旅行景點 |

### status 資料表欄位
- id（固定為 1）
- reading、music、mood、doing（現在狀態四欄）
- japan_explore_public（boolean，控制探索日本搜尋的公開/私人）

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
- 已啟用 API：Maps JavaScript API、Places API (New)、Geocoding API
- API Key 名稱：Travel Map
- Key 存於 Vercel 環境變數：PUBLIC_GOOGLE_MAPS_KEY
- 免費額度：Maps 10,000次/月、Places 10,000次/月、Geocoding 10,000次/月

### Google Custom Search JSON API
- ⚠️ 已於 2025 年對新用戶永久關閉，請勿嘗試申請

---

## Vercel 環境變數

| 變數名稱 | 用途 | 類型 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 URL | 前端 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名 Key | 前端 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署的 Webhook URL | 前端 |
| SERPAPI_KEY | 探索日本搜尋 | 後端 |
| PUBLIC_GOOGLE_MAPS_KEY | Google Maps API Key | 前端 |

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
