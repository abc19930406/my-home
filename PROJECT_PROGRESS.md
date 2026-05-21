# PROJECT_PROGRESS.md
# The Corner Table — 功能清單與工作進度

> 每次開始新任務前，請先完整閱讀本文件與 PROJECT_ARCHITECTURE.md。

---

## 一、已完成功能

### ✅ 基礎建設
- Astro 主站建立，Tailwind CSS 設定完成
- GitHub Repository：https://github.com/abc19930406/my-home
- Vercel 部署上線：https://my-home-blond-tau.vercel.app
- Supabase 資料庫連接（含 RLS 權限設定）
- 管理員登入系統（/login 頁面，Supabase Auth）
- 管理後台（/admin 頁面，需登入才能進入）
- Vercel Deploy Webhook 正常運作
- **架構升級**：Astro output 改為 `server` 模式 + `@astrojs/vercel` 適配器，支援 Serverless Function
- 所有現有靜態頁面加上 `export const prerender = true` 維持靜態輸出

### ✅ 首頁
- 深木奶油色系視覺風格（背景 #2C1E14）
- 資料驅動卡片架構（src/data/links.ts 集中管理）
- 三個卡片分區：知識與創作 / 生活記錄 / 工具
- 登入後每張卡片出現編輯按鈕
- 「旅行地圖」卡片目前連結到 /travel

### ✅ 現在狀態便條紙（首頁卡片上方）
- 淡黃色便條紙 + 頂部琥珀色紙膠帶 + 微傾斜
- 內容四欄：📖 正在讀的書 / 🎵 正在聽的音樂 / 💬 心情 / 🔨 最近在做的事
- 登入後 /admin 頁面可直接編輯儲存

### ✅ 短文模組（/posts）「日噹」
- 列表頁時間軸、單篇 Markdown 渲染、照片幻燈片
- 權限系統 public / friends / private
- 日夜切換主題、前台管理（新增/編輯/刪除）

### ✅ 語錄收藏（/quotes）
- 牛皮紙格紋背景、書頁卡片
- 新增語錄按鈕：紙膠帶風格（微傾斜 -3deg）
- 搜尋 + 分類篩選、前台管理
- 底部登入連結

### ✅ Polaroid 底片日記（/polaroid）
- 深木色底片風格 + 上下齒孔
- 同一日期跨年並排（今年最亮、去年次之、兩年前最暗）
- 日期導航、本月縱覽、新增/編輯/刪除
- 日期處理用本地時區避免 UTC 偏移

### ✅ 記帳系統（/ledger）
- 私密頁面，未登入導向 /login
- 收入來源：樂驛、豐苒、少觀所、仁愛之家、演講、其他
- 支出分類：固定支出、飲食、交通、娛樂、其他
- 月份導航、三張指標卡片、橫條圖、明細列表

### ✅ 日本收藏（/japan）— 完整上線
- 晨霧富士淡藍灰風格（#E8EEF5 + 格紋）
- 兩層分類系統（主分類 + 子分類），登入後前台管理
- 磚磚片式三欄 Grid（桌面）/ 兩欄（手機）
- 照片依原始比例顯示，點擊放大 Lightbox
- 收藏品搜尋框（即時過濾 name + note）
- **探索日本搜尋功能**（完整運作）：
  - 後端 Serverless Function：`src/pages/api/explore.ts`
  - 搜尋引擎：**SerpApi**（Google Shopping 模式，每月 100 次免費）
  - 搜尋結果顯示：商品圖片、日文名稱、價格、來源
  - 「收藏」按鈕：直接加入 japan_items，標記「網友推薦」
  - 公開/私人切換開關（存於 Supabase status.japan_explore_public）
  - SERPAPI_KEY 安全保存於 Vercel 後端

### ✅ 旅行地圖（/travel）— 完整上線
- 日系清新白底暖木色系視覺風格（#FDFCF8）
- 行程切換列（多個旅行可切換）
- 類型篩選（全部/景點/飲食/購物/住宿）+ 狀態篩選（想去/已去）
- **雙層過濾列 (Two-tier Filter Bar)**：支援主分類與子分類過濾
- **景點類型自訂管理**（動態載入、登入後可管理、包含防呆檢查）
- **景點子類型管理**（展開式選單、行內新增、防呆檢查）
- Google Maps 動態載入（IIFE + document.createElement，避免 prerender 插值問題）
- 搜尋功能：AutocompleteSuggestion 即時聯想（locationBias 限制在地圖視野）
- 搜尋功能：Place.searchByText 按鈕搜尋（locationRestriction 限制在地圖視野）
- AdvancedMarkerElement 搜尋結果圓點標記
- InfoWindow 顯示地點名稱、地址、加入行程、Google Maps 連結
- Modal 捲動鎖定（overflow: hidden）+ 內部獨立捲動
- 新增/編輯/刪除景點、新增行程
- Supabase 資料庫：trips、spots、spot_types 資料表 + RLS
- Supabase Storage：travel_images bucket
- 使用 Places API (New)，不依賴舊版 Places API

**已啟用的 Google API（my-home 專案）：**
- Maps JavaScript API ✅
- Places API (New) ✅
- Geocoding API ✅
- API Key 名稱：Travel Map
- Key 限制：Maps JavaScript API + Places API (New) + Geocoding API
- Vercel 環境變數：PUBLIC_GOOGLE_MAPS_KEY

---

## 二、規劃中功能（尚未開始）

- 首頁「旅行地圖」卡片點擊後出現子選單（選擇去 /travel 或 /japan）
- 讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡

---

## 三、重要注意事項

1. 新增文章後單篇頁需等 Vercel 重新編譯（約 1 分鐘）才能訪問
2. `<script define:vars>` 不支援頂層 await，所有非同步邏輯必須包在 `(async () => { ... })()` 內
3. `<script define:vars>` 內不能用 import，Supabase 用 CDN 動態匯入
4. 所有日期處理用本地時區避免 UTC 偏移
5. 私密頁面在 IIFE 開頭確認 session，無 session 立即導向 /login?from=/xxx
6. **架構注意**：astro.config.mjs 已改為 `output: 'server'`，所有靜態頁面必須有 `export const prerender = true`
7. API 路由放在 src/pages/api/，需加 `export const prerender = false`
8. **Google Custom Search JSON API 已對新用戶永久關閉**，請勿嘗試申請，改用 SerpApi
9. **靜態頁面的 Google Maps 載入方式**：不能用 `<script src={...}>` 插值，
   必須在 JS IIFE 裡動態建立 script 標籤（見 /travel 說明）
10. **AdvancedMarkerElement 需要 mapId**，且不能同時設 styles（會衝突產生警告）
11. **AdvancedMarkerElement 點擊事件用 `'gmp-click'`** 而非 `'click'`（使用 addEventListener）
12. **搜尋用 AutocompleteSuggestion（即時聯想）+ Place.searchByText（按鈕搜尋）**，
    兩者都需要傳入 locationBias 或 locationRestriction 限制搜尋範圍

---

## 四、Vercel 環境變數清單

| 變數名稱 | 用途 | 備註 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 | 前端可見 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 驗證 | 前端可見 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署 | 前端可見 |
| SERPAPI_KEY | 探索日本搜尋 | 後端專用 |
| PUBLIC_GOOGLE_MAPS_KEY | 旅行地圖 Google Maps | 前端可見 |

---

## 五、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
