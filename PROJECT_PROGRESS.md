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
- 「旅行地圖」卡片點擊後展開子選單：
  - 🗺 旅行地圖 → /travel
  - 🇯🇵 日本收藏 → /japan
  - 點擊卡片外部自動收合，展開時有淡入動畫

### ✅ 現在狀態便條紙（首頁卡片上方）
- 淡黃色便條紙 + 頂部琥珀色紙膠帶 + 微傾斜
- 內容四欄：📖 正在讀的書 / 🎵 正在聽的音樂 / 💬 心情 / 🔨 最近在做的事
- 登入後 /admin 頁面可直接編輯儲存

### ✅ 短文模組（/posts）「日噹」
- 列表頁時間軸、單篇 Markdown 渲染、照片幻燈片
- 權限系統 public / friends / private
- 日夜切換主題、前台管理（新增/編輯/刪除）
- 單篇頁改為 SSR（移除 prerender = true）
- 權限控制在 client side JS 處理：
  - public：所有人可看
  - friends / private：需登入，否則導向 /login?from=/posts/[id]
- posts 資料表 RLS 已開放 SELECT 給所有人（內容保護靠前端）

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
- **日幣記帳功能**：
  - 即時匯率：自動抓取 JPY→TWD 匯率（多重 API 備援）
  - 所有 API 失敗時顯示手動輸入匯率框（預設 0.22）
  - 新增支出時可切換幣別（TWD / JPY）
  - 輸入日幣後即時顯示換算台幣金額
  - 儲存時同時記錄：台幣金額（amount）、日幣原始金額（amount_jpy）、當下匯率（exchange_rate）
  - 明細列表：JPY 記錄顯示 ¥xxx (NT$ xxx)
  - 本月日幣支出統計區塊（有日幣記錄時才顯示）

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
- 行程切換列（多個旅行可切換）+ 編輯行程功能
- 景點類型自訂管理系統（兩層）：
  - 主類型（spot_types）：名稱 + emoji，可新增/編輯/刪除
  - 子類型（spot_subtypes）：隸屬於主類型，可新增/刪除
  - 登入後篩選列旁顯示「⚙️ 管理類型」按鈕
- 雙層篩選列：
  - 第一列：主類型篩選（動態讀取 spot_types）
  - 第二列：子類型篩選（點選主類型後動態出現）
- 景點搜尋框（即時過濾 name + address + notes）
- Google Maps 動態載入（IIFE + document.createElement）
- 搜尋功能（Places API New）：
  - 打字即時聯想（AutocompleteSuggestion + locationBias）
  - 按鈕搜尋多點顯示（Place.searchByText + locationRestriction）
  - 搜尋結果下拉選單，點選後地圖置中
- AdvancedMarkerElement 景點標記（顯示類型/子類型 emoji）
- 點擊景點 Marker 顯示 InfoWindow：
  - 景點名稱、子類型標籤、地址、開放時間、價格、備註
  - 「🗺 Google Maps」按鈕（優先用 place_id，備用名稱+地址）
  - 「✏️ 編輯」按鈕（登入後顯示）
- Modal 捲動鎖定（overflow: hidden）+ 內部獨立捲動
- 新增/編輯/刪除景點（儲存 place_id）
- 新增/編輯/刪除行程
- Supabase 資料庫：trips、spots、spot_types、spot_subtypes 資料表 + RLS
- Supabase Storage：travel_images bucket
- 使用 Places API (New)，不依賴舊版 Places API

**已啟用的 Google API（my-home 專案）：**
- Maps JavaScript API ✅
- Places API (New) ✅
- Geocoding API ✅
- API Key 名稱：Travel Map
- Vercel 環境變數：PUBLIC_GOOGLE_MAPS_KEY

---

## 二、規劃中功能（尚未開始）

- 讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡

---

## 三、重要注意事項

1. 新增文章後單篇頁為 SSR，即時可訪問（不需等待 Vercel 重新編譯）
2. `<script define:vars>` 不支援頂層 await，所有非同步邏輯必須包在 `(async () => { ... })()` 內
3. `<script define:vars>` 內不能用 import，Supabase 用 CDN 動態匯入
4. 所有日期處理用本地時區避免 UTC 偏移
5. 私密頁面在 IIFE 開頭確認 session，無 session 立即導向 /login?from=/xxx
6. **架構注意**：astro.config.mjs 已改為 `output: 'server'`，所有靜態頁面必須有 `export const prerender = true`
7. API 路由放在 src/pages/api/，需加 `export const prerender = false`
8. **Google Custom Search JSON API 已對新用戶永久關閉**，請勿嘗試申請，改用 SerpApi
9. **靜態頁面的 Google Maps 載入方式**：不能用 `<script src={...}>` 插值，
   必須在 JS IIFE 裡動態建立 script 標籤
10. **AdvancedMarkerElement 需要 mapId**，且不能同時設 styles（會衝突產生警告）
11. **AdvancedMarkerElement 點擊事件用 `'gmp-click'`** 而非 `'click'`
12. **搜尋用 AutocompleteSuggestion（即時聯想）+ Place.searchByText（按鈕搜尋）**，
    兩者都需要傳入 locationBias 或 locationRestriction 限制搜尋範圍
13. **首頁卡片有子選單時**，卡片外層不能是 `<a>` 標籤，需改為 `<div>` + JS 控制跳轉
14. **spot_types / spot_subtypes**：spots 資料表用 spot_type_id 和 spot_subtype_id 關聯
15. **spots.place_id**：從 Places API New 搜尋加入的景點會儲存 place_id
16. **posts 單篇頁為 SSR**：已移除 prerender = true，權限控制在 client side JS
17. **posts RLS**：已開放 SELECT 給所有人，private/friends 內容保護靠前端 JS
18. **記帳日幣功能**：匯率用多重 API 備援，本地開發環境可能無法連線，部署後正常

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
| japan_categories | 日本收藏分類（兩層） |
| japan_items | 日本收藏品項 |
| trips | 旅行行程 |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） |
| spot_types | 景點主類型 |
| spot_subtypes | 景點子類型（關聯 spot_types） |

---

## 五、Vercel 環境變數清單

| 變數名稱 | 用途 | 備註 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 | 前端可見 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 驗證 | 前端可見 |
| PUBLIC_VERCEL_DEPLOY_HOOK | 觸發重新部署 | 前端可見 |
| SERPAPI_KEY | 探索日本搜尋 | 後端專用 |
| PUBLIC_GOOGLE_MAPS_KEY | 旅行地圖 Google Maps | 前端可見 |

---

## 六、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md 和 PROJECT_PROGRESS.md，這兩個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
