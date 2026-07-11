# PROJECT_PROGRESS.md
# The Corner Table — 功能清單與工作進度

> 每次開始新任務前，請先完整閱讀本文件、PROJECT_ARCHITECTURE.md 與 PROJECT_ARCHITECTURE_V2.md。

---

## 一、已完成功能

### ✅ 基礎建設
- Astro 主站建立，Tailwind CSS 設定完成
- GitHub Repository：https://github.com/abc19930406/my-home
- Vercel 部署上線：https://my-home-blond-tau.vercel.app
- Supabase 資料庫連接（含 RLS 權限設定）
- 管理員登入系統（/login 頁面，Supabase Auth）
- 管理後台（/admin 頁面，需登入才能進入）
- Vercel Deploy Webhook 正常運作（2026-07-11 安全重構：hook 網址收進後端 `/api/trigger-deploy`，前端不再暴露，詳見下方「安全修復」）
- **架構升級**：Astro output 改為 `server` 模式 + `@astrojs/vercel` 適配器
- **PWA**：manifest.json 設定，可從 Safari 加入主畫面（已移除 Service Worker）
- **全站 Pull to Refresh**：手機下拉重新整理功能，捲到頁面頂部往下拉超過 80px 即觸發 location.reload()，含白色 spinner 視覺回饋，實作於 Layout.astro

### ✅ 首頁
- 深木奶油色系視覺風格（背景 #2C1E14）
- 資料驅動卡片架構（src/data/links.ts 集中管理）
- 三個卡片分區：知識與創作 / 生活記錄 / 工具
- 登入後每張卡片出現編輯按鈕
- 「旅行地圖」卡片點擊後展開子選單（/travel 和 /japan，未來將導向 /trip）

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

### ✅ 日本收藏（/japan）— 完整上線（舊頁面，將被 /trip 取代）
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
- **篩選列置頂**：搜尋框 + 分類篩選列 + 管理按鈕整區 sticky 吸頂，手機與網頁皆適用
- **朋友清單新增「所有人」模式**（管理員限定）：下拉選單可選「所有人」，顯示所有人標記的願望商品，點擊「❤️ N 人想買」跳出 Modal 列出每人 display_name 與數量
- **修正卡片點擊跳動**：點擊愛心/數量按鈕改為局部 DOM 更新（updateCardFooter），不再重建整個卡片網格
- **Modal 滾動鎖定**：所有 Modal 開啟時加上 modal-open class 鎖定背景捲動，關閉後移除
- 右上角登入/登出按鈕
- ⚠️ 此頁面已搬移核心元件至 `JapanCollection.astro`，整合進 /trip，舊頁面 /japan 是否下線待 /trip 全面穩定後評估

### ✅ 旅行地圖（/travel）— 完整上線（舊頁面，將被 /trip 取代）
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
- **連鎖店顯示/隱藏功能**：
  - spot_types、spot_subtypes 新增 is_chain_store boolean
  - 任一為 true 即視為連鎖店
  - 地圖標記縮小（scale 0.65）+ 變淡（opacity 0.6）
  - 篩選列「顯示連鎖店」開關，預設關閉，僅影響地圖顯示，不影響選點邏輯
  - fitBounds 與 Marker 渲染已拆分，切換開關不會重置地圖視野
- Supabase：trips、spots、spot_types、spot_subtypes、trip_days、day_spots
- 右上角登入/登出按鈕
- ⚠️ 此頁面已搬移核心元件至 `TripPlanner.astro`，整合進 /trip，舊頁面 /travel 是否下線待 /trip 全面穩定後評估

---

### 🔶 /trip 整合頁面（階段 1、2 已完成，階段 2.5 有未解決問題待釐清）

將 `/travel` 與 `/japan` 整合為單一頁面 `/trip`，含 Desktop/Mobile 雙版面、AI 助手分頁（規劃中）、協作者權限系統（規劃中）。詳細架構規劃見 **PROJECT_ARCHITECTURE_V2.md**。

#### 已完成項目

- **頁面骨架**（trip.astro）：
  - Desktop / Mobile 雙版面（依裝置寬度切換完全不同版面模板）
  - 三分頁切換：行程 / 收藏 / AI（AI 分頁尚為佔位）
  - 管理員判斷（admin-home-link 僅管理員顯示）
  - 返回首頁按鈕：Desktop 左上角、Mobile 選單展開列表最上方
  - Mobile 選單展開機制：改用 `position: fixed`（原 `absolute` 會被截斷）

