# PROJECT_ARCHITECTURE_V2.md
# The Corner Table — 行程整合頁面 架構規劃

> 本文件記錄「旅行地圖 + 日本收藏 整合頁面」的架構決策。
> 與 PROJECT_ARCHITECTURE.md（全站通用架構規則）並行參考。
> /trip 的 Supabase 單一入口架構等實作層細節，見 PROJECT_ARCHITECTURE.md 對應章節；
> 開發進度與 Bug 修正記錄，見 PROJECT_PROGRESS.md。
>
> 狀態標記：✅ 已完成　🔶 進行中　📋 規劃中（尚未開發）

---

## 一、整體概述

### 1.1 目標

將現有 `/japan`（日本收藏）與 `/travel`（旅行地圖）**重構整合為單一頁面 `/trip`**，
並加入一個固定的 AI 對話助手，AI 可以直接讀取與修改行程、收藏資料。

整合後：
- 管理員（你）：完整功能，包含 AI 助手
- 協作者（朋友/家人）：依各行程個別授權的權限，使用簡化版功能
- ✅ `/japan`、`/travel` 已於 2026-07-13（V2 階段 9）正式退役並轉址至 `/trip`，詳見第八節階段 9

### 1.2 命名

頁面路徑為 `/trip`（已定案，src/pages/trip.astro）。

---

## 二、版面設計（Desktop / Mobile 分流）✅ 骨架已完成

同一份資料與 JS 邏輯，依裝置寬度切換**完全不同的版面模板**（非單純響應式縮放）。

### 2.1 三大主分頁

- **行程** ✅：地圖、每日行程、交通查詢、資源（優惠券/地鐵圖）皆已上線
- **收藏** ✅：日本收藏品瀏覽、願望清單、數量調整、依行程篩選皆已上線
- **AI** ✅：固定對話視窗（僅管理員可見），唯讀版已上線，可回答目前行程/收藏相關問題，尚無寫入工具

### 2.2 Desktop 版面 ✅

左側固定窄欄選單：
- 最上方：「返回首頁」按鈕（**僅管理員可見**），置於左上角
- 下方：「行程」「收藏」「AI」三個圖示常駐顯示，點擊切換主畫面內容

### 2.3 Mobile 版面 ✅

- 畫面右上角一個選單按鈕（漢堡選單樣式）
- 點擊展開小選單，切換「行程」「收藏」「AI」
- 「返回首頁」按鈕僅管理員登入時顯示，置於選單列表最上方
- 不使用底部固定分頁列，避免與 AI 對話輸入框搶位置
- 選單展開機制：已從 `position: absolute` 改為 `position: fixed`（修正截斷問題）

### 2.4 Sandbox 模式（非管理員）✅ 已實作（V2 階段 4 任務三）

- 完全不顯示連回網站其他頁面（首頁、短文、語錄等）的連結
- 不顯示「返回首頁」按鈕
- 整個頁面對協作者而言是獨立工具，無法離開到主站其他地方
- `trip.astro` 判斷 `isAdminUser` 後，僅管理員會被加回 `.admin-home-link`、`.trip-admin-only` 兩個 class 元素的顯示（`display: flex`）；非管理員（協作者/朋友/訪客）預設一律隱藏，不需額外針對每個角色寫判斷

---

## 三、「行程」分頁 — 三個子分頁

✅ **子分頁骨架已上線（2026-07-13，V2 階段 5 任務一；2026-07-13 新增第三個子分頁，V2 階段 6 任務一）**：`TripPlanner.astro` 頂部「行程」「交通查詢」「資源」三個子分頁導覽（純前端顯示切換，不重讀資料），`switchTripSubtab()` 以 `data-subtab` 屬性泛化處理，非寫死兩個分頁的判斷。切換子分頁時登入/登出按鈕維持顯示於子分頁列，不隨子分頁切換而消失；切回「行程」時若地圖容器曾被隱藏，僅觸發 Google Maps `resize` 事件修正 tile 渲染並保留原本 center/zoom，不呼叫 `fitBounds`，地圖視野與選取狀態不會被重置。

### 3.1 行程（核心，預設顯示）✅ 已遷移上線

沿用並擴充原 `/travel` 的核心功能，已搬移至 `TripPlanner.astro` 元件：

- ✅ 地圖模式 / 行程模式切換
- ✅ 每日行程管理（新增/刪除/排序天數，景點排序）
- ✅ **連鎖店顯示/隱藏**：
  - `spot_types.is_chain_store`、`spot_subtypes.is_chain_store`
  - 任一為 true 即視為連鎖店
  - 地圖標記縮小（scale 0.65）+ 變淡（opacity 0.6）
  - 篩選列「顯示連鎖店」開關，預設關閉，僅影響地圖模式顯示，不影響行程模式選點
  - fitBounds 與 Marker 渲染已拆分，切換開關不會重置地圖視野
