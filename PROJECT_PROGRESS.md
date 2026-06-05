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
- **架構升級**：Astro output 改為 `server` 模式 + `@astrojs/vercel` 適配器
- **PWA**：manifest.json 設定，可從 Safari 加入主畫面（已移除 Service Worker）

### ✅ 首頁
- 深木奶油色系視覺風格（背景 #2C1E14）
- 資料驅動卡片架構（src/data/links.ts 集中管理）
- 三個卡片分區：知識與創作 / 生活記錄 / 工具
- 登入後每張卡片出現編輯按鈕
- 「旅行地圖」卡片點擊後展開子選單（/travel 和 /japan）

### ✅ 現在狀態便條紙（首頁卡片上方）
- 淡黃色便條紙 + 頂部琥珀色紙膠帶 + 微傾斜
- 內容四欄：📖 正在讀的書 / 🎵 正在聽的音樂 / 💬 心情 / 🔨 最近在做的事
- 登入後 /admin 頁面可直接編輯儲存

### ✅ 短文模組（/posts）「日噹」
- 列表頁時間軸、單篇 Markdown 渲染、照片幻燈片
- 權限系統 public / friends / private
- 日夜切換主題、前台管理（新增/編輯/刪除）
- 單篇頁改為 SSR，權限控制在 client side JS
- 右上角登入/登出按鈕

### ✅ 語錄收藏（/quotes）
- 牛皮紙格紋背景、書頁卡片
- 新增語錄按鈕：紙膠帶風格（微傾斜 -3deg）
- 搜尋 + 分類篩選、前台管理
- 右上角登入/登出按鈕

### ✅ Polaroid 底片日記（/polaroid）
- 深木色底片風格 + 上下齒孔
- 同一日期跨年並排（今年最亮、去年次之、兩年前最暗）
- 日期導航、本月縱覽、新增/編輯/刪除
- 右上角登入/登出按鈕

### ✅ 記帳系統（/ledger）
- 私密頁面，未登入導向 /login
- 月份導航、三張指標卡片、橫條圖、明細列表
- 右上角「⚙️ 管理類別」+ 登出按鈕
- **自訂類別管理**：income_categories、expense_categories 動態管理
- **橫條圖點擊顯示明細**：所有分類都可點擊查看該月明細
- **日幣記帳功能**：即時匯率（後端 API /api/exchange-rate）、日幣換算

### ✅ 日本收藏（/japan）— 完整上線
- 晨霧富士淡藍灰風格（#E8EEF5 + 格紋）
- 兩層分類系統（主分類 + 子分類）
- 收藏品搜尋框（即時過濾 name + note）
- 探索日本搜尋功能（SerpApi）
- **願望清單功能**：三種登入方式、白名單機制、管理者/朋友功能
- **「❤️ 我想買」雙層篩選**：點選後動態出現子分類篩選列
- **數量選擇功能**（完整上線）：
  - 已勾選商品旁顯示「－ N ＋」數量調整器
  - 管理者數量存於 japan_items.owner_quantity
  - 朋友數量存於 wishlist_items.quantity（需 UPDATE RLS policy）
  - 「❤️ N 人想買」彈出視窗顯示每人數量 + 合計
- 右上角登入/登出按鈕

### ✅ 旅行地圖（/travel）— 完整上線
- 日系清新白底暖木色系視覺風格（#FDFCF8）
- 行程切換列 + 編輯行程功能
- 景點類型自訂管理（兩層：主類型 + 子類型）
- 雙層篩選列 + 景點搜尋框
- Google Maps 動態載入（Places API New）
- 搜尋功能：即時聯想 + 按鈕搜尋（限制在地圖視野內）
- 點擊景點 Marker 顯示 InfoWindow
- 景點備註網址自動轉為超連結
- **每日行程功能**（完整上線）：
  - 「🗺 地圖模式」/「📅 行程模式」切換
  - 天數管理：新增/刪除/上下排序
  - 從想去清單選擇景點（含搜尋框）
  - 景點排序、刪除、點擊顯示詳情
  - 地圖連動：數字 Marker + 藍色虛線
  - 行程切換自動更新天數列表
- Supabase：trips、spots、spot_types、spot_subtypes、trip_days、day_spots
- 右上角登入/登出按鈕

---

## 二、規劃中功能（尚未開始）

- 讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡
- 旅行地圖每日行程：升級為 Google Maps Directions API 真實路線

---

## 三、重要注意事項

1. 單篇頁為 SSR，即時可訪問
2. `<script define:vars>` 不支援頂層 await，包在 `(async () => { ... })()` 內
3. **Supabase CDN 載入**：Layout.astro 用 `<script is:inline>` 動態注入，各頁面用 `window.addEventListener('supabase-ready', ...)` 等待
4. **astro.config.mjs** 有 Vite plugin 移除所有 modulepreload 標籤
5. **PWA**：已移除 Service Worker，Layout.astro 有主動 unregister 舊 SW 的程式碼
6. **Google Maps**：必須在 JS IIFE 裡動態建立 script 標籤載入
7. **AdvancedMarkerElement**：需要 mapId，點擊事件用 'gmp-click'，需要 gmpClickable: true
8. **Places API New**：AutocompleteSuggestion（即時聯想）+ Place.searchByText（按鈕搜尋）
9. **日本收藏多角色登入**：
   - 白名單 email 比對用 ilike（大小寫不敏感）
   - Google OAuth 同意畫面需設為「實際運作中」
   - 朋友需用 Safari 或 Chrome，不能用 App 內建瀏覽器
10. **記帳匯率**：後端 API /api/exchange-rate，多重備援
11. **trip_days/day_spots**：id 都是 uuid
12. **wishlist_items RLS**：需要 SELECT、INSERT、UPDATE、DELETE 四個 policy
    - UPDATE policy：`auth.uid() = user_id`（朋友才能更新自己的數量）

---

## 四、Supabase 資料表清單

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
| allowed_users | 日本收藏白名單 |
| wishlist_items | 朋友/家人願望清單（含 quantity） |
| trips | 旅行行程 |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） |
| spot_types | 景點主類型 |
| spot_subtypes | 景點子類型 |
| trip_days | 每日行程（關聯 trips） |
| day_spots | 每天景點安排（關聯 trip_days + spots） |

---

## 五、Vercel 環境變數清單

| 變數名稱 | 用途 | 備註 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 | 前端可見 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 驗證 | 前端可見 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署 | 前端可見 |
| SERPAPI_KEY | 探索日本搜尋 | 後端專用 |
| PUBLIC_GOOGLE_MAPS_KEY | 旅行地圖 Google Maps | 前端可見 |
| PUBLIC_ADMIN_EMAIL | 管理者 email 判斷 | 前端可見 |

---

## 六、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
