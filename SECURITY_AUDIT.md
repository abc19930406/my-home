# SECURITY_AUDIT.md — 資料庫安全現況盤點

> 本文件為唯讀盤點,不含任何修改動作。目的是產出 RLS(Row Level Security)現況矩陣,
> 作為後續安全修復任務的依據。矩陣完成前需要你在 Supabase Dashboard 執行一段唯讀查詢並貼回結果。

盤點日期:2026-07-11

---

## 一、全專案資料表清單與程式碼中的讀寫位置

前端一律使用 `PUBLIC_SUPABASE_ANON_KEY`(見 `src/lib/supabase-client.ts`),
也就是說**未登入訪客能查到什麼、能寫入什麼,完全由 RLS 政策決定**,
前端的登入檢查、按鈕隱藏都只是 UI 層,不是安全邊界。

### ⚠️ 重要架構事實:兩種查詢時機,風險程度不同

| 查詢時機 | 說明 | 風險 |
|---|---|---|
| **Frontmatter(build-time / server-side)** | 頁面加了 `export const prerender = true` 的,frontmatter 的 `.from()` 查詢在**編譯當下**於 Vercel 伺服器執行一次,結果直接烘進靜態 HTML,**每一位訪客拿到的都是同一份**,無論有沒有登入。`posts/[id].astro` 沒有 prerender(SSR),則是**每次請求**都在伺服器端用 anon key 重新查一次,一樣不看訪客身分 | 若 RLS 對 anon 開放 SELECT,資料等於**直接公開在網頁原始碼**,無法被前端邏輯攔截 |
| **Script 內(client-side)** | `<script>` 標籤內的 `.from()` 查詢在**訪客瀏覽器**執行,若訪客未登入則用 anon key | 若 RLS 對 anon 開放 SELECT/INSERT/UPDATE/DELETE,任何人打開瀏覽器 Console 都能直接呼叫 Supabase API 存取,不需要通過任何頁面 UI |

以下每張表都會標注屬於哪一種。

### 資料表總表