- ✅ Supabase 單一入口架構整合（見 PROJECT_ARCHITECTURE.md）
- ✅ 登入/登出 UI、權限判斷（含 Race Condition 修正）
- ✅ **刪除行程**（2026-07-13，僅管理員，非 V2 分階段任務，使用者臨時追加需求）：
  - 編輯行程 Modal 底部新增「刪除行程」按鈕，只在編輯既有行程時顯示（新增行程時隱藏）
  - 刪除前 `confirm()` 明確告知：底下每日行程、景點排序、協作者設定、地鐵圖分類關聯會一併永久刪除（`trip_days`/`trip_collaborators`/`trip_subway_categories` 皆為 `trip_id` `ON DELETE CASCADE`）；景點本身不會被刪除，但會退回沒有歸屬行程的狀態
  - 配套資料庫調整：`spots.trip_id` 外鍵刪除規則由 `CASCADE` 改為 `SET NULL`（比照 `japan_items.trip_id` 既有設計），景點資料本身不受刪除行程影響
  - ⚠️ **已知限制**：`/trip` 目前沒有瀏覽「沒有歸屬行程」景點的畫面（不同於 `japan_items` 有「一般收藏」篩選），退回一般狀態的景點目前無法從介面看到或管理，只能透過 Supabase Dashboard 直接查詢/改 `trip_id`。已與使用者確認此限制可接受，暫不開發對應瀏覽功能
  - 🔴 **教訓（已寫入 CLAUDE.md）**：上線當下 SQL 尚未執行、使用者就先測試了刪除，當時外鍵仍是舊的 `CASCADE` 規則，實際刪除了一個測試行程底下的景點資料（免費方案無自動備份，無法復原）。事後確認為測試用資料，不追究，但已確立規則：涉及「資料庫外鍵/RLS 變更」+「會觸發該行為的功能」時，兩者必須明確排序，不能同一則訊息一次帶過

- ✅ **景點間內嵌交通方式**（M2，2026-07-13，V2 階段 6 任務二）：
  - 行程模式中，同一天相鄰兩個景點之間插入窄的交通區塊（虛線左框、淡色，不搶景點卡片視覺主體）；配對依「目前顯示順序」即時計算，景點排序調整後配對自動跟著新相鄰關係重算，資料庫不因排序移動任何路線資料
  - 已有路線：收合顯示第一筆（mode + 時間），點擊展開全部選項，含備註、時刻表連結、地鐵圖分類（點擊跳到「資源」子分頁定位）
  - 無路線：僅對有編輯權者（管理員/該行程 `can_edit_itinerary` 協作者）顯示「+ 交通方式」；無編輯權者無路線時不顯示任何東西
  - 新增/編輯沿用「交通查詢」子分頁同一個 Modal，開啟前把該子分頁的起訖點欄位設為預填值（不修改交通查詢子分頁本身邏輯）；新增/編輯/刪除後兩處互相刷新（`queryTransportRoutes()` 與 `renderDaySpots()` 互相呼叫，Modal 關閉時重抓，非即時推播）
  - 排序安全性：`moveSpotOrder()` 為純陣列運算（`daySpotsCache.findIndex` + 交換 `order_index`），不依賴 DOM 順序或 `nth-child`，交通區塊以獨立 sibling 元素插入不影響既有排序邏輯，已實測確認

### 3.2 交通查詢 ✅ 已上線（2026-07-13，V2 階段 6 任務一）

獨立工具，用於行程調整時查詢任意兩點之間的交通方式：

- 選擇「起點」「終點」（下拉選單，選項為目前行程已存景點；監聽 `trip-changed` 事件，切換行程時重新載入）
- 列出 `spot_transport_routes` 中已儲存的所有路線選項：mode 圖示（依關鍵字比對 電車/巴士/步行/計程車/渡輪，其餘用預設圖示）+ 名稱、時間、費用；展開見備註、時刻表連結（新分頁開啟）、對應地鐵圖分類（點擊跳到「資源」子分頁並捲動定位該分類，若該分類當下未顯示會暫時加入個人篩選以便看到，不寫入資料庫）
- **⇄ 反向**按鈕一鍵交換起訖點重新查詢；路線具方向性，A→B 與 B→A 是資料庫中的兩筆不同資料，UI 不會互相顯示
- 管理員與該行程 `can_edit_itinerary` 協作者可新增/編輯/刪除路線選項（Modal，`travel-` 前綴隔離，寫入皆檢查受影響筆數）；朋友/訪客僅能查詢瀏覽，無編輯入口
- ⚠️ **「AI 搜尋」明確不做**：原規劃「若尚無資料可觸發 AI 搜尋」依賴階段 7-8 才會建置的 AI 後端，本次遞延，UI 未放置任何佔位按鈕
- 行程子分頁（3.1 的「景點間內嵌交通方式」，M2，✅ 已上線）與交通查詢共用同一份 `spot_transport_routes` 資料；兩處互相刷新，交通查詢子分頁與行程子分頁皆可新增/編輯/刪除路線

`spot_transport_routes` 表（✅ 已建立，2026-07-13）：`id`、`origin_spot_id`/`destination_spot_id`（皆 FK → `spots.id`，`ON DELETE CASCADE`，`CHECK` 不可相同）、`mode`（text NOT NULL）、`duration_minutes`（可空）、`cost`（text 可空，幣別格式自由）、`note`（可空）、`timetable_url`（可空）、`subway_map_category`（可空，對應 `travel_subway_maps.category`，非外鍵，僅字串比對）、`sort_order`、`created_at`。RLS：SELECT 開放；INSERT/UPDATE/DELETE 重用 `can_edit_trip((SELECT trip_id FROM spots WHERE id = origin_spot_id))`；INSERT/UPDATE 的 `WITH CHECK` 另加完整性——起點與終點的 `spots.trip_id` 必須相等，`trip_id` 為 NULL 的遺留景點因 NULL 比較特性（`NULL = NULL` 恆為 false）自然無法建立路線，屬預期行為。

### 3.3 資源 ✅ 已全部上線（2026-07-13，V2 階段 5 任務一、二）

跨行程共用的**全域資源庫**，不綁定特定 `trip_id`：