- **元件搬移**：
  - `TripPlanner.astro`：從 travel.astro 搬移地圖/行程模式核心邏輯，移除 Layout 與獨立 header 登入區（後補回登入按鈕）
  - `JapanCollection.astro`：從 japan.astro 搬移收藏品瀏覽/願望清單核心邏輯，保留 top-right-auth-container
  - `window.currentTripId` 全域暴露機制：`selectTrip()` 設定 + `dispatchEvent('trip-changed')` 廣播，供收藏分頁未來依行程篩選使用

- **Supabase 單一入口架構**（重大重構，已完成並驗證）：
  - **問題背景**：原本 trip.astro / TripPlanner.astro / JapanCollection.astro 三個檔案各自呼叫 `createClient`、`waitForSupabase`、`getSession`，導致：
    - `GoTrueClient Multiple instances detected` 警告
    - OAuth 登入時觸發 `@supabase/xxx-js@版本號/+esm` 大量 404（子模組重複動態載入）
    - `Session as retrieved from URL was issued in the future` 警告
  - **解法**：重構為單一入口模式
    - `trip.astro` 是唯一執行 `createClient` + `getSession` + `onAuthStateChange` 的地方
    - Client 存於 `window.sharedSupabase`（單例）
    - 透過 `auth-state-changed` CustomEvent 廣播狀態給 TripPlanner / JapanCollection
    - 子元件改用 `waitForSharedSupabase()` 輪詢取得 client，不再自己 createClient 或 getSession
  - 已驗證：Console 不再出現 multiple instances 警告，OAuth 流程 404 消失

- **Race Condition（事件競態）修正**：
  - **問題**：TripPlanner.astro 的 `auth-state-changed` 監聽器原本綁定在 `await googleMapsPromise`（地圖腳本載入，需 300-800ms）之後；而 trip.astro 的 `getSession()` 通常 50ms 內完成並廣播。子元件常常綁定監聽時已經錯過廣播，導致登入按鈕在未登入狀態下也不會顯示（卡在 HTML 預設的 `display: none`）
  - **解法**：
    - 事件監聽提前到 `<script>` 最開頭（在任何 await 之前）
    - 新增 `window.__latestAuthState` 全域快照機制，trip.astro 每次廣播事件時同步寫入快照
    - 子元件綁定監聽後立即檢查快照，若已錯過廣播則補跑一次 `updateAuthUI()`
  - 已驗證：未登入狀態下，行程/收藏分頁的登入按鈕初次載入皆正確顯示

- **CDN 版本鎖定**：
  - Layout.astro 的 Supabase CDN import 原本未鎖定版本號（`@supabase/supabase-js/+esm`），先改為鎖定主版號 `@2`，避免 jsdelivr 抓取最新版造成子模組路徑解析不穩定
  - 2026-07-11 進一步凍結為確切版號 `@supabase/supabase-js@2.110.2/+esm`（Heisenbug 診斷後決策，消除「SDK 版本自行變動」變數，詳見下方進行中問題）

- **權限漏洞修正**：
  - TripPlanner.astro 的 `updateAuthUI` 原本只要有 session 就無條件設 `isAdminUser = true`，未比對 email，導致任何登入者都取得管理員權限
  - 已修正為嚴格比對：`currentSession.user.email === adminEmail`

- **朋友帳號三層權限顯示修復**（2026-06-22，commit `7973fc3`）：
  - **問題**：已在 `allowed_users` 白名單中的朋友帳號，登入後收藏分頁正確顯示已登入樣式，但行程分頁顯示與未登入完全相同的訪客樣式。初期誤判為「登入失敗」，實際上是登入成功但 UI 未正確切換
  - **根因**：`TripPlanner.astro` 的 `updateAuthUI` 只有「管理員 / 非管理員」二元判斷，沒有「已登入但非管理員的白名單朋友」這個第三種狀態。所有非管理員一律被丟進 `else` 分支，強制顯示成訪客樣式。`JapanCollection.astro` 原本就有正確的三層判斷，是搬移過程中兩者實作出現分歧
  - **修復內容**：
    - `updateAuthUI` 改為 `async function`，新增三層分支：管理員 / 白名單朋友（查 `allowed_users` 表）/ 訪客
    - 引入 `authUIUpdateSeq` 遞增序號防競態：每次呼叫遞增，`await` 後檢查序號，確保只有最後一次呼叫有權更新 DOM，避免非同步查詢結果互相覆蓋
    - `catch` 區塊加入 `console.warn('⚠️ allowed_users 查詢失敗或使用者不在白名單：', err)`，讓失敗有明確的 Console 線索
    - `JapanCollection.astro` 不動（原本邏輯正確）
  - **驗證結果**：朋友帳號登入後，行程/收藏分頁皆正確顯示「登出」按鈕 ✅；管理員登入行為不受影響 ✅；靜置後 `allowed_users` 查詢不再持續增長 ✅

