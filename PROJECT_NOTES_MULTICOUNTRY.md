# PROJECT_NOTES_MULTICOUNTRY.md
# The Corner Table — 收藏與行程「多國家」擴充 架構規劃

> 記錄「收藏／行程從日本專屬擴充為多國家」的架構決策。
> 與 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 並行。
> 狀態：🔶 進行中（MC-1 資料地基建置中，2026-09-16 開工）

---

## 一、背景與目標

現況：旅行地圖與收藏皆以日本為主，命名亦沿用日本（japan_items、JapanCollection、japan- 前綴）。
目標：支援韓國、泰國等其他國家。核心是**收藏**加入「國家」最上層維度——每個國家是獨立收藏世界，切換國家看不同清單。行程一併加入國家維度以利分組。

### 使用者已定案的四個關鍵決策
1. 收藏形式：**每個國家獨立收藏世界**（切國家看不同清單），非「單一總清單加國家標註」。
2. 收藏歸屬層級：**國家級常駐 + 行程級臨時並存**——country_id（跨年度常駐）與既有 trip_id（V2 階段 3，行程級臨時）兩欄並存即滿足，無需新機制。
3. 分類：**各國共用同一套分類**，分類表不加國家維度。
4. 連動：**切行程時，收藏頁自動切到該行程所屬國家**。
5. 行程：**trips 也加 country_id**，行程可依國家分組。
6. 命名：**不改**（japan_items / JapanCollection / japan- 前綴保留為歷史代號，改名風險高、留待獨立清理階段評估）。

---

## 二、資料結構變更

### 2.1 新表 countries

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid pk gen_random_uuid() | |
| name | text NOT NULL | 國家名（日本、韓國、泰國…） |
| emoji | text 可空 | 國旗或代表 emoji |
| sort_order | int default 0 | |
| is_default | boolean default false | 標記「日本」為預設，遷移基準 |
| created_at | timestamptz default now() | |

- 建表後 seed 一筆「日本」，is_default=true。
- RLS：SELECT 開放；INSERT/UPDATE/DELETE 僅 is_admin()（重用既有函式）。

### 2.2 既有表異動

| 表 | 異動 | 遷移處理 |
|----|------|---------|
| japan_items | 新增 country_id uuid FK→countries（回填後設 NOT NULL；ON DELETE RESTRICT，避免刪國家孤兒化收藏品） | 既有全部回填為「日本」的 id |
| trips | 新增 country_id uuid FK→countries（回填後設 NOT NULL；ON DELETE RESTRICT） | 既有全部回填為「日本」的 id |

- 遷移屬不可逆資料操作：先試算清單 → 使用者確認 → Dashboard 匯出備份 → 執行回填 → 再設 NOT NULL。
- japan_items / trips 既有 RLS 不因加欄位而改變（寫入仍鎖 is_admin，任務 G/K2 成果保留）。
- 分類表（japan_categories）不動——各國共用。

### 2.3 結構總結

- 國家 countries ← 多個 trips（一國多趟旅行）
- 國家 countries ← 多個 japan_items（一國多收藏品）
- 收藏品 japan_items → 一個 country（常駐）+ 可空 trip_id（V2 階段 3，行程級臨時，維持不動）
- 收藏品三層檢視：國家（常駐）→ 行程（臨時篩選）→ 品項

---

## 三、前端行為

### 3.1 收藏頁（JapanCollection.astro）
- 頂部新增**國家切換器**（比照行程頁的 trip 切換 UI），切換即篩選 country_id。
- 預設顯示 is_default 國家（日本）的收藏；切到韓國只見韓國收藏。
- 既有的「依行程篩選」（V2 階段 3）在選定國家內繼續運作：國家 → 該國行程 → 品項。
- 管理員新增收藏品時，表單加「國家」下拉（預設當前切換的國家）。
- 國家管理入口（新增/編輯/刪除國家）僅管理員可見。

### 3.2 行程頁（TripPlanner.astro）
- 行程清單依 country_id 分組顯示（如「🇯🇵 日本」下列日本各行程）。
- 新增行程時選所屬國家。

### 3.3 連動（關鍵體驗）
- 既有 trip-changed 事件擴充：切換行程時，事件 payload 帶上該行程的 country_id。
- 收藏頁監聽此事件，自動將國家切換器切到對應國家（並套用該行程的收藏篩選）。
- 反向：收藏頁手動切國家時，不強制連動行程（避免互相打架，單向連動：行程→收藏）。

---

## 四、權限

- countries：SELECT 開放、寫入 is_admin。
- japan_items / trips 既有權限模型完全不變，country_id 僅為分類維度，不涉及權限判斷。
- 協作者權限（trip_collaborators、can_edit_*）不受影響：授權仍以 trip_id 為單位，國家只是行程的上層分組。

---

## 五、開發階段（草案）

| 階段 | 內容 | 風險 |
|------|------|------|
| MC-1 | countries 表 + seed 日本；japan_items/trips 加 country_id + 既有資料回填為日本（試算→備份→執行）；RLS | 中（動既有資料，走安全遷移流程） |
| MC-2 | 收藏頁國家切換器 + 新增收藏品的國家選擇 + 國家管理 CRUD | 低 |
| MC-3 | 行程頁依國家分組 + 新增行程選國家 | 低 |
| MC-4 | 行程→收藏的國家連動（trip-changed 帶 country_id） | 低 |

- MC-1 完成後建議回 Fable 覆核（涉及既有資料遷移與 RLS）；其餘前端階段使用者實測即可。

---

## 六、明確排除（本次不做）

- 不改任何既有命名（japan_items / JapanCollection / japan- 前綴 / 元件名）。
- 不動分類系統（各國共用，維持現狀）。
- 不動收藏／行程既有的 RLS 與協作者權限。
- 不做收藏→行程的反向國家連動（僅行程→收藏單向）。
- 不做各國獨立分類（若未來需要，另案）。
