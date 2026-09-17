# PROJECT_NOTES_MULTICOUNTRY.md
# The Corner Table — 收藏與行程「多國家」擴充 架構規劃

> 記錄「收藏／行程從日本專屬擴充為多國家」的架構決策。
> 與 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md 並行。
> 狀態：✅ 全部完成（MC-1～MC-5 皆已結案，2026-09-17）

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

| 階段 | 內容 | 風險 | 狀態 |
|------|------|------|------|
| MC-1 | countries 表 + seed 日本；japan_items/trips 加 country_id + 既有資料回填為日本（試算→備份→執行）；RLS | 中（動既有資料，走安全遷移流程） | ✅ 2026-09-16 已完成，a-e 驗收全數通過，詳見 PROJECT_PROGRESS.md「MC-1」章節 |
| MC-2 | 收藏頁國家切換器 + 新增收藏品的國家選擇 + 國家管理 CRUD | 低 | ✅ 2026-09-17 已完成，a-g 驗收全數通過，詳見 PROJECT_PROGRESS.md「MC-2」章節 |
| MC-3 | 行程頁依國家分組 + 新增行程選國家 | 低 | ✅ 2026-09-17 已完成，a-f 驗收全數通過，詳見 PROJECT_PROGRESS.md「MC-3」章節 |
| MC-4 | 行程→收藏的國家連動（trip-changed 帶 country_id） | 低 | ✅ 2026-09-17 已完成，a-f 驗收全數通過，詳見 PROJECT_PROGRESS.md「MC-4」章節 |

- MC-1 完成後建議回 Fable 覆核（涉及既有資料遷移與 RLS）；其餘前端階段使用者實測即可。
- **MC-1 實作備註（2026-09-16）**：`japan_items.country_id`/`trips.country_id` 設為 `NOT NULL` 後，額外補上 `DEFAULT`（指向日本那一列的固定 uuid），因為既有四個寫入點（新增行程、新增收藏品兩處、AI 助手 `add_japan_item`）在 MC-2 前端做出國家選擇 UI 之前都不會帶 `country_id`，若無預設值會直接被 `NOT NULL` 擋下。MC-2 開發時若前端已一律明確帶入 `country_id`，可評估是否移除此 `DEFAULT`（非必要，保留也不影響功能）。
- MC-5（國家級協作授權）另見下方附錄，子階段 MC-5a 已完成。
- **MC-3 執行備註（2026-09-17）**：開工時發現 `TripPlanner.astro` 的 `initAuthAndData()` 原本完全不會重繪初始的行程標籤列表(只挑第一筆行程當預選)，畫面顯示的其實是 build time 產出的靜態 SSR 版本；這次補上載入 `countries` 快取後立即呼叫 `renderTripsTabList()` 重繪，才讓分組邏輯在初次載入時也生效，不只是登入或 CRUD 之後。分組只在多國情境下才顯示標題列，只有一組時外觀與 MC-3 之前的單一橫向列表完全一致。
- **MC-4 執行備註（2026-09-17）**：`TripPlanner.astro` 的 `selectTrip()` 發送的 `trip-changed` 事件 payload 直接從 `tripsCache` 帶出該行程的 `country_id`，不需額外查詢；`JapanCollection.astro` 新增 `applyTripCountryLink()`，監聽器提前綁定(在任何 `await` 之前)，比照本專案既有的 Race Condition 防護慣例。單向連動天然成立：收藏頁的國家切換完全沒有發送任何事件給行程頁，不需要額外的「鎖」或旗標去防止反向連動；手動切換國家會直接覆蓋 `selectedCountryId`，manual 天然覆蓋 auto。驗證時用使用者先前測試 MC-3 時留下的真實泰國行程「2026泰國之旅」做端到端實測，非僅模擬事件。
- **多國家擴充（MC-1～MC-5）至此全部結案**，收藏與行程皆已支援多國家維度，可視未來需求規劃後續國家（如新增其他國家、擴充分類等）。

---

## 六、明確排除（本次不做）

- 不改任何既有命名（japan_items / JapanCollection / japan- 前綴 / 元件名）。
- 不動分類系統（各國共用，維持現狀）。
- 不動收藏／行程既有的 RLS 與協作者權限。
- 不做收藏→行程的反向國家連動（僅行程→收藏單向）。
- 不做各國獨立分類（若未來需要，另案）。