- **衝突熱點稽核**（2026-06-22，commit `2317d2d`）：
  - **稽核範圍**：針對 trip.astro、TripPlanner.astro、JapanCollection.astro 三檔案，逐項檢查四個已知高風險模式，純稽核不修改程式碼
  - **稽核結果**：
    | 項目 | 結果 |
    |------|------|
    | CSS/ID 前綴隔離 | ⚠️ 有違規（詳見下方，已決議延後至階段 9） |
    | Modal 開關邏輯 | ⚠️ 有違規（已修復，見下方） |
    | Supabase 單一入口使用規範 | ✅ 無違規 |
    | z-index / stacking context | ⚠️ 有違規（已修復，見下方） |
  - **CSS/ID 前綴隔離違規內容（決議延後至階段 9 程式碼清理，暫不處理）**：
    - `TripPlanner.astro`（第 550、577、590、600 行）與 `JapanCollection.astro`（第 466 行）皆使用全域 `document.querySelectorAll('.admin-only')`，兩元件互相覆寫同一批元素（判斷為等冪操作，目前無實際功能危害，暫緩處理）
    - `TripPlanner.astro` 內 Modal ID 未加 `travel-` 前綴（`wishlist-modal`、`spot-detail-modal`、`trip-modal`、`spot-modal`、`type-management-modal`）
    - `JapanCollection.astro` 內 Modal ID 未加 `japan-` 前綴（`item-modal`、`collect-modal`、`auth-modal`、`wishlist-names-modal`）
    - `auth-modal` 被 trip.astro、TripPlanner、JapanCollection 三方共用選取，未依元件隔離（暫判斷為刻意共用登入 Modal，非誤用）
    - 延後原因：命名規則變更牽涉範圍大（HTML + JS 同步改），出錯風險高，適合與階段 9 整體 Modal/CSS 命名規則整併一次處理
  - **Modal 開關邏輯違規內容（已修復）**：
    - `JapanCollection.astro`（約第 1547 行）背景點擊關閉邏輯原本漏掉 `auth-modal`、`wishlist-names-modal` 兩個 Modal 的關閉處理
    - `TripPlanner.astro`（約第 3198 行）ESC 鍵全域監聽原本漏掉 `wishlist-modal`、`spot-detail-modal` 兩個 Modal 的關閉呼叫
    - **修復內容**：`JapanCollection.astro` 統一用 `.modal-overlay` class 加 ID 判斷處理四個 Modal 的背景點擊關閉；`TripPlanner.astro` 新增 `closeWishlistModal()`、`closeSpotDetailModal()` 兩個函式，ESC 監聽補齊呼叫全部六個關閉函式
    - **驗證狀態**：程式碼經肉眼核對邏輯正確、與既有寫法風格一致，已部署；⚠️ 尚未取得使用者手動測試 ESC / 背景點擊關閉的明確結果（測試過程中發現下方新問題，原定驗證被中斷）
  - **z-index / stacking context 違規內容（已修復）**：
    - 三檔案中完全未發現任何 `isolation: isolate` 或明確 `z-index` 設定，地圖容器缺乏 stacking context 隔離，屬於與歷史 bug（地圖 z-index 蓋住 Modal）相同的風險模式
    - **修復內容**：`TripPlanner.astro` `<style>` 區塊 `.map-wrapper` 補上 `isolation: isolate; position: relative; z-index: 0;`
    - **驗證狀態**：已部署，尚未有已知的 z-index 衝突案例回報

#### 🔴 進行中問題：OAuth 登入後 UI 間歇性未切換（Heisenbug，2026-06-22 發現；2026-07-11 完成第一輪時序診斷）

- **症狀描述修正（2026-07-11 對照實驗結論）**：原「DevTools 關閉時必失敗、開啟時正常」的描述**不成立**——同一流程在 DevTools 關/開兩種環境各取得一份完整時序 log，兩組登入皆成功、時序逐筆等價。DevTools 開關與 bug 無因果關係，此為**間歇性時序問題**，兩種環境皆可能發生；該輪實驗 bug 未重現
- **已依時序證據排除的假設**：
  - 嫌犯一（trip.astro callback 內 `replaceState` 提前清除 OAuth hash）：不成立，該行**從未執行過**——hash 由 Supabase SDK 自行清除，這段清 hash 程式碼實為死碼，列入階段 9 清理
  - 嫌犯二（手動 INITIAL_SESSION(null) 覆寫 SIGNED_IN）：不成立，所有廣播皆攜帶有效 session，無任何 null 事後覆寫
  - trip.astro 的 auth 管線（getSession / onAuthStateChange / 事件廣播 / `__latestAuthState` 快照）整段經兩組 log 驗證健康；先前「真的未登入」的判斷需重新檢視——至少已證明 session 取得與廣播層面可靠
