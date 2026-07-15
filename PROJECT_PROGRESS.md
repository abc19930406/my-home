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

### 🔶 /trip 整合頁面（階段 1、2、3、4、5、6、7、8、9 第一個任務已完成，階段 2.5 有未解決問題待釐清，階段 9 其餘清理項目未開始）

將 `/travel` 與 `/japan` 整合為單一頁面 `/trip`，含 Desktop/Mobile 雙版面、AI 助手分頁（唯讀版 ✅ 已上線，V2 階段 7；寫入工具規劃中，階段 8）、協作者權限系統（✅ 已全數落實，V2 階段 4）。詳細架構規劃見 **PROJECT_ARCHITECTURE_V2.md**。

#### 已完成項目

- **頁面骨架**（trip.astro）：
  - Desktop / Mobile 雙版面（依裝置寬度切換完全不同版面模板）
  - 三分頁切換：行程 / 收藏 / AI（AI 分頁唯讀版已上線，見「V2 階段 7」）
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
- ~~已知非安全性問題（待後續清理）：`posts/index.astro` 的編輯/刪除只檢查 `error` 是否為空，未檢查實際受影響筆數，非管理員操作被 RLS 擋下時前端仍誤報成功~~ **✅ 2026-07-11 收尾清理任務已修復**：update/insert/delete 三處呼叫比照 C3、任務 H 的做法補上 `.select()` 受影響筆數檢查，0 筆時提示「沒有權限或資料不存在」

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

### ✅ 安全修復：日本收藏（japan_items / japan_categories）寫入鎖定管理員專用（2026-07-11，任務 D 稽核發現接續任務 G，已結案）

- **背景**：SECURITY_AUDIT.md 盤點列為 HIGH——兩張表的 SELECT 為刻意保留的公開展示設計（收藏頁本質上任何人瀏覽合理），本次**不動**；問題在寫入：INSERT/UPDATE/DELETE 政策只檢查 `auth.role() = 'authenticated'`，任何登入帳號（含白名單朋友/家人）皆可完整新增/修改/刪除全部收藏品項與分類
- **🔍 執行前稽核發現（本次任務的重要副產品，具獨立參考價值）**：動工前依任務要求逐一比對兩張表所有 `.insert()/.update()/.delete()` 呼叫點，是否都有 `isAdminUser` 判斷守護，結果「前端所有寫入功能都掛 isAdminUser 判斷」這個原始假設**不成立**：
  - `japan_categories`（4 個寫入點）：刪除主分類、刪除子分類、新增子分類 3 個——因為事件監聽器只在 `if (isAdminUser) { renderManageCategoryRows(); }` 分支內才會被綁定，等同被守住；**新增主分類**（`#btn-add-main-cat`）1 個——監聽器在 script 頂層無條件綁定，handler 內無任何 `isAdminUser` 檢查，純靠 CSS `admin-only { display:none }` 隱藏按鈕
  - `japan_items`（5 個寫入點）：僅「管理員調整數量」1 個有明確 inline `if (role === 'admin' && isAdminUser)` 檢查；其餘 4 個（新增/編輯品項表單送出、切換擁有者願望清單、刪除品項）皆透過掛在整個卡片容器（`itemsGrid`）上的**委派事件監聽器**處理，該監聽器無條件綁定，對應的 `if (btnEdit)/if (btnDelete)/if (btnWishlistAdmin)` 分支內完全沒有 `isAdminUser` 檢查
  - 關鍵技術細節：裝著編輯/刪除按鈕的 `.card-admin-actions` 容器**在每張卡片都會被渲染**（只是 inline style 依 `isAdminUser` 決定 `display: flex` 或 `none`），DOM 元素與事件監聽器對任何訪客（含完全未登入者）都實際存在，只是視覺隱藏。理論上任何人在瀏覽器 Console 對隱藏元素呼叫 `.click()`（不需先讓它可見）即可觸發寫入請求，此前資料庫端毫無防備
  - **教訓（已寫入 PROJECT_ARCHITECTURE.md 對應章節，供未來開發參照）**：「前端隱藏」（CSS `display:none`／`admin-only` class）與「資料庫規則」（RLS）是兩件完全獨立的事，看得到按鈕被藏起來不代表寫入請求真的被擋住。**新增任何寫入功能時，一律先確認 RLS 是否已限制，不要只靠前端判斷或按鈕隱藏當作安全邊界**
  - 此發現已回報使用者並取得明確同意後才繼續執行 RLS 修復；發現本身不影響 RLS 該怎麼設計（前端功能的設計意圖仍然是僅供管理員使用，只是實作有缺陷，缺陷本身正是需要 RLS 補上的理由）
- **修復**：RLS 重用任務 B 已建立的 `public.is_admin()`；`japan_items`、`japan_categories` 的 SELECT 政策維持不動，INSERT/UPDATE/DELETE 一律改為僅 `is_admin()`
- **驗證結果（2026-07-11，使用者實測）**：
  - 未登入訪客瀏覽 `/japan`、`/trip` 收藏分頁 → 正常瀏覽/搜尋/篩選，SELECT 不受影響 ✅
  - 管理員於 `/trip` 新增/編輯/刪除收藏品、管理分類 → 正常 ✅
  - 朋友帳號 session 直接繞過頁面呼叫 API：新增分類 → `403 Forbidden`（明確拒絕）✅；刪除品項 → 網頁回應 `success:true/204`，但 Table Editor 確認資料庫該筆資料**實際未被刪除**，確認是 RLS 靜默擋下（PostgREST 對 RLS 擋下的 DELETE 仍回傳成功狀態，不能只看回應，需查資料庫本身）✅
  - 朋友帳號既有的願望清單勾選、數量調整功能 → 不受影響，行為與修改前一致 ✅
- **過程中發現、記錄但未處理的異常（不在本次任務範圍，`/japan` 為凍結頁面不得修改）**：驗證時發現管理員在**舊版 `/japan` 頁面**（非 `/trip`）新增收藏品項時會完全卡住無反應、Console 無任何錯誤訊息、隨後整頁失去回應；同一管理員帳號在 `/trip` 操作完全正常。判斷與本次 RLS 修改無關（RLS 只認登入者身分，不分請求來自哪個頁面；且 `/trip` 用同一帳號寫入正常，證明 `is_admin()` 判斷本身沒問題），較可能是 `japan.astro` 獨立管理 Supabase session 的既有問題（架構與 `/trip` 單一入口不同）。因 `/japan` 屬凍結頁面，依規則不修改，僅記錄；`/trip` 才是實際使用中的頁面，不影響本次任務驗收
- 隱私修復任務 C（短文照片/媒體）已拆分為短文媒體改版任務 C1、C2、C3 執行完成，詳見下方對應章節

### ✅ 安全修復：短文照片改用私有 bucket + 簽名網址（2026-07-11，短文媒體改版任務 C1，已結案）

- **背景**：短文照片原存於 PUBLIC bucket `post_images`，網址一旦產生就永久公開，跟文章 visibility 完全脫鉤——即使文章設為 private，照片本身還是任何人都能直接連進去看
- **盤點結果**：`posts` 表僅 1 篇文章（id=7「躁鬱」，private）有照片；`post_images` bucket 實際有 11 個檔案，但只有 1 個真正被文章引用，其餘 10 個是孤兒檔案（無任何文章指向）
- **修復**：
  - 新增私有 bucket `post_media`，路徑規則 `{post_id}/{檔名}`；RLS 政策（重用 `is_admin()`/`is_friend()`）：SELECT 條件與 posts 表本身一致（public / 管理員 / friends 且在白名單），管理員另有無條件讀取整個 bucket 的例外（因應新增文章時照片先存 `pending/` 暫存資料夾、文章尚未存檔仍需預覽的情境）；INSERT/UPDATE/DELETE 一律僅 `is_admin()`
  - `posts.image_url`/`image_urls` 欄位語意改變：現在存**路徑**，不是網址（簽名網址 1 小時過期，不能落地存資料庫）；頁面渲染時才動態呼叫 `createSignedUrl` 換成當下有效網址
  - 唯一被引用的那個檔案手動搬遷至 `post_media/7/`，`posts` 表對應欄位更新前已請使用者匯出備份、確認試算清單
  - 新增文章的上傳流程改為：`pending/{隨機檔名}` 暫存 → 文章存檔拿到 `id` → `move()` 搬進 `{id}/` → 二次 `UPDATE` 寫回正式路徑；編輯既有文章則直接上傳至已知的 `{id}/`，不經過 `pending/`
- **驗證結果（2026-07-11，使用者實測）**：
  - 未登入訪客直接訪問 private 文章網址 → 完全看不到任何照片痕跡，原始碼無 storage 網址 ✅
  - 簽名網址過期測試：存下 `/posts/7` 的照片網址，超過 1 小時後重開 → 確認失效 ✅
  - 管理員/朋友帳號依權限各自看得到該看的照片 ✅
  - 管理員發新文章上傳照片 → 正常進 `post_media`、路徑正確、顯示正常（過程中出現一次性、無法重現的失敗，使用者判斷是「照片還沒上傳完成就按發布」，屬既有上傳流程沒有防呆的既知風險，非本次改動導致，記錄於下方待辦）
- **待辦（非本次任務範圍，僅記錄）**：上傳表單沒有「上傳中禁止送出」的防呆機制，太快按發布可能導致該次照片遺失（沿用既有設計缺口，新舊系統皆有此風險）；`post_images` 舊 bucket 內 11 個檔案原樣保留未刪，日後由使用者自行於 Dashboard 清理

### ✅ 短文照片呈現改版：瀑布流 + 燈箱（2026-07-11，短文媒體改版任務 C2，已結案）

- **背景**：C1 完成後，原本的簡易輪播呈現方式維持不變；此任務只改呈現，不動保護機制
- **修復**：
  - `posts/[id].astro`：多張照片改為 CSS columns 瀑布流（桌面 3 欄、手機 2 欄），照片保持原始比例（`width`/`height` HTML 屬性提供載入前佔位，避免跳版，載入後仍依實際比例顯示，不裁切）；點擊任一張開啟燈箱（全螢幕深色遮罩、置中大圖、左右箭頭、張數指示、右上關閉鈕、手機支援手指滑動切換）
  - 燈箱三種關閉路徑（關閉鈕、點遮罩空白處、ESC 鍵）皆清除 `body.modal-open`；相關 class/id 皆加 `post-` 前綴
  - `posts/index.astro`：列表卡片新增封面縮圖（取第一張照片）+ 右下角張數徽章（如「6 張」），單張不顯示徽章
  - 視覺沿用這兩頁既有的圓角卡片、陰影語彙，未引入新視覺語言；純 CSS + 原生 JS，無第三方套件
- **驗證結果（2026-07-11，使用者實測）**：多圖瀑布流排列、點圖放大、左右切換、三種關閉方式皆正常且捲動不卡住 ✅；單圖與無圖文章版面正常 ✅；手機 2 欄瀑布流 + 滑動切換正常 ✅；未登入看 public、朋友看 friends 呈現皆正常 ✅
- **過程中發現並修復的問題（本次任務範圍內的迴歸，已修正非僅記錄）**：
  - 列表頁一度出現同一篇文章重複顯示 3 次——根因是 `fetchPrivatePosts()` 新增的「算封面縮圖」非同步步驟，插在「檢查是否已顯示」與「插入畫面」中間，而 `onAuthStateChange` 本來就會連續觸發多次（見前述 Heisenbug 相關記錄），多次並發呼叫都在插入前通過了檢查。修法：插入前再檢查一次，徹底關閉這個競態窗口（JS 單執行緒特性下,兩次檢查中間沒有 await,可完整避免同一篇被搶插兩次）
  - 已確認資料庫本身沒有真的產生重複列，純屬前端渲染的競態，資料庫 `posts` 表 id=7 只有 1 筆

### ✅ 短文新增媒體支援：YouTube / 短片 / 錄音（2026-07-11，短文媒體改版任務 C3，已結案）