**優惠券**（`travel_coupons`，✅ 2026-07-13 已上線，V2 階段 5 任務一）
- 全站共用，卡片式呈現：圖片、標題、說明、連結（點擊開新分頁）
- 管理員可新增/編輯/刪除（Modal 表單，圖片上傳至 `travel_coupons` bucket，沿用既有 spot 圖片上傳模式）；`admin-only` class 控制編輯入口顯示，寫入操作皆檢查受影響筆數
- RLS 稽核時已確認正確（SELECT 全開、寫入鎖管理員 email），本次未異動

**地鐵圖**（`travel_subway_maps` + `trip_subway_categories`，✅ 2026-07-13 已上線，V2 階段 5 任務二）
- `travel_subway_maps` 新增 `category`（text，NOT NULL）欄位，全域資源庫依此分組顯示；原 `trip_id` 欄位**停用不刪**（新程式碼不再讀寫，保留至階段 9 評估是否清理，此為刻意決定，不是遺漏）
- 新表 `trip_subway_categories`（`trip_id` + `category`，`UNIQUE(trip_id, category)`）記錄行程關聯了哪些分類；RLS：SELECT 開放、INSERT/DELETE 重用 `can_edit_trip()`（V2 階段 4 任務二建立），UPDATE 不開放（要改就刪了重加）
- 「資源」子分頁優惠券下方新增地鐵圖區塊：預設依目前行程關聯的分類分組顯示圖片，點圖沿用既有 `#lightbox`（與景點照片共用）放大檢視
- 「瀏覽全部分類」：⚠️ **與原規劃不同**——原規劃僅管理員與 `can_edit_itinerary` 協作者可見。開發驗收時使用者提出調整：**開放給所有人使用**（含朋友帳號、未登入訪客），比照 V2 階段 3「收藏依行程篩選」的精神。但寫入行為依身分分流：
  - 管理員或該行程 `can_edit_itinerary` 協作者：勾選會寫入 `trip_subway_categories`，變更該行程對**所有人**的預設顯示分類
  - 其餘所有人（一般協作者、白名單朋友、未登入訪客）：勾選只更新前端本地變數（`personalSubwayCategorySelection`），**不寫入資料庫、不影響其他人**，切換行程或重新整理會重置回該行程的預設分類；Modal 內說明文字依身分顯示不同版本
- 管理員專屬「上傳地鐵圖」：圖片 + 名稱 + 分類（單一輸入框 + `<datalist>` 自動建議既有分類，可直接選用或輸入新分類）+ 選填原始連結；上傳至 `travel_subway_maps` bucket，沿用既有 spot/優惠券圖片上傳模式
  - ⚠️ **與原規劃不同**：分類欄位第一版做成「下拉選單（選既有）/文字框（輸入新分類）」雙欄位切換設計，使用者驗收時反映選了既有分類仍誤以為要填新分類名稱，體驗混淆；改為單一輸入框 + `<datalist>`，選現有或打新分類都在同一欄位完成
  - 監聽 `trip-changed` 事件，切換行程時重新查詢該行程關聯的分類（`loadTripSubwayCategories()`），全域地鐵圖清單本身只在頁面初次載入時抓取一次，不隨行程切換重抓
- 「AI 幫我找圖」**明確遞延至階段 7**（依賴階段 7 才會建置的 AI 後端），本次僅實作手動上傳
- **管理員專屬「刪除地鐵圖」**（✅ 2026-07-13 已上線，非分階段任務，使用者臨時追加需求）：每張圖右上角 `admin-only` 垃圾桶按鈕，`confirm()` 後刪除該筆 `travel_subway_maps` 資料，完全比照既有優惠券刪除模式；RLS 早已就緒（`travel_subway_maps_admin_all` 為 `FOR ALL` 鎖管理員 email，DELETE 本來就允許，只是先前沒有對應前端按鈕），不需要任何 SQL 變更。只刪資料庫該筆資料，圖片檔案留在 Storage bucket（比照 `travel_coupons`/`post_images` 既有孤兒檔案慣例，不引入新的清理邏輯）；`trip_subway_categories` 以 `trip_id`+分類名稱關聯、非外鍵指向 `travel_subway_maps.id`，刪除單張圖片不影響任何行程的分類關聯設定

---

## 四、「收藏」分頁 ✅ 已遷移上線（依行程篩選 ✅ 已上線，2026-07-12）

沿用並擴充原 `/japan` 收藏功能，已搬移至 `JapanCollection.astro` 元件：

- ✅ 搜尋、分類篩選、願望清單、數量調整、「❤️ N 人想買」Modal — 皆沿用現有邏輯
- ✅ 管理員的「所有人」模式沿用
- ✅ Supabase 單一入口架構整合、登入/登出 UI
- ⚠️ `window.currentTripId` 暴露機制（selectTrip() 設定 + dispatchEvent('trip-changed')）：當初預留供收藏篩選讀取，但實際開發階段 3 時依使用者需求**改為不採用**，詳見下方說明；此機制本身仍保留給行程分頁自己使用，未被移除