- **診斷設施（留存於線上）**：trip.astro 已插入 `[DEBUG-HEISENBUG]` 標記的 sessionStorage 時序記錄碼（commit `5724f31`，寫入 `sessionStorage.__auth_debug_log`，刻意不用 console 以免改變時序）。事後搜尋 `DEBUG-HEISENBUG` 可整批移除
- **失敗取證 SOP**：日常使用中任何一次登入後顯示異常，**不關閉、不重整該分頁**，開 Console 執行 `copy(sessionStorage.__auth_debug_log)` 貼出剪貼簿內容，並截圖 Console（確認有無「🔑 朋友已登入」或 ⚠️ 警告）
- **新觀察（修復階段一併評估）**：每次視窗焦點切換，Supabase 會重發 `SIGNED_IN`，TripPlanner 的 `updateAuthUI` 隨之重查一次 `allowed_users`。功能無害，但查詢次數隨使用時間持續累積，可評估白名單查詢結果快取
- **2026-07-11 診斷結論（使用者已確認）**：本輪**未重現**，兩嫌犯排除，診斷碼保留在線上待真實失敗時取證
- **環境凍結（2026-07-11）**：瀏覽器端 Supabase CDN 由浮動 `@2` 鎖定為確切版號 `@2.110.2`——jsdelivr 對 `@2` 會自動升 minor/patch，「SDK 版本自行變動」是 6/22 故障、7/11 無法重現的最可能解釋，凍結後此變數排除；若凍結後 bug 不再發生，亦可反向佐證此推論
- **狀態**：等待真實失敗發生時依上述 SOP 取證，定案根因後才修復
- **優先級**：⚠️ 維持高於進入階段 3

#### Bug 修正記錄（供後續排查參考，技術細節見下方「重要注意事項」）

- Modal 點擊後立即消失/卡住：根因為 `japan.css` 與 `travel.css` 的 `.modal-overlay` class 衝突，已拆分為 `.japan-modal-overlay` / `.travel-modal-overlay`
- 行程分頁地圖 z-index 蓋住其他 Modal：用 `.map-wrapper { isolation: isolate }` 隔離 Google Maps 的 stacking context
- 管理景點類型 Modal 內按鈕被截斷：`.modal-box form { overflow: hidden }` 改為 `overflow: visible`，並修正誤用的不存在 CSS 變數
- TypeScript 語法殘留導致 esbuild 編譯失敗：Astro `<script>`（非 frontmatter）不支援 TS 語法，已全面清除型別標註與 `as` 斷言（重災區為 JapanCollection.astro，50+ 處）
- 重複初始化導致狀態混亂：已重構為 Supabase 單一入口架構（見上方）

#### 排查過程中確認的非根因項目（備查，避免未來重複走冤枉路）

| 假設 | 排除依據 |
|------|---------|
| CDN `@supabase/...+esm` 404 造成登入失敗 | `window.sharedSupabase` 與 `window.__latestAuthState` 在 Console 確認均正常，session 資料完整 |
| `modulepreload` 標籤被解析成本站相對路徑 | 搜尋 `modulepreload` 無任何結果，Vite plugin 運作正常 |
| Safari 無痕模式 localStorage 限制 | 換 Chrome 一般視窗後問題依然存在，排除此因素 |
| `allowed_users` 查詢失敗（白名單比對問題） | Network 分頁確認查詢回傳 200，白名單比對正常 |

#### 最近一次驗證狀態（2026-06-22）

- ✅ Console 無 SyntaxError、無 @supabase 404
- ✅ 未登入狀態下，行程/收藏分頁登入按鈕正常顯示
- ✅ Google 登入完整流程，OAuth 後停留 /trip 且正確顯示已登入
- ✅ 登入後行程/收藏分頁多次切換狀態穩定
- ✅ 登出再登入循環測試正常
- ✅ 管理員帳號：行程/收藏分頁皆正確顯示管理員介面
- ✅ 朋友帳號（allowed_users 白名單）：行程/收藏分頁皆正確顯示已登入樣式（登出按鈕），不顯示 admin-only 元素
- ⚠️ **重要但書（2026-07-11 更新）**：2026-07-11 對照實驗已確認 DevTools 開關與登入行為無因果，上述結果可視為一般情境的有效參考；惟「OAuth 登入後 UI 間歇性未切換」問題尚待真實失敗取證（見上方進行中問題），階段 2.5 收尾仍以該問題定案為準

### ✅ 安全修復：Deploy Hook 後端化（2026-07-11，隱私修復任務 A，已結案）