- **背景**：C1、C2 完成後，文章僅支援文字與照片；此任務新增 YouTube 非公開影片內嵌、短片上傳（50MB 內）、錄音上傳，短片與錄音沿用 C1 的私有 bucket 保護機制
- **新表**：`post_media_items`（id uuid、post_id→posts、kind：youtube/clip/audio、value：youtube 存解析出的影片 ID，clip/audio 存 `post_media` 路徑、sort_order、created_at）；RLS 重用 `is_admin()`/`is_friend()`，SELECT 條件與 posts 表一致，INSERT/UPDATE/DELETE 僅 `is_admin()`
- **編輯器（posts/index.astro）**：新增「媒體」區塊，YouTube 貼網址自動解析影片 ID（格式錯誤即時提示）、短片/錄音上傳（超過 50MB 直接擋下並提示改用 YouTube，上傳中/失敗皆有明確提示不靜默）；已加入項目可用 ↑↓ 排序、可個別刪除；新文章的短片/錄音沿用 C1 的 `pending/` 暫存機制，存檔取得 `id` 後搬移歸位並寫入 `post_media_items`；編輯既有文章則做差異同步（刪除、排序更新、新增）
- **渲染（posts/[id].astro）**：文字後方新增影片區塊（YouTube 用 `youtube-nocookie.com` 隱私增強模式內嵌、短片用原生 `<video>`）與錄音區塊（原生 `<audio>`），SSR（public）與前端動態渲染（friends/private）兩路徑皆支援；顯示順序為「照片瀑布流 → 文字 → 影片 → 錄音」（經與使用者確認，C2 既有的「照片在文字前」版面不變，僅在文字後方依序加影片、錄音區塊）；同類型（例如兩支短片）依 `sort_order` 排序，不同類型（影片 vs 錄音）的區塊順序固定，不受 `sort_order` 影響
- **驗證結果（2026-07-11，使用者實測）**：YouTube／短片／錄音三種皆可在文章內直接播放不跳離頁面 ✅；超過 50MB 短片被正確擋下並提示 ✅；private 文章未登入者完全看不到（含媒體）✅；朋友帳號看 friends 文章三種媒體皆正常播放 ✅；刪除媒體項目、同類型項目排序調整，單篇頁皆正確反映 ✅；1 小時簽名網址過期沿用 C1 已驗證機制，本次未重測
- **過程中發現並修復的問題（本次任務範圍內，已修正非僅記錄）**：
  - iOS「語音備忘錄」錄音檔在 `accept="audio/*"` 篩選下選不到（iOS 對這類匯出檔案的 MIME 類型判定不一致的已知現象）：放寬 `accept` 屬性加入 `.m4a,.caf,.aac,.mp3,.wav`；另確認 iOS 無法直接從網頁存取語音備忘錄 App 內部錄音，需先在語音備忘錄用「共用→儲存到檔案」匯出後才能上傳，此為蘋果平台限制非本站問題
  - 排序調整的 `UPDATE` 呼叫原本沒有檢查受影響筆數，若被 RLS 靜默擋下會誤判成功（此專案已多次遇到同一類坑）：補上 `.select()` 檢查回傳筆數，筆數為 0 時明確 alert
  - 手機上傳長檔名媒體（如 iOS 產生的 UUID 檔名）會把整個編輯表單卡片撐寬到超出螢幕，且外層 `overflow-x: hidden` 讓使用者完全無法捲動觸及被推出畫面的「發布/更新文章」按鈕：第一次僅修正媒體清單本身的 flex `min-width:0` 不夠，實際根因是外層 `.notebook-page`（flex 項目）沒有 `min-width: 0`，導致內容撐大整張卡片；用瀏覽器工具在 375px 手機視窗實測確認根因與修法後才寫入正式修復，補上 `.notebook-page { min-width: 0 }`
  - YouTube 一度「上傳失敗」，事後確認是使用者貼完網址後忘記點「新增」按鈕，非程式問題
- 至此短文媒體改版任務 C1（私有 bucket）、C2（瀑布流+燈箱）、C3（YouTube/短片/錄音）全數結案；未做項目維持任務排除範圍：頁面內直接錄音、影片轉檔壓縮、既有照片搬進 `post_media_items`

### ✅ 安全修復：語錄（quotes）收斂為三級保護（2026-07-11，隱私修復任務 H，已結案）

- **背景**：`quotes` 表雖然前端表單早就有 public/friends/private 三級選項，但資料庫從未真正把關——任何登入帳號（含朋友）皆可讀寫全部語錄；`fetchPrivateQuotes` 的渲染邏輯把 `isAdmin` 寫死 `true`，只要有 session 就顯示編輯/刪除按鈕、也把 private 語錄一併顯示給朋友看
- **修復（架構細節見 PROJECT_ARCHITECTURE.md「語錄三級保護架構」）**：
  - RLS：重用 `is_admin()`/`is_friend()`，SELECT 收斂為 `visibility='public' OR is_admin() OR (visibility='friends' AND is_friend())`，INSERT/UPDATE/DELETE 一律僅 `is_admin()`
  - 前端：`fetchPrivateQuotes` 的 `isAdmin` 改為真正比對 `session.user.email === adminEmail`（新增 `adminEmail` 透過 `define:vars` 注入，此頁原本沒有這個管道）；update/delete 呼叫補上 `.select()` 檢查受影響筆數，0 筆時明確提示「沒有權限或資料不存在」而非誤報成功
- **驗證結果（2026-07-11，使用者實測）**：未登入僅見 public 語錄 ✅；朋友帳號看得到 public+friends、看不到 private，friends 語錄卡片不再顯示編輯/刪除按鈕 ✅；管理員三級皆可讀寫，下拉選單三值各測一輪正常 ✅；朋友帳號透過 Console 強行呼叫寫入得到明確「沒有權限」提示而非誤報成功 ✅
- **過程中的插曲（已釐清，非 bug）**：
  - 朋友帳號在 **public 語錄卡片**（SSR 渲染）上仍看得到編輯/刪除按鈕、且當下（RLS 未收緊前）能成功寫入——這是既有的、範圍外的 `checkAdmin()` 全域「有 session 即管理員」判斷造成，`.admin-only` class 在編譯時已寫死在 public 卡片 HTML 裡，不受本次 `fetchPrivateQuotes`（2026-07-11 稍後更名為 `refreshQuotesList()`，見下方排序修正記錄）修正影響；RLS 收緊後實際寫入已被擋下，僅剩 UI 顯示不精確，記錄於 PROJECT_ARCHITECTURE.md，留待未來一併處理
  - 管理員將一則語錄的 visibility 從 public 改為 friend，更新當下「看起來沒反應」：實際上 Table Editor 確認資料庫已正確變更，且程式碼覆核確認成功提示 toast 有無條件觸發，只是 1.5 秒的提示訊息被使用者切換視窗查資料庫時錯過，非真正的靜默失敗
- ~~測試中發現、記錄但未處理的獨立問題：`posts`、`quotes` 兩個頁面登入狀態下的列表排序皆會錯亂~~ **✅ 2026-07-11 已修復**（獨立 session 執行，見下方「posts/quotes 列表排序修正」記錄）

### ✅ posts/quotes 列表排序修正（2026-07-11，已結案，於獨立 session/分支執行後合併）

- **背景**：任務 H 驗證時發現的獨立問題（見上方），與當時任務的 RLS/isAdmin 修改無關
- **根因**：`posts/index.astro`、`quotes/index.astro` 原本 build time 只抓 `visibility='public'` 內容排序後烘進靜態 HTML；登入後另外呼叫 `fetchPrivatePosts()`/`fetchPrivateQuotes()` 抓 friends/private 內容，用 `insertAdjacentHTML('afterbegin', ...)` 逐筆插在最前面。造成 (1) private/friends 內容一律排在所有 public 內容之前，不管實際發布時間早晚 (2) 逐筆 `afterbegin` 插入還會讓 private 內容彼此之間的順序反過來
- **修復**：兩頁改為一致做法——`refreshPostsList()`/`refreshQuotesList()`：登入後一次性重抓「全部」內容（不分 public/friends/private，交由 RLS 過濾），依 `created_at` 整體排序後整個列表重繪（不再是插入式的局部更新）；用遞增 `seq` 序號避免 `onAuthStateChange` 短時間內連續觸發時，較舊的回應覆蓋較新的畫面（沿用 trip.astro 的 `authUIUpdateSeq` 手法）；`quotes` 的 `page-num` 頁碼標籤原本因插入邏輯只能顯示死值 `"new"`，改為依整體重繪後的陣列位置正確計算
- **狀態**：commit `051d33d`，已合併進 main（`d664c92`），commit message 記錄「已在 Preview 部署驗證正確」；本記錄由後續 session 依 commit 內容整理，非本 session 直接參與開發或於正式環境重新驗證，若後續發現排序異常可從這裡回頭查

### ✅ V2 階段 3：收藏依行程篩選（2026-07-12，已結案）

- **背景**：`japan_items` 支援歸屬行程，`/trip` 收藏分頁可依行程篩選；架構規劃詳見 PROJECT_ARCHITECTURE_V2.md 第四節
- **資料庫**：新增 `japan_items.trip_id`（可空，FK → `trips.id`，`ON DELETE SET NULL`——刪除行程時品項自動退回一般收藏，不連帶刪除）；RLS 未改動，SELECT 本就是刻意公開的展示設計、寫入已於任務 G 收斂為僅 `is_admin()`，新欄位不改變保護模型
- **前端（`JapanCollection.astro`）**：
  - 篩選為前端邏輯，資料照現行方式全量載入後在瀏覽器端過濾
  - 管理員新增/編輯品項表單新增「歸屬」下拉（一般收藏 + 行程清單）
  - 歸屬行程的品項卡片顯示行程名稱徽章，一般收藏不顯示
  - **與原規劃不同**：原規劃是篩選跟隨「行程」分頁目前選中的行程（透過既有的 `window.currentTripId`/`trip-changed` 掛鉤），且僅管理員可切換篩選範圍。開發驗收時使用者提出調整：(1) 收藏分頁改用完全獨立的行程下拉選單直接選行程，與「行程」分頁選中哪個行程無關；(2) 篩選器開放給所有人使用（含朋友帳號、未登入訪客），不再限管理員。已依新方向重新實作，`window.currentTripId`/`trip-changed` 機制本身未被移除，仍供「行程」分頁自己使用
  - `japan.astro`、`travel.astro` 兩個凍結頁面完全未修改，diff 為零
- **驗證結果（2026-07-12，使用者實測）**：未指派品項前顯示與改版前完全一致 ✅；指派/切換/改回一般收藏，卡片徽章與篩選結果皆正確反映 ✅；收藏分頁切換行程即時重篩 ✅；設計調整後的獨立選單與開放對象（管理員/朋友/訪客皆可用）驗證通過 ✅；`/japan` 舊頁面全量顯示、功能照舊 ✅

### ✅ V2 階段 4 任務一：協作者權限系統地基（2026-07-12，已結案，共三個子任務，本次僅第一個）