---

## 附錄:MC-5 國家級協作授權 + 收藏頁多國文字動態化

> 2026-09-16 與使用者敲定。排在 MC-2 之後、MC-3 之前(同動收藏頁)。

### A. 背景與目標

現況:收藏品(japan_items)寫入權限為「全有或全無」——僅管理員可新增/編輯/刪除(任務 G 鎖定),朋友只能對品項標願望清單(白名單機制)。
目標:引入**國家級協作授權**——管理員可針對特定國家,授權特定朋友「新增該國品項」;被授權者能新增、並管理自己新增的品項。同時將收藏頁寫死的「日本」介面文字改為跟隨當前國家。

### B. 使用者已定案的權限規則

1. **新增品項**:管理員恆可;該國被授權朋友可(新增時自動記 created_by=自己)
2. **編輯/刪除品項**:管理員可改任何;被授權朋友僅能改 created_by 為自己的品項
3. **標想買 + 填自己的數量**:管理員恆可;被授權朋友對該國品項可(沿用現有 wishlist 機制,授權範圍由「白名單」擴大為「該國被授權朋友」)
4. **看全體想買明細(誰想買、各數量、總數)**:僅管理員(維持現狀不變)
5. **可見性**:新增即公開(維持收藏頁公開展示現況,不審核)——使用者已知悉此為「將部分內容發布權交給被授權朋友」的信任邊界

### C. 資料結構變更

#### C.1 新表 country_collaborators

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid pk gen_random_uuid() | |
| country_id | uuid NOT NULL FK→countries ON DELETE CASCADE | |
| user_email | text NOT NULL | 被授權朋友 email(存入前 trim+小寫) |
| created_at | timestamptz default now() | |
| — | | UNIQUE(country_id, user_email) |

- 本表 RLS:SELECT 允許 is_admin() OR lower(user_email)=lower(auth.jwt()->>'email')(朋友查得到自己的授權,前端據以顯示新增 UI);INSERT/UPDATE/DELETE 僅 is_admin()

#### C.2 japan_items 加 created_by

- 新增 created_by uuid 可空(記錄品項建立者的 auth uid);既有 167 筆回填為管理員 uid,走安全遷移(試算→備份→執行);新增品項時由前端寫入當前使用者 uid
- 不設 NOT NULL(容許歷史或管理員建立時的彈性),但新寫入一律帶值

#### C.3 輔助函式

- public.can_add_country_item(p_country_id uuid):is_admin() OR EXISTS(SELECT 1 FROM country_collaborators WHERE country_id=p_country_id AND lower(user_email)=lower(auth.jwt()->>'email'))

### D. japan_items RLS 調整(重點,取代任務 G 的寫入政策)

- SELECT:維持公開(不動)
- INSERT:WITH CHECK 為 can_add_country_item(country_id) AND (is_admin() OR created_by = auth.uid())——非管理員新增時 created_by 必須是自己,杜絕冒名
- UPDATE / DELETE:USING 為 is_admin() OR (can_add_country_item(country_id) AND created_by = auth.uid())——被授權朋友僅能改自己該國建立的品項
- wishlist_items 的既有 can_wishlist_item 函式(V2 階段 4 K3)需擴充:對有 country 的品項,除既有條件外,增加「該品項所屬國家的 country_collaborators 授權朋友」亦可——實作時重用 can_add_country_item 或並列條件,確保規則 3 成立

### E. 收藏頁前端

