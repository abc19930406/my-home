# PROJECT_ARCHITECTURE.md
# The Corner Table — 專案架構說明

> 每次開始新任務前，請先完整閱讀本文件、PROJECT_ARCHITECTURE_V2.md 與 PROJECT_PROGRESS.md。
> PROJECT_ARCHITECTURE_V2.md 為 /trip 整合頁面的詳細功能規劃，本文件為全站通用架構規則。

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
│   │   ├── trip.astro           # 🆕 整合頁面（行程+收藏+AI），Supabase 單一入口
│   │   └── api/
│   │       ├── explore.ts       # 探索日本 Serverless（prerender = false）
│   │       ├── exchange-rate.ts # 匯率 API（prerender = false）
│   │       ├── trigger-deploy.ts # 觸發重新部署（prerender = false，驗證管理員後代呼叫 Deploy Hook）
│   │       └── ai-assistant.ts  # AI 助手唯讀查詢 + 寫入工具（prerender = false，V2 階段 7-8）
│   ├── _archived/                # 已封存、不再參與路由（V2 階段 9，不得修改或復用）
│   │   ├── japan.astro          # 舊日本收藏頁，原網址已 301 導向 /trip
│   │   └── travel.astro         # 舊旅行地圖頁，原網址已 301 導向 /trip
│   ├── components/
│   │   ├── TripPlanner.astro    # 行程地圖/每日行程元件（原從 travel.astro 搬移，被 trip.astro 引用）
│   │   ├── JapanCollection.astro # 日本收藏元件（原從 japan.astro 搬移，被 trip.astro 引用）
│   │   └── AiAssistant.astro    # AI 助手對話 UI（被 trip.astro 引用，V2 階段 7）
│   ├── layouts/
│   │   └── Layout.astro         # 共用 Layout（含 Supabase CDN 注入）
│   ├── styles/
│   │   ├── japan.css            # .japan-modal-overlay 等 japan- 前綴 class
│   │   └── travel.css           # .travel-modal-overlay 等 travel- 前綴 class
│   └── data/
│       └── links.ts             # 首頁卡片資料
├── astro.config.mjs             # 含 Vite plugin 移除 modulepreload + optimizeDeps exclude、/japan+/travel redirects
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

### Supabase 瀏覽器端載入方式（2026-07-16 正式改寫，取代舊版 CDN 動態注入規則）

走 npm 匯入，不再使用 CDN 動態注入（V2 階段 9 核心任務，四波遷移 + 浸泡期已滿確認穩定）。

- `src/lib/supabase-browser.js` 的 `getSupabaseBrowserClient()` 為單例入口：
  ```js
  import { createClient } from '@supabase/supabase-js';

  let client = null;
  export function getSupabaseBrowserClient() {
    if (!client) {
      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
      const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
      client = createClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
  }
  ```
- 各頁面/元件一律 `import { getSupabaseBrowserClient } from '.../lib/supabase-browser.js'` 取得 client，**不得**自行 `createClient()`
- **版本鎖定確切版號** `@supabase/supabase-js@2.110.2`（`package.json`/`package-lock.json`，2026-07-11 由 CDN 浮動版號沿用至此，禁止浮動）：
  - 曾因完全未鎖版號，CDN 抓取最新版時，OAuth 流程觸發 SDK 內部延遲載入子模組路徑錯誤解析，導致大量 404
  - 升版視同依賴變更（安全紅線），須經使用者同意並於升版後實測登入流程
- 在 `/trip` 頁面（多元件共存），**不適用上述各自呼叫 `getSupabaseBrowserClient()` 的寫法**，請見下方「/trip 頁面 Supabase 單一入口架構」專章

### Script 寫法規則
- `<script define:vars={{ var1, var2 }}>` 用來把 frontmatter 變數傳入客戶端
- `define:vars` 內**不能**用 import 語法
- 必須用 `(async () => { ... })()` IIFE 包住所有非同步邏輯
- ⚠️ **重要**：`is:inline` 與 `define:vars` 的 `<script>` **禁用 TypeScript 語法**——這類 script 不經過 Vite 打包器，型別標註（`:Type`）、`as Type` 斷言會直接送進瀏覽器，導致執行期語法錯誤（不是 build 階段就會擋下來，容易漏測）。一般 `<script>`（非 `is:inline`、非 `define:vars`）會經 Vite/esbuild 打包，**可以**使用 TS 語法，型別標註與 `as` 斷言皆合法，專案內既有大量此類寫法且建置與執行皆正常（2026-07-11 修正此條，原本的全面禁用描述與實際情況矛盾）

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

### 日期處理
- 一律用本地時區，避免 UTC 偏移

