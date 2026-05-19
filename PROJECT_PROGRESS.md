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
- 知識庫卡片子連結：Obsidian 筆記
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
- 新增/編輯/刪除 Modal

### ✅ 日本收藏（/japan）
- 晨霧富士淡藍灰風格（#E8EEF5 + 格紋）
- 兩層分類系統（主分類 + 子分類），登入後前台管理
- 磚磚片式三欄 Grid 排列
- 照片依原始比例顯示（height: auto，min 120px，max 400px）
- 點擊照片放大 Lightbox（ESC / 點背景關閉）
- 「探索日本」搜尋區塊已建立（UI 完整）
- 底部登入連結
- 首頁「旅行地圖」卡片已連結至 /japan

### ⚠️ 日本收藏 — 探索日本搜尋（待修復）
**功能架構已完整，但 Google Custom Search API 尚未正常運作。**

已完成：
- Vercel Serverless Function：`src/pages/api/explore.ts`（POST，prerender: false）
- 後端保護 API Key（GOOGLE_SEARCH_KEY、GOOGLE_SEARCH_CX）
- 前端搜尋 UI：搜尋框、快速標籤、結果卡片、「＋ 加入收藏」按鈕
- 「網友推薦」分類標籤篩選
- Vercel 環境變數已設定：GOOGLE_SEARCH_KEY、GOOGLE_SEARCH_CX

待修復問題：
- Google Custom Search API 回傳 403 PERMISSION_DENIED
- API Key 在 my-home 專案下，Custom Search API 已啟用，帳單帳戶正常
- 配額正常（10,000/天，已用 22 次）
- 懷疑是 API 啟用後需要幾小時才生效，隔天再試

程式化搜尋引擎已設定網站：
- *.cosme.net/*
- *.ptt.cc/*
- *.dcard.tw/*
- *.pixnet.net/*
- *.mobile01.com/*
- travel.rakuten.com.tw/*
- matome.naver.jp/*

### ✅ 資料庫
- posts、quotes、status、daily、transactions、japan_categories、japan_items 資料表均已建立
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

---

## 四、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