- **背景**：階段 4 規劃建立 `trip_collaborators` 表，讓每個行程可指定協作者並給予「調整願望清單」「編輯行程」兩個獨立權限開關；規劃詳見 PROJECT_ARCHITECTURE_V2.md 第六節。本任務範圍**只建地基**（資料表 + RLS + 管理員管理 UI），刻意不落實任何實際權限效果——新增協作者此時不會讓對方獲得任何額外寫入權限，是預期行為
- **執行前盤點（唯讀，供後續兩個子任務設計參考）**：
  - `spots` 表已有 `trip_id`（uuid，FK → `trips.id`），是景點的唯一歸屬欄位；但該欄位資料庫層**可為 NULL**，`TripPlanner.astro` 的 `spotPayload`（約第 2864 行）目前每次寫入都會帶 `trip_id`，實務上不會留空——與 `japan_items.trip_id`（NULL 是刻意設計的「一般收藏」）意義不同，這裡的可空比較像遺留而非刻意設計，留意未來若要以「景點屬於哪個行程」做協作者權限判斷的邊界情況
  - `day_spots` 只有 `spot_id → spots.id`、`day_id → trip_days.id` 兩條獨立外鍵，**資料庫層沒有任何約束驗證「spot 的 trip_id」與「day 所屬 trip_days 的 trip_id」一致**，也沒有 UNIQUE 擋住同一個 spot_id 出現在多筆 day_spots。目前是靠前端（`TripPlanner.astro` 第 1980 行，選點清單過濾 `spot.trip_id == currentTripId`）限制使用者只能把自己行程的景點排進自己行程的天數，繞過前端理論上可讓一個 spot 被跨行程引用。屬記錄性質，本次任務範圍不修
  - `TripPlanner.astro` 新增/編輯景點寫入的欄位（`spotPayload`）：`trip_id`、`name`、`place_id`、`spot_type_id`、`spot_subtype_id`、`address`、`lat`、`lng`、`open_hours`、`price`、`note`、`status`、`rating`、`images`，共 13 個；`spots.category`/`spots.icon`（DB 為 `NOT NULL`，有預設值）從未被前端寫入，一律吃預設值 `'景點'`/`'📍'`，推測是被 `spot_type_id`/`spot_subtype_id` 兩層分類系統取代後尚未清理的舊欄位
- **資料庫**：新增 `trip_collaborators`（`id` uuid PK、`trip_id` uuid NOT NULL FK→`trips.id` `ON DELETE CASCADE`、`user_email` text NOT NULL、`can_edit_wishlist`/`can_edit_itinerary` boolean 預設 false、`created_at`，`UNIQUE(trip_id, user_email)`）；RLS 重用既有 `public.is_admin()`：SELECT 為 `is_admin() OR lower(user_email)=lower(auth.jwt()->>'email')`（協作者可讀到自己那一列），INSERT/UPDATE/DELETE 一律僅 `is_admin()`
- **前端（`TripPlanner.astro`）**：行程標題（「景點清單」旁）新增 👥 圖示按鈕（`admin-only`），開啟 `travel-collaborators-modal`：列出目前選中行程的協作者（email + 兩個開關 + 移除鈕），下方表單可新增協作者（email 前端 trim + 轉小寫）；新增/切換開關/移除三種寫入操作皆用 `.select()` 檢查受影響筆數，0 筆時明確提示「沒有權限或資料不存在」而非誤報成功；Modal 三種關閉路徑（按鈕、背景點擊、ESC）統一收斂到 `closeCollaboratorsModal()`，皆會清除 `body.modal-open`；Modal ID/class 加 `travel-` 前綴
- **驗證結果（2026-07-12，使用者實測）**：管理員新增協作者、切換兩個開關、移除再重新加入，清單皆正確反映 ✅；朋友帳號登入看不到協作者管理入口，Console 直查 `trip_collaborators` 只回傳自己那一列，寫入被拒且提示正確 ✅；Modal 三種關閉方式後頁面捲動正常 ✅；`/japan`、`/travel` 凍結頁面完全未修改，diff 為零
- **明確排除（留待階段 4 後續兩個子任務）**：`can_edit_wishlist`/`can_edit_itinerary` 兩個欄位目前只是被記錄，`spots`/`trip_days`/`day_spots`/`japan_items` 等表的 RLS 完全沒有讀取這兩個欄位，協作者此時仍無法編輯任何東西；Sandbox 模式未開發

### ✅ V2 階段 4 任務二：落實 can_edit_itinerary（2026-07-13，已結案）

- **背景**：任務一（見上方）建好 `trip_collaborators` 地基後，`can_edit_itinerary` 欄位只是被記錄，未在任何表的 RLS 中生效。本任務讓協作者可依授權實際編輯行程；同時關閉任務一盤點發現的 `day_spots` 跨行程資料完整性漏洞
- **資料庫**：
  - 新函式 `public.can_edit_trip(p_trip_id uuid)`（`SECURITY DEFINER`）：`is_admin() OR EXISTS(該行程 trip_collaborators 中 can_edit_itinerary=true 的自己那一列)`
  - `trips`：INSERT/UPDATE/DELETE 收斂為僅 `is_admin()`——協作者不能建立/改名/刪除行程本身
  - `trip_days`（原為一條 `Authenticated users can manage trip_days` 的 ALL 政策）、`spots`（原 `spots_insert`/`spots_update`/`spots_delete`）：拆分/替換為用 `can_edit_trip(trip_id)` 判斷；`spots.trip_id` 為 NULL 的遺留景點（任務一盤點發現的邊界情況）因 `EXISTS` 子查詢比對 NULL 恆為 false，`can_edit_trip(NULL)` 只剩 `is_admin()` 會過，只有管理員能動，符合預期
  - `day_spots`（原為一條 `Authenticated users can manage day_spots` 的 ALL 政策）：改用 `can_edit_trip((SELECT trip_id FROM trip_days WHERE id = day_id))`；INSERT/UPDATE 的 `WITH CHECK` 額外檢查 `(SELECT trip_id FROM spots WHERE id = spot_id) = (SELECT trip_id FROM trip_days WHERE id = day_id)`——關閉任務一盤點 Q2 發現的「可把 A 行程景點塞進 B 行程某一天」漏洞，只擋新寫入不影響既有資料
  - 四張表的 SELECT 政策完全不動（公開展示為刻意設計）
- **前端（`TripPlanner.astro`）**：
  - 新增 `canEditItinerary(tripId)` 判斷（管理員恆真，或協作者在該行程 `can_edit_itinerary=true`）；登入後（`updateAuthUI` 的非管理員分支）查詢 `trip_collaborators` 取得自己在各行程的授權並快取為 `collaboratorTripPermissions`
  - 四個編輯進入點（新增景點按鈕、地圖點擊新增提示、新增一天按鈕、從想去清單選擇按鈕）從 `admin-only` 改為新的 `itinerary-edit-only` class，由 `updateItineraryEditUI()` 依目前選中行程動態切換顯示
  - 天數上下移/刪除、景點卡片編輯/刪除、每日行程項目移動/移除、地圖 InfoWindow 編輯鈕等原本內嵌 `isAdminUser` 判斷的渲染邏輯，一併改用 `canEditItinerary(currentTripId)`
  - 監聽 `trip-changed` 事件，切換行程時重新評估並刷新 `itinerary-edit-only` 元素顯示
  - 行程本身建立/改名/刪除、協作者管理、管理類型維持 `admin-only` 不變，未受影響
  - 授權撤銷生效時機：資料庫層即時（下一次寫入就被拒），前端 UI 允許在重新整理或切換行程時更新，未做即時推播
- **驗證結果（2026-07-13，使用者實測）**：管理員所有行程的所有編輯功能一切照舊 ✅；協作者（對行程 A 開啟 `can_edit_itinerary`）選中行程 A 可見編輯功能，新增景點、加入天數、調整順序、刪除皆成功 ✅；同一協作者切到未授權的行程 B，編輯功能消失，Console 直接寫入 `trip_days`/`spots`/`day_spots` 皆 0 筆生效且前端提示正確 ✅；關閉該協作者的 `can_edit_itinerary` 後續寫入被拒 ✅；非協作者的白名單朋友與未登入訪客頁面瀏覽與既有功能行為不變 ✅；Console 嘗試把行程 A 的景點塞進行程 B 的某一天，被完整性檢查擋下 ✅；`/japan`、`/travel` 凍結頁面完全未修改，diff 為零
- **明確排除（留待階段 4 任務三）**：`can_edit_wishlist` 未落實，`japan_items` 的 RLS 未讀取此欄位，協作者尚無法調整願望清單；Sandbox 模式未開發；願望清單機制未變動；任務一盤點發現的 `spots.category`/`icon` 遺留欄位問題未修（見待辦清單）

### ✅ V2 階段 4 任務三：落實 can_edit_wishlist + Sandbox 模式（2026-07-13，已結案，階段 4 全部結案）

- **背景**：任務二落實了 `can_edit_itinerary`，本任務落實剩下的 `can_edit_wishlist`（行程收藏品的願望清單由協作者權限管控），並收緊 `wishlist_items` 原本對「任何登入帳號」開放的寫入縫隙；同時完成 Sandbox 模式（非管理員在 `/trip` 看不到 AI 分頁與任何連回主站的入口）
- **資料庫**：
  - 新函式 `public.can_wishlist_item(p_item_id bigint)`（`SECURITY DEFINER`，注意 `japan_items.id` 是 `bigint` 非 `uuid`）：管理員恆可；品項 `trip_id IS NULL`（一般收藏）→ 沿用白名單機制回傳 `is_friend()`；品項有 `trip_id`（行程收藏）→ `EXISTS(該行程 trip_collaborators 中 can_edit_wishlist=true 的自己那一列)`
  - `wishlist_items`（原政策 `Users can manage own wishlist`(INSERT)、`Users can update own wishlist quantity`(UPDATE) 只檢查 `auth.uid()=user_id`，任何登入帳號皆可對任意品項寫入）：INSERT/UPDATE 改為 `auth.uid()=user_id AND can_wishlist_item(japan_item_id)`；**DELETE（`Users can delete own wishlist`）與 SELECT（`Authenticated users can read wishlist`）刻意不動**——就算權限被撤，本人永遠能收回自己標過的願望，不留殘留；SELECT 對所有登入帳號開放是既有設計（「❤️ N 人想買」統計依賴它），本次不動
- **前端（`JapanCollection.astro`）**：
  - 新增 `canWishlistItem(item)` 判斷，邏輯與 SQL 函式一致；登入的白名單使用者另外查詢自己的 `trip_collaborators` 授權並快取為 `collaboratorTripPermissions`（此元件自己查一次，不與 `TripPlanner.astro` 共用快取，避免耦合）
  - 願望清單 📌 圖示的渲染條件從單純 `isAllowedUser` 改為「有權限操作(`canWishlistItem`)或已經標記過(`isUserWishlisted`)任一為真」；不符合任一條件的品項完全不渲染操作 UI（沿用既有訪客看到的樣式，未發明新樣式）
  - **驗證中發現並修復的問題**：第一版把 📌 圖示完全綁在 `canWishlistItem(item)` 上，權限被撤後圖示直接消失，導致使用者無法透過畫面收回已標記的願望，跟 DELETE 政策「永遠可收回」的設計初衷矛盾（commit `f51c13d`）。修復為：已標記或仍有權限任一為真就顯示 📌；數量調整器則維持只在仍有權限時才顯示，避免點了卻被 RLS 拒絕產生困惑
- **Sandbox 模式（`trip.astro`）**：
  - AI 分頁的 Desktop 側欄圖示與 Mobile 選單項新增 `trip-admin-only` class（預設 `display: none`），與既有 `admin-home-link`（返回首頁連結）合併在同一段管理員判斷邏輯中一起顯示
  - **全站盤點結果**：`trip.astro`/`TripPlanner.astro`/`JapanCollection.astro` 全文搜尋所有 `<a>` 標籤與 `window.location.href` 賦值，僅 2 個「返回首頁」連結（Desktop + Mobile），已由既有 `admin-home-link` 正確控制；其餘 `<a>` 皆為外部連結（Google Maps、使用者筆記網址、探索日本來源網站），與站內導覽無關；`Layout.astro` 未注入任何全站共用導覽列/footer，無其他洩漏管道；`TripPlanner.astro` 登入按鈕有一個 `window.location.href='/login'` fallback（僅 `auth-modal` 元素不存在時觸發，正常不會執行），判斷為所有人皆需要的登入入口，非站內導覽洩漏，不處理
  - AI 分頁內容本身仍為佔位文字（功能本體屬階段 7）；`switchTab()` 函式技術上可被 Console 直接呼叫繞過按鈕隱藏，但佔位內容無實質資訊，非本階段修補範圍，記錄備查
