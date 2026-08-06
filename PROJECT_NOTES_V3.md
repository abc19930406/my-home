# PROJECT_NOTES_V3.md
# The Corner Table — 讀書筆記模組 架構規劃

> 本文件記錄「讀書筆記/知識庫」新模組的架構決策。
> 與 PROJECT_ARCHITECTURE.md（全站通用規則）、PROJECT_ARCHITECTURE_V2.md（/trip 整合頁）並行。
> 狀態標記：✅ 已完成　🔶 進行中　📋 規劃中

---

## 一、概述

### 1.1 目標

建立個人知識庫 `/notes`：記錄讀過的書、上過的課、看過的資料與筆記，作為日後複習與演講的素材來源。核心能力是「以主題彙整某領域的所有筆記，交由 AI 整理成複習綱要或演講大綱」。

### 1.2 定位與邊界

- 這是**對內檢索的工作資料**，與 `/posts`（對外分享的隨筆）用途、結構皆不同，**兩者分開建，不共用資料表或頁面**。
- 私人工作資料，權限沿用既有 `is_admin()`：讀寫全部限管理員本人，不設協作。是全站權限最單純的模組。
- 路徑 `/notes`，SSR 頁面（`prerender = false`，因內容全私密、需登入後才取資料，比照 posts 非公開機制）。

---

## 二、資料結構

三張核心表 + 一張標籤關聯表。設計原則：出處、主題、笔记三者解耦。

### 2.1 sources（出處）

一本書／一堂課／一份資料，獨立存在，可被多則筆記引用。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid pk | |
| title | text NOT NULL | 書名／課程名／資料標題 |
| kind | text NOT NULL | book / course / article / other |
| author | text 可空 | 作者／講者／來源 |
| source_date | date 可空 | 出版／上課／取得日期 |
| url | text 可空 | 若為線上資料 |
| note | text 可空 | 對這個出處本身的備註 |
| created_at | timestamptz default now() | |

### 2.2 topics（主題）

分類軸。含一個不可刪除的「未分類」預設項。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid pk | |
| name | text NOT NULL | 主題名稱 |
| description | text 可空 | |
| is_default | boolean default false | 標記「未分類」，唯一且不可刪 |
| sort_order | int default 0 | |
| created_at | timestamptz default now() | |

- 「未分類」在建表時以 seed 資料插入，is_default = true。
- 刪除主題時，其下筆記的 topic_id 自動改指「未分類」（不連帶刪筆記）。

### 2.3 notes（筆記）

一則筆記。挂一個出处（從哪來）+ 歸一個主題（關於什麼）。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | uuid pk | |
| source_id | uuid 可空 FK→sources ON DELETE SET NULL | 出處，可暫時留空 |
| topic_id | uuid NOT NULL FK→topics ON DELETE SET DEFAULT | 主題，預設「未分類」 |
| title | text 可空 | 筆記標題／小節名 |
| quote | text 可空 | 原文引述（書上原話，精確） |
| thought | text 可空 | 我的心得／詮釋（我的觀點） |
| page_ref | text 可空 | 頁碼／章節／時間戳，便於回查 |
| sort_order | int default 0 | |
| created_at | timestamptz default now() | |

- quote 與 thought 分離（擴充建議 2）：AI 整理時能區分「原文」與「使用者詮釋」，演講素材更可靠。兩欄至少一欄有內容。
- 圖片挂在筆記層（使用者確認）：一則筆記可配多張圖（書中圖表、手寫筆記照、投影片截圖等）。實作見 2.6。
- **✅ 2026-08-06 實作結果**：`topic_id` 的 `DEFAULT` 值直接寫死「未分類」的固定 UUID 字面值（seed 時不用 `gen_random_uuid()`，改用固定值 `00000000-0000-0000-0000-000000000001`），因此原生 `ON DELETE SET DEFAULT` 語法可直接使用，不需要 trigger 做這部分。「不可刪除、唯一」這兩個 FK 語法管不到的保護，另外用 `topics` 表的 `BEFORE DELETE` trigger（`is_default=true` 時 `RAISE EXCEPTION`）+ partial unique index（`WHERE is_default = true`）補強，兩種機制分工明確，非互斥。

### 2.4 note_tags + tags（自由標籤，擴充建議 1）

一則筆記可挂多個標籤，用於跨主題檢索（例：所有關於「用故事開場」的筆記，不分主題出處）。

- tags：id uuid pk、name text NOT NULL UNIQUE、created_at
- note_tags：note_id FK→notes ON DELETE CASCADE、tag_id FK→tags ON DELETE CASCADE、UNIQUE(note_id, tag_id)

### 2.6 note_media（筆記圖片，私有保護）

圖片挂在筆記層。沿用短文 C1 已驗證的私有媒體機制，不走公開 bucket。

- 新私有 bucket：note_media（Public 關閉）
- 路徑規則：{note_id}/{檔名}，第一層為所屬筆記 id（權限判斷依據）
- 讀取一律 createSignedUrl（有效期 3600 秒），絕不 getPublicUrl
- storage.objects 的 RLS：解析路徑第一層 note_id，此模組所有圖片讀寫皆僅 is_admin()（私人資料，無需跟隨主題/出處判斷）
- **✅ 2026-08-06 實作結果**：採獨立表 `note_media`（id、note_id FK→notes ON DELETE CASCADE、path、sort_order、created_at），支援多圖排序