- **問題**：`PUBLIC_VERCEL_DEPLOY_HOOK` 以 `define:vars` 暴露於 7 個頁面前端原始碼（index/Welcome、admin、posts、quotes、japan、travel、/trip 的 TripPlanner + JapanCollection），任何人取得網址可無限觸發部署。舊 hook 網址視為已洩漏
- **修復**：新增 `/api/trigger-deploy`（後端驗證 access token + `ADMIN_EMAIL` 比對後代呼叫 `VERCEL_DEPLOY_HOOK`），13 個前端呼叫點全數改為帶 Bearer token 呼叫此 API，移除所有 `PUBLIC_VERCEL_DEPLOY_HOOK` 引用與 `window.__WEBHOOK_URL__` 橋接。/trip 子元件 token 取自 `__latestAuthState` 快照（唯讀，不違反單一入口規則）
- **驗證**：build 產物已確認無任何 hook 網址/相關變數殘留
- **收尾完成（2026-07-11，使用者於 Vercel 後台操作並驗證）**：新 hook `backend-trigger` 建立、`VERCEL_DEPLOY_HOOK` 與 `ADMIN_EMAIL` 環境變數設定完成；管理員實測 /admin 儲存可觸發新部署 ✅；舊 Deploy Hook 已刪除（洩漏網址永久失效）、`PUBLIC_VERCEL_DEPLOY_HOOK` 變數已刪除；刪除後再次實測觸發部署正常 ✅
- **驗收紀錄**：無 token / 偽造 token 呼叫 `/api/trigger-deploy` 均回 401；Astro 內建 CSRF 防護（checkOrigin）額外阻擋非同源 POST（403）

### ✅ 安全修復：短文（posts）visibility 保護（2026-07-11，隱私修復任務 B，已結案）

- **問題**（見 SECURITY_AUDIT.md 盤點）：兩層問題疊加——(1) `posts` 的 RLS SELECT 政策 `Anyone can read post metadata`（`qual: true`）對匿名者完全開放，與 visibility 無關；(2) `posts/[id].astro` 的 SSR 查詢完全不過濾權限（註解原文：「只抓資料不檢查權限，交給前端處理」），只用前端 `display: none` 隱藏私人/朋友文章，資料早已寫進 HTTP 回應，檢視原始碼即可讀取
- **修復（架構細節見 PROJECT_ARCHITECTURE.md「短文（posts）visibility 權限架構」）**：
  - RLS：新增 `is_admin()`、`is_friend()` 兩個 `SECURITY DEFINER` 輔助函式，`posts` 的 SELECT 改為 `visibility='public' OR is_admin() OR (visibility='friends' AND is_friend())`，INSERT/UPDATE/DELETE 一律僅 `is_admin()`
  - 頁面：`posts/[id].astro` 移除「渲染全文 + display:none + 前端檢查」機制；SSR 抓不到（無權限或不存在，刻意不區分）一律渲染無內容外殼，登入後由前端以使用者 session 重新查詢，RLS 自動判權，動態渲染時 Markdown 轉換改用 CDN `marked@18.0.3`（鎖定確切版本）
  - `posts/index.astro` 不需改動（client-side `fetchPrivatePosts()` 原邏輯已相容 RLS 過濾）；過程中發現並順手修復一個既有 bug：發布/編輯成功後儲存按鈕永久卡在 disabled，導致第二次之後的送出完全沒反應（`resetForm()` 補上解除 disabled）
- **驗證結果（2026-07-11，使用者實測）**：
  - 無痕視窗開私人文章網址 → 顯示「需要登入」外殼，檢視原始碼搜尋不到文章內容 ✅
  - 無痕視窗開 `/posts` 列表 → 只看到 public 文章，原始碼搜尋不到非公開文章 ✅
  - 管理員登入 → 三種 visibility 皆可讀寫 ✅
  - 臨時建立朋友測試帳號（`allowed_users` 白名單）→ 看得到 public+friends、看不到 private ✅；嘗試編輯/刪除文章，Table Editor 直接確認資料庫未變動，RLS 正確擋下寫入 ✅（前端當下誤顯示「已更新/已刪除」，重新整理即恢復，是既有 UI 提示不準確問題，非安全漏洞，見下方待辦）
- **已知非安全性問題（待後續清理，非本次任務範圍）**：`posts/index.astro` 的編輯/刪除只檢查 `error` 是否為空，未檢查實際受影響筆數；RLS 擋下 UPDATE/DELETE 時不回傳錯誤、只是實際變更 0 筆，導致非管理員操作被擋下時前端仍誤報成功

### ✅ 安全修復：記帳（transactions）與白名單（allowed_users）鎖定管理員專用（2026-07-11，任務 D 稽核發現，已結案）