- ✅ **依行程篩選**（V2 階段 3，2026-07-12 上線）：
  - `japan_items` 新增 `trip_id`（可空，FK → trips，`ON DELETE SET NULL`）：
    - `trip_id IS NULL`：一般收藏（不分行程）
    - `trip_id = 某行程`：歸屬該行程的收藏品
  - **實際設計與原規劃不同**：原規劃是收藏分頁篩選跟隨「行程」分頁目前選中的行程（透過 `window.currentTripId`/`trip-changed`）。開發驗收時使用者提出兩項調整需求：(1) 收藏分頁改用**自己獨立的行程下拉選單**直接選擇要看哪個行程，與「行程」分頁選中哪個行程完全無關；(2) 篩選功能**開放給所有人使用**（含朋友帳號、未登入訪客），不再限管理員可見。目前實作：下拉選單三類選項「全部」「一般收藏」＋所有行程名稱，選特定行程時顯示「該行程＋一般收藏」
  - 管理員新增/編輯收藏品項的表單新增「歸屬」下拉（一般收藏 + 行程清單），可自由指定或改回一般收藏
  - 歸屬行程的品項卡片顯示行程名稱徽章，一般收藏不顯示
  - 已確認既有資料 `trip_id` 為 NULL 時顯示與改版前完全一致，願望清單/白名單機制不受影響
  - `/japan`、`/travel` 凍結頁面完全未修改（diff 為零），此篩選功能僅存在於 `/trip`

---

## 五、「AI」分頁 ✅ 唯讀版已上線（V2 階段 7），寫入工具已全部上線（V2 階段 8，2026-07-13）

固定對話視窗，**僅管理員可見與使用**。V2 階段 7 為純唯讀；V2 階段 8 分兩批開放全部規劃中的寫入工具（見 5.2 節），兩批皆已驗收通過，階段 8 全部結案。

### 5.1 架構 ✅ 已上線

- `src/pages/api/ai-assistant.ts`（`prerender = false`）：
  - 身分驗證完全比照 `/api/trigger-deploy`——前端帶 Supabase access token（`Authorization: Bearer`），後端 `supabase.auth.getUser(token)` 驗證後比對後端環境變數 `ADMIN_EMAIL`（過渡期 fallback `PUBLIC_ADMIN_EMAIL`），不符一律 401
  - 查詢 context 一律用「請求者的 token」建立的 client（RLS 生效），**不使用 service role**
  - 呼叫 Anthropic API 直接用原生 `fetch`（未安裝 `@anthropic-ai/sdk`，比照 `src/pages/api/explore.ts` 呼叫外部 API 的既有寫法），model `claude-sonnet-5`，`max_tokens: 2048`，非串流，30 秒逾時
  - Context 組成（只留必要欄位，不含 images 陣列與座標）：目前選中行程的 `trips`（名稱/emoji）、`trip_days`+`day_spots`+`spots`（依天數排序的景點名稱/備註/類型/子類型/是否連鎖店）、`spot_transport_routes`（該行程景點之間的路線）、`japan_items`（`trip_id` 等於該行程或為 NULL）+`wishlist_items`（供 AI 判斷願望清單數量相關問題）
  - API 金鑰存於後端環境變數 `ANTHROPIC_API_KEY`，不出現在任何前端程式碼
- 前端元件 `src/components/AiAssistant.astro`：token 取自 `window.__latestAuthState` 快照、tripId 取自 `window.currentTripId` +監聽 `trip-changed`（套用與 auth 快照相同的 Race Condition 雙保險），對話歷史存於記憶體陣列，前端固定只送出最近 20 則（超過丟最舊，控制成本），不做持久化

### 5.2 Tool Use（逐步開放）

| 工具 | 對應操作 | 狀態 |
|------|---------|------|
| `add_spot` | 新增**全新**景點至 spots，可選同時指定加入某天（day_number + 1-based position） | ✅ 已上線（2026-07-13，V2 階段 8 第一批） |
| `assign_spot_to_day` | 把目前資料中**已存在**的景點加入某一天（不新建景點） | ✅ 已上線（2026-07-13，驗收 a 發現的補充工具，見下方說明） |
| `update_spot` | 修改景點資訊（名稱、地址、類型、開放時間、價格、備註、狀態） | ✅ 已上線 |
| `reorder_day_spots` | 調整某天景點順序（整批傳入新順序，不可增減成員） | ✅ 已上線 |
| `add_transport_route` | 新增 A→B 交通方式至 spot_transport_routes | ✅ 已上線 |
| `delete_spot` | 刪除景點（無法復原） | ✅ 已上線（2026-07-13，V2 階段 8 第二批） |
| `toggle_wishlist` | 勾選/取消管理員自己在 japan_items 的願望清單標記 | ✅ 已上線 |
| `update_wishlist_quantity` | 調整管理員自己的願望數量 | ✅ 已上線 |
| `add_japan_item` | 新增收藏品項 | ✅ 已上線 |