### Modal 捲動鎖定
- 開啟：`document.body.classList.add('modal-open')`
- 關閉：`document.body.classList.remove('modal-open')`
- CSS：`body.modal-open { overflow: hidden; }`（不加 position: fixed）
- ⚠️ **每個 Modal 通常有多種關閉路徑**（關閉按鈕、背景點擊、ESC 鍵），新增 Modal 時務必確認**每一種**路徑都有執行 `classList.remove('modal-open')`。曾發生背景點擊監聽與 ESC 鍵監聽各自獨立維護一份 Modal 清單，新增 Modal 時只更新了其中一處，導致漏網的關閉路徑無法清除 `modal-open`，頁面卡死無法捲動（詳見 PROJECT_PROGRESS.md「衝突熱點稽核」記錄）

### 多元件共存的 CSS/ID 隔離規則（重要，/trip 頁面適用）
- 當兩個元件（如 TripPlanner.astro 與 JapanCollection.astro）共存於同一頁面時，**務必為各自的 Modal/Toast 等 UI 元素加上獨立前綴**（如 `japan-`、`travel-`），避免 `getElementById` 或 CSS class 選擇器互相干擾
- 案例：`japan.css` 與 `travel.css` 都定義了 `.modal-overlay`，但 display 屬性設定不同（一個用 `none`、一個用 `flex` 預設+opacity 切換），同時載入時互相覆蓋導致 Modal 顯示異常。已拆分為 `.japan-modal-overlay` 與 `.travel-modal-overlay` 兩個獨立 class
- z-index 衝突：Google Maps 內部元件 z-index 可能高達百萬，若與其他 Modal 共存，建議用 `.map-wrapper { isolation: isolate; position: relative; z-index: 0 }` 隔離其 stacking context，而非搬移 DOM 結構（搬移容易產生新的截斷/定位問題）

### 私密頁面保護
```js
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = '/login?from=/page-name';
  return;
}
```

### 短文（posts）visibility 權限架構（2026-07-11 安全修復）
- **原則**：非公開短文的內容,必須在**資料庫層(RLS)**與**頁面層(SSR/靜態 HTML)**都只對有權限者可見,不能只靠前端 JS 判斷顯示與否——舊機制曾把全文渲染進 HTML、只用 `display: none` 隱藏,任何人檢視原始碼即可讀取
- **RLS 層**：`posts` 表的 SELECT 政策為 `visibility = 'public' OR is_admin() OR (visibility = 'friends' AND is_friend())`;INSERT/UPDATE/DELETE 一律僅 `is_admin()`
  - `public.is_admin()`、`public.is_friend()` 為 `SECURITY DEFINER` 輔助函式(email 寫死管理員本人比對;`is_friend()` 查 `allowed_users` 白名單,不分大小寫)
  - 用 `SECURITY DEFINER` 是必要的:若在 policy 內直接子查詢 `allowed_users`,會受該表自身 RLS 限制導致查不到資料
- **頁面層**：
  - `posts/index.astro`(列表,prerender=true):build time 只抓 `visibility='public'` 烘進靜態 HTML;登入後由 client-side `refreshPostsList()` 重新查詢,RLS 自動依身分過濾,無須額外程式碼判斷(此函式 2026-07-11 由 `fetchPrivatePosts()` 重新設計並更名,細節見下方「登入後列表整體重抓+重繪」)
  - `posts/[id].astro`(單篇,SSR):一律以 anon key 查詢,RLS 生效後匿名 SSR 只查得到 public 文章。查到 → 照常渲染(SSR HTML 內含完整內容,public 文章維持既有 SEO 行為);**查不到** → 不再猜測是「不存在」還是「無權限」,一律渲染不含任何文章內容的外殼(「需要登入」提示 + 登入按鈕),由前端 client script 以使用者自己的 session 重新查詢,RLS 自動判權,查得到才動態渲染全文(Markdown 轉換改用 CDN 版 `marked@18.0.3`,鎖定確切版本,與 npm 端一致)
  - **禁止**再出現「先把全文渲染進 HTML、只用 `display:none` 隱藏、前端 JS 事後檢查」這種機制——資料一旦進了 HTTP 回應就等於外洩,前端顯示與否無法補救
- **已知限制**：RLS 對 UPDATE/DELETE 若擋下操作,不會回傳錯誤,只會實際變更 0 筆資料;`posts/index.astro` 目前的編輯/刪除前端邏輯只檢查 `error` 是否為空,未檢查實際受影響筆數,非管理員操作被 RLS 正確擋下時,前端仍會誤顯示「已更新/已刪除」(重新整理後會恢復原狀,資料庫本身未受影響,不是安全漏洞,是前端提示不準確,留待後續清理)