| 資料表 | Build-time / SSR 讀取(烘進 HTML 或每次請求皆讀) | Client-side 讀寫(瀏覽器內執行) |
|---|---|---|
| **posts** | [posts/index.astro:13](src/pages/posts/index.astro:13) `SELECT *`,有 `.eq('visibility','public')` 過濾,prerender=true(僅烘公開文章)<br>[posts/\[id\].astro:15](src/pages/posts/\[id\].astro:15) `SELECT *`,**無任何權限過濾**,註解明寫「只抓資料不檢查權限,交給前端處理」,SSR 每次請求執行 | UPDATE/INSERT/DELETE 皆在 [posts/index.astro](src/pages/posts/index.astro:313)(313/316/412 行) |
| **quotes** | [quotes/index.astro:11](src/pages/quotes/index.astro:11) `SELECT *`,有 `.eq('visibility','public')` 過濾,prerender=true | UPDATE/INSERT/DELETE 在 [quotes/index.astro](src/pages/quotes/index.astro:285)(285/288/409 行) |
| **japan_items** | [JapanCollection.astro:24](src/components/JapanCollection.astro:24)、[japan.astro:25](src/pages/japan.astro:25) `SELECT *`,**無過濾**,prerender=true(嵌入 /trip 與 /japan) | SELECT/UPDATE/INSERT/DELETE 遍布 JapanCollection.astro、japan.astro(願望清單、數量、收藏品 CRUD) |
| **japan_categories** | [JapanCollection.astro:14](src/components/JapanCollection.astro:14)、[japan.astro:15](src/pages/japan.astro:15) `SELECT *`,prerender=true | DELETE/UPSERT 在 JapanCollection.astro、japan.astro(分類管理) |
| **trips** | [TripPlanner.astro:13](src/components/TripPlanner.astro:13)、[travel.astro:14](src/pages/travel.astro:14) `SELECT *`,prerender=true | INSERT/UPDATE 在 TripPlanner.astro、travel.astro(行程管理) |
| **spots** | [TripPlanner.astro:23](src/components/TripPlanner.astro:23)、[travel.astro:24](src/pages/travel.astro:24) `SELECT *`,prerender=true | INSERT/UPDATE/DELETE 遍布(景點 CRUD) |
| **spot_types / spot_subtypes** | 無 frontmatter 查詢 | SELECT/DELETE/UPSERT 在 TripPlanner.astro、travel.astro(類型管理) |
| **day_spots / trip_days** | 無 frontmatter 查詢 | SELECT/INSERT/UPDATE/DELETE 在 TripPlanner.astro、travel.astro(每日行程) |
| **status** | [index.astro:33](src/pages/index.astro:33)(首頁便條紙,設計上本就公開)、[admin.astro:26](src/pages/admin.astro:26)、[JapanCollection.astro:34](src/components/JapanCollection.astro:34)、[japan.astro:35](src/pages/japan.astro:35),皆 prerender=true | SELECT/UPDATE 在 Welcome.astro、JapanCollection.astro、japan.astro、admin.astro |
| **cards** | [index.astro:12](src/pages/index.astro:12) `SELECT *`,prerender=true(首頁卡片,設計上本就公開) | UPDATE 在 [admin.astro:250](src/pages/admin.astro:250) |
| **allowed_users** | 無 frontmatter 查詢 | SELECT(白名單比對)在 JapanCollection.astro、TripPlanner.astro、japan.astro |
| **wishlist_items** | 無 frontmatter 查詢 | SELECT/INSERT/UPDATE 在 JapanCollection.astro、japan.astro(朋友願望清單) |
| **transactions** | 無 frontmatter 查詢(ledger.astro 無 build-time `.from()`) | SELECT/INSERT/UPDATE/DELETE 全在 [ledger.astro](src/pages/ledger.astro:334)(記帳明細,私人財務資料) |
| **income_categories / expense_categories** | 無 | SELECT 在 ledger.astro |
| **daily** | 無 frontmatter 查詢(polaroid.astro 無 build-time `.from()`) | SELECT/INSERT/UPDATE/DELETE 在 [polaroid.astro](src/pages/polaroid.astro:187) |
| **japan_images** | 無 | INSERT 在 JapanCollection.astro、japan.astro(上傳圖片記錄) |
| **post_images** | 無資料表查詢,僅 Storage bucket 操作 | `storage.from('post_images')` upload/getPublicUrl 在 [posts/index.astro:272](src/pages/posts/index.astro:272) |

### 尚未在程式碼中被引用、但資料庫已建立的表(依 PROJECT_ARCHITECTURE.md)

`travel_coupons`、`travel_subway_maps` — 已建表但 UI 尚未開發,無程式碼引用。仍會出現在下方 SQL 查詢結果中,一併列入矩陣。

---

## 二、Code-level 已確認的風險(不需等 RLS 結果即可定性的部分)

這一項是讀程式碼直接發現的**設計層級問題**,無論 RLS 政策如何設定都存在,先列出:

### 🔴 `posts/[id].astro` 完全不做權限過濾
```
第 14-18 行:
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', id)
  .single();
// 註解原文:「Server-side: 只抓資料不檢查權限，交給前端處理」
```
這代表:只要有人知道或猜到某篇 `private`/`friends` 短文的 `id`,直接訪問 `/posts/<id>`,**伺服器端就會把該篇完整內容(含 private 標記的文字)查出來寫進回應的 HTML**,是否隱藏只交給前端 JS 決定要不要顯示——但資料已經在 HTTP 回應內容裡了,對任何會看網頁原始碼或攔截網路請求的人形同公開。這與 RLS 是否允許 anon SELECT `posts` **獨立存在**:即使 RLS 開放 anon SELECT,問題出在「查詢時完全沒有依 visibility 過濾」,而不只是「該不該讓 anon 查」。

其餘所有其他頁面的 frontmatter 查詢(posts 列表、quotes 列表)都有确實加上 `.eq('visibility','public')` 過濾,只有這個單篇頁例外。

---

## 三、請你到 Supabase Dashboard 執行以下唯讀查詢

