# PROJECT_ARCHITECTURE_V2.md
# The Corner Table — 行程整合頁面 架構規劃

> 本文件記錄「旅行地圖 + 日本收藏 整合頁面」的架構決策。
> 完成確認後，將作為後續所有開發階段的依據，與 PROJECT_ARCHITECTURE.md（原有架構）並行參考。
>
> 狀態標記：✅ 已完成　📋 規劃中（尚未開發）

---

## 一、整體概述

### 1.1 目標

將現有 `/japan`（日本收藏）與 `/travel`（旅行地圖）**重構整合為單一頁面**（暫稱 `/trip`），
並加入一個固定的 AI 對話助手，AI 可以直接讀取與修改行程、收藏資料。

整合後：
- 管理員（你）：完整功能，包含 AI 助手
- 協作者（朋友/家人）：依各行程個別授權的權限，使用簡化版功能
- `/japan`、`/travel` 兩個現有頁面將被取代

### 1.2 命名

新頁面路徑暫定為 `/trip`，可於開發時依需求調整。

---

## 二、版面設計（Desktop / Mobile 分流）

同一份資料與 JS 邏輯，依裝置寬度切換**完全不同的版面模板**（非單純響應式縮放）。

### 2.1 三大主分頁

- **行程**：地圖、每日行程、交通查詢、資源（優惠券/地鐵圖）
- **收藏**：日本收藏品瀏覽、願望清單、數量調整
- **AI**：固定對話視窗（僅管理員可見）

### 2.2 Desktop 版面

左側固定窄欄選單：
- 最上方：「返回首頁」按鈕（**僅管理員可見**），置於左上角
- 下方：「行程」「收藏」「AI」三個圖示常駐顯示，點擊切換主畫面內容

### 2.3 Mobile 版面

- 畫面右上角一個選單按鈕（漢堡選單樣式）
- 點擊展開小選單，切換「行程」「收藏」「AI」
- 「返回首頁」按鈕僅管理員登入時顯示，置於選單列表最上方（對應左上角概念）
- 不使用底部固定分頁列，避免與 AI 對話輸入框搶位置

### 2.4 Sandbox 模式（非管理員）

- 完全不顯示連回網站其他頁面（首頁、短文、語錄等）的連結
- 不顯示「返回首頁」按鈕
- 整個頁面對協作者而言是獨立工具，無法離開到主站其他地方

---

## 三、「行程」分頁 — 三個子分頁

### 3.1 行程（核心，預設顯示）📋

沿用並擴充現有 `/travel` 的核心功能：

- 地圖模式 / 行程模式切換
- 每日行程管理（新增/刪除/排序天數，景點排序）
- ✅ **連鎖店顯示/隱藏**（已完成）：
  - `spot_types.is_chain_store`、`spot_subtypes.is_chain_store`
  - 任一為 true 即視為連鎖店
  - 地圖標記縮小（scale 0.65）+ 變淡（opacity 0.6）
  - 篩選列「顯示連鎖店」開關，預設關閉，僅影響地圖模式顯示，不影響行程模式選點
  - fitBounds 與 Marker 渲染已拆分，切換開關不會重置地圖視野

- 📋 **景點間內嵌交通方式**：
  - 行程模式中，連續兩個景點之間顯示「交通方式」區塊
  - 可直接新增/編輯這兩點之間的路線（對應 `spot_transport_routes`）
  - 點擊可展開查看時刻表連結、注意事項

### 3.2 交通查詢 📋

獨立工具，用於行程調整時查詢任意兩點之間的交通方式：

- 選擇「起點」「終點」（從該行程已存景點中選）
- 列出 `spot_transport_routes` 中已儲存的所有路線選項（方式、時間、費用、注意事項、時刻表連結）
- 若尚無資料，可觸發 **AI 搜尋**：
  - AI 根據起點/終點搜尋所有可行交通方式
  - 結果以勾選列表呈現，含時間、費用、時刻表連結、地鐵圖分類連結、注意事項（如：分前後車廂往不同方向）
  - 勾選後一次儲存至 `spot_transport_routes`
- 行程子分頁新增的路線與交通查詢共用同一份資料，雙向同步

### 3.3 資源 📋

跨行程共用的**全域資源庫**，不綁定特定 `trip_id`：

**優惠券**（`travel_coupons`，✅ 表已建立）
- 全站共用，卡片式呈現：圖片、標題、說明、連結
- 管理員可新增/編輯/刪除

**地鐵圖**（`travel_subway_maps`，✅ 表已建立，需調整）
- 全域資源庫，依 `category`（地區/系統名稱，如「東京 Metro」「沖繩巴士」）分組顯示
- 移除原本的 `trip_id` 綁定（改為下方關聯表）
- 每個行程可透過 `trip_subway_categories` 關聯表選擇「這次行程要顯示哪些分類」
  - 預設顯示該行程已關聯的分類
  - 可展開「瀏覽全部分類」，選用其他行程曾上傳的資源（避免重複上傳）
- 新增地鐵圖時提供「AI 幫我找圖」（依分類名稱搜尋官方路線圖並上傳）或「手動上傳」

---

## 四、「收藏」分頁 📋

沿用並擴充現有 `/japan` 收藏功能：

- 搜尋、分類篩選、願望清單、數量調整、「❤️ N 人想買」Modal — 皆沿用現有邏輯
- `japan_items` 新增 `trip_id`（可空，FK → trips）：
  - `trip_id IS NULL`：一般收藏（不分行程）
  - `trip_id = 某行程`：歸屬該行程的收藏品
- 此分頁預設顯示「目前選中行程」的收藏品 + 一般收藏；管理員可切換篩選範圍
- 管理員的「所有人」模式（✅ 已完成於 /japan）沿用至此

---

## 五、「AI」分頁 📋

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

### 6.1 管理員

- `auth.jwt() ->> 'email' = PUBLIC_ADMIN_EMAIL`
- 所有行程、所有收藏品、AI 助手 — 完整存取權限

### 6.2 協作者（trip_collaborators）📋

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

## 八、開發階段規劃（草案）

考量範圍龐大，建議以下順序，每個階段再拆解為多個 Antigravity 步驟：

1. **新頁面骨架**：建立 `/trip`，Desktop/Mobile 兩套版面 shell（行程/收藏/AI 三分頁可切換，先以佔位內容呈現）
2. **行程子分頁遷移**：將 `/travel` 地圖、行程模式、連鎖店功能遷移至新頁面「行程」分頁
3. **收藏分頁整合**：`japan_items.trip_id`、收藏分頁顯示邏輯、一般收藏 vs 行程收藏
4. **協作者權限系統**：`trip_collaborators`、雙開關權限、Sandbox 模式
5. **資源子分頁**：優惠券（沿用已建表）、地鐵圖分類化、`trip_subway_categories`
6. **交通查詢子分頁**：`spot_transport_routes`、行程內嵌交通方式 UI
7. **AI 助手（只讀）**：`/api/ai-assistant`，AI 可讀取行程/收藏資料並回答問題，尚不寫入
8. **AI 工具逐個開放**：依序加上 `add_spot`、`toggle_wishlist` 等寫入工具並個別測試

---

## 九、已完成項目（沿用 ✅ 標記）

- `spot_types` / `spot_subtypes` 新增 `is_chain_store`，連鎖店地圖標記縮小變淡
- 「顯示連鎖店」篩選開關，地圖視野不受切換影響
- `travel_coupons`、`travel_subway_maps` 資料表與 Storage bucket 建立（地鐵圖部分待第五階段調整為全域分類庫）