### 記帳(transactions)與白名單(allowed_users)權限架構(2026-07-11 安全修復)
- **決策前提**：記帳系統確認為管理員個人專用,無家人/朋友共用需求(2026-07-11 與使用者確認)。若未來需要共用記帳,現行「僅 `is_admin()`」設計需重新評估,改為以 `user_id` 為單位的擁有權模型(schema 異動,不只是 RLS 調整)
- **RLS 層**：
  - `transactions`:SELECT/INSERT/UPDATE/DELETE 一律僅 `public.is_admin()`(重用任務 B 已建立的函式,未重新建立)
  - `allowed_users`:SELECT 為 `is_admin() OR (auth.jwt()->>'email' ilike email)`——管理員可讀全表,非管理員只能讀到白名單中自己那一列;INSERT/UPDATE/DELETE 一律僅 `is_admin()`。此設計刻意配合既有前端查詢模式(管理員 `select('*')` 撈全表建快取,朋友分支 `.ilike('email', 自己信箱).single()` 只查自己),前端程式碼未變動
- **頁面層**：`ledger.astro` 原本只檢查 `session` 是否存在(任何登入帳號皆可進入),已比照 `JapanCollection.astro` 的 `isAdminUser` 判斷模式,新增 `session.user.email !== adminEmail` 比對;非管理員(含白名單朋友/家人帳號)一律 `alert` 提示「僅管理員可使用記帳系統」後導回首頁(不是導去登入頁,因為問題不是沒登入)
- **驗證方式**：頁面層保護可直接瀏覽 `/ledger` 測試;資料庫層保護需繞過頁面、以目標帳號的 session 直接呼叫 `supabase.from('transactions').select('*')` 確認回傳空陣列,才能排除「頁面擋得住但 API 仍開放」的情況

### 日本收藏(japan_items / japan_categories)寫入權限架構(2026-07-11 安全修復)
- **原則**：收藏頁的 SELECT 為刻意保留的公開展示設計(任何人瀏覽合理),**不受本次修復影響**;問題只在寫入——前端所有新增/編輯/刪除功能設計上都只給管理員用,但資料庫端原本未真正把關
- **RLS 層**：`japan_items`、`japan_categories` 的 SELECT 政策維持不動;INSERT/UPDATE/DELETE 一律改為僅 `public.is_admin()`(重用任務 B 已建立的函式)
- **⚠️ 重要教訓(2026-07-11 執行前稽核發現)**：動工前逐一比對兩張表所有 `.insert()/.update()/.delete()` 呼叫點是否都有 `isAdminUser` 判斷守護,結果發現 `japan_categories` 4 個寫入點中 1 個(新增主分類)、`japan_items` 5 個寫入點中 4 個(新增/編輯品項、切換願望清單、刪除品項),實際上**只靠 CSS `admin-only { display:none }` 隱藏按鈕**,對應的事件處理程式碼裡完全沒有 `isAdminUser` 檢查——因為這些操作是透過**委派事件監聽器**（綁在整個卡片容器上、無條件執行）處理，任何人只要在瀏覽器 Console 對隱藏元素呼叫 `.click()`（不需要先讓它可見）就能觸發請求。**「前端隱藏」與「資料庫規則」是兩件完全獨立的事，看得到 admin-only 的 UI 判斷不代表寫入請求真的被擋住，只有 RLS 才是唯一可靠的防線。新增任何寫入功能時，一律先確認 RLS 是否已限制，不能只靠前端判斷或按鈕隱藏。**（完整比對記錄見 PROJECT_PROGRESS.md「任務 G」）
- **驗證方式**：管理員寫入正常 + 朋友帳號繞過頁面直接呼叫 API 應被拒絕；DELETE 操作務必用 Table Editor 確認資料實際未變動（PostgREST 對 RLS 擋下的 DELETE 仍回傳 `200/204 success:true`，不能只看回應）

### 語錄(quotes)三級保護架構(2026-07-11 安全修復)
- **原則**：與 posts 表的 visibility 保護完全同等級,重用 `is_admin()`/`is_friend()`
- **RLS 層**：SELECT 為 `visibility='public' OR is_admin() OR (visibility='friends' AND is_friend())`;INSERT/UPDATE/DELETE 一律僅 `is_admin()`
- **前端層(quotes/index.astro)**：
  - 渲染時原本把 `isAdmin` 寫死 `true`,只要有 session(含朋友帳號)就顯示編輯/刪除按鈕；已改為 `session.user.email === adminEmail` 的真正比對,`adminEmail` 透過 `define:vars` 注入(比照其他頁面既有模式)。此判斷目前位於 `refreshQuotesList()`(2026-07-11 由 `fetchPrivateQuotes()` 重新設計並更名,細節見下方)
  - update/delete 呼叫原本只檢查 `error` 是否為空,補上 `.select()` 檢查受影響筆數,0 筆時明確提示「沒有權限或資料不存在」，insert 呼叫本身已有 `.select().single()`，RLS 擋下 INSERT 會直接拋錯不會靜默，不需額外處理
