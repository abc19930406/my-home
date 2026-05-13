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
- 「現在狀態」區塊（手動更新，目前內容空白待填）
- 登入後每張卡片出現編輯按鈕，可直接修改標題/描述/連結
- 短文卡片已連結到 /posts

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

### ✅ 資料庫
- posts 資料表含 image_urls text[] 欄位
- post_images Storage Bucket（PUBLIC）

### ✅ 語錄收藏模組（/quotes）
- [x] 牛皮紙書頁摺角設計，含 SVG 皺摺濾鏡效果
- [x] 列表頁：SSG 渲染公開語錄，登入後補齊私密內容
- [x] 「翻頁」收合搜尋區，支援關鍵字與標籤即時篩選
- [x] 琥珀金紙膠帶風格管理介面（新增/編輯/刪除）
- [x] 整合至首頁卡片連結
- [x] 行高 1.7，段落間距 0.4rem

---

## 二、下一個任務：讀書筆記模組

## 三、規劃中功能

讀書筆記、視覺日記、年度回顧、作品集、書籤收藏、記帳系統、習慣打卡、語言學習、旅行地圖 — 均未開始。

---

## 四、重要注意事項

1. 新增文章後單篇頁需等 Vercel 重新編譯（約 1 分鐘）才能訪問，正常行為。
2. 有自訂背景的頁面需在頂部加 <style is:global> html, body { background-color: transparent !important; } </style>
3. posts.css 用 import 在 frontmatter 載入，不放在 <style> 標籤
4. define:vars 傳入 Webhook URL，script 拆成兩段
5. .halo-moon 容器需 280x280px 才不會出現方形邊框
6. Build Debug 訊息已移除

---

## 五、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