**架構（V2 階段 8 第一批，2026-07-13）**：
- Context 擴充：`spots`/`days` 改為同時攜帶 `spot_id`/`day_id`（stage 7 為求精簡只留名稱，本批工具需要精確定位，改為 ID 引用），供工具呼叫時直接使用，避免同名景點造成的模糊比對問題
- 後端實作 Anthropic tool-use 迴圈：`stop_reason` 為 `tool_use` 時執行對應工具、把 `tool_result`（含 `is_error`）附回訊息陣列再呼叫，迴圈上限 10 次；超過上限仍未拿到最終文字回覆，回報「操作過於複雜，請拆小」
- 寫入一律用查詢 context 同一支「請求者 token 的 client」，RLS（`is_admin()`）為最終防線，API 層不繞過；由於本階段僅管理員能呼叫此 API，RLS 一律放行，協作者權限不受影響
- 每個工具執行後檢查受影響筆數，0 筆一律回報失敗（`{success:false, error}`），不得對 AI 或使用者謊報成功
- `add_spot`/`update_spot` 的地址一律呼叫 Google Geocoding API 換算座標與 `place_id`（重用既有前端環境變數 `PUBLIC_GOOGLE_MAPS_KEY`，未新增環境變數）；解析失敗直接回報錯誤，不寫入資料庫、不臆造座標
- `type_name`/`subtype_name` 依 context 提供的既有名稱做字串對照解析成 `spot_type_id`/`spot_subtype_id`，對不到就寫 NULL（不阻擋整個操作）
- 完整性檢查：`update_spot`/`add_transport_route` 收到的 `spot_id` 執行前都先確認確實屬於目前 `tripId`，防止模型幻覺 ID 時誤寫（即使 context 本身只會包含當前行程的 ID）
- System prompt 增補：寫入前若使用者未明確要求該操作先文字確認；每次成功後在回覆中明確描述做了什麼；ID 必須直接使用 context 中出現的值，不可自行編造
- 前端 `AiAssistant.astro` 未改動，工具完全在後端執行，對話 UI 照舊只顯示文字結果
- **`assign_spot_to_day`（驗收 a 發現的缺口，2026-07-13 補上）**：原始四工具設計中，`add_spot` 只能新增全新景點、`reorder_day_spots` 只能調整既有成員順序不能新增成員，導致「把已經存在於行程中的景點加入某一天」這個操作沒有對應工具（對應既有前端 `TripPlanner.astro` 的 `addSpotToDay()`/「從想去清單選擇」功能）。使用者實測時要求把已存在的景點加入 Day 1，AI 正確判斷現有工具做不到並如實告知，沒有誤用 `add_spot` 建立重複資料——證明系統提示的「不確定就先確認、不要猜測執行」有效。已新增 `assign_spot_to_day` 工具補上缺口，重用既有的 `applyDaySpotOrder` 排序邏輯；若該景點已在該天則回報失敗而非重複加入
- ⚠️ **已知風險（如實記錄，非本次能解決）**：10 輪迴圈 × 每輪最多 30 秒逾時，理論上限可能到數分鐘；若 Vercel 方案的 serverless function 逾時上限（Hobby 方案固定 10 秒，無法調整）比這個短，複雜的多工具操作可能被 Vercel 中途砍斷，而非後端邏輯自己回報「操作過於複雜」。若之後實測常態逾時，需另外討論對策（例如降低單輪 timeout、減少迴圈上限）

**架構（V2 階段 8 第二批，2026-07-13）**：
- **關鍵澄清（依現有程式碼校正任務描述）**：`toggle_wishlist`/`update_wishlist_quantity` 操作的是 **`japan_items.owner_wishlist`/`owner_quantity` 兩個欄位本身**（管理員自己的收藏狀態就存在這裡），**不是** `wishlist_items` 表——後者是朋友/家人專用（有獨立的 `user_id`/`japan_item_id`/`quantity`），管理員的收藏狀態從來不會出現在那張表。兩套機制完全獨立，實作前已比對 `JapanCollection.astro` 第 1370、1397 行既有寫法確認
- Context 擴充：`japan_items` 補上 `item_id`（沿用批次一「工具需要 ID 才能精確定位」的原則，此前只有名稱）與解析後的 `category`；新增 `japan_categories` 查詢，回傳 `categories` 陣列供顯示，並建立 `categoryIdByName` lookup 供 `add_japan_item` 解析分類
- **`delete_spot`**：本批唯一的刪除工具，`spot_id` 執行前確認屬於目前 `tripId`（比照 `update_spot`），成功訊息固定包含「已刪除，若為誤刪需手動重建」。⚠️ **確認流程是提示詞層級的行為約束，不是程式碼層級的強制擋修**：規則寫在 system prompt 與工具 `description`——只有使用者在對話中明確點名要刪除某景點才可考慮呼叫、呼叫前必須先用文字複述景點名稱與所屬行程並等待使用者在下一則訊息明確確認。程式碼本身不會技術性阻止模型提前呼叫，完全仰賴模型對提示詞的遵循程度
- `toggle_wishlist`：`update({ owner_wishlist, owner_quantity: 1 })` 兩欄位一起寫，勾選與取消皆重置數量為 1，完全比照既有手動 UI 行為
- `update_wishlist_quantity`：`update({ owner_quantity })`，只改數量，比照既有手動 UI
- `add_japan_item`：欄位對齊既有 `itemData`（`name`/`note`/`image_url`/`category_id`/`trip_id`）；AI 無法上傳圖片，`image_url` 固定 null；`scope` 省略時預設 `'trip'`（歸屬目前行程），需明確指定 `general` 才存進不分行程的一般收藏
- System prompt 增補：`japan_items` 的 `scope` 語意說明（`general`=一般收藏、`trip`=歸屬目前行程，新增品項預設歸屬目前行程）；`delete_spot` 的確認流程規則
- 前端 `AiAssistant.astro` 未改動

### 5.3 介面 ✅ 已上線(唯讀對話,無工具)