- **已知但本次不修的相關問題**：`checkAdmin()` 對「有 session 即視為管理員」的判斷是全站共用的既有模式（其他頁面如 posts/index.astro 也有相同寫法），會讓朋友帳號在**SSR 渲染的 public 語錄卡片**上也看到編輯/刪除按鈕（這些卡片的 `.admin-only` class 是編譯時就寫死的，不受 `refreshQuotesList` 的 isAdmin 修正影響）；RLS 已擋下實際寫入，屬 UI 顯示不精確而非安全漏洞，留待未來一併處理

### posts/quotes 登入後列表：整體重抓 + 依 created_at 重繪(2026-07-11 確立的架構模式)
- **適用情境**：頁面採「build time 只烘 public 內容 + 登入後 client-side 補抓 private/friends 內容」架構時(目前 posts、quotes 皆是),補抓邏輯**不可**用「檢查是否已存在於 DOM → 用 `insertAdjacentHTML('afterbegin', ...)` 插入單筆」的寫法——這會導致 private/friends 內容一律排在所有 public 內容之前(不管實際 `created_at` 早晚)，且逐筆插入還會讓 private 內容彼此的順序反過來
- **正確做法**：登入後一次性重新查詢「全部」內容(不分 public/friends/private,交由 RLS 過濾)，依 `created_at` 整體排序後**整個容器重繪**(`container.innerHTML = ...`)，不要用局部插入。函式命名慣例：`refreshXxxList()`(取代舊的 `fetchPrivateXxx()` 命名，因為現在抓的不再只是「private 的部分」)
- **防競態**：`onAuthStateChange` 可能短時間連續觸發多次，每次呼叫遞增一個 `seq` 序號，非同步查詢返回後比對序號是否仍是最新，不是則捨棄該次結果，避免較舊的回應覆蓋較新的畫面(沿用 trip.astro 的 `authUIUpdateSeq` 手法，見下方「/trip 頁面 Supabase 單一入口架構」)
- **若卡片內含依陣列位置計算的欄位**(例如 quotes 的頁碼 `page-num`)：改為整體重繪後才有正確的陣列位置可用，插入式寫法只能顯示固定值(例如寫死 `"new"`)

---

## /trip 頁面 Supabase 單一入口架構（重要）

`/trip` 頁面由 `trip.astro`（容器）+ `TripPlanner.astro`（行程元件）+ `JapanCollection.astro`（收藏元件）組成，三者共存於同一頁面。**Supabase 的初始化、登入狀態管理採單一入口模式**，避免重複初始化造成的各種問題（multiple instances 警告、OAuth 流程 404、Session 解析錯誤、Race Condition 導致 UI 狀態錯誤）。

### 架構原則

1. **trip.astro 是唯一的 auth 初始化入口**：
   - 呼叫 `getSupabaseBrowserClient()` 取得單例 client（存於 `window.sharedSupabase`，與子元件各自呼叫 `getSupabaseBrowserClient()` 拿到的是同一個實例，因為該函式內部本身就是單例）
   - 唯一呼叫 `supabase.auth.getSession()` 取得初始 session
   - 唯一綁定 `supabase.auth.onAuthStateChange()`

2. **狀態廣播機制**：
   - trip.astro 在每次取得/變更 session 狀態時，透過 `window.dispatchEvent(new CustomEvent('auth-state-changed', { detail: { event, session } }))` 廣播給子元件
   - 同時將最新狀態寫入 `window.__latestAuthState = { event, session }`（全域快照），供子元件在綁定監聽器時補跑檢查，避免 Race Condition（見下方）

3. **子元件（TripPlanner.astro / JapanCollection.astro）規則**：
   - **絕不**自行呼叫 `supabase.auth.getSession()` 或 `onAuthStateChange()`（auth 狀態只能來自 trip.astro 的廣播，不得另外查詢）
   - 若需要 supabase client 做資料讀寫（非 auth 相關），直接 `import { getSupabaseBrowserClient } from '../lib/supabase-browser.js'` 呼叫取得，不需要輪詢等待（npm 匯入下該模組保證同步可用，這是 CDN 時代才需要 `waitForSharedSupabase()` 輪詢的舊限制，已隨 npm 遷移移除）
   - UI 狀態（登入/登出按鈕等）一律透過監聽 `auth-state-changed` 事件更新，呼叫各自的 `updateAuthUI(session)` 函式

### Race Condition 防護（重要教訓）

**問題**：子元件中若有耗時的非同步操作（例如 TripPlanner.astro 需要 `await googleMapsPromise` 等待 Google Maps 腳本載入，約 300-800ms），而事件監聽器綁定寫在這段 await 之後，就會發生：
- trip.astro 的 `getSession()` 通常 50ms 內完成並廣播 `INITIAL_SESSION` 事件
- 子元件還卡在 `await googleMapsPromise`，根本還沒執行到 `addEventListener`
- 等子元件終於綁定監聽器時，廣播早已發生過，永久錯過 → UI 卡在預設的未初始化狀態（例如登入按鈕永遠是 `display: none`）