- **驗證結果（2026-07-13，使用者實測，含一輪修復後複測）**：白名單朋友（非協作者）一般收藏品操作與改版前一致、行程收藏品顯示為不可操作 ✅；協作者對行程 A（開 `can_edit_wishlist`）可標可調、行程 B 不可、不在白名單的一般收藏不可 ✅；關閉協作者的 `can_edit_wishlist` 後新增/調整被拒但可刪除已標記的（第一輪測試失敗，定位為前端渲染邏輯問題並修復後複測通過）✅；管理員一切照舊，含「所有人」模式與「N 人想買」統計 ✅；非白名單陌生 Google 帳號的願望清單寫入被拒 ✅；協作者與朋友帳號檢視 `/trip` 看不到 AI 分頁與任何連回主站的連結，管理員照舊 ✅；`/japan`、`/travel` 凍結頁面完全未修改，diff 為零
- **明確排除**：DELETE 與 SELECT 政策未動；K2 的行程編輯權未動；AI 分頁功能本體未做（仍為佔位，屬階段 7）；一般收藏的白名單機制本身未動

### ✅ V2 階段 5 任務一：「行程」主分頁子分頁化 + 優惠券牆（2026-07-13，已結案）

- **背景**：階段 5 規劃「行程」主分頁底下再分「行程」「交通查詢」「資源」三個子分頁；本任務只建「行程」「資源」兩個子分頁的骨架（「交通查詢」留待階段 6，不放死佔位），並完成「資源」子分頁裡的優惠券區塊，規劃詳見 PROJECT_ARCHITECTURE_V2.md 第三節
- **執行前盤點**：`travel_coupons` 欄位（`id` uuid、`title` NOT NULL、`description`、`image_url`、`link_url`、`sort_order` 預設 0、`created_at`）與 RLS（`travel_coupons_select_all` SELECT 全開、`travel_coupons_admin_all` ALL 鎖 `auth.jwt()->>'email' = 'abc19930406@gmail.com'`）皆與 SECURITY_AUDIT.md 稽核記錄一致，本次未異動 RLS
- **前端（`TripPlanner.astro`）**：
  - 新增子分頁導覽（「行程」「資源」），純前端顯示切換（`switchTripSubtab()`），不重新查詢資料；登入/登出按鈕移至子分頁列，不隨子分頁切換而消失
  - 切回「行程」子分頁時，若地圖容器曾因子分頁切換被隱藏，僅對 Google Maps 觸發 `resize` 事件並用切換前記下的 `center` 還原視野中心，修正可能的 tile 渲染問題，但**不呼叫 `fitBounds`**，避免重置使用者已調整的地圖視野與選取狀態（吸取先前 fitBounds 與渲染耦合的教訓）
  - 「資源」子分頁新增優惠券牆：卡片式呈現圖片（無圖時顯示 placeholder）、標題、說明、連結（`target="_blank"`）；管理員可見卡片右上角編輯/刪除圖示（`admin-only` class，沿用既有機制）；新增/編輯用 Modal（`travel-coupon-modal`，`travel-` 前綴隔離，三種關閉路徑收斂到 `closeCouponModal()`）；圖片上傳沿用 `TripPlanner.astro` 既有的 spot 圖片上傳模式（`crypto.randomUUID()` 檔名 + 直接上傳至 `travel_coupons` public bucket 取得公開網址），未引入新套件；新增/更新/刪除皆用 `.select()` 檢查受影響筆數
  - 資料/渲染/Modal 開關函式（`loadCoupons`/`renderCoupons`/`openCouponModal`/`closeCouponModal` 等）定義在 `initEvents` 外層作用域，因為 `initAuthAndData()` 需要在外層呼叫 `loadCoupons()`——初版誤把這些函式寫在 `initEvents` 內層作用域，導致外層呼叫不到，開發階段自查修正，未流出到驗證階段
- **首頁連結（`CardSection.astro`，使用者追加請求）**：「旅行地圖」卡片子選單新增「🧭 行程與收藏（新版）」連結至 `/trip`，排序置頂於既有 `/travel`、`/japan` 兩個連結之上
- **驗證結果（2026-07-13，使用者實測）**：子分頁來回切換，地圖視野、選中行程、篩選狀態皆保持不變 ✅；管理員新增（含圖片）/編輯/刪除優惠券即時反映 ✅；訪客與朋友帳號看得到卡片與連結、無編輯入口，Console 強行寫入 0 筆生效 ✅；Mobile 版面子分頁與卡片排版正常，Modal 開關後可正常捲動 ✅；首頁「旅行地圖」子選單新連結驗證正常 ✅；`/japan`、`/travel` 凍結頁面完全未修改，diff 為零
- **明確排除**：地鐵圖（`travel_subway_maps` 分類化、`trip_subway_categories`）未做；交通查詢子分頁未做（階段 6）；RLS 未異動

### ✅ V2 階段 5 任務二：地鐵圖改為跨行程共用的全域資源庫（2026-07-13，已結案，階段 5 全部結案）

- **背景**：任務一完成子分頁骨架與優惠券牆後，本任務把地鐵圖從原本規劃的單一行程綁定，改為依 `category`（如「東京」「大阪」）分組的全域資源庫，每個行程透過關聯表選用要顯示的分類，避免同一張圖被不同行程重複上傳，規劃詳見 PROJECT_ARCHITECTURE_V2.md 3.3 節
- **執行前盤點**：`travel_subway_maps` 欄位（`id` uuid、`trip_id` uuid 可空、`title` NOT NULL、`image_url`、`external_url`、`sort_order` 預設 0、`created_at`）與 RLS（`travel_subway_maps_select_all` SELECT 全開、`travel_subway_maps_admin_all` ALL 鎖管理員 email）皆與 SECURITY_AUDIT.md 稽核記錄一致；資料筆數為 0（符合預期，此表 UI 從未開發過），直接照設計動工，未觸發「筆數 > 0 先停下回報」的排除條件
- **資料庫**：
  - `travel_subway_maps` 新增 `category`（text，NOT NULL）欄位；原 `trip_id` 欄位**停用不刪**——新程式碼不再讀寫，保留至階段 9 評估是否清理，這是刻意決定不是遺漏；寫入 RLS 維持管理員限定，本次未異動
  - 新表 `trip_subway_categories`（`id` uuid PK、`trip_id` FK→trips `ON DELETE CASCADE`、`category` text NOT NULL、`UNIQUE(trip_id, category)`）；RLS 建表當下即設計：SELECT 開放，INSERT/DELETE 重用 V2 階段 4 任務二的 `can_edit_trip()` 函式（管理員或該行程 `can_edit_itinerary` 協作者），UPDATE 不開放（要改就刪了重加）
- **前端（`TripPlanner.astro`）**：「資源」子分頁優惠券下方新增地鐵圖區塊，預設依目前行程關聯的分類分組顯示圖片，點圖沿用既有 `#lightbox`（與景點照片共用同一份燈箱元件，未另建新元件）放大檢視；管理員專屬「上傳地鐵圖」Modal（圖片 + 名稱 + 分類 + 選填原始連結，上傳至 `travel_subway_maps` bucket，沿用既有 spot/優惠券圖片上傳模式）；監聽 `trip-changed` 事件，切換行程時重新查詢該行程關聯的分類，全域地鐵圖清單本身只在頁面初次載入時抓取一次，不隨行程切換重抓；「AI 幫我找圖」明確遞延至階段 7（依賴階段 7 才會建置的 AI 後端），本次僅實作手動上傳
- **驗證中發現並修復的問題（本次任務範圍內，已修正非僅記錄）**：
  1. **分類欄位雙控制項設計造成誤解**：第一版「上傳地鐵圖」的分類欄位做成「下拉選單（選既有分類）/文字框（輸入新分類，依下拉選單值動態顯示或隱藏）」，使用者驗收時反映即使從下拉選單選了既有分類，仍誤以為「新分類名稱」是必填，體驗混淆（用瀏覽器直接測試過切換邏輯本身沒有錯，純粹是雙欄位設計不夠直覺）。改為單一輸入框 + `<datalist>` 自動建議既有分類，選現有或打新分類都在同一欄位完成（commit `f82b4ee`）
  2. **「瀏覽全部分類」開放對象與原規劃不同**：原規劃「此功能對管理員與該行程 `can_edit_itinerary` 協作者顯示，與 RLS 一致」。使用者驗收時提出調整：希望朋友/訪客/協作者都能瀏覽並勾選要看哪些分類的相關資訊。因為勾選動作原本會直接寫入 `trip_subway_categories`（全站共用、永久生效），若無條件開放給任何人（含未登入訪客）寫入，會讓匿名訪客永久竄改其他人看到的行程預設內容，於是先用 `AskUserQuestion` 向使用者確認開放範圍，使用者選擇「個人篩選（推薦）」——按鈕改為所有人可見，但勾選行為依身分分流：管理員/`can_edit_itinerary` 協作者的勾選依舊寫入資料庫（設定行程對所有人的預設）；其餘所有人（朋友、無編輯權協作者、匿名訪客）的勾選只更新前端本地變數 `personalSubwayCategorySelection`，不寫入資料庫、不影響其他人，切換行程或重新整理會重置回該行程的預設分類，Modal 內說明文字依身分顯示不同版本（commit `8cb9614`）
- **驗證結果（2026-07-13，使用者實測，含二輪調整後複測）**：管理員上傳兩張不同分類的圖、行程各自關聯不同分類、切換行程只看到自己關聯的、「瀏覽全部分類」兩個行程都能選用同一分類 ✅；協作者（`can_edit_itinerary`）可為有權限的行程加/移分類、對無權限行程不行 ✅；朋友與訪客看得到目前行程的地鐵圖與放大、開放後可個人篩選且不寫入資料庫（瀏覽器實測確認勾選無任何寫入請求、無錯誤）✅；燈箱三種關閉方式後頁面捲動正常、Mobile 排版正常 ✅；`travel_subway_maps.trip_id` 欄位確認未被刪除 ✅；`/japan`、`/travel` 凍結頁面完全未修改，diff 為零
- **明確排除**：「AI 幫我找圖」未做（依賴階段 7 AI 後端）；`trip_id` 欄位未刪除（留待階段 9）；交通查詢子分頁未做（階段 6）
- **本任務的文件同步曾經遺漏**：commit `f358a68`、`f82b4ee`、`8cb9614` 上線後，三份文件（本檔、PROJECT_ARCHITECTURE_V2.md、SECURITY_AUDIT.md）一開始未同步更新，直到使用者主動指出才補做。已將「文件同步與程式碼屬同一任務範圍，文件未更新前不得回報任務完成」寫入 CLAUDE.md 部署規則區，作為後續任務的硬性檢查點

---

### ✅ V2 階段 6 任務一：交通查詢子分頁 + spot_transport_routes（2026-07-13，已結案）