- 國家協作管理 UI(僅管理員):在國家管理面板中,每個國家可設定被授權朋友清單(email + 新增/移除),比照 trip_collaborators 的既有管理模式
- 被授權朋友登入:在其被授權的國家,顯示「新增品項」入口;非授權國家不顯示;其只能編輯/刪除自己建立的品項(卡片操作鈕依 created_by 判斷)
- 介面文字動態化:所有寫死「日本」的可見字串改為當前國家名——探索標題(explore-title-text)、搜尋提示與結果標題、加入成功訊息(showToast)等(見盤點清單:JapanCollection.astro 行 92/95/2002/2018/2176 等);預設國家不可刪除的提示保留「日本」為實際國名動態代入
- **⚠️ 與原規劃不同(2026-09-17，開發中途調整)**:探索/搜尋熱門資訊這個功能，使用者決定目前只服務日本，不做多國適配。原訂「文字動態化」的方向（讓探索標題等 4 處文字跟著目前國家變化）因此**取消**，改為：這 4 處文字維持寫死「日本」，但探索區塊整個只在目前切換中的國家是日本（`is_default`）時顯示，切到其他國家整塊隱藏。唯一維持「動態化」的是「加入收藏」這個全國家通用功能的成功提示——原本寫死「成功加入日本收藏」，改為中性文字「已成功加入收藏」，不再與任何國名綁定。詳見下方 G 節 MC-5b 實作備註

### F. 明確排除

- 不做審核機制(新增即公開)
- 不改「看全體願望明細僅管理員」的現況
- 不改命名(japan_items 等)
- 協作授權僅收藏品(japan_items),不涉及行程協作(trip_collaborators 為獨立系統)

### G. 開發子階段

| 階段 | 內容 | 風險 | 狀態 |
|------|------|------|------|
| MC-5a | country_collaborators 表 + japan_items 加 created_by(回填,安全遷移)+ RLS 調整 + can_add_country_item 函式 + wishlist 函式擴充 | 中(動既有資料與權限,回 Fable 覆核) | ✅ 2026-09-17 已完成，a-e 驗收全數通過，詳見 PROJECT_PROGRESS.md「MC-5a」章節 |
| MC-5b | 收藏頁協作管理 UI + 被授權朋友的新增/自管 UI + 介面文字動態化 | 低 | ✅ 2026-09-17 已完成，a-f、a-e(探索區調整追加驗收)全數通過，詳見 PROJECT_PROGRESS.md「MC-5b」章節 |

- **MC-5a 執行備註(2026-09-17)**：開工時發現 `country_collaborators` 表、RLS、`can_add_country_item` 函式已存在於資料庫(結構與本文件設計逐項核對完全相符)，判斷為先前已執行過，跳過重建，直接沿用。`japan_items` RLS 調整採 `ALTER POLICY` 原地修改既有三條政策(不改名稱、不動 SELECT)，UPDATE 政策額外把 `WITH CHECK` 明確設為與 `USING` 相同條件(附錄 D 只寫了 USING)，避免被授權朋友透過 UPDATE 把自己建立的品項的 `country_id`/`created_by` 改到規則檢查不到的地方；`can_wishlist_item` 用純 `OR` 新增第四個分支，前三個既有分支逐字元未變，已用實際部署後的函式定義文字比對確認。
- **MC-5b 執行備註(2026-09-17)**：開工前發現附錄列的 5 個文字動態化位置中，有 4 個(探索標題、搜尋中提示、結果標題、快速收藏成功訊息)其實都屬於「探索日本」功能，而該功能後端 `/api/explore.ts` 本身就寫死搜尋日本(query 固定加「日本」、`gl=jp`)，若只動前端標籤會讓訊息不實，已與使用者確認後改為維持寫死「日本」，只動了唯一真正國家無關的一處(刪除預設國家的保護提示，改用實際國名)。上線後使用者實測發現：探索區塊本身沒有跟著國家切換隱藏，導致切到泰國仍看到「探索日本」——這是原規劃「文字動態化」方向本來就沒有涵蓋「整塊隱藏」，屬於設計遺漏而非實作錯誤。經使用者決定調整方向：探索功能維持日本專屬，不做多國適配，改為讓整個探索區塊只在目前切換中的國家 `is_default`(日本)時顯示，其餘文字動態化維持取消；另把探索區「加入收藏」的成功訊息從寫死「日本」改為中性文字，因為加入收藏本身是全國家通用功能。順手修正兩個既有缺陷：`japan_items` 的 UPDATE/DELETE 原本未用 `.select()` 檢查受影響筆數，RLS 擋下時會誤報成功(MC-5b 起非管理員的寫入才會真的被擋，此坑必須先補)；編輯品項原本從卡片 dataset 重組資料，遺漏 `created_by`，改用 `itemsCache` 完整物件。
