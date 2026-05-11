# PROJECT_PROGRESS.md
# The Corner Table — 功能清單與工作進度

> 每次開始新任務前，請先完整閱讀本文件與 PROJECT_ARCHITECTURE.md。

---

## 一、已完成功能

### ✅ 基礎建設
- Astro 主站建立，Tailwind CSS 設定完成
- GitHub Repository 連結（abc19930406/my-home）
- Vercel 部署上線（https://my-home-blond-tau.vercel.app）
- Supabase 資料庫連接（含 RLS 權限設定）
- 管理員登入系統（/login 頁面，Supabase Auth）
- 管理後台（/admin 頁面，需登入才能進入）
- Vercel Deploy Webhook（發布內容後自動觸發重新編譯）

### ✅ 首頁
- 深木奶油色系視覺風格（背景 #2C1E14）
- 資料驅動卡片架構（src/data/links.ts 集中管理）
- 三個卡片分區：知識與創作 / 生活記錄 / 工具
- 知識庫卡片子連結：Obsidian 筆記（https://quartz-five-sigma.vercel.app）
- 「現在狀態」區塊（手動更新）
- 登入後每張卡片出現編輯按鈕，可直接修改標題/描述/連結

### ✅ 短文模組（/posts）
- 列表頁：時間軸排列，顯示標題/天氣/日期/閱讀時間/預覽
- 單篇頁：Markdown 渲染、照片顯示、頁碼、返回連結
- 權限系統：public（所有人）/ friends（登入者）/ private（管理員）
- 日夜切換：白天（陽光海面）/ 夜晚（繁星月光），1.8 秒過渡
- 主題偏好存入 localStorage（key: tcr-theme）
- 玻璃日記本質感（backdrop-filter: blur(12px)）
- 前台管理（登入後直接在 /posts 操作）：
  - ＋ 新增短文按鈕
  - 每篇文章有編輯/刪除按鈕
  - 新增表單：標題、天氣、正文(Markdown)、權限、照片上傳
  - 照片上傳至 Supabase Storage（post_images bucket）
  - 閱讀時間自動計算（每 300 字 1 分鐘）
- 底部低調登入入口（未登入時顯示）

---

## 二、進行中 / 待處理

### ⏳ 待確認
- Webhook 的 `define:vars` 傳入方式（目前用空字串佔位，功能正常但不會觸發重新編譯）
- 短文的「首頁卡片連結」尚未設定（/posts 網址需加進 links.ts）

---

## 三、規劃中功能（尚未開始）

### 靜態內容模組（第二階段）
| 功能 | 說明 | 狀態 |
|------|------|------|
| 語錄收藏 | 喜歡的句子整理 | ❌ 未開始 |
| 讀書筆記 | 書評、摘錄、評分 | ❌ 未開始 |
| 視覺日記 | 照片為主的時間軸 | ❌ 未開始 |
| 年度回顧 | 每年總結頁面 | ❌ 未開始 |
| 作品集 | 作品展示頁 | ❌ 未開始 |
| 書籤收藏 | 常用資源整理 | ❌ 未開始 |

### 動態工具模組（第三階段，需 Supabase）
| 功能 | 說明 | 狀態 |
|------|------|------|
| 記帳系統 | 個人收支、每月概況 | ❌ 未開始 |
| 習慣打卡 | 每日追蹤、進度視覺化 | ❌ 未開始 |
| 語言學習 | 單字、進度、練習記錄 | ❌ 未開始 |
| 旅行地圖 | 去過/想去的地方 | ❌ 未開始 |

---

## 四、已知問題與注意事項

1. **Webhook 觸發問題**：在 /posts 頁面新增/編輯文章後，Vercel 不會自動重新編譯。目前需要手動到 Vercel Dashboard 點 Redeploy，或等下次推送 git 時觸發。
2. **靜態編譯特性**：新增文章後，線上列表頁不會即時更新，需等 Vercel 重新部署後才會出現。
3. **Layout 背景色衝突**：`Layout.astro` 的 body 有全域背景 `#2C1E14`，短文頁面用 `<style is:global>` 覆蓋，日後新增有自訂背景的頁面需注意同樣的問題。

---

## 五、每次開始新任務的標準指令

請在開始任何任務前，對 Antigravity 說：

> 「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」