- **背景**：SECURITY_AUDIT.md 盤點列為 CRITICAL（transactions）與 HIGH（allowed_users）——兩張表的寫入政策只檢查 `auth.role() = 'authenticated'`，任何登入帳號（含 `allowed_users` 白名單的朋友/家人）皆可完整讀寫全部財務資料、讀寫整份白名單；`ledger.astro` 頁面本身也完全沒有管理員檢查，任何登入帳號手動打開 `/ledger` 即可直接操作
- **前提決策（供未來查閱）**：執行前與使用者確認記帳系統**無家人/朋友共用需求**，純管理員個人專用，因此設計為「僅 `is_admin()`」而非以 `user_id` 區分擁有權。若未來要開放家人共用記帳，此設計需重新評估（架構細節見 PROJECT_ARCHITECTURE.md「記帳與白名單權限架構」）
- **修復**：
  - RLS：重用任務 B 已建立的 `public.is_admin()`；`transactions` 的 SELECT/INSERT/UPDATE/DELETE 一律僅 `is_admin()`；`allowed_users` 的 SELECT 改為 `is_admin() OR (auth.jwt()->>'email' ilike email)`（管理員全讀，非管理員只讀自己那一列），INSERT/UPDATE/DELETE 一律僅 `is_admin()`
  - 頁面：`ledger.astro` 比照 `JapanCollection.astro` 的 `isAdminUser` 判斷模式，新增 `session.user.email !== adminEmail` 比對，非管理員（含白名單帳號）一律導回首頁並提示「僅管理員可使用記帳系統」
- **驗證結果（2026-07-11，使用者實測）**：
  - 白名單朋友測試帳號登入 → `/ledger` 被導回首頁 ✅
  - 朋友帳號 session 直接繞過頁面、對資料庫查 `transactions` → 回傳 0 筆、無錯誤，資料庫層確認擋住 ✅
  - 管理員帳號 → `/ledger` 正常讀寫 ✅
  - 朋友帳號的 `/trip`、`/japan` 既有白名單相關功能（願望清單等）不受影響 ✅
  - `allowed_users` 前台無管理 UI（依 PROJECT_ARCHITECTURE.md 是透過 Supabase Dashboard 手動管理），無對應前端可測，以 RLS 政策本身作為驗收依據
- **過程中發現、記錄但未處理的異常（不在本次任務範圍）**：驗證過程中一度出現「明確用朋友測試帳號（`abc19930406test@gmail.com`）登入 `/trip`，畫面卻顯示『管理員已登入，啟用前台管理介面』，但實際新增景點/行程失敗」的狀況；改用全新無痕視窗、關閉其他分頁後重測未再重現。判斷可能與「進行中問題：OAuth 登入後 UI 間歇性未切換」Heisenbug 同一根因家族（畫面顯示的登入身分與實際權限判斷不一致），方向相反（這次是誤判成管理員，而非誤判成訪客）。尚未診斷根因，不確定是否為同一問題，留待下次處理 Heisenbug 時一併納入排查線索
- 隱私修復任務 C（照片）另案處理，尚未開始

---

## 二、規劃中功能（尚未開始）

### /trip 整合頁面後續開發（詳見 PROJECT_ARCHITECTURE_V2.md）

1. **收藏分頁依行程篩選**：`japan_items.trip_id` 篩選邏輯（一般收藏 NULL vs 行程收藏的 UI 切換）
2. **旅行資源子分頁**：優惠券（`travel_coupons`，表已建立）+ 地鐵圖分類化（`travel_subway_maps` 改全域庫 + `trip_subway_categories` 關聯表）
3. **交通查詢子分頁**：`spot_transport_routes` 表 + 行程內嵌交通方式 UI + AI 輔助搜尋
4. **協作者權限系統**：`trip_collaborators` 表，雙開關權限（can_edit_wishlist / can_edit_itinerary）+ Sandbox 模式
5. **AI 助手分頁**：`/api/ai-assistant` Serverless API，含 tool use 寫入功能（add_spot / update_spot / delete_spot / reorder_day_spots / add_transport_route / toggle_wishlist / update_wishlist_quantity / add_japan_item）
6. **舊頁面下線評估**：待 /trip 完全穩定後，評估是否移除 /travel 與 /japan
7. **程式碼清理階段**（獨立規劃，待全部功能穩定後執行）：統一 Modal 開關/CSS class 命名規則、移除殘留冗餘邏輯

### 其他規劃中功能
- 讀書筆記、食記、年度回顧、作品集、書籤收藏、習慣打卡
- 旅行地圖每日行程：升級為 Google Maps Directions API 真實路線

---

## 三、重要注意事項