**解法（雙保險）**：
1. 事件監聽器綁定**必須提前到 `<script>` 最開頭**，在任何 `await`（包含 Google Maps 載入）之前
2. 綁定完成後，立即檢查 `window.__latestAuthState` 快照，若已存在（代表已經錯過廣播），手動補跑一次 UI 更新：
   ```js
   window.addEventListener('auth-state-changed', async (e) => {
     const { event, session } = e.detail;
     updateAuthUI(session);
   });
   // 補跑快照檢查
   if (window.__latestAuthState) {
     const { session } = window.__latestAuthState;
     updateAuthUI(session);
   }
   ```

### 已知陷阱

- **自動格式化工具誤刪風險**：曾發生 Antigravity 在移除 debug console.log 時，因 Prettier 格式化（單引號→雙引號）導致字串模糊比對誤判，意外把鄰近的 `window.__latestAuthState = ...` 賦值邏輯整段刪除。**任何牽涉這個快照機制的修改後，務必明確要求 Antigravity 完整顯示修改後的程式碼以供肉眼確認**，不能只信任「build 通過」的回報

---

## Supabase 資料表

| 資料表 | 說明 |
|--------|------|
| posts | 短文（日噹） |
| post_images | 短文照片，舊表，已停用（改用 post_media bucket + post_media_items） |
| post_media_items | 短文媒體：YouTube / 短片 / 錄音（2026-07-11 新增，見下方章節） |
| quotes | 語錄收藏 |
| status | 現在狀態（id=1 固定） |
| cards | 首頁卡片資料，**實際資料源**（見下方「cards 資料表欄位」章節） |
| daily | Polaroid 底片日記 |
| transactions | 記帳明細（含 currency、amount_jpy、exchange_rate） |
| income_categories | 收入來源（動態管理） |
| expense_categories | 支出分類（動態管理） |
| japan_categories | 日本收藏分類（兩層） |
| japan_items | 日本收藏品項（含 owner_wishlist、owner_quantity、trip_id；trip_id NULL=一般收藏，有值=歸屬該行程，見 PROJECT_ARCHITECTURE_V2.md 第四節） |
| allowed_users | 日本收藏白名單（email + display_name） |
| wishlist_items | 朋友/家人願望清單（含 quantity） |
| trips | 旅行行程 |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） |
| spot_types | 景點主類型（含 is_chain_store） |
| spot_subtypes | 景點子類型（關聯 spot_types，含 is_chain_store） |
| trip_days | 每日行程（關聯 trips） |
| day_spots | 每天景點安排（關聯 trip_days + spots） |
| travel_coupons | 優惠券，全站共用（✅ UI 已上線） |
| travel_subway_maps | 地鐵圖，全域分類庫（✅ 已調整，新增 category 欄位；trip_id 停用不刪，留待階段 9） |
| trip_subway_categories | ✅ 已上線，行程關聯地鐵圖分類 |
| spot_transport_routes | ✅ 已上線，景點間交通方式（含行程模式內嵌區塊） |
| trip_collaborators | ✅ 已上線，行程協作者權限（can_edit_wishlist、can_edit_itinerary 皆已在對應表 RLS 生效） |

> 完整的 /trip 整合頁面資料庫異動細節，請見 PROJECT_ARCHITECTURE_V2.md 第七節。

### status 資料表欄位
- id（固定為 1）
- reading、music、mood、doing（現在狀態四欄）
- japan_explore_public（boolean，控制探索日本搜尋的公開/私人）

### cards 資料表欄位（首頁卡片資料，2026-07-18 補充記錄）
- 欄位：`id`（PK，自動遞增）、`section`（分區名稱）、`title`、`icon`（Tabler icon 名稱）、`description`、`url`、`sort_order`（現有資料以 10 為單位遞增：10、20、30...）、`children`（jsonb 陣列，格式 `{ title, url }[]`，供卡片下方子連結使用，例如「知識庫」卡片的「Obsidian 筆記」）
- **⚠️ 重要：此表才是首頁卡片的實際資料源，`src/data/links.ts` 只是編譯期備援**——`src/pages/index.astro` 會先查詢此表，查到非空結果就完全採用；只有查詢失敗或資料表是空的，才會退回使用 `linksData`（見 `index.astro` 第 11-21 行）。正常情況下（此表有資料）修改 `links.ts` **不會**反映到正式站，必須直接對此表寫入才會生效。目前兩邊內容已知存在落差（例如「記帳系統」的 `url` 在 `cards` 表為空字串、`links.ts` 為 `/ledger`；「旅行地圖」在 `cards` 表為 `/japan`、`links.ts` 為空字串），屬歷史遺留，非單一任務範圍內能一次修復，日後如需讓兩邊保持一致，需要專門排一個同步任務逐欄核對
- **RLS 現況（2026-07-18 以 anon key 實測確認，非查詢資料庫政策文字本身）**：
  - SELECT：對任何人開放（未登入、匿名 anon key 皆可完整讀取全部卡片資料），供首頁公開展示，符合預期
  - INSERT：已確認鎖管理員——anon key 嘗試寫入直接收到 `new row violates row-level security policy for table "cards"`（42501），未實際寫入任何資料
  - UPDATE / DELETE：**未直接測試**（避免對正式資料做寫入類測試，即使是無害的原值覆寫也不做未經授權的正式環境寫入）；比對站內其他公開展示型資料表的一致設計慣例（SELECT 開放 + 寫入鎖 `is_admin()`／管理員 email 的 `FOR ALL` 政策，如 `travel_coupons`、`travel_subway_maps`），高度可能是同一套「僅管理員可寫入」設計，但**未經確認不能視為定案**；如需 100% 確定政策文字，需由使用者本人於 Supabase Dashboard → Authentication → Policies 查看 `cards` 表的實際政策定義