- **背景**：「行程」主分頁新增第三個子分頁「交通查詢」，選起訖點查看/管理兩點間已儲存的交通方式；建立新表 `spot_transport_routes` 作為資料基礎，規劃詳見 PROJECT_ARCHITECTURE_V2.md 3.2 節。本任務設計已定案（新表，非既有表調整），不需要執行前盤點
- **資料庫**：新表 `spot_transport_routes`（`id` uuid PK、`origin_spot_id`/`destination_spot_id` 皆 FK→`spots.id` `ON DELETE CASCADE`、`mode` text NOT NULL、`duration_minutes`/`cost`/`note`/`timetable_url`/`subway_map_category` 皆可空、`sort_order` 預設 0、`created_at`，`CHECK(origin_spot_id <> destination_spot_id)`）；RLS 建表當下即設計：SELECT 開放，INSERT/UPDATE/DELETE 重用 V2 階段 4 任務二的 `can_edit_trip((SELECT trip_id FROM spots WHERE id = origin_spot_id))`，INSERT/UPDATE 的 `WITH CHECK` 另加跨行程完整性——起訖點的 `spots.trip_id` 必須相等，`trip_id` 為 NULL 的遺留景點因 NULL 比較特性自然無法建立路線，屬預期行為
- **前端（`TripPlanner.astro`）**：
  - `switchTripSubtab()` 從寫死「行程/資源」二選一，泛化為依 `.trip-subtab-pane` 的 id 與 `.trip-subtab-btn` 的 `data-subtab` 屬性通用處理任意數量子分頁，新增第三個子分頁「交通查詢」不需要重寫切換邏輯
  - 交通查詢 UI：起點/終點下拉（選項為目前行程景點，監聽 `trip-changed` 重新載入，且切換到此子分頁時也會重新整理一次）、⇄ 反向按鈕一鍵交換起訖點重查；結果卡片列表顯示 mode 圖示（依關鍵字比對電車/巴士/步行/計程車/渡輪，其餘用預設圖示）+ 名稱、時間、費用，展開見備註、時刻表連結（新分頁）、對應地鐵圖分類
  - 點擊地鐵圖分類會呼叫 `jumpToSubwayCategory()`：切到「資源」子分頁並捲動定位到該分類，若該分類當下未在顯示範圍內（不在行程預設或個人篩選中）會暫時加入個人篩選以便看到，不寫入資料庫，沿用 V2 階段 5 任務二已有的個人篩選機制
  - 管理員與該行程 `can_edit_itinerary` 協作者可新增/編輯/刪除路線（Modal `travel-transport-route-modal`，`travel-` 前綴隔離，三種關閉路徑收斂到 `closeTransportRouteModal()`，寫入皆檢查受影響筆數）；「新增交通方式」按鈕的顯示條件比 `itinerary-edit-only` 多一層（還需已選起訖點），未使用該 class，獨立由 `updateAddTransportButtonVisibility()` 管理，並掛在 `updateItineraryEditUI()` 尾端一併更新
  - 「AI 搜尋交通方式」明確不做（依賴階段 7-8 才會建置的 AI 後端），UI 未放置任何佔位按鈕
- **驗證結果（2026-07-13，使用者實測）**：見下方自我驗收對照表，a-e 全數通過
- **明確排除**：行程模式內嵌交通方式區塊（M2，3.1 節）未做；「AI 搜尋」未做；未異動任何既有表

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| a. 管理員建立三筆不同交通選項，查詢如實列出、展開細節正常 | 結果卡片列表 + 展開備註/連結 | ✅ |
| a. 反向查詢為空（方向性驗證，A→B 與 B→A 是兩筆不同資料） | RLS 不限制方向；UI `.eq('origin_spot_id', ...).eq('destination_spot_id', ...)` 精確比對方向 | ✅ |
| b. 協作者（`can_edit_itinerary`）可增刪改行程 A 的路線 | INSERT/UPDATE/DELETE 用 `can_edit_trip()` | ✅ |
| b. 協作者對行程 B 的景點 Console 強行寫入 0 筆生效 | `can_edit_trip()` 綁定起點所屬行程，非全域協作者身分 | ✅ |
| c. 朋友/訪客可查詢瀏覽，無編輯入口 | SELECT 開放；「新增交通方式」與卡片編輯/刪除圖示皆依 `canEditItinerary()` 顯示 | ✅ |
| d. 跨行程完整性：行程 A 起點 + 行程 B 終點寫入被拒 | INSERT/UPDATE 的 `WITH CHECK` 起訖點 `trip_id` 相等檢查 | ✅ |
| e. 切換行程後起訖點下拉正確重載 | 監聽 `trip-changed` 呼叫 `populateTransportSpotOptions()` | ✅ |
| e. Mobile 排版與 Modal 正常 | 沿用既有 `.transport-*` 響應式樣式與 Modal 慣例 | ✅ |
| `spot_transport_routes` 為新表，`travel_subway_maps.trip_id` 不受影響 | 本任務未異動任何既有表 | ✅ |

---

### ✅ 刪除行程功能（2026-07-13，已結案，使用者臨時追加需求，非 V2 分階段任務）

- **背景**：`/trip` 行程分頁原本可以新增/編輯行程，但沒有刪除功能，使用者提出補上（僅管理員可用）
- **設計決策**：刪除行程時，底下的景點（`spots`）該如何處理，經 `AskUserQuestion` 詢問使用者後決定「退回一般狀態」（trip_id 清空，景點本身不刪除），比照 `japan_items.trip_id` 既有的 `ON DELETE SET NULL` 設計，而非連同景點一起永久刪除
- **資料庫**：`spots.trip_id` 外鍵刪除規則由 `CASCADE` 改為 `SET NULL`（原本是 CASCADE，代表刪行程會連景點一起刪掉，與決策不符，需要調整）
- **前端（`TripPlanner.astro`）**：編輯行程 Modal 底部新增「刪除行程」按鈕（`.btn-danger`，新樣式），只在編輯既有行程時顯示；點擊 `confirm()` 明確告知底下每日行程/景點排序/協作者設定/地鐵圖分類關聯會一併永久刪除（這些表的 `trip_id` 皆為 `ON DELETE CASCADE`），景點本身不會被刪除但會退回沒有歸屬行程的狀態；刪除成功後重繪行程列表、自動選中下一個行程，若已無任何行程則清空地圖標記並顯示既有的「目前沒有行程」空狀態
- **已知限制（已與使用者確認可接受）**：`/trip` 目前沒有瀏覽「沒有歸屬行程」景點的畫面（不同於 `japan_items` 有「一般收藏」篩選可查看），退回一般狀態的景點目前無法從介面找到或管理，只能透過 Supabase Dashboard 直接查詢/改 `trip_id`；本次不開發對應瀏覽功能

#### 🔴 事故記錄：測試順序錯誤導致一個測試行程的景點資料遺失

- **經過**：SQL（外鍵改 `SET NULL`）與程式碼（commit `a57ad25`）同一則訊息交付，指引使用者「等 Vercel Ready 後」測試，但沒有明確要求「先確認 SQL 已在 Dashboard 執行完成」才能測試。使用者先測試了刪除行程，此時外鍵仍是舊的 `CASCADE` 規則，資料庫依照舊規則把該行程底下的景點一併永久刪除；事後才補執行 SQL
- **影響**：一個測試行程底下的景點資料遺失，使用者確認為測試用資料非正式行程，不追究、不嘗試復原；使用者的 Supabase 專案為免費方案，本來就沒有自動備份/PITR，即使是正式資料也無法復原
- **根因**：涉及「資料庫外鍵/RLS 變更」與「會觸發該變更行為的功能」交付時，兩者存在隱性依賴（SQL 必須先執行，功能測試才會是安全的），但當時只寫了「等 Vercel Ready 後測試」，沒有把「SQL 已執行」列為前置條件明確講出來
- **教訓（已寫入 CLAUDE.md）**：往後任何任務只要同時包含「資料庫 schema/RLS/外鍵變更」+「會觸發該變更所保護行為的功能測試」，必須在指引使用者測試前，明確要求並確認 SQL 已經執行完成，不能只用「等 Vercel Ready 後」帶過，兩個前置條件（部署完成 + SQL 已執行）要分開列出

---

### ✅ V2 階段 6 任務二：行程模式內嵌交通方式（M2）（2026-07-13，已結案，階段 6 全部結案）

- **背景**：任務一完成獨立的「交通查詢」子分頁後，本任務把交通方式資訊內嵌進行程模式本身——同一天相鄰兩個景點之間直接顯示交通區塊，與交通查詢子分頁共用同一份 `spot_transport_routes` 資料、雙向同步，規劃詳見 PROJECT_ARCHITECTURE_V2.md 3.1 節。不需要新 SQL
- **最大風險點與排除過程**：任務指示點名「交通區塊不得干擾既有的景點拖曳排序功能」為最高風險。實作前先讀 `moveSpotOrder()` 原始碼確認其為**純陣列運算**（`daySpotsCache.findIndex` 找位置、交換兩筆 `order_index`、`Array.sort` 重排、呼叫 `renderDaySpots()` 重繪），完全不依賴 DOM 節點順序、`nextElementSibling` 或 `nth-child` CSS，也確認 travel.css 沒有任何 `.itinerary-spot-item:nth-child` 選擇器。因此交通區塊以獨立 sibling 元素插入景點卡片之間，於陣列運算層面與 DOM 樣式層面皆不構成干擾，此風險點在實作前即以程式碼閱讀方式排除，非事後補救
- **前端（`TripPlanner.astro`）**：
  - `renderDaySpots()` 改為 `async`：先依「目前顯示順序」計算所有相鄰景點配對（陣列運算，不查資料庫），再用一次 `origin_spot_id IN (...)` 批次查詢取代逐對查詢，取回後在前端依確切 origin+destination 過濾成每對的路線清單（`inlineTransportRoutesByPair`），配對每次重繪都重新計算，資料庫本身不因排序異動任何路線資料
  - 交通區塊樣式：虛線左框、淡色背景，故意不用實心卡片樣式，避免搶走景點卡片的視覺主體
  - 已有路線：收合狀態顯示第一筆 mode + 時間，點擊展開全部選項，含備註、時刻表連結、地鐵圖分類（點擊呼叫既有的 `jumpToSubwayCategory()` 跳轉並定位，沿用 V2 階段 5 任務二的機制不重寫）
  - 無路線：只有 `canEditItinerary(currentTripId)` 為真時才顯示「+ 交通方式」，無編輯權者完全不顯示任何東西（不留視覺痕跡）
  - 新增/編輯：`openInlineTransportRouteModal(originId, destId, route)` 開啟前把交通查詢子分頁的起訖點欄位（`transport-origin-select`/`transport-destination-select`）設為預填值，再呼叫既有的 `openTransportRouteModal()`——因為該 Modal 的 submit handler 讀取的正是這兩個欄位，此設計讓內嵌入口與交通查詢子分頁**共用同一套送出邏輯**，不需要另外重寫；submit 成功後同時呼叫 `queryTransportRoutes()`（更新交通查詢子分頁）與 `renderDaySpots()`（更新內嵌區塊），達成雙向同步；標準查詢子分頁的刪除也同樣補上 `renderDaySpots()` 呼叫
- **驗證結果（2026-07-13，使用者實測）**：見下方自我驗收對照表，a-e 全數通過，其中 b（排序不受干擾）為最高優先項目
- **明確排除**：AI 搜尋交通方式未做（遞延階段 7-8）；交通查詢子分頁本身邏輯未變動（除共用 Modal 的預填參數）；未新增 SQL

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| a. 有路線的相鄰景點間顯示收合區塊，展開細節正確 | `renderInlineTransportBlock()` + `renderInlineTransportRouteRow()` | ✅ |
| a. 內嵌新增的路線在交通查詢子分頁立即可見（反之亦然） | submit/delete 成功後同時呼叫 `queryTransportRoutes()` + `renderDaySpots()` | ✅ |
| b.（最高優先）拖曳排序功能與改版前完全一致 | `moveSpotOrder()` 純陣列運算，不依賴 DOM 順序，實作前已讀碼確認 | ✅ |
| b. 排序後交通區塊依新相鄰關係重新配對 | 配對於每次 `renderDaySpots()` 依目前陣列順序即時重算 | ✅ |
| c. 刪除中間景點後，前後兩景點間顯示新配對區塊 | 同上，配對即時重算不依賴既有路線資料 | ✅ |
| d. 協作者於授權行程可用「+ 交通方式」 | `canEditItinerary(currentTripId)` 判斷 | ✅ |
| d. 朋友/訪客看不到新增入口，已有路線可展開瀏覽 | 同上；展開/瀏覽不受 `canEditItinerary` 限制 | ✅ |
| e. Mobile 排版與展開收合順暢 | 沿用既有響應式版面與全站 Modal/展開慣例 | ✅ |

---

### ✅ 交通查詢起訖點搜尋（2026-07-13，已結案，使用者臨時追加需求，非 V2 分階段任務）

