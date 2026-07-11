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
- `/japan`、`/travel` 兩個現有頁面是否下線，待 `/trip` 全面穩定後評估

### 1.2 命名

頁面路徑為 `/trip`（已定案，src/pages/trip.astro）。

---

## 二、版面設計（Desktop / Mobile 分流）✅ 骨架已完成

同一份資料與 JS 邏輯，依裝置寬度切換**完全不同的版面模板**（非單純響應式縮放）。

### 2.1 三大主分頁

- **行程** 🔶：地圖、每日行程已上線；交通查詢、資源（優惠券/地鐵圖）規劃中
- **收藏** 🔶：日本收藏品瀏覽、願望清單、數量調整、依行程篩選皆已上線
- **AI** 📋：固定對話視窗（僅管理員可見），目前為佔位內容

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

### 2.4 Sandbox 模式（非管理員）📋

- 完全不顯示連回網站其他頁面（首頁、短文、語錄等）的連結
- 不顯示「返回首頁」按鈕
- 整個頁面對協作者而言是獨立工具，無法離開到主站其他地方
- 目前管理員判斷邏輯已實作（admin-home-link 顯示控制），完整 Sandbox 模式待 trip_collaborators 權限系統一併開發

---

## 三、「行程」分頁 — 三個子分頁

### 3.1 行程（核心，預設顯示）🔶 已遷移上線

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

- 📋 **景點間內嵌交通方式**（尚未開發）：
  - 行程模式中，連續兩個景點之間顯示「交通方式」區塊
  - 可直接新增/編輯這兩點之間的路線（對應 `spot_transport_routes`）
  - 點擊可展開查看時刻表連結、注意事項

### 3.2 交通查詢 📋 規劃中

獨立工具，用於行程調整時查詢任意兩點之間的交通方式：

- 選擇「起點」「終點」（從該行程已存景點中選）
- 列出 `spot_transport_routes` 中已儲存的所有路線選項（方式、時間、費用、注意事項、時刻表連結）
- 若尚無資料，可觸發 **AI 搜尋**：
  - AI 根據起點/終點搜尋所有可行交通方式
  - 結果以勾選列表呈現，含時間、費用、時刻表連結、地鐵圖分類連結、注意事項（如：分前後車廂往不同方向）
  - 勾選後一次儲存至 `spot_transport_routes`
- 行程子分頁新增的路線與交通查詢共用同一份資料，雙向同步

### 3.3 資源 📋 規劃中

跨行程共用的**全域資源庫**，不綁定特定 `trip_id`：

**優惠券**（`travel_coupons`，✅ 表已建立，UI 尚未開發）
- 全站共用，卡片式呈現：圖片、標題、說明、連結
- 管理員可新增/編輯/刪除

**地鐵圖**（`travel_subway_maps`，✅ 表已建立，需調整；UI 尚未開發）
- 全域資源庫，依 `category`（地區/系統名稱，如「東京 Metro」「沖繩巴士」）分組顯示
- 移除原本的 `trip_id` 綁定（改為下方關聯表）
- 每個行程可透過 `trip_subway_categories` 關聯表選擇「這次行程要顯示哪些分類」
  - 預設顯示該行程已關聯的分類
  - 可展開「瀏覽全部分類」，選用其他行程曾上傳的資源（避免重複上傳）
- 新增地鐵圖時提供「AI 幫我找圖」（依分類名稱搜尋官方路線圖並上傳）或「手動上傳」

---

## 四、「收藏」分頁 🔶 已遷移上線（依行程篩選 ✅ 已上線，2026-07-12）

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

## 五、「AI」分頁 📋 規劃中（尚未開發）

固定對話視窗，**僅管理員可見與使用**。

### 5.1 架構

- 新增 Serverless API：`src/pages/api/ai-assistant.ts`（`prerender = false`）
- 後端驗證管理員 session 後，呼叫 Anthropic API
- Context 傳入：目前選中行程的 `trips`/`trip_days`/`day_spots`/`spots`/`spot_transport_routes`，以及相關 `japan_items`

### 5.2 Tool Use（逐步開放）

初期工具清單：

| 工具 | 對應操作 |
|------|---------|
| `add_spot` | 新增景點至 spots，並可指定加入某天行程 |
| `update_spot` | 修改景點資訊（名稱、備註、類型等） |
| `delete_spot` | 刪除景點 |
| `reorder_day_spots` | 調整某天景點順序 |
| `add_transport_route` | 新增 A→B 交通方式至 spot_transport_routes |
| `toggle_wishlist` | 勾選/取消 japan_items 願望清單 |
| `update_wishlist_quantity` | 調整願望清單數量 |
| `add_japan_item` | 新增收藏品項 |

每次 AI 執行寫入操作後，於對話框顯示明確的完成訊息（例如：「已將『熊本城』加入 Day 3 行程」）。

### 5.3 介面

- Desktop：對話框可常駐於主畫面一角（展開/收合）
- Mobile：切到「AI」分頁時為全螢幕對話介面，底部固定輸入框

---

## 六、權限模型

### 6.1 管理員 ✅ 已實作（含安全修正）

- `auth.jwt() ->> 'email' = PUBLIC_ADMIN_EMAIL`
- 所有行程、所有收藏品、AI 助手 — 完整存取權限
- ⚠️ 曾發生權限漏洞：`updateAuthUI` 一度未比對 email，只要有 session 即無條件設為管理員，已修正為嚴格比對 `currentSession.user.email === adminEmail`

### 6.2 協作者（trip_collaborators）📋 規劃中

新表 `trip_collaborators`：