- **新增卡片流程（目前限制）**：`admin.astro` 的卡片編輯 Modal（`.from('cards').update(...)`）只支援 `UPDATE`（依 `title` 比對既有列），沒有新增列的介面；新增卡片目前只能由管理員在 Supabase Dashboard 手動執行 SQL INSERT 或用 Table Editor 新增列

### wishlist_items RLS policies
- SELECT：所有登入用戶可讀
- INSERT：用戶只能新增自己的記錄（auth.uid() = user_id）
- UPDATE：用戶只能更新自己的記錄（auth.uid() = user_id）
- DELETE：用戶只能刪除自己的記錄（auth.uid() = user_id）

### Storage Buckets
- post_media（PRIVATE，2026-07-11 新增，短文照片專用，見下方「短文照片私有化」章節）
- post_images（PUBLIC，已停用，短文照片已全數搬遷至 post_media；舊檔案保留未刪除，不再被任何程式碼讀取）
- japan_images（PUBLIC）
- travel_images（PUBLIC）
- travel_coupons（PUBLIC）
- travel_subway_maps（PUBLIC）

### 短文照片私有化：post_media（2026-07-11 安全修復）
- **原則**：照片存取權限跟隨所屬文章的 `visibility`，與任務 B 的文字保護同等級——public 文章的照片任何人可讀，friends 文章僅白名單朋友，private 僅管理員
- **Bucket 設定**：`post_media` 為私有 bucket（Public bucket 關閉），路徑規則固定為 `{post_id}/{檔名}`，第一層目錄即為權限判斷依據
- **RLS（storage.objects，重用任務 B 的 `is_admin()`/`is_friend()`）**：
  - SELECT：`is_admin()` 無條件可讀整個 bucket（管理員需要在文章尚未存檔、照片還在 `pending/` 暫存資料夾時就能預覽）；非管理員需路徑解析出的 `post_id` 對應到一篇存在的文章，且 `visibility='public'` 或（`visibility='friends'` 且 `is_friend()`）
  - INSERT/UPDATE/DELETE：一律僅 `is_admin()`
- **上傳流程**：新增文章時 `id` 尚未存在，照片先上傳至 `pending/{隨機檔名}`；文章存檔取得真正 `id` 後，程式碼呼叫 Storage 的 `move()` 搬進 `{id}/` 資料夾，並用第二次 `UPDATE` 把最終路徑寫回 `posts.image_url`/`image_urls`。編輯既有文章時 `id` 已知，直接上傳至 `{id}/`，不經過 `pending/`
- **讀取方式**：`posts.image_url`/`image_urls` 欄位存的是 **bucket 內路徑**，不是網址（簽名網址 1 小時後失效，不能落地存資料庫）。頁面渲染時才呼叫 `createSignedUrl(path, 3600)` 動態換成當下有效的臨時網址：
  - `posts/[id].astro` SSR（public 文章）：frontmatter 內用 anon key 產生
  - `posts/[id].astro` 前端（friends/private 文章）：登入後用使用者 session 產生，RLS 自動判權
  - `posts/index.astro` 列表頁封面縮圖：僅對每篇文章的第一張照片產生簽名網址
- **搬遷紀錄**：舊 `post_images` bucket 內 11 個檔案，僅 1 個實際被文章引用（id=7），已手動複製至 `post_media/7/`，其餘 10 個為孤兒檔案，未搬遷、未刪除，原樣留在 `post_images`