- **背景**：階段 6 驗收通過後，使用者反映行程景點動輒上百筆，「交通查詢」子分頁原生 `<select>` 選起訖點很難用，要求加搜尋功能
- **實作（`TripPlanner.astro`）**：起點/終點從 `<select>` 改為搜尋輸入框 + 下拉建議清單，沿用既有 `.search-dropdown`/`.search-result-item` 樣式（與地圖模式的地點搜尋同一套視覺語彙，未寫新 CSS）；實際選取值仍保留在原本 id 的 hidden input（`transport-origin-select`/`transport-destination-select`），因此查詢、送出、內嵌區塊預填等既有讀取 `.value` 的邏輯完全不用改動，只新增搜尋框的輸入/點選/還原邏輯
- **輸入行為**：即時篩選目前行程的景點（大小寫不敏感、子字串比對）；點擊建議項目才算真正選定；未點選就切走焦點（blur）時自動還原顯示文字為上次有效選擇或清空，避免顯示文字與實際選取值不一致；⇄ 反向按鈕同步交換隱藏值與顯示文字
- **驗證結果（2026-07-13，瀏覽器對真實行程資料端到端驗證）**：搜尋比對（含日文全形字元）、點選、方向性、反向交換、查詢結果皆正確；Mobile 排版正常

---

### ✅ V2 階段 7：AI 助手唯讀版（2026-07-13，已結案）

- **背景**：`/trip` AI 分頁原為佔位文字（詳見 PROJECT_ARCHITECTURE_V2.md 第五節），本階段實作唯讀版——僅管理員可用的對話助手，能讀取目前選中行程與收藏資料回答問題，不提供任何寫入工具
- **後端（`src/pages/api/ai-assistant.ts`，`prerender = false`）**：
  - 身分驗證完全比照既有 `/api/trigger-deploy` 模式：前端帶 Supabase access token（`Authorization: Bearer`），後端 `supabase.auth.getUser(token)` 驗證後比對後端環境變數 `ADMIN_EMAIL`（沿用既有過渡期 fallback `PUBLIC_ADMIN_EMAIL`），不符一律 401，不信任前端任何身分宣告
  - 查詢 context 一律用「請求者的 token」建立的 client 讓 RLS 生效，**不使用 service role**
  - 呼叫 Anthropic API 直接用原生 `fetch`（比照 `src/pages/api/explore.ts` 呼叫外部 API 的既有寫法），**未安裝 `@anthropic-ai/sdk`**，不觸碰「安裝依賴套件」安全紅線；model `claude-sonnet-5`，`max_tokens: 2048`，非串流，`AbortController` 30 秒逾時
  - Context 組成：`trips`（名稱/emoji）、`trip_days`+`day_spots`+`spots`（依天數排序的景點名稱/備註/類型/子類型/是否連鎖店）、`spot_transport_routes`（該行程景點間路線）、`japan_items`（`trip_id` 等於該行程或為 NULL）+`wishlist_items`（供判斷願望清單數量問題）；只留必要欄位，不含 images 陣列與座標
  - system prompt 明確要求：以繁中回答、只依提供資料回答、資料裡沒有的一律誠實說沒有、回答精簡
- **前端（新元件 `src/components/AiAssistant.astro`）**：
  - Token 取自 `window.__latestAuthState` 快照（單一入口規則，不自行呼叫 `getSession()`）；tripId 取自 `window.currentTripId` 並監聽 `trip-changed`，套用與 auth 快照相同的 Race Condition 雙保險（監聽器提前綁定 + 綁定後立即檢查快照補跑），避免 `TripPlanner.astro` 掛載時搶先廣播的第一次 `trip-changed` 被錯過
  - 訊息氣泡列表（可捲動）+ 底部輸入框，元素 `ai-` 前綴隔離；送出後鎖定輸入框顯示等待動畫；401/500/504 分別顯示對應中文錯誤提示
  - 對話歷史存於記憶體陣列，每次送出前只保留最近 20 則（超過丟最舊，控制成本），不做持久化，重新整理即重置
  - `trip.astro` 的 `#tab-ai` 佔位內容改為 `<AiAssistant />`，比照 `#tab-trip`/`#tab-japan` 既有的 `style="padding:0"` 寫法
- **已知限制（非本階段修補範圍）**：`.trip-main-content` 依賴 `body.trip-page` class 才會有 `height:100vh`+`overflow:hidden` 版面鎖定，但 `Layout.astro` 從未把此 class 加到 `<body>` 上，是全站既有、與本次改動無關的落差，導致 AI 對話框是「隨內容增高、捲動整個分頁」而非「固定視窗高度」，功能不受影響，詳見 PROJECT_ARCHITECTURE_V2.md 5.3 節
- **提交節奏**：分兩輪 commit+push（後端 API 一輪、前端 UI 一輪），皆已推送並確認成功
- **明確排除**：任何寫入工具（tools 參數不出現）、串流、桌面浮動視窗，皆遞延至階段 8 或後續優化

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| d. 未帶 Authorization header 呼叫 API | 回 401 | ✅（本機 curl 驗證） |
| d. 帶假造/無效 token 呼叫 API | `getUser` 驗證失敗，回 401 | ✅（本機 curl 驗證） |
| e. 前端原始碼與已提交檔案搜尋不到 `ANTHROPIC_API_KEY` 的值 | 金鑰只讀取自後端 `import.meta.env.ANTHROPIC_API_KEY`，`git grep` 確認只出現在 `src/pages/api/ai-assistant.ts` | ✅ |
| c（程式碼面）401 判斷邏輯無遺漏 | email 嚴格比對 `adminEmail`，不符一律拒絕 | ✅（程式碼審查） |
| a. 管理員提問與實際行程/收藏資料相符，資料庫沒有的如實說沒有 | 使用者本人登入瀏覽器實測（例：問 Day 1 景點，正確回答「目前資料中沒有安排景點，只有住宿資訊」，未編造資料） | ✅ |
| b. 切換行程後提問，context 跟著換 | 使用者本人登入瀏覽器實測 | ✅ |
| c（實測）朋友帳號看不到 AI 分頁入口 | Sandbox 既有機制 | ✅ |

- **上線過程的一個插曲**：驗收 a 時第一次提問曾遇到 500 錯誤，函式日誌顯示 Anthropic `400 Your credit balance is too low`——這其實是好消息，代表 token 驗證、email 比對、context 組裝、呼叫 Anthropic API 整條流程都正常，只是帳戶額度不足；使用者儲值後重測即全數通過，不是程式碼或設定問題，過程中沒有修改任何程式碼
- **model 修正**：原始指示的 `claude-sonnet-4-6` 並非有效 model ID，已改為 `claude-sonnet-5`（commit `729ac7f`），三份文件同步更新

---

### ✅ V2 階段 8 第一批：AI 助手開放行程類寫入工具（2026-07-13，已結案）

- **背景**：V2 階段 7 的 AI 助手為純唯讀，本批開放四個「行程類」寫入工具，讓 AI 能直接依對話指令修改行程資料；delete 類與收藏類工具明確排除在本批之外，架構詳見 PROJECT_ARCHITECTURE_V2.md 5.2 節
- **Context 擴充**：`buildTripContext()` 的 `spots`/`days` 改為同時攜帶 `spot_id`/`day_id`（stage 7 為精簡只留名稱，本批工具需要精確定位，避免同名景點造成模糊比對）
- **四個工具（`src/pages/api/ai-assistant.ts`）**：
  - `add_spot`：`name`+`address` 必填，後端呼叫 Google Geocoding API（重用既有 `PUBLIC_GOOGLE_MAPS_KEY`，未新增環境變數）換算 `lat`/`lng`/`place_id`；可選 `day_number`+`position`（1-based）同時排入某天，內部與 `reorder_day_spots` 共用同一個「整批重新編號 order_index」的 helper（`applyDaySpotOrder`）
  - `update_spot`：只更新有提供的欄位；改 `address` 會重新 geocode；執行前確認 `spot_id` 確實屬於目前 `tripId`（完整性檢查，防止模型幻覺 ID 誤寫其他行程）
  - `reorder_day_spots`：輸入的 `ordered_spot_ids` 必須與該天目前實際的 spot_id 集合完全一致（數量、成員都要對得上），對不上直接回工具錯誤，不做部分執行
  - `add_transport_route`：欄位對齊 V2 階段 6 任務一建立的 `spot_transport_routes` 表（`TripPlanner.astro` 既有 payload 寫法），執行前確認起訖點皆屬於目前行程
- **Anthropic tool-use 迴圈**：`stop_reason === 'tool_use'` 時執行工具、把 `tool_result`（含 `is_error`）附回訊息陣列再呼叫，上限 10 輪；超過上限仍未拿到最終文字，回報「操作過於複雜，請拆小」。每輪呼叫沿用既有 30 秒逾時
- **權限與安全**：寫入沿用查詢 context 同一支「請求者 token 的 client」，不使用 service role；由於本階段僅管理員能呼叫此 API（既有 401 gate 未變），RLS 的 `is_admin()` 一律放行，協作者權限完全不受影響
- **失敗如實回報**：每個工具執行後檢查受影響筆數，0 筆一律視為失敗（`{success:false, error}`），不得對 AI 或使用者謊報成功
- **前端未改動**：`AiAssistant.astro` 維持原樣，工具完全在後端執行，對話 UI 只顯示模型回覆的文字
- **本地驗證**：型別檢查（`astro check`）通過；`curl` 確認未帶/假 token 皆回 401（改動未破壞既有身分驗證）；`git grep` 確認 `ANTHROPIC_API_KEY` 只出現在後端檔案，`PUBLIC_GOOGLE_MAPS_KEY` 沿用既有前端變數未新增機密
- ⚠️ **已知風險**：10 輪迴圈 × 每輪最多 30 秒逾時，理論上限可能達數分鐘；若 Vercel 方案的 serverless function 逾時上限（Hobby 方案固定 10 秒）比這短，複雜多工具操作可能被 Vercel 中途砍斷而非我們自己回報「操作過於複雜」，這不是本次改動能解決的，待實測後視情況再討論對策

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| 型別檢查無新增錯誤 | `astro check` | ✅ |
| 未帶/假 token 回 401 | 既有身分驗證未被破壞 | ✅（本機 curl 驗證） |
| 金鑰未外洩 | `git grep` 確認 `ANTHROPIC_API_KEY` 只在後端；`PUBLIC_GOOGLE_MAPS_KEY` 為既有前端變數，未新增機密 | ✅ |
| a.「幫我把已存在的景點加進 Day 1」→ 景點真實出現在行程，AI 回覆明確描述；行程分頁重整後可見 | 第一次實測用 `add_spot` 設計缺口失敗，修復後用新工具 `assign_spot_to_day` 重測 | ✅ 使用者實測通過（修復後） |
| b. 「把 Day 1 的順序倒過來」→ 順序真實改變 | `reorder_day_spots` | ✅ 使用者實測通過 |
| c. 「新增京都站到清水寺的巴士 20 分鐘」→ 交通查詢可見 | `add_transport_route` | ✅ 使用者實測通過 |
| d. 修改景點備註 → 生效 | `update_spot` | ✅ 使用者實測通過 |
| e. 對照 a-d 每項，資料庫實際狀態與 AI 宣稱一致（重整頁面驗證，不信對話文字） | 全部工具的 0 筆受影響檢查 | ✅ 全數確認 |

- **驗收 a 失敗記錄與修復（2026-07-13，commit `be4914e`）**：使用者實測時要求把「大國藥妝 國際通縣廳前店」(已存在於行程景點清單中)加進 Day 1。原始四工具設計有缺口:`add_spot` 只能新增全新景點(會產生重複資料)、`reorder_day_spots` 只能調整既有成員順序、不能新增成員,兩者之間沒有「把既有景點掛進某一天」的工具。**AI 的實際反應是正確的**:如實告知現有工具做不到、主動提出「用 add_spot 重新建立同名新景點」的替代方案並先詢問使用者是否要這樣做,而不是自行決定用不適合的工具硬做或憑空宣稱成功——系統提示裡「不確定就先確認、不要猜測執行」與「如實回報」在此發揮了預期效果,只是暴露了工具集本身不完整。已新增 `assign_spot_to_day` 工具補上此缺口(對應既有前端 `TripPlanner.astro` 的 `addSpotToDay()`/「從想去清單選擇」既有功能),重用既有的 `applyDaySpotOrder` 排序邏輯;若該景點已在該天則回報失敗而非重複加入。同時更新 `add_spot` 的工具說明與 system prompt,引導模型依「全新景點」或「已存在景點」正確選擇工具