1. 單篇頁為 SSR，即時可訪問
2. `<script define:vars>` 不支援頂層 await，包在 `(async () => { ... })()` 內
3. **Supabase CDN 載入**：Layout.astro 用 `<script is:inline>` 動態注入，**已鎖定確切版號 `@supabase/supabase-js@2.110.2/+esm`**（2026-07-11 凍結，禁止浮動版號；升版視同依賴變更須先問），各頁面用 `window.addEventListener('supabase-ready', ...)` 等待
4. **astro.config.mjs** 有 Vite plugin 移除所有 modulepreload 標籤（已強化為 `transformIndexHtml: { order: 'post', handler }`），並新增 `optimizeDeps: { exclude: ['@supabase/supabase-js'] }`
5. **PWA**：已移除 Service Worker，Layout.astro 有主動 unregister 舊 SW 的程式碼
6. **Google Maps**：必須在 JS IIFE 裡動態建立 script 標籤載入
7. **AdvancedMarkerElement**：需要 mapId，點擊事件用 'gmp-click'，需要 gmpClickable: true
8. **Places API New**：AutocompleteSuggestion（即時聯想）+ Place.searchByText（按鈕搜尋）
9. **日本收藏多角色登入**：
   - 白名單 email 比對用 ilike（大小寫不敏感）
   - Google OAuth 同意畫面需設為「實際運作中」
   - 朋友需用 Safari 或 Chrome，不能用 App 內建瀏覽器
   - OAuth `redirectTo` 統一使用 `window.location.href`（不寫死特定路徑）
10. **記帳匯率**：後端 API /api/exchange-rate，多重備援
11. **trip_days/day_spots**：id 都是 uuid
12. **wishlist_items RLS**：需要 SELECT、INSERT、UPDATE、DELETE 四個 policy
    - UPDATE policy：`auth.uid() = user_id`（朋友才能更新自己的數量）
13. **日本收藏卡片更新**：點擊愛心/數量按鈕用局部 DOM 更新（updateCardFooter），避免全版重渲染造成跳動
14. **Modal 滾動鎖定**：開啟 Modal 時加 `document.body.classList.add('modal-open')`，關閉時移除，CSS 需有 `body.modal-open { overflow: hidden; }`
15. **Astro `<script>` 標籤禁用 TypeScript 語法**（重要）：非 frontmatter 的 `<script>` 預設會被當 TypeScript 處理，但**不應寫 TS 語法**。型別標註（`:Type`）與 `as Type` 斷言都會在 esbuild parse 階段導致編譯錯誤，必須全部使用純 JS 寫法（可選鏈 `?.` 合法，但 `xxx?: Type` 型別標註不合法）
16. **多元件共存於同一頁面時的 CSS/ID 隔離**：務必為各自的 Modal/Toast 等 UI 元素加上獨立前綴（如 `japan-`、`travel-`），避免 `getElementById` 或 CSS class 選擇器互相干擾（曾發生 `.modal-overlay` 衝突案例，display 屬性互相覆蓋）
17. **/trip 頁面 Supabase 單一入口架構**（重要，詳見 PROJECT_ARCHITECTURE.md「/trip 頁面 Supabase 架構」章節）：
    - trip.astro 是唯一執行 createClient + getSession + onAuthStateChange 的地方
    - Client 存於 `window.sharedSupabase`，最新狀態快照存於 `window.__latestAuthState`
    - 子元件透過 `auth-state-changed` CustomEvent 接收狀態，搭配快照機制避免 Race Condition
    - 子元件絕不能自行呼叫 `createClient()` 或 `getSession()`
18. **診斷 Modal/UI 顯示問題的標準流程**：先查 `getBoundingClientRect()` 是否為 0、`getComputedStyle().display`，再往上遍歷 parentElement 確認是否有祖先層 `display: none` 或造成 stacking context 的屬性（transform / filter / isolation 等）
19. **不可只信任 Antigravity 的「測試通過」回報**：多次發現自動化腳本回報通過但實際操作仍有問題，需使用者本人在瀏覽器實際操作確認，必要時要求 Antigravity 不要修改程式碼、只回報診斷資訊，由使用者親自驗證後再決定下一步
20. **Vercel build log 顯示 Ready/Success 不代表前端執行無誤**：須實際在瀏覽器（建議無痕視窗）驗證，注意 CDN Edge Cache 可能延遲，必要時在 Vercel 後台手動 redeploy 並清除 build cache
21. **修改程式碼後必須完成 git commit + git push，才算部署**（重要教訓，2026-06-22）：Antigravity 曾執行多輪程式碼修改但未 commit/push，導致 Vercel 持續跑舊版本，所有瀏覽器測試都在測試舊程式碼，造成多輪誤判。**規則：Antigravity 完成任何程式碼修改後，必須在同一輪明確執行 `git add` / `git commit` / `git push` 並貼出終端機輸出確認推送成功。驗證測試必須在 Vercel 出現新的 Ready 部署後才進行。**