### 短文媒體支援：YouTube / 短片 / 錄音（2026-07-11 新增）
- **資料表 `post_media_items`**：`id`(uuid)、`post_id`(FK→posts，on delete cascade)、`kind`(`youtube`/`clip`/`audio`)、`value`(youtube 存解析出的影片 ID；clip/audio 存 `post_media` bucket 內路徑)、`sort_order`、`created_at`
- **RLS**：SELECT 條件與 `posts` 表本身完全一致（`visibility='public'` 或 `is_admin()` 或 `visibility='friends'` 且 `is_friend()`）；INSERT/UPDATE/DELETE 一律僅 `is_admin()`；照片欄位維持在 `posts.image_url`/`image_urls`，未搬進此表
- **短片/錄音檔案**：與照片共用 `post_media` bucket 與其 RLS，走一樣的 `pending/` 暫存 → 存檔後 `move()` 歸位流程；短片上傳前檢查檔案大小，超過 50MB 直接擋下（前端限制，非資料庫層）
- **YouTube**：只存**解析出的影片 ID**（不存完整網址），編輯器貼網址後用正規表達式解析（支援 `youtube.com/watch?v=`、`youtube.com/embed/`、`youtu.be/` 三種格式），解析失敗即時提示格式錯誤；渲染時組成 `https://www.youtube-nocookie.com/embed/{id}` 內嵌（隱私增強模式，不使用一般 `youtube.com/embed`）。**注意**：YouTube「私人」等級的影片通常無法被任何網站嵌入播放，只有「非公開」（unlisted）才能正常嵌入，這是 YouTube 平台限制不是本站問題
- **顯示順序**：單篇頁固定為「照片瀑布流 → 文字 → 影片（YouTube+短片依 `sort_order` 混合排列）→ 錄音（依 `sort_order`）」。**排序僅在同類型項目之間有意義**（例如兩支短片誰先誰後）；不同類型之間的區塊順序（影片一定在錄音之前）是寫死的，調整跨類型的 `sort_order` 不會反映在頁面上，避免誤判為排序功能故障
- **iOS 錄音上傳限制**：網頁 `<input type="file">` 無法直接讀取「語音備忘錄」App 內部的錄音，這是蘋果平台限制，任何網站都無法透過調整 `accept` 屬性解決；使用者需先在語音備忘錄用「共用 → 儲存到檔案」匯出，再用「選擇檔案」上傳

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

### Vercel Deploy Hook（重新部署觸發，2026-07-11 安全重構）
- **背景**：hook 網址原以 `PUBLIC_VERCEL_DEPLOY_HOOK` + `define:vars` 暴露於 7 個頁面的前端原始碼，任何人取得後可無限觸發部署，已視為洩漏並汰換
- **現行架構**：前端一律呼叫 `/api/trigger-deploy`（src/pages/api/trigger-deploy.ts）：
  1. 前端帶目前 session 的 access token（`Authorization: Bearer <token>`）
  2. 後端以 `supabase.auth.getUser(token)` 驗證身分，email 比對後端環境變數 `ADMIN_EMAIL`（不信任前端任何身分宣告），非管理員回 401
  3. 驗證通過才 POST 後端環境變數 `VERCEL_DEPLOY_HOOK` 的網址
- **規則**：hook 網址**不得**再以任何形式進入前端（`PUBLIC_` 前綴環境變數、define:vars、window 全域皆禁止）
- /trip 子元件（TripPlanner / JapanCollection）依單一入口規則不呼叫 `getSession`，token 改從 `window.__latestAuthState` 快照唯讀取得

### Anthropic API（/trip AI 助手，2026-07-13 新增，V2 階段 7）
- 後端 Serverless Function：src/pages/api/ai-assistant.ts，直接用原生 `fetch` 呼叫 `https://api.anthropic.com/v1/messages`（未安裝 `@anthropic-ai/sdk`）
- Key 存於 Vercel 後端環境變數 `ANTHROPIC_API_KEY`（不加 `PUBLIC_` 前綴，絕不進前端）
- Model：`claude-sonnet-5`，`max_tokens: 2048`，非串流，30 秒逾時
- 身分驗證與 `/api/trigger-deploy` 同一套模式（見上方「Vercel Deploy Hook」章節）；查詢 Supabase context 一律用請求者 token 建立的 client 讓 RLS 生效，不使用 service role
- 完整架構細節見 PROJECT_ARCHITECTURE_V2.md 第五節

### Google Custom Search JSON API
- ⚠️ 已於 2025 年對新用戶永久關閉，請勿嘗試申請，改用 SerpApi

---

## Vercel 環境變數

| 變數名稱 | 用途 | 類型 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 URL | 前端 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名 Key | 前端 |
| VERCEL_DEPLOY_HOOK | 觸發重新部署的 Webhook URL（新 hook，2026-07-11 汰換） | 後端 |
| ADMIN_EMAIL | /api/trigger-deploy 管理員身分比對 | 後端 |
| SERPAPI_KEY | 探索日本搜尋 | 後端 |
| PUBLIC_GOOGLE_MAPS_KEY | Google Maps API Key | 前端 |
| PUBLIC_ADMIN_EMAIL | 管理者 email 判斷 | 前端 |
| ANTHROPIC_API_KEY | /api/ai-assistant 呼叫 Anthropic API（2026-07-13 新增，V2 階段 7） | 後端 |

---

## 日本收藏多角色登入