---

### ✅ V2 階段 8 第二批：AI 助手開放收藏類工具與 delete_spot，階段 8 全部結案（2026-07-13）

- **背景**：V2 階段 8 第一批已開放行程類寫入工具，本批補齊剩下的 `delete_spot`（唯一的刪除工具）、`toggle_wishlist`/`update_wishlist_quantity`/`add_japan_item`（收藏類），完成後 V2 階段 8 全部結案
- **關鍵澄清（依現有程式碼校正任務描述）**：原始任務描述寫「toggle_wishlist / update_wishlist_quantity 操作管理員自己的願望清單列（user_id 為管理員）」，但查證 `JapanCollection.astro` 第 1370、1397 行既有寫法後發現：**管理員自己的願望清單狀態存在 `japan_items.owner_wishlist`/`owner_quantity` 兩個欄位本身**，不是寫入 `wishlist_items` 表（那張表是朋友/家人專用，有獨立的 `user_id`/`japan_item_id`/`quantity`，管理員的資料從來不會出現在裡面）。本批依實際 schema 實作，避免工具行為與既有 UI 顯示邏輯脫節
- **Context 擴充**：`japan_items` 補上 `item_id`（沿用批次一原則，工具需要 ID 才能精確定位）與解析後的 `category` 名稱；新增查詢 `japan_categories`，回傳 `categories` 陣列並建立 `categoryIdByName` lookup
- **四個工具（`src/pages/api/ai-assistant.ts`）**：
  - `delete_spot`：唯一的刪除工具，執行前確認 `spot_id` 屬於目前行程，成功訊息固定含「已刪除，若為誤刪需手動重建」。⚠️ **確認流程屬提示詞層級的行為約束，非程式碼層級強制擋修**——規則寫在 system prompt 與工具 description：只有使用者明確點名要刪除某景點才可考慮呼叫，呼叫前必須先文字複述景點名稱與所屬行程並等待使用者在下一則訊息明確確認；程式碼本身不會技術性阻止模型提前呼叫，完全仰賴模型對提示詞的遵循程度
  - `toggle_wishlist`：`japan_items.update({ owner_wishlist, owner_quantity: 1 })`，勾選與取消皆重置數量為 1，完全比照既有手動 UI 行為
  - `update_wishlist_quantity`：`japan_items.update({ owner_quantity })`，比照既有手動 UI
  - `add_japan_item`：欄位對齊既有 `itemData`（`name`/`note`/`image_url`/`category_id`/`trip_id`）；AI 無法上傳圖片，`image_url` 固定 null；`scope` 省略時預設歸屬目前行程，需明確指定 `general` 才存進一般收藏
- **System prompt 增補**：`japan_items` 的 `scope` 語意說明（`general`=一般收藏、`trip`=歸屬目前行程）；`delete_spot` 的確認流程規則
- **本地驗證**：型別檢查（`astro check`）通過；`curl` 確認未帶/假 token 皆回 401；`git grep` 確認 `ANTHROPIC_API_KEY` 只在後端
- **前端未改動**：`AiAssistant.astro` 維持原樣

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| 型別檢查無新增錯誤 | `astro check` | ✅ |
| 未帶/假 token 回 401 | 既有身分驗證未被破壞 | ✅（本機 curl 驗證） |
| a. 刪除流程：要求刪除 → AI 複述並要求確認 → 未確認不執行 → 確認後才真刪 | `delete_spot` + system prompt 確認規則 | ✅ 使用者實測通過 |
| b. 「把 XX 加進願望清單、數量 2」→ 收藏分頁重整後如實反映 | `toggle_wishlist` + `update_wishlist_quantity` | ✅ 使用者實測通過 |
| c. 新增收藏品指定行程 → 收藏分頁重整後帶行程徽章出現 | `add_japan_item`（scope=trip） | ✅ 使用者實測通過 |
| d. 每項以頁面重整後的實際狀態為準核對 | 全部工具的 0 筆受影響檢查 | ✅ 全數確認 |

---

### ✅ V2 階段 9 第一個任務：/japan、/travel 正式退役（2026-07-13，已結案）

- **前提**：使用者已明確確認 `/japan`、`/travel` 功能已全數遷移至 `/trip` 並穩定運行多個階段（V2 階段 1-8），同意正式退役
- **`astro.config.mjs`**：新增 `redirects: { '/japan': '/trip', '/travel': '/trip' }`，字串簡寫預設 301 永久轉址
- **封存**：`src/pages/japan.astro`、`src/pages/travel.astro` 以 `git mv` 搬移至 `src/_archived/`（不刪除，保留至階段 9 收尾批次）；因 `src/_archived/` 與 `src/pages/` 同層，檔案內既有的 `../layouts/`、`../lib/`、`../styles/` 相對路徑深度不變，未修改任何 import；frontmatter 開頭加封存說明註解
- **連結盤點**：全站 grep `/japan`、`/travel` 後，唯一需要更新的活連結是 `src/components/CardSection.astro` 首頁「旅行地圖」卡片子選單（第 67-69 行），把 `href="/travel"`、`href="/japan"` 改成 `href="/trip"`；其餘出現的字串皆是兩個封存檔**自己內部**的邏輯（OAuth `redirectTo`、登入 `from` 參數），封存後不再是路由、屬死碼，未修改
- ⚠️ **副作用告知**：改完後首頁子選單三個連結全部導向同一個 `/trip`（僅文字標籤不同），是忠實執行「連結改指 /trip」的必然結果；選單本身瘦身（例如砍成一個連結）屬介面重新設計，不在本次範圍，留待後續清理批次評估
- **本地驗證**：`astro check` 無新增錯誤（封存檔沿用原有既存警告，非新增）；`curl` 確認 `http://localhost:4321/japan`、`/travel` 皆回 301 且 `location: /trip`；瀏覽器確認首頁子選單三個連結皆為 `/trip`；`/trip` 本身功能不受影響
- **文件同步**：`CLAUDE.md` 的「凍結頁面」規則改寫為退役說明；`PROJECT_ARCHITECTURE.md` 目錄結構圖同步移除 `japan.astro`/`travel.astro` 於 `src/pages/` 的條目、新增 `src/_archived/` 區塊（順帶補上先前遺漏的 `ai-assistant.ts`/`AiAssistant.astro` 條目）

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| 型別檢查無新增錯誤 | `astro check` | ✅ |
| 本機 `/japan`、`/travel` 皆 301 轉址 `/trip` | `astro.config.mjs` redirects | ✅（本機 curl 驗證） |
| 首頁子選單三個連結皆為 `/trip` | `CardSection.astro` href 更新 | ✅（本機瀏覽器驗證） |
| `/trip` 本身功能不受影響 | 轉址設定不影響既有路由 | ✅（本機瀏覽器驗證） |
| a. 正式站 `/japan`、`/travel` 網址轉址（登入、未登入各一次） | Vercel 部署後實測 | ✅ 使用者實測通過 |
| b. 首頁各處入口點擊皆到 `/trip`，全站無殘留舊連結 | 同上 | ✅ 使用者實測通過 |
| c. `/trip` 全功能抽測正常 | 同上 | ✅ 使用者實測通過 |

---

### ✅ 地鐵圖新增刪除功能（2026-07-13，已結案，非分階段任務，使用者臨時追加需求）

- **背景**：「資源」子分頁的地鐵圖（V2 階段 5 任務二）原本只有管理員上傳功能，沒有刪除功能，使用者測完階段 9 第一個任務後提出這個小需求
- **執行前確認**：`travel_subway_maps` 的 RLS 早已就緒——`travel_subway_maps_admin_all` 是 `FOR ALL`（涵蓋 SELECT/INSERT/UPDATE/DELETE）鎖管理員 email 的既有政策，DELETE 本來就被允許，只是前端從未做過對應按鈕，**本次不需要任何 SQL/RLS 變更**
- **實作（`TripPlanner.astro`）**：完全比照既有「優惠券刪除」模式——`renderSubwayGroups()` 每張圖新增 `admin-only` 垃圾桶按鈕（`.subway-map-admin-actions`），點擊 `confirm()` 後 `.delete().eq('id', id).select()`，檢查受影響筆數為 0 時明確提示失敗，成功後更新本地快取、重繪、`showToast()`、`triggerBuildWebhook()`；按鈕點擊 `stopPropagation()` 避免誤觸底下景點放大檢視的 lightbox
- **明確不做的事（比照既有慣例維持一致性）**：不刪除 Storage 裡的圖片檔（比照 `travel_coupons`/`post_images` 既有孤兒檔案慣例，不引入新清理邏輯）；不處理 `trip_subway_categories`（該表以 `trip_id`+分類名稱關聯，非外鍵指向 `travel_subway_maps.id`，刪除單張圖片不影響任何行程的分類關聯設定）
- **本地驗證**：`astro check` 無新增錯誤；瀏覽器強制顯示 `admin-only` 元素後確認按鈕外觀與位置正確、`confirm()` 對話框正確跳出（stub 攔截確認訊息文字無誤）、點擊不觸發底下的 lightbox 放大
- **上線後回報 bug 與修復（2026-07-13，commit `0f1584e`）**：使用者實測反映垃圾桶「時而出現、時而消失」。**根因**：`renderSubwayGroups()`（以及既有的 `renderCoupons()`）的 admin-only 刪除按鈕容器寫死 `style="display: none"`，只靠登入當下一次性的全域 `updateAuthUI()` 的 `.admin-only` 掃描補上顯示；但這兩個函式會在切換分類、切換行程、上傳/刪除後反覆重新產生 `innerHTML`，每次重繪都會把 style 重置回 `display:none`，且不會有任何後續動作再次觸發全域掃描，導致按鈕「重繪後就消失、只有剛登入那一刻曾經短暫出現過」。修法比照 `JapanCollection.astro` 既有同類重繪函式（第 921 行）的寫法，直接在樣板字串內插入當下的 `isAdminUser` 狀態（`style="display: ${isAdminUser ? 'flex' : 'none'}"`），不再依賴外部單次全域補丁；優惠券刪除按鈕原本就有同樣的潛在問題（只是尚未被注意到，因為 `renderCoupons()` 平常重繪頻率較低），一併修正，避免同一根因的 bug 只修一半

#### 自我驗收對照表

| 驗收項目 | 對應設計 | 結果 |
|---|---|---|
| 型別檢查無新增錯誤 | `astro check` | ✅ |
| 刪除按鈕外觀、位置、confirm() 觸發正常 | 本機瀏覽器強制顯示驗證 | ✅ |
| 點擊刪除按鈕不誤觸景點放大檢視 | `stopPropagation()` | ✅（本機驗證） |
| 垃圾桶按鈕在切換分類/行程/上傳/刪除後仍持續顯示，不再消失 | `isAdminUser` 直接插入樣板（commit `0f1584e`） | ✅ 使用者實測通過 |
| 優惠券刪除按鈕同一根因修復，行為一致 | 同上 | ✅ 使用者實測通過 |
| 管理員上傳測試圖 → 刪除 → 重整後確認資料庫真的消失 | 使用者以真實管理員帳號實測 | ✅ 使用者實測通過 |
| 非管理員身分看不到刪除按鈕 | 使用者實測 | ✅ 使用者實測通過 |

---

### 🔶 V2 階段 9 核心任務：Supabase 瀏覽器端由 CDN 動態注入改為 npm 打包（進行中，四波執行）

