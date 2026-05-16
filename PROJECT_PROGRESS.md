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
- Vercel Deploy Webhook 正常運作（測試狀態碼 201 確認）

### ✅ 首頁
- 深木奶油色系視覺風格（背景 #2C1E14）
- 資料驅動卡片架構（src/data/links.ts 集中管理）
- 三個卡片分區：知識與創作 / 生活記錄 / 工具
- 知識庫卡片子連結：Obsidian 筆記（https://quartz-five-sigma.vercel.app）
- 登入後每張卡片出現編輯按鈕，可直接修改標題/描述/連結

### ✅ 現在狀態便條紙（首頁卡片上方）
- 視覺：淡黃色便條紙（#F5EDD0）+ 頂部琥珀色紙膠帶 + 微傾斜 -1.2deg
- 內容四欄：📖 正在讀的書 / 🎵 正在聽的音樂 / 💬 心情 / 🔨 最近在做的事
- 資料來源：Supabase `status` 資料表（固定一筆 id=1）
- 更新方式：登入後進入 /admin，便條紙右上角有編輯按鈕，可直接編輯儲存
- 儲存後即時更新畫面，背景觸發 Webhook 重新部署

### ✅ 短文模組（/posts）標題已改為「日噹」
- 列表頁：時間軸排列，顯示標題/天氣/日期/閱讀時間/預覽
- 單篇頁：Markdown 渲染、照片幻燈片顯示、頁碼、返回連結
- 權限系統：public / friends / private
- 日夜切換：白天（陽光海面）/ 夜晚（繁星月光），1.8 秒過渡
- 主題偏好存入 localStorage（key: tcr-theme）
- 玻璃日記本質感（backdrop-filter: blur(12px)）
- 前台管理（登入後直接在 /posts 操作）：
  - 新增/編輯/刪除，事件委派不重複觸發
  - 多圖上傳（post_images bucket），單篇頁幻燈片顯示
  - 發文後立即更新畫面，背景靜默觸發 Webhook
- 底部登入連結，登入後跳回 /posts
- 手機版響應式已調整
- 段落行高 1.6，段落間距 0.8em

### ✅ 語錄收藏模組（/quotes）
- 路由：/quotes（列表頁，無單篇頁）
- 視覺：牛皮紙格紋背景（#E8D5A8）、書頁卡片（左側邊欄＋右上摺角）
- 「新增語錄」按鈕：紙膠帶風格（半透明金棕、微傾斜 -3deg、左右漸層毛邊）
- 關鍵字搜尋 + 分類篩選（全部、成長、關係、當下、孤獨、自己）
- 管理：新增/編輯/刪除，登入後顯示
- 來源圖示：ti-book / ti-movie / ti-pencil
- 「翻頁」收合搜尋區
- 無日夜切換（已移除）
- 底部低調「管理」登入連結，登入後隱藏
- 已連結首頁卡片（語錄收藏 url 已改為 /quotes）
- 樣式在 src/styles/quotes.css

### ✅ Polaroid 底片日記（/polaroid）
- 路由：/polaroid
- 視覺：深木色底片風格（#1A1410），上下齒孔（14×9px，#0A0806）
- 核心功能：同一日期跨年並排（今年最亮 / 去年次之 / 兩年前最暗）
- 日期導航：左右箭頭切換日期
- 底片格：顯示完整日期（YYYY · M · D）+ 內文
- 輸入框：登入後顯示，支援新增／編輯／刪除
- 刪除前有確認提示
- 本月縱覽：每行一天，有記錄亮起，空白顯示「—」，點擊切換日期
- 底部低調「管理」登入連結，登入後隱藏
- 日期處理用本地時區避免 UTC 偏移
- 已連結首頁卡片（視覺日記 url 已改為 /polaroid）
- 樣式在 src/styles/polaroid.css

### ✅ 記帳系統（/ledger）
- 路由：/ledger
- 權限：私密，未登入者導向 /login?from=/ledger
- 貨幣：NTD
- 收入來源分類：樂驛、豐苒、少觀所、仁愛之家、演講、其他（其他需補充備註）
- 支出分類：固定支出、飲食、交通、娛樂、其他
- 頁面結構：
  - 月份導航（左右切換）
  - 三張指標卡片：本月收入（綠）/ 本月支出（紅）/ 本月結餘（金）
  - 收入來源分布橫條圖（按金額排列）
  - 支出分類分布橫條圖（按金額排列）
  - 本月明細列表（收入綠色正號、支出紅色負號）
  - 新增／編輯／刪除 Modal
- 日期處理用本地時區避免 UTC 偏移
- 已連結首頁卡片（記帳系統 url 已改為 /ledger）
- 樣式在 src/styles/ledger.css

### ✅ 資料庫
- posts 資料表含 image_urls text[] 欄位
- post_images Storage Bucket（PUBLIC）
- quotes 資料表已建立（含 RLS）
- status 資料表已建立（固定一筆 id=1，含 RLS）
- daily 資料表已建立（date UNIQUE，含 RLS）
- transactions 資料表已建立（含 RLS，僅管理員可讀寫）

---

## 二、規劃中功能（尚未開始）

讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡、語言學習、旅行地圖

---

## 三、重要注意事項

1. 新增文章後單篇頁需等 Vercel 重新編譯（約 1 分鐘）才能訪問，正常行為。
2. 有自訂背景的頁面需在頂部加 `<style is:global> html, body { background-color: transparent !important; } </style>`
3. 各頁面 CSS 用 import 在 frontmatter 載入，不放在 `<style>` 標籤
4. `<script define:vars>` 不支援頂層 await，所有非同步邏輯必須包在 `(async () => { ... })()` 內
5. `<script define:vars>` 內不能用 import 語句，Supabase 用 CDN 動態匯入：
   `const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')`
6. define:vars 傳入 supabaseUrl、supabaseAnonKey、webhookUrl
7. .halo-moon 容器需 280x280px 才不會出現方形邊框
8. /admin 頁面的 page-wrapper 預設 display:none，IIFE 確認 session 後顯示
9. 所有日期處理用本地時區，避免 UTC 偏移：
   `const localDate = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\``
10. 私密頁面（如 /ledger）在 IIFE 開頭確認 session，無 session 立即導向 /login?from=/xxx

---

## 四、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