---

## 四、Supabase 資料表清單

| 資料表 | 說明 | 狀態 |
|--------|------|------|
| posts | 短文（日噹） | ✅ |
| post_images | 短文照片 | ✅ |
| quotes | 語錄收藏 | ✅ |
| status | 現在狀態（id=1 固定） | ✅ |
| daily | Polaroid 底片日記 | ✅ |
| transactions | 記帳明細（含 currency、amount_jpy、exchange_rate） | ✅ |
| income_categories | 收入來源（動態管理） | ✅ |
| expense_categories | 支出分類（動態管理） | ✅ |
| japan_categories | 日本收藏分類（兩層） | ✅ |
| japan_items | 日本收藏品項（含 owner_wishlist、owner_quantity） | ✅，📋 待新增 trip_id |
| allowed_users | 日本收藏白名單 | ✅ |
| wishlist_items | 朋友/家人願望清單（含 quantity） | ✅ |
| trips | 旅行行程 | ✅ |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） | ✅ |
| spot_types | 景點主類型（含 is_chain_store） | ✅ |
| spot_subtypes | 景點子類型（含 is_chain_store） | ✅ |
| trip_days | 每日行程（關聯 trips） | ✅ |
| day_spots | 每天景點安排（關聯 trip_days + spots） | ✅ |
| travel_coupons | 優惠券，全站共用 | ✅ 已建立 |
| travel_subway_maps | 地鐵圖 | ✅ 已建立，📋 待調整為全域分類庫（移除 trip_id） |
| trip_subway_categories | trip_id + category，行程關聯的地鐵圖分類 | 📋 規劃中 |
| spot_transport_routes | 景點間交通方式（origin/destination/mode/duration/cost/note/timetable_url/subway_map_category） | 📋 規劃中 |
| trip_collaborators | trip_id + user_email + can_edit_wishlist + can_edit_itinerary | 📋 規劃中 |

### Storage Buckets

| Bucket | 狀態 |
|--------|------|
| post_images | ✅ PUBLIC |
| japan_images | ✅ PUBLIC |
| travel_images | ✅ PUBLIC |
| travel_coupons | ✅ PUBLIC |
| travel_subway_maps | ✅ PUBLIC |

---

## 五、Vercel 環境變數清單

| 變數名稱 | 用途 | 備註 |
|---------|------|------|
| PUBLIC_SUPABASE_URL | Supabase 連線 | 前端可見 |
| PUBLIC_SUPABASE_ANON_KEY | Supabase 驗證 | 前端可見 |
| VERCEL_DEPLOY_HOOK | 觸發重新部署（新 hook，2026-07-11 汰換） | 後端專用 |
| ADMIN_EMAIL | /api/trigger-deploy 管理員比對 | 後端專用 |
| SERPAPI_KEY | 探索日本搜尋 | 後端專用 |
| PUBLIC_GOOGLE_MAPS_KEY | 旅行地圖 Google Maps | 前端可見 |
| PUBLIC_ADMIN_EMAIL | 管理者 email 判斷 | 前端可見 |

---

## 六、待辦事項總覽（當前最優先）

1. 🔴 **最優先**：「OAuth 登入後 UI 間歇性未切換」Heisenbug（見上方「進行中問題」）。第一輪時序診斷已完成（2026-07-11）：嫌犯一、二均排除，trip.astro auth 管線健康，與 DevTools 開關無因果；診斷碼留在線上，等待真實失敗發生時依取證 SOP 抓 log，定案根因後修復,方能確認階段 2.5 真正收尾。2026-07-11 驗證任務 D 時新增一筆疑似同根因家族的觀察（朋友帳號登入 `/trip` 一度被誤判成管理員，方向與原記錄相反），未確認是否同一問題，下次排查時一併納入
2. 補做「衝突熱點稽核」修復（commit `2317d2d`）的手動驗證：ESC 鍵、Modal 背景點擊是否都能正確關閉並清除 `modal-open`（原定驗證因發現上述問題而中斷）
3. **階段 3**：japan_items 加入 trip_id 篩選邏輯（收藏依行程篩選）
4. **階段 4**：trip_collaborators 協作者權限系統
5. **階段 5**：旅行資源頁面（優惠券 + 地鐵圖分類）
6. **階段 6**：交通查詢系統（spot_transport_routes + AI 整理）
7. **階段 7-8**：AI 助手分頁與 Serverless API 串接
8. /trip 穩定後評估是否移除舊的 /travel 與 /japan 頁面
9. **階段 9**（全部功能穩定後）：程式碼清理與重構，含 CSS/ID 前綴隔離補齊（衝突熱點稽核中發現、決議延後的項目）

---

## 七、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 和 PROJECT_PROGRESS.md，這三個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