- **背景**：CDN 動態注入是歷史上 modulepreload 錯誤、版本浮動、多實例、race condition（含 Heisenbug 登入異常）等一整類問題的共同根源；改由 `@supabase/supabase-js`（npm 套件，SSR 端 `src/lib/supabase-client.ts` 已在用）打包後，版本由 `package-lock.json` 鎖死、載入時序交給 Vite，結構性消除這類問題
- **鐵律**（貫穿四波）：純機械轉換，不改任何業務邏輯/函式內容/事件流程；`/trip` 單一入口架構與子元件事件接收端完全不動；Heisenbug 診斷碼（`logAuth` 與所有 `[DEBUG-HEISENBUG]` 呼叫點）原樣保留；每波獨立 commit+push，使用者以 **DevTools 全程關閉**的方式實測登入（歷史觸發條件），異常立刻停下取 `sessionStorage.__auth_debug_log` 回報，不自行往下修
- **四波規劃**：① `trip.astro`（本次執行）② 逐頁轉換其餘消費 CDN 的頁面 ③ 拆除 `Layout.astro` CDN 注入 + `astro.config.mjs` modulepreload 移除 plugin ④ 浸泡一至兩週無異常後結案，改寫 `PROJECT_ARCHITECTURE.md`/`CLAUDE.md` 對應規則

#### 第一波：`trip.astro`（本輪範圍）

- 新增 `src/lib/supabase-browser.js`：模組層級單例，`import { createClient } from '@supabase/supabase-js'`，內部讀 `import.meta.env.PUBLIC_SUPABASE_URL`/`PUBLIC_SUPABASE_ANON_KEY`，匯出 `getSupabaseBrowserClient()`
- `trip.astro`：移除 `<script define:vars={...} is:inline>` 橋接區塊（其存在理由是讓不經 Vite 打包的 `is:inline` script 拿到值，改為 npm 匯入後不再需要）；主要 Heisenbug 診斷 `<script>`（本來就非 `is:inline`/`define:vars`，已經過 Vite 打包）改為直接 `import` 該模組 + 直讀 `import.meta.env.PUBLIC_ADMIN_EMAIL`；`waitForSupabase()` 輪詢 CDN 就緒的邏輯整段移除，改為直接呼叫 `getSupabaseBrowserClient()`
- 子元件（`TripPlanner.astro`/`JapanCollection.astro`/`AiAssistant.astro`）完全不動，接收 `window.sharedSupabase`/`auth-state-changed`/`window.__latestAuthState` 的方式不變

（本節將於本波完成、覆核、使用者實測後補上結果）

---

## 二、規劃中功能（尚未開始）

### /trip 整合頁面後續開發（詳見 PROJECT_ARCHITECTURE_V2.md）

1. ~~**旅行資源子分頁**：優惠券（`travel_coupons`）+ 地鐵圖分類化（`travel_subway_maps` 改全域庫 + `trip_subway_categories` 關聯表）~~ **✅ 2026-07-13 全部已上線**，詳見上方「V2 階段 5 任務一」「V2 階段 5 任務二」
2. ~~**交通查詢子分頁**：`spot_transport_routes` 表 + 行程內嵌交通方式 UI（M2）~~ **✅ 2026-07-13 全部已上線**，詳見上方「V2 階段 6 任務一」「V2 階段 6 任務二」；剩餘：AI 輔助搜尋（遞延階段 7-8）
~~3. **協作者權限系統**：`trip_collaborators` 表 + 雙開關權限（can_edit_wishlist / can_edit_itinerary）+ Sandbox 模式~~ **✅ 2026-07-13 全部已上線**，詳見上方「V2 階段 4」相關章節
3. ~~**AI 助手分頁**：`/api/ai-assistant` Serverless API，讀取行程/收藏資料回答問題 + tool use 寫入功能（add_spot / assign_spot_to_day / update_spot / delete_spot / reorder_day_spots / add_transport_route / toggle_wishlist / update_wishlist_quantity / add_japan_item）~~ **✅ 2026-07-13 全部已上線**，詳見上方「V2 階段 7」「V2 階段 8 第一批」「V2 階段 8 第二批」
4. ~~**舊頁面下線評估**：待 /trip 完全穩定後，評估是否移除 /travel 與 /japan~~ **✅ 2026-07-13 已執行退役,a-c 驗收項目全數通過**(V2 階段 9 第一個任務):原網址 301 轉址 /trip、檔案封存 src/_archived/ 不刪除,詳見上方「V2 階段 9」
5. **程式碼清理階段**（獨立規劃，待全部功能穩定後執行）：統一 Modal 開關/CSS class 命名規則、移除殘留冗餘邏輯

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
    - 2026-07-13 更新（V2 階段 4 任務三）：INSERT/UPDATE 額外加上 `can_wishlist_item(japan_item_id)` 檢查（一般收藏看白名單、行程收藏看協作者 `can_edit_wishlist`）；DELETE/SELECT 政策未變動
13. **日本收藏卡片更新**：點擊愛心/數量按鈕用局部 DOM 更新（updateCardFooter），避免全版重渲染造成跳動
14. **Modal 滾動鎖定**：開啟 Modal 時加 `document.body.classList.add('modal-open')`，關閉時移除，CSS 需有 `body.modal-open { overflow: hidden; }`
15. **`is:inline` 與 `define:vars` 的 `<script>` 禁用 TypeScript 語法**（2026-07-11 修正，原描述過寬）：這類 script 不經 Vite 打包器，型別標註（`:Type`）、`as Type` 斷言會直接送進瀏覽器造成執行期語法錯誤。一般 `<script>`（非 `is:inline`、非 `define:vars`）會經 Vite/esbuild 打包，**可以**使用 TS 語法，專案內既有大量此類寫法且建置與執行皆正常
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
| post_images | 短文照片，舊表（已停用，無程式碼引用） | ⚠️ 已停用 |
| post_media_items | 短文媒體（YouTube / 短片 / 錄音），2026-07-11 新增 | ✅ |
| quotes | 語錄收藏 | ✅ |
| status | 現在狀態（id=1 固定） | ✅ |
| daily | Polaroid 底片日記 | ✅ |
| transactions | 記帳明細（含 currency、amount_jpy、exchange_rate） | ✅ |
| income_categories | 收入來源（動態管理） | ✅ |
| expense_categories | 支出分類（動態管理） | ✅ |
| japan_categories | 日本收藏分類（兩層） | ✅ |
| japan_items | 日本收藏品項（含 owner_wishlist、owner_quantity、trip_id） | ✅ |
| allowed_users | 日本收藏白名單 | ✅ |
| wishlist_items | 朋友/家人願望清單（含 quantity） | ✅ |
| trips | 旅行行程 | ✅ |
| spots | 旅行景點（含 spot_type_id、spot_subtype_id、place_id） | ✅ |
| spot_types | 景點主類型（含 is_chain_store） | ✅ |
| spot_subtypes | 景點子類型（含 is_chain_store） | ✅ |
| trip_days | 每日行程（關聯 trips） | ✅ |
| day_spots | 每天景點安排（關聯 trip_days + spots） | ✅ |
| travel_coupons | 優惠券，全站共用 | ✅ 已建立，UI 已上線（2026-07-13） |
| travel_subway_maps | 地鐵圖，全域分類庫（新增 category 欄位，trip_id 停用不刪） | ✅ 已建立，UI 已上線（2026-07-13） |
| trip_subway_categories | trip_id + category，行程關聯的地鐵圖分類 | ✅ 已建立，UI 已上線（2026-07-13） |
| spot_transport_routes | 景點間交通方式（origin/destination/mode/duration/cost/note/timetable_url/subway_map_category） | ✅ 已建立，UI 已上線（2026-07-13） |
| trip_collaborators | trip_id + user_email + can_edit_wishlist + can_edit_itinerary | ✅ 已建立（2026-07-12），權限已全數落實（2026-07-13） |

### Storage Buckets

| Bucket | 狀態 |
|--------|------|
| post_media | ✅ PRIVATE，2026-07-11 新增，短文照片/短片/錄音專用 |
| post_images | ⚠️ 已停用，PUBLIC，無程式碼引用，孤兒檔案原樣保留 |
| japan_images | ✅ PUBLIC |
| travel_images | ✅ PUBLIC |
| travel_coupons | ✅ PUBLIC，使用中（優惠券圖片，2026-07-13） |
| travel_subway_maps | ✅ PUBLIC，使用中（地鐵圖圖片，2026-07-13） |

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
| ANTHROPIC_API_KEY | /api/ai-assistant 呼叫 Anthropic API（2026-07-13 新增） | 後端專用 |

---

## 六、待辦事項總覽（當前最優先）

1. 🔴 **最優先**：「OAuth 登入後 UI 間歇性未切換」Heisenbug（見上方「進行中問題」）。第一輪時序診斷已完成（2026-07-11）：嫌犯一、二均排除，trip.astro auth 管線健康，與 DevTools 開關無因果；診斷碼留在線上，等待真實失敗發生時依取證 SOP 抓 log，定案根因後修復,方能確認階段 2.5 真正收尾。2026-07-11 驗證任務 D 時新增一筆疑似同根因家族的觀察（朋友帳號登入 `/trip` 一度被誤判成管理員，方向與原記錄相反），未確認是否同一問題，下次排查時一併納入
2. 補做「衝突熱點稽核」修復（commit `2317d2d`）的手動驗證：ESC 鍵、Modal 背景點擊是否都能正確關閉並清除 `modal-open`（原定驗證因發現上述問題而中斷）
3. ~~階段 3：japan_items 加入 trip_id 篩選邏輯（收藏依行程篩選）~~ **✅ 2026-07-12 已完成**，詳見上方「V2 階段 3：收藏依行程篩選」
4. ~~**階段 4**：協作者權限系統~~ **✅ 2026-07-13 全部完成**（任務一：trip_collaborators 資料表+管理員管理 UI 2026-07-12；任務二：can_edit_itinerary 落實 2026-07-13；任務三：can_edit_wishlist 落實 + Sandbox 模式 2026-07-13），詳見上方「V2 階段 4」對應章節
5. ~~**階段 5**：旅行資源頁面（任務一：子分頁骨架 + 優惠券牆；任務二：地鐵圖全域分類庫）~~ **✅ 2026-07-13 全部完成**，詳見上方「V2 階段 5」對應章節
6. ~~**階段 6**：交通查詢系統（任務一：spot_transport_routes + 交通查詢子分頁；任務二：行程內嵌交通方式 M2）~~ **✅ 2026-07-13 全部完成**，詳見上方「V2 階段 6」對應章節；AI 輔助整理遞延階段 7-8
7. ~~**階段 7**：AI 助手分頁（唯讀版）與 /api/ai-assistant 串接~~ **✅ 2026-07-13 全部完成，a-e 驗收項目全數通過**，詳見上方「V2 階段 7」
8. ~~**階段 8**:AI 工具逐個開放(第一批行程類五工具 + 第二批收藏類三工具與 delete_spot)~~ **✅ 2026-07-13 全部完成,階段 8 結案**,詳見上方「V2 階段 8 第一批」「V2 階段 8 第二批」
9. /trip 穩定後評估是否移除舊的 /travel 與 /japan 頁面
10. **階段 9**（全部功能穩定後）：程式碼清理與重構，含 CSS/ID 前綴隔離補齊（衝突熱點稽核中發現、決議延後的項目）；一併處理 V2 階段 4 任務一盤點發現的 `spots.category`/`spots.icon` 遺留欄位（`NOT NULL` 但前端從未寫入，一律吃預設值，已被 `spot_type_id`/`spot_subtype_id` 取代）；一併評估是否補上 `body.trip-page` class（V2 階段 7 發現的既有落差，見 PROJECT_ARCHITECTURE_V2.md 5.3 節）

---

## 七、開始新任務的指令

給 Antigravity：
「請先閱讀專案根目錄的 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 和 PROJECT_PROGRESS.md，了解目前的架構、規則和進度後，再開始執行任務。在動手前請先說明你的實作計畫，等我確認後再開始。」

給新的 Claude 對話：
「請閱讀我的 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 和 PROJECT_PROGRESS.md，這三個文件在我的 Antigravity 專案資料夾 /Users/wangyusheng/Desktop/my-home/ 裡，了解目前進度後告訴我你看到了什麼。」