| 身份 | 登入方式 | 可使用功能 |
|------|---------|-----------|
| 管理者 | 現有帳號（email/password） | 全部 |
| 朋友 | Google OAuth | /japan（及未來 /trip）願望清單 |
| 家人 | Email/Password（管理者建立）| /japan（及未來 /trip）願望清單 |

- 白名單：Supabase Table Editor → allowed_users → Insert row
- 新增家人帳號：Supabase Authentication → Users → Add user
- 白名單 email 比對用 `ilike`（大小寫不敏感）
- 朋友需用 Safari 或 Chrome，不能用 App 內建瀏覽器
- OAuth `redirectTo` 一律使用 `window.location.href`（不寫死特定路徑，確保在哪個頁面登入就跳回哪個頁面）
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
| /trip（整合頁面） | 沿用 travel + japan 既有風格（依分頁切換） | — |

---

## 開發除錯方法論（經驗累積）

1. **診斷 UI 顯示問題的標準流程**：先查 `getBoundingClientRect()` 是否為 0、`getComputedStyle().display`，再往上遍歷 parentElement 確認是否有祖先層 `display: none` 或造成 stacking context 的屬性（transform / filter / isolation 等）
2. **不可只信任「測試通過」的自動化回報**：要求 Antigravity 在診斷階段先不修改程式碼、只回報資訊，由使用者本人在瀏覽器實際操作驗證
3. **Vercel build 成功 ≠ 前端執行無誤**：build log 顯示 Ready/Success 不保證瀏覽器端無錯誤，務必用無痕視窗實測，必要時手動 redeploy 並清除 build cache
4. **dev server 常見問題**：
   - port 4321 殘留進程：`lsof -i :4321` + `kill -9`
   - 快取問題：`rm -rf node_modules/.vite .astro dist` 後重啟
   - 瀏覽器快取：Safari 無「清除快取硬式重新載入」選項，改用「進入響應式設計模式」（Cmd+Ctrl+R）測試手機版，或 Network 分頁勾選「停用快取」+ Cmd+R
5. **重大架構改動後，要求完整貼出修改後程式碼**，而非只看 commit message 摘要，避免自動化工具的誤判（如模糊比對誤刪程式碼）被忽略
6. **修改程式碼後必須在同一輪完成 git commit + push 並確認推送成功，才算真正部署**：曾發生 Antigravity 完成多輪程式碼修改但未執行 commit/push，Vercel 持續運行舊版本，導致後續多輪瀏覽器測試實際上都在測試舊程式碼，造成大量誤判、浪費大量排查時間。修改完成後應立即貼出 `git push` 的終端機輸出確認成功，且應在 Vercel Deployments 頁籤確認新版本狀態為 Ready（且 commit SHA 相符）後才進行驗證測試
7. **頁面搬移/重構時，先前已修復的規則容易被靜默遺漏**：例如 `.map-wrapper { isolation: isolate }` 這類 CSS 隔離規則，原本已在舊版 /travel 頁面修復並記錄於本文件，但搬移為 TripPlanner.astro 時未被帶過去，直到後續稽核才發現相關檔案完全沒有任何 isolation 或明確 z-index 設定。重構或搬移程式碼時，應主動逐條比對本文件已記載的規則是否真的體現在新程式碼中，不能只憑「功能測試通過」就假設所有先前修復都還在
8. **懷疑 race condition 或間歇性 bug 時，優先控制測試環境變數**：瀏覽器的無痕模式、DevTools 開啟/關閉等狀態可能改變 JavaScript 執行時序（例如 console 呼叫本身有效能開銷）或儲存行為（例如 Safari 無痕模式對 localStorage 的限制），進而讓 bug 時有時無、難以穩定重現。若懷疑是時序或環境相關問題，應優先在不同瀏覽器/模式間切換比對以縮小範圍，而非在同一環境下反覆重測
9. **flex/grid 項目預設 `min-width: auto`，內容過長時會撐大整個容器**（2026-07-11 教訓）：`display: flex`（或 grid）的直接子項目，即使設了 `flex: 1`、`overflow: hidden`、`text-overflow: ellipsis`，只要沒有明確加上 `min-width: 0`，仍會被內部無法換行的長文字（如長檔名、UUID）撐大到超出容器寬度；且這個「撐大」效應會沿著 flex 容器鏈一路往上傳遞，直到某層有 `overflow-x: hidden` 才會被裁掉——若這層剛好又不提供橫向捲動，使用者會完全看不到、也點不到被推出畫面的元素（例如表單送出按鈕）。修這類問題**不能只加在直接出問題的元素上**，要往上檢查每一層 flex/grid 容器是否都設了 `min-width: 0`；懷疑是這類問題時，用瀏覽器工具在目標裝置寬度下量測各層 `getBoundingClientRect().width` 找出實際撐大的那一層，不要憑截圖猜測就動手改
