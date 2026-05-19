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
- 磚磚片式三欄 Grid 排列
- 照片依原始比例顯示，點擊放大 Lightbox
- **探索日本搜尋功能**（完整運作）：
  - 後端 Serverless Function：`src/pages/api/explore.ts`
  - 搜尋引擎：**SerpApi**（Google Shopping 模式，每月 100 次免費）
  - 搜尋結果顯示：商品圖片、日文名稱、價格、來源
  - 「收藏」按鈕：直接加入 japan_items，標記「網友推薦」
  - 快速標籤：防曬推薦、京都景點、北海道零食、藥妝必買
  - SERPAPI_KEY 安全保存於 Vercel 後端，不暴露前端
- 「網友推薦」分類篩選標籤
- 底部登入連結

**重要備注 — Google Custom Search JSON API：**
此 API 已於 2025 年對新用戶永久關閉，無法申請新帳號使用。
改用 SerpApi 替代。

### ✅ 資料庫
- posts、quotes、status、daily、transactions 資料表
- japan_categories、japan_items 資料表（含 RLS）
- japan_images Storage Bucket（PUBLIC）

---

## 二、規劃中功能（尚未開始）

讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡、語言學習

---

## 三、重要注意事項

1. 新增文章後單篇頁需等 Vercel 重新編譯（約 1 分鐘）才能訪問
2. 有自訂背景的頁面需在頂部加 `<style is:global> html, body { background-color: transparent !important; } </style>`
3. 各頁面 CSS 用 import 在 frontmatter 載入
4. `<script define:vars>` 不支援頂層 await，所有非同步邏輯必須包在 `(async () => { ... })()` 內
5. `<script define:vars>` 內不能用 import，Supabase 用 CDN 動態匯入
6. 所有日期處理用本地時區避免 UTC 偏移
7. 私密頁面在 IIFE 開頭確認 session，無 session 立即導向 /login?from=/xxx
8. /admin 頁面的 page-wrapper 預設 display:none，IIFE 確認 session 後顯示
9. **架構注意**：astro.config.mjs 已改為 `output: 'server'`，所有靜態頁面必須有 `export const prerender = true`
10. API 路由放在 src/pages/api/，需加 `export const prerender = false`
11. **Google Custom Search JSON API 已對新用戶關閉**，請勿嘗試申請，改用 SerpApi

---

## 四、Vercel 環境變數清單

| 變數名稱 | 用途 | 備註 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 | 前端可見 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 驗證 | 前端可見 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署 | 前端可見 |
| SERPAPI_KEY | 探索日本搜尋 | 後端專用，不可加 PUBLIC_ |

---

## 五、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