- 訊息氣泡列表(可捲動)+ 底部輸入框，元素 `ai-` 前綴隔離；送出後鎖定輸入框顯示等待動畫，錯誤(401/500/504)顯示明確中文提示
- ⚠️ **與原規劃不同**:桌面「常駐一角展開/收合」的浮動視窗設計本階段遞延，目前與行程/收藏分頁一樣是切換到 AI 分頁才看到對話框(非常駐)；Mobile 沿用既有分頁切換，無額外全螢幕特化
- ⚠️ **已知限制**:`.trip-main-content` 依賴 `body.trip-page` 這個 class 才會有 `height:100vh`+`overflow:hidden` 的版面鎖定(定義於 `trip.css`)，但 `Layout.astro` 從未實際把這個 class 加到 `<body>` 上，是全站既有、與本次改動無關的既有落差。實際效果是 `.trip-main-content` 高度隨內容自動增高(行程/收藏分頁本來就是這樣運作)，AI 對話框因此也是「隨對話內容增高，捲動整個分頁」而非「固定視窗高度、只在訊息區內捲動」。功能不受影響，但未完全達到當初「底部固定輸入框」的視覺效果，留待階段 9 一併評估是否修正 `body` class 缺漏(影響全站 /trip，非僅 AI 分頁，不在本階段範圍內處理)

---

## 六、權限模型

### 6.1 管理員 ✅ 已實作（含安全修正）

- `auth.jwt() ->> 'email' = PUBLIC_ADMIN_EMAIL`
- 所有行程、所有收藏品、AI 助手 — 完整存取權限
- ⚠️ 曾發生權限漏洞：`updateAuthUI` 一度未比對 email，只要有 session 即無條件設為管理員，已修正為嚴格比對 `currentSession.user.email === adminEmail`

### 6.2 協作者（trip_collaborators）✅ 已全數落實（2026-07-13，V2 階段 4 任務一、二、三，階段 4 結案）

表 `trip_collaborators`（已建立）：

| 欄位 | 說明 |
|------|------|
| id | uuid，PK |
| trip_id | uuid，NOT NULL，FK → trips（`ON DELETE CASCADE`） |
| user_email | text，NOT NULL，寫入前 trim + 轉小寫 |
| can_edit_wishlist | boolean，預設 false，是否可瀏覽/標記/調整收藏願望清單 |
| can_edit_itinerary | boolean，預設 false，是否可編輯該行程的地圖/每日行程 |
| created_at | timestamptz，預設 now() |

UNIQUE(trip_id, user_email)。RLS：SELECT 為 `is_admin() OR lower(user_email)=lower(auth.jwt()->>'email')`（協作者查得到自己那一列）；INSERT/UPDATE/DELETE 一律僅 `is_admin()`（重用既有 `public.is_admin()`）。

- 兩個權限**獨立開關**，可任意組合（例如：某人只能調整願望清單，不能改行程）
- 每個行程可指定不同協作者與權限組合
- **管理員 UI 已上線**（`TripPlanner.astro`）：行程標題旁 👥 圖示（`admin-only`）開啟 Modal（`travel-collaborators-modal`），可對目前選中行程新增/移除協作者、切換兩個開關；三種關閉路徑（按鈕/背景/ESC）皆會清除 `body.modal-open`；寫入操作皆檢查受影響筆數，RLS 擋下時明確提示而非誤報成功
- ✅ **can_edit_itinerary 已落實生效（2026-07-13，V2 階段 4 任務二）**：
  - 新函式 `public.can_edit_trip(p_trip_id uuid)`（`SECURITY DEFINER`）：`is_admin() OR EXISTS(該行程 trip_collaborators 中 can_edit_itinerary=true 的自己那一列)`
  - `trips`：INSERT/UPDATE/DELETE 一律僅 `is_admin()`——協作者不能建立/改名/刪除行程本身
  - `trip_days`/`spots`：INSERT/UPDATE/DELETE 改用 `can_edit_trip(trip_id)`；`spots.trip_id` 為 NULL 的遺留景點（見任務一盤點）因 `EXISTS` 子查詢比對 NULL 恆為 false，`can_edit_trip(NULL)` 只剩 `is_admin()` 會過，符合預期只有管理員能動
  - `day_spots`：寫入用 `can_edit_trip((SELECT trip_id FROM trip_days WHERE id = day_id))`；INSERT/UPDATE 的 `WITH CHECK` 額外檢查 `(SELECT trip_id FROM spots WHERE id = spot_id) = (SELECT trip_id FROM trip_days WHERE id = day_id)`——關閉任務一盤點 Q2 發現的「可把 A 行程景點塞進 B 行程某一天」漏洞，此檢查只擋新寫入，不影響既有資料
  - 四張表的 SELECT 政策完全不動（公開展示為刻意設計）
  - **前端（`TripPlanner.astro`）**：新增 `canEditItinerary(tripId)` 判斷（管理員恆真，或協作者在該行程 `can_edit_itinerary=true`）；登入後查詢 `trip_collaborators` 取得自己在各行程的授權並快取；四個編輯進入點（新增景點、地圖點擊新增提示、新增一天、從想去清單選擇）從 `admin-only` 改為新的 `itinerary-edit-only`，由 `updateItineraryEditUI()` 依目前選中行程動態切換；天數排序/刪除、景點卡片編輯/刪除、每日行程項目移動/移除、地圖 InfoWindow 編輯鈕等原本內嵌 `isAdminUser` 的渲染邏輯，一併改用 `canEditItinerary(currentTripId)`；監聽 `trip-changed` 事件在切換行程時重新評估；行程本身建立/改名/刪除、協作者管理、管理類型維持 `admin-only` 不變
  - 授權撤銷生效時機：資料庫層即時（下一次寫入就被拒），前端 UI 允許在重新整理或切換行程時更新，不做即時推播