**這兩段 SQL 只有 SELECT,不會修改、新增或刪除任何資料表或資料,可放心執行。**

### 操作步驟

1. 開啟瀏覽器前往 [supabase.com](https://supabase.com) 並登入,點進你的專案(URL 開頭應為 `ltmrkdldmgysczfnidra`)
2. 左側選單找到 **SQL Editor**(圖示像 `</>`)並點擊
3. 點右上角的 **+ New query** 按鈕,會開啟一個空白查詢視窗
4. 把下面「查詢一」整段複製貼上到空白視窗
5. 按右下角(或右上角,依版面)的綠色 **Run** 按鈕(或按鍵盤 `Cmd + Enter`)
6. 查詢結果會顯示在下方表格,點表格右上角的匯出/複製圖示,或直接**全選表格內容複製**
7. 把結果完整貼回來給我
8. 再點一次 **+ New query**,貼上「查詢二」,重複步驟 5-7

### 查詢一:各資料表是否啟用 RLS

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

### 查詢二:每張表的 RLS 政策細節(誰能做什麼操作)

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
```

---

## 四、RLS 矩陣(2026-07-11,依使用者提供的查詢結果整理)

**判讀依據**:PostgreSQL RLS 政策彼此為 OR 關係(任一政策放行即放行)。`roles: {public}` 只代表「這條政策不限定資料庫角色」,實際限制看 `qual`(USING)/`with_check` 條件。三種常見角色語意:
- `auth.role() = 'authenticated'`:**只要是登入的帳號就符合,不分管理員或朋友/家人**
- `auth.uid() = user_id`:只能動自己那筆資料
- `auth.jwt() ->> 'email' = '特定 email'`:真正鎖定管理員身分(唯一正確做法,見 travel_coupons/travel_subway_maps)

全部 20 張表**皆已啟用 RLS**(查詢一 `rowsecurity` 全為 `true`),沒有表是完全裸奔的。問題出在個別政策條件過寬。

| 資料表 | anon(未登入)SELECT | anon 寫入 | authenticated(任何登入帳號,含朋友/家人)SELECT | authenticated 寫入 | 風險等級 |
|---|---|---|---|---|---|
| **posts** | 🔴 **全表無條件可讀**(`Anyone can read post metadata`,qual=true,與 visibility 無關) | 否 | 全表可讀(重複放行) | 🔴 任何登入帳號可 INSERT/UPDATE/DELETE **任何人的**貼文 | **CRITICAL** |
| **transactions** | 否 | 否 | 🔴 任何登入帳號可讀**全部**財務明細 | 🔴 任何登入帳號可 INSERT/UPDATE/DELETE | **CRITICAL** |
| **japan_items** | 🟡 全表可讀(含 owner_wishlist/owner_quantity) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD **全部**品項(非僅自己的) | **HIGH** |
| **japan_categories** | 🟡 全表可讀(taxonomy) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD | **HIGH** |
| **quotes** | 🟢 僅 `visibility='public'` | 否 | 🟡 任何登入帳號可讀**全部**語錄(含私人) | 🔴 任何登入帳號可 INSERT/UPDATE/DELETE **任何人的**語錄 | **HIGH** |
| **allowed_users**(白名單) | 否 | 否 | 🔴 任何登入帳號可讀/改/刪**整份白名單**(含所有朋友 email) | 同左(ALL) | **HIGH** |
| **wishlist_items** | 否 | 否 | 🟡 任何登入帳號可讀**所有人的**願望清單(非僅自己) | 🟢 INSERT/UPDATE/DELETE 均鎖定 `auth.uid()=user_id`,只能動自己的 | **MEDIUM** |
| **spots / trips / trip_days / day_spots** | 🟡 全表可讀(完整行程、地點、座標) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD 任何行程/景點 | **MEDIUM** |
| **spot_types / spot_subtypes** | 🟡 全表可讀(僅分類名稱) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD | **LOW** |
| **expense_categories / income_categories** | 🟡 全表可讀(記帳分類名稱,非金額) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD | **LOW** |
| **cards / status / daily** | 🟢 全表可讀(設計上本就公開:首頁卡片、狀態便條、Polaroid) | 否 | 全表可讀 | 🔴 任何登入帳號可改(cards/status)或 CRUD(daily),非僅管理員 | **LOW**(讀取合理,寫入權限過寬) |
| **travel_coupons / travel_subway_maps** | 🟢 全表可讀(尚無 UI,表已建但空) | 否 | 全表可讀 | 🟢 **正確示範**:寫入鎖定 `auth.jwt()->>'email' = 'abc19930406@gmail.com'`,真正限定管理員本人 | 目前無資料,結構正確 |

🔴 嚴重 / 🟡 中等 / 🟢 設計合理或已正確收斂

### 明確回答:未登入的陌生人現在能讀到哪些表、寫入哪些表

**能讀(不需要任何帳號,直接呼叫 API 或查看靜態頁面原始碼即可)**:
`posts`(**含私人與朋友限定文章的完整內容**)、`japan_items`、`japan_categories`、`spots`、`trips`、`trip_days`、`day_spots`、`spot_types`、`spot_subtypes`、`expense_categories`、`income_categories`、`cards`、`status`、`daily`、`quotes`(僅 public 標記的)、`travel_coupons`、`travel_subway_maps`。

**讀不到**:`transactions`(財務明細)、`allowed_users`(白名單)、`wishlist_items`(願望清單)——這三張表的 SELECT 政策都要求 `authenticated`,匿名者完全無法查詢。

**寫入**:**沒有任何一張表允許匿名寫入**。所有 INSERT/UPDATE/DELETE 政策都至少要求 `auth.role() = 'authenticated'`、`auth.uid() = user_id`,或管理員 email 比對,匿名者無法新增/修改/刪除任何資料。

### 貫穿多張表的系統性問題:「authenticated」被當成「admin」使用

你的登入設計本來就存在非管理員的登入帳號(Google OAuth 朋友、Email/Password 家人,用於日本收藏願望清單)。但 `posts`、`quotes`、`japan_items`、`japan_categories`、`allowed_users`、`transactions`、`spots` 系列、`trip_days`、`cards`、`status`、`daily`、`spot_types/subtypes`、`expense/income_categories` 的寫入政策一律只檢查 `auth.role() = 'authenticated'`,**沒有任何一條額外比對是不是管理員本人**。也就是說,任何一個朋友或家人帳號,只要成功登入(哪怕登入目的只是想勾選日本收藏願望清單),理論上就能透過直接呼叫 Supabase API:
- 讀取/刪除你的完整記帳明細
- 新增、竄改或刪除你的短文(含私人文章)、語錄
- 修改整份 `allowed_users` 白名單(等於能自行把任何 email 加入白名單)
- 刪改你的旅行行程與日本收藏資料

`travel_coupons`、`travel_subway_maps` 這兩張表用 `auth.jwt() ->> 'email' = '特定管理員 email'` 正確做出了「登入 ≠ 管理員」的區分,是本次盤點中**唯一**正確收斂到管理員身分的範例,可作為修復時的參考模式。

### 待釐清項目

`japan_images` 資料表在程式碼中有寫入操作([JapanCollection.astro:1078](src/components/JapanCollection.astro:1078)、[japan.astro:1074](src/pages/japan.astro:1074)),但**未出現在查詢一的 `pg_tables` 結果中**,因此也沒有對應的 RLS 政策資料。可能原因待確認(例如實際表名不同、或查詢時被遺漏),本次不猜測結論,留待下次查詢時一併確認。另外 Storage bucket(`post_images`、`japan_images`、`travel_images` 等)的存取權限屬 `storage.objects` 表的政策,不在本次查詢範圍內,如需盤點需另外查詢。

---

## 五、本輪任務範圍聲明

- 本文件僅盤點現況,**未修改任何程式碼、未執行任何會變更資料庫的操作**
- 不提出修復方案,修復留待後續任務
- 完整矩陣已根據使用者提供的兩段 SQL 查詢結果(2026-07-11)填入