### 2.5 關係總結

- 一個 source ← 多則 note（一本書多則筆記）
- 一個 topic ← 多則 note（一主題多則筆記）
- 一則 note → 一個 source + 一個 topic（可跨主題：同一本書的筆記可落在不同主題）
- 一則 note ↔ 多個 tag（跨主題檢索）
- 一則 note ← 多張 note_media（私有圖片，簽名網址）

---

## 三、權限（全部沿用既有機制）

- 五張表 RLS 一律：SELECT / INSERT / UPDATE / DELETE 皆僅 public.is_admin()。
- 重用 2026-07-11 建立的 is_admin() 函式，不新建。
- 無協作、無公開讀取。這是全站最單純的權限模型。
- note_media 圖片同樣全鎖 is_admin，讀取走簽名網址。

---

## 四、頁面與功能

### 4.1 瀏覽與檢索

- 主視圖：依主題分組列出筆記；可切換為依出處分組。
- 篩選：主題、出處類型（書/課/資料）、標籤（可複選，跨主題）。
- 搜尋：對 title / quote / thought 全文搜尋。
- 每則筆記卡片：出處、主題、標籤、原文引述與心得分區顯示、頁碼參照。

### 4.2 管理

- 出處、主題、標籤、筆記的新增/編輯/刪除（皆管理員）。
- 新增筆記時：選出處（或當場新增出處）、選主題（預設未分類）、填引述/心得、加標籤。
- Modal 遵守全站慣例：前綴隔離、所有關閉路徑清 body.modal-open、寫入做受影響筆數檢查。

### 4.3 AI 主題彙整（核心能力）

沿用 /trip AI 助手（N 系列）的後端架構：新增 API 或擴充既有 ai-assistant，身分驗證、以使用者 token 查詢（RLS 生效）、金鑰只在後端。

- 觸發：在某個主題（或某組標籤篩選結果）上，按「AI 彙整」，選輸出型態（複習綱要 / 演講大綱 / 重點摘要）。
- context：該範圍所有筆記的 title/quote/thought/出處/頁碼。
- system prompt：以繁體中文；明確區分「原文引述」與「使用者心得」；整理為所選型態；每個要點標註來源出處，便於回查。

#### ⚠️ 技術難點：筆記量大時的長度上限（本模組唯一需認真設計處）

單一主題笔记累積過多時，一次全塞會超過 AI 輸入上限或稀釋重點。設計對策（分階段）：
- 初期（笔记少）：直接一次呼叫，夠用。
- 預留機制：當某範圍笔记總字數超過門檻，改為「分批摘要再彙整」——先分批各自摘要，再把摘要合併做最終整理（map-reduce 式）。此機制在笔记量觸及門檻前不啟用，但 API 架構要預留分批的空間，不要寫死單次呼叫。

---

### 4.4 匯出（使用者確認：兩種來源 × 兩種格式）

沿用既有 docx / pdf 產出能力（全站已具備）。

- 兩種來源：
  - 「匯出整理稿」：AI 彙整後的複習綱要／演講大綱，適合演講前攜帶
  - 「匯出原始筆記」：該主題（或標籤篩選結果）所有筆記的原文引述＋心得＋出處＋頁碼，適合完整複習或存檔
- 兩種格式：
  - Word（.docx）：可再編輯，適合演講稿再加工
  - PDF：定稿不動，適合列印攜帶
- 四種組合皆提供（來源 × 格式）。匯出範圍跟隨當前的主題／標籤篩選狀態。

## 五、開發階段規劃（草案，待轉任務佇列）

| 階段 | 內容 | 狀態 |
|------|------|------|
| V3-1 | 六張表（含 2.6 的 `note_media`）+ RLS + 「未分類」seed；/notes 頁面骨架（SSR、登入判斷、空狀態） | ✅ 2026-08-06 已完成 |
| V3-2 | 出處與主題的管理 CRUD | 📋 |
| V3-3 | 筆記 CRUD（引述/心得分離、頁碼、挂出處與主題）＋ note_media 私有圖片上傳 | 📋 |
| V3-4 | 標籤系統 + 瀏覽/篩選/搜尋（含跨主題標籤檢索） | 📋 |
| V3-5 | AI 主題彙整（初期單次呼叫版） | 📋 |
| V3-7 | 匯出：整理稿／原始筆記 × Word／PDF 四種組合 | 📋 |
| V3-6 | AI 彙整的分批處理機制（筆記量大時，觸發門檻後啟用） | 📋（可延後至實際遇到再做） |

> 每階段完成後更新本文件與 PROJECT_PROGRESS.md。V3-6 屬「遇到再做」，不強制排入。

---

## 六、已確認決策（設計凍結）

- 出處類型：book / course / article / other，足夠使用。
- 圖片：挂在筆記層，一則多圖，私有 bucket + 簽名網址（2.6）。
- AI 輸出型態：複習綱要 / 演講大綱 / 重點摘要，符合需求。
- 匯出：整理稿與原始筆記兩種來源 × Word 與 PDF 兩種格式，四種組合皆提供（4.4）。

設計已凍結，可進入任務拆解。