- ✅ **can_edit_wishlist 已落實生效（2026-07-13，V2 階段 4 任務三）**：
  - 新函式 `public.can_wishlist_item(p_item_id bigint)`（`SECURITY DEFINER`，`japan_items.id` 為 `bigint` 非 `uuid`）：管理員恆可；該品項 `trip_id IS NULL`（一般收藏）→ 沿用白名單機制，回傳 `is_friend()`；該品項有 `trip_id`（行程收藏）→ `EXISTS(該行程 trip_collaborators 中 can_edit_wishlist=true 的自己那一列)`
  - `wishlist_items`：INSERT 的 `WITH CHECK`、UPDATE 的 `USING`/`WITH CHECK` 改為 `auth.uid() = user_id AND can_wishlist_item(japan_item_id)`；**DELETE（`auth.uid() = user_id`）與 SELECT（`authenticated` 可讀）刻意不動**——就算權限被撤，本人永遠能收回自己標過的願望，不留下動不了的殘留；「N 人想買」統計依賴 SELECT 全開
  - 關閉的縫隙：修復前任何登入帳號（不限白名單）都能對任意品項寫入 `wishlist_items`，只檢查 `auth.uid()=user_id`，未檢查是否真的有權限操作該品項；一般收藏與行程收藏兩套授權機制（白名單 vs 協作者）完全獨立，互不影響
  - **前端（`JapanCollection.astro`）**：新增 `canWishlistItem(item)` 判斷，邏輯與 SQL 函式一致；登入的白名單使用者另外查詢自己的 `trip_collaborators` 授權並快取（此元件自查一次，不與 `TripPlanner.astro` 共用，避免耦合）；願望清單 📌 圖示渲染條件為「有權限」或「已經標記過」任一為真（即使權限被撤，已標記的仍會顯示以便收回，但**不再顯示數量調整器**，避免點擊觸發 RLS 拒絕造成困惑）；不符合任一條件的品項完全不渲染 📌，沿用既有訪客看到的樣式，未發明新樣式
- ✅ **Sandbox 模式已實作（2026-07-13，V2 階段 4 任務三）**：
  - `trip.astro`：AI 分頁的 Desktop 側欄圖示與 Mobile 選單項新增 `trip-admin-only` class（預設 `display: none`），與既有 `admin-home-link`（返回首頁連結）一起，僅管理員登入後才顯示
  - 已盤點 `trip.astro`、`TripPlanner.astro`、`JapanCollection.astro` 全部連結：僅 2 個「返回首頁」連結（Desktop + Mobile），已由既有 `admin-home-link` 機制正確控制；其餘 `<a>` 標籤皆為外部連結（Google Maps、使用者筆記網址、探索日本來源網站），與站內導覽無關；共用 `Layout.astro` 未注入任何站內導覽列，無其他洩漏管道
  - 2026-07-13 更新（V2 階段 7）：AI 分頁內容已改為真正的對話 UI，`switchTab()` 函式技術上仍可被 Console 呼叫繞過按鈕隱藏直接切換到該分頁並看到輸入框，但送出訊息會呼叫 `/api/ai-assistant`，後端仍會依 token 驗證身分，非管理員一律 401，不會取得任何資料——前端分頁隱藏只是 UX 層，真正的權限把關在後端，不因此產生資安缺口
- 協作者登入後僅看到「行程」「收藏」分頁（依權限決定可否編輯），無「AI」分頁，Sandbox 模式已生效

### 6.3 一般收藏（trip_id IS NULL）

- 沿用現有 `allowed_users` 白名單機制（不分行程的「一般收藏」願望清單）
- 與 `trip_collaborators` 為兩套獨立機制，互不影響
- ✅ 2026-07-13：`can_wishlist_item()` 函式已將此白名單判斷（`is_friend()`）與行程收藏的協作者判斷整合進同一個函式，但兩套機制的判斷條件本身仍完全獨立（品項 `trip_id` 決定走哪一套），互不影響

---

## 七、資料庫異動總表

### 7.1 新增資料表

| 資料表 | 狀態 | 說明 |
|--------|------|------|
| travel_coupons | ✅ 已建立，UI 已上線（2026-07-13） | 優惠券，全站共用 |
| travel_subway_maps | ✅ 已調整，UI 已上線（2026-07-13） | 地鐵圖，新增 `category` 欄位分組；`trip_id` 停用不刪（留待階段 9） |
| trip_subway_categories | ✅ 已建立，UI 已上線（2026-07-13） | trip_id + category，行程關聯的地鐵圖分類，RLS 重用 `can_edit_trip()` |
| spot_transport_routes | ✅ 已建立，UI 已上線（2026-07-13） | origin_spot_id + destination_spot_id + 多筆交通方式（mode/duration/cost/note/timetable_url/subway_map_category），RLS 重用 `can_edit_trip()` |
| trip_collaborators | ✅ 已建立（2026-07-12），權限已全數落實（2026-07-13） | trip_id + user_email + can_edit_wishlist + can_edit_itinerary，RLS 已設定，管理員 UI 已上線，兩個權限開關均已在對應表的 RLS 中生效 |

### 7.2 既有資料表異動

| 資料表 | 異動 | 狀態 |
|--------|------|------|
| spot_types | 新增 `is_chain_store` boolean | ✅ 已完成 |
| spot_subtypes | 新增 `is_chain_store` boolean | ✅ 已完成 |
| japan_items | 新增 `trip_id`（可空，FK → trips，`ON DELETE SET NULL`） | ✅ 已完成（2026-07-12） |
| travel_subway_maps | 新增 `category`（text, NOT NULL）；`trip_id` 停用不刪（改用 trip_subway_categories 記錄關聯，`trip_id` 本身保留至階段 9 評估） | ✅ 已完成（2026-07-13） |
| spots | `trip_id` 外鍵刪除規則 `CASCADE` → `SET NULL`（配合刪除行程功能，比照 japan_items 設計） | ✅ 已完成（2026-07-13） |