| 欄位 | 說明 |
|------|------|
| id | uuid |
| trip_id | 關聯 trips |
| user_email | 協作者 email（白名單比對沿用 ilike） |
| can_edit_wishlist | boolean，是否可瀏覽/標記/調整收藏願望清單 |
| can_edit_itinerary | boolean，是否可編輯該行程的地圖/每日行程 |

- 兩個權限**獨立開關**，可任意組合（例如：某人只能調整願望清單，不能改行程）
- 每個行程可指定不同協作者與權限組合
- 協作者登入後僅看到「行程」「收藏」分頁（依權限決定可否編輯），無「AI」分頁，Sandbox 模式生效

### 6.3 一般收藏（trip_id IS NULL）

- 沿用現有 `allowed_users` 白名單機制（不分行程的「一般收藏」願望清單）
- 與 `trip_collaborators` 為兩套獨立機制，互不影響

---

## 七、資料庫異動總表

### 7.1 新增資料表

| 資料表 | 狀態 | 說明 |
|--------|------|------|
| travel_coupons | ✅ 已建立 | 優惠券，全站共用 |
| travel_subway_maps | ✅ 已建立，需調整 | 地鐵圖，移除 trip_id，改用 category 分組 |
| trip_subway_categories | 📋 | trip_id + category，行程關聯的地鐵圖分類 |
| spot_transport_routes | 📋 | origin_spot_id + destination_spot_id + 多筆交通方式（mode/duration/cost/note/timetable_url/subway_map_category） |
| trip_collaborators | 📋 | trip_id + user_email + can_edit_wishlist + can_edit_itinerary |

### 7.2 既有資料表異動

| 資料表 | 異動 | 狀態 |
|--------|------|------|
| spot_types | 新增 `is_chain_store` boolean | ✅ 已完成 |
| spot_subtypes | 新增 `is_chain_store` boolean | ✅ 已完成 |
| japan_items | 新增 `trip_id`（可空，FK → trips） | 📋 |
| travel_subway_maps | 移除/不再使用 `trip_id`（改用 trip_subway_categories） | 📋 |

### 7.3 Storage Buckets

| Bucket | 狀態 | 說明 |
|--------|------|------|
| travel_coupons | ✅ 已建立 | PUBLIC |
| travel_subway_maps | ✅ 已建立 | PUBLIC |

---

## 八、開發階段規劃

| 階段 | 內容 | 狀態 |
|------|------|------|
| 1 | 新頁面骨架：`/trip` Desktop/Mobile 兩套版面 shell，三分頁可切換 | ✅ 已完成 |
| 2 | 行程子分頁遷移：地圖、行程模式、連鎖店功能遷移至 TripPlanner.astro | ✅ 已完成 |
| 2.5 | Supabase 單一入口架構重構 + Race Condition 修正（原規劃外，因應實作過程發現的問題而新增） | 🔶 大致完成，有未解決問題待釐清 |
| 3 | 收藏分頁整合：japan_items.trip_id、收藏分頁顯示邏輯、一般收藏 vs 行程收藏 | ✅ 已完成（2026-07-12） |
| 4 | 協作者權限系統：trip_collaborators、雙開關權限、Sandbox 模式 | 📋 待開始 |
| 5 | 資源子分頁：優惠券、地鐵圖分類化、trip_subway_categories | 📋 待開始 |
| 6 | 交通查詢子分頁：spot_transport_routes、行程內嵌交通方式 UI | 📋 待開始 |
| 7 | AI 助手（只讀）：/api/ai-assistant，讀取行程/收藏資料並回答問題 | 📋 待開始 |
| 8 | AI 工具逐個開放：add_spot、toggle_wishlist 等寫入工具 | 📋 待開始 |
| 9 | 程式碼清理與重構：統一 Modal/CSS 命名規則、評估舊頁面下線 | 📋 待開始（待功能全部穩定後執行） |

> 階段 1、2、2.5 的詳細實作記錄與 Bug 修正過程，見 PROJECT_PROGRESS.md「/trip 整合頁面」章節。

---

## 九、已完成項目總覽（沿用 ✅ 標記）

### 資料庫
- `spot_types` / `spot_subtypes` 新增 `is_chain_store`，連鎖店地圖標記縮小變淡
- 「顯示連鎖店」篩選開關，地圖視野不受切換影響
- `travel_coupons`、`travel_subway_maps` 資料表與 Storage bucket 建立（地鐵圖部分待第五階段調整為全域分類庫）

### /trip 頁面實作
- trip.astro 骨架（Desktop/Mobile 雙版面、三分頁切換、管理員判斷）
- TripPlanner.astro、JapanCollection.astro 元件搬移完成
- Supabase 單一入口架構（trip.astro 統一管理 createClient/getSession/onAuthStateChange，子元件透過事件接收狀態）
- Race Condition 防護機制（`window.__latestAuthState` 快照 + 事件提前綁定）
- CDN 版本鎖定（`@supabase/supabase-js@2`）
- 管理員權限判斷安全性修正（嚴格 email 比對）
- 朋友帳號三層權限顯示修復（TripPlanner.astro 的 updateAuthUI 補齊白名單朋友判斷分支，詳見 PROJECT_PROGRESS.md）
- 多項 Modal/CSS/z-index 衝突修正（詳見 PROJECT_PROGRESS.md）

### 待驗證
- 2026-06-22 發現：OAuth 登入後 UI 間歇性未切換（Heisenbug）。2026-07-11 第一輪時序診斷已排除 trip.astro auth 管線問題，並確認與 DevTools 開關無因果；診斷碼留在線上等待真實失敗取證。須先定案並解決此問題，階段 2.5 才能真正視為完成（詳見 PROJECT_PROGRESS.md「進行中問題」）