### 7.3 Storage Buckets

| Bucket | 狀態 | 說明 |
|--------|------|------|
| travel_coupons | ✅ 已建立，使用中（2026-07-13） | PUBLIC |
| travel_subway_maps | ✅ 已建立，使用中（2026-07-13） | PUBLIC |

---

## 八、開發階段規劃

| 階段 | 內容 | 狀態 |
|------|------|------|
| 1 | 新頁面骨架：`/trip` Desktop/Mobile 兩套版面 shell，三分頁可切換 | ✅ 已完成 |
| 2 | 行程子分頁遷移：地圖、行程模式、連鎖店功能遷移至 TripPlanner.astro | ✅ 已完成 |
| 2.5 | Supabase 單一入口架構重構 + Race Condition 修正（原規劃外，因應實作過程發現的問題而新增） | 🔶 大致完成，有未解決問題待釐清 |
| 3 | 收藏分頁整合：japan_items.trip_id、收藏分頁顯示邏輯、一般收藏 vs 行程收藏 | ✅ 已完成（2026-07-12） |
| 4 | 協作者權限系統：trip_collaborators、雙開關權限、Sandbox 模式（共三個子任務） | ✅ 已完成（任務一：地基與管理員 UI 2026-07-12；任務二：can_edit_itinerary 落實 2026-07-13；任務三：can_edit_wishlist 落實 + Sandbox 模式 2026-07-13） |
| 5 | 資源子分頁：優惠券、地鐵圖分類化、trip_subway_categories | ✅ 已完成（任務一：子分頁骨架 + 優惠券牆 2026-07-13；任務二：地鐵圖全域分類庫 2026-07-13） |
| 6 | 交通查詢子分頁：spot_transport_routes、行程內嵌交通方式 UI | ✅ 已完成（任務一：spot_transport_routes 建表 + 交通查詢子分頁 2026-07-13；任務二：行程內嵌交通方式 UI，M2 2026-07-13） |
| 7 | AI 助手（只讀）：/api/ai-assistant，讀取行程/收藏資料並回答問題 | ✅ 已完成（2026-07-13） |
| 8 | AI 工具逐個開放：add_spot、toggle_wishlist 等寫入工具 | ✅ 已完成（2026-07-13）：第一批行程類五工具（含補丁 assign_spot_to_day）+ 第二批收藏類三工具與 delete_spot，皆驗收通過 |
| 9 | 程式碼清理與重構：統一 Modal/CSS 命名規則、評估舊頁面下線 | 🔶 第一個任務（/japan、/travel 正式退役+轉址）✅ 已完成並驗收通過（2026-07-13）；統一 Modal/CSS 命名規則等其餘清理項目待開始 |

> 階段 1、2、2.5 的詳細實作記錄與 Bug 修正過程，見 PROJECT_PROGRESS.md「/trip 整合頁面」章節；階段 4 三個任務、階段 5 兩個任務、階段 6 兩個任務、階段 7 的實作記錄與驗收對照表，見 PROJECT_PROGRESS.md「V2 階段 4」「V2 階段 5」「V2 階段 6」「V2 階段 7」對應章節。

---

## 九、已完成項目總覽（沿用 ✅ 標記）

### 資料庫
- `spot_types` / `spot_subtypes` 新增 `is_chain_store`，連鎖店地圖標記縮小變淡
- 「顯示連鎖店」篩選開關，地圖視野不受切換影響
- `travel_coupons`、`travel_subway_maps` 資料表與 Storage bucket 建立；`travel_subway_maps` 已於 V2 階段 5 任務二調整為全域分類庫（新增 `category` 欄位，`trip_id` 停用不刪），新表 `trip_subway_categories` 記錄行程關聯
- `japan_items` 新增 `trip_id`（2026-07-12，V2 階段 3，見第四節）

### /trip 頁面實作
- trip.astro 骨架（Desktop/Mobile 雙版面、三分頁切換、管理員判斷）
- TripPlanner.astro、JapanCollection.astro 元件搬移完成
- Supabase 單一入口架構（trip.astro 統一管理 createClient/getSession/onAuthStateChange，子元件透過事件接收狀態）
- Race Condition 防護機制（`window.__latestAuthState` 快照 + 事件提前綁定）
- CDN 版本鎖定（`@supabase/supabase-js@2.110.2`，2026-07-11 由浮動 `@2` 進一步凍結為確切版號，詳見 PROJECT_PROGRESS.md「Heisenbug」相關記錄）
- 管理員權限判斷安全性修正（嚴格 email 比對）
- 朋友帳號三層權限顯示修復（TripPlanner.astro 的 updateAuthUI 補齊白名單朋友判斷分支，詳見 PROJECT_PROGRESS.md）
- 多項 Modal/CSS/z-index 衝突修正（詳見 PROJECT_PROGRESS.md）

### 待驗證
- 2026-06-22 發現：OAuth 登入後 UI 間歇性未切換（Heisenbug）。2026-07-11 第一輪時序診斷已排除 trip.astro auth 管線問題，並確認與 DevTools 開關無因果；診斷碼留在線上等待真實失敗取證。須先定案並解決此問題，階段 2.5 才能真正視為完成（詳見 PROJECT_PROGRESS.md「進行中問題」）
