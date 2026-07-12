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
| **posts** | ✅ 2026-07-11 已修復:[posts/index.astro:13](src/pages/posts/index.astro:13) `SELECT *`,`.eq('visibility','public')` 過濾,prerender=true(僅烘公開文章)<br>[posts/\[id\].astro](src/pages/posts/[id].astro) SSR 改為查不到即渲染無內容外殼,不再無過濾渲染全文,詳見 PROJECT_PROGRESS.md「隱私修復任務 B」 | UPDATE/INSERT/DELETE 皆在 [posts/index.astro](src/pages/posts/index.astro:313)(313/316/412 行);RLS 已收緊為僅管理員可寫入 |
| **quotes** | ✅ 2026-07-11 已修復:[quotes/index.astro:11](src/pages/quotes/index.astro:11) `SELECT *`,有 `.eq('visibility','public')` 過濾,prerender=true | UPDATE/INSERT/DELETE 在 [quotes/index.astro](src/pages/quotes/index.astro)(update/insert/delete 呼叫點);RLS 已收緊為僅 `is_admin()`;前端 `fetchPrivateQuotes` 的 `isAdmin` 判斷已改為真正比對 email,朋友帳號不再誤顯示編輯/刪除按鈕 |
| **japan_items** | [JapanCollection.astro:24](src/components/JapanCollection.astro:24)、[japan.astro:25](src/pages/japan.astro:25) `SELECT *`,無過濾,prerender=true(嵌入 /trip 與 /japan)——**SELECT 為刻意保留的公開展示設計,不動** | ✅ 2026-07-11 已修復:SELECT/UPDATE/INSERT/DELETE 遍布 JapanCollection.astro、japan.astro(願望清單、數量、收藏品 CRUD),寫入(INSERT/UPDATE/DELETE)RLS 已收緊為僅 `is_admin()` |
| **japan_categories** | [JapanCollection.astro:14](src/components/JapanCollection.astro:14)、[japan.astro:15](src/pages/japan.astro:15) `SELECT *`,prerender=true——**SELECT 為刻意保留的公開展示設計,不動** | ✅ 2026-07-11 已修復:DELETE/INSERT 在 JapanCollection.astro、japan.astro(分類管理),寫入 RLS 已收緊為僅 `is_admin()` |
| **trips** | [TripPlanner.astro:13](src/components/TripPlanner.astro:13)、[travel.astro:14](src/pages/travel.astro:14) `SELECT *`,prerender=true | INSERT/UPDATE 在 TripPlanner.astro、travel.astro(行程管理) |
| **spots** | [TripPlanner.astro:23](src/components/TripPlanner.astro:23)、[travel.astro:24](src/pages/travel.astro:24) `SELECT *`,prerender=true | INSERT/UPDATE/DELETE 遍布(景點 CRUD) |
| **spot_types / spot_subtypes** | 無 frontmatter 查詢 | SELECT/DELETE/UPSERT 在 TripPlanner.astro、travel.astro(類型管理) |
| **day_spots / trip_days** | 無 frontmatter 查詢 | SELECT/INSERT/UPDATE/DELETE 在 TripPlanner.astro、travel.astro(每日行程) |
| **status** | [index.astro:33](src/pages/index.astro:33)(首頁便條紙,設計上本就公開)、[admin.astro:26](src/pages/admin.astro:26)、[JapanCollection.astro:34](src/components/JapanCollection.astro:34)、[japan.astro:35](src/pages/japan.astro:35),皆 prerender=true | SELECT/UPDATE 在 Welcome.astro、JapanCollection.astro、japan.astro、admin.astro |
| **cards** | [index.astro:12](src/pages/index.astro:12) `SELECT *`,prerender=true(首頁卡片,設計上本就公開) | UPDATE 在 [admin.astro:250](src/pages/admin.astro:250) |
| **allowed_users** | ✅ 2026-07-11 已修復:無 frontmatter 查詢 | SELECT(白名單比對)在 JapanCollection.astro、TripPlanner.astro、japan.astro;RLS 已收緊為管理員全讀、非管理員僅讀自己那一列,寫入僅管理員 |
| **wishlist_items**(✅ 2026-07-13 INSERT/UPDATE 已收斂) | 無 frontmatter 查詢 | SELECT/INSERT/UPDATE 在 JapanCollection.astro、japan.astro(朋友願望清單);INSERT/UPDATE 新增 `can_wishlist_item()` 檢查,DELETE/SELECT 未動 |
| **transactions** | ✅ 2026-07-11 已修復:無 frontmatter 查詢(ledger.astro 無 build-time `.from()`) | SELECT/INSERT/UPDATE/DELETE 全在 [ledger.astro](src/pages/ledger.astro:334)(記帳明細,私人財務資料);RLS 已收緊為僅管理員,`ledger.astro` 頁面本身也新增管理員身分檢查 |
| **income_categories / expense_categories** | 無 | SELECT 在 ledger.astro |
| **daily** | 無 frontmatter 查詢(polaroid.astro 無 build-time `.from()`) | SELECT/INSERT/UPDATE/DELETE 在 [polaroid.astro](src/pages/polaroid.astro:187) |
| **japan_images** | 無 | INSERT 在 JapanCollection.astro、japan.astro(上傳圖片記錄) |
| **post_images** | ✅ 2026-07-11 已停用:無資料表查詢,僅 Storage bucket 操作 | 舊 bucket,已無任何程式碼引用(改用下方 `post_media`);原 11 個檔案中僅 1 個被實際使用,已搬遷,其餘孤兒檔案原樣保留未刪 |
| **post_media**(新增,2026-07-11) | 短文照片/短片/錄音私有 bucket,RLS 詳見 PROJECT_ARCHITECTURE.md「短文照片私有化」「短文媒體支援」 | `storage.from('post_media')` upload/move/createSignedUrl 在 posts/index.astro、posts/[id].astro |
| **post_media_items**(新增,2026-07-11) | ✅ 建表當下即依 posts 表 SELECT 邏輯設計 RLS(is_admin/is_friend),非事後補修 | 短文的 YouTube 影片、上傳短片、錄音,寫入僅 `is_admin()`,詳見 PROJECT_ARCHITECTURE.md「短文媒體支援」 |
| **trip_collaborators**(新增,2026-07-12) | 無 frontmatter 查詢 | ✅ 建表當下即設計 RLS(is_admin() OR 讀自己那一列,寫入僅 is_admin()),非事後補修;SELECT/INSERT/UPDATE/DELETE 在 TripPlanner.astro(協作者管理 Modal)。`can_edit_itinerary` 已於 2026-07-13 被 `trips`/`trip_days`/`spots`/`day_spots` 的 RLS 透過 `can_edit_trip()` 函式讀取並生效;`can_edit_wishlist` 已於同日被 `wishlist_items` 的 RLS 透過 `can_wishlist_item()` 函式讀取並生效,詳見 PROJECT_ARCHITECTURE_V2.md「6.2 協作者」

### travel_coupons / travel_subway_maps / trip_subway_categories(✅ 2026-07-13 UI 已上線,V2 階段 5)

- `travel_coupons`:SELECT/INSERT/UPDATE/DELETE 在 TripPlanner.astro(優惠券牆 + 管理員 Modal),RLS 稽核已確認正確(見下方矩陣),本次未異動
- `travel_subway_maps`:新增 `category`(text, NOT NULL)欄位,全域資源庫依此分組;原 `trip_id` 欄位**停用不刪**(新程式碼不再讀寫,保留至階段 9 評估);SELECT/INSERT 在 TripPlanner.astro(地鐵圖區塊 + 管理員上傳 Modal),RLS 未異動(寫入仍鎖定管理員 email)
- `trip_subway_categories`(新增,2026-07-13):建表當下即設計 RLS,非事後補修;SELECT 開放(任何人可查詢行程關聯了哪些分類),INSERT/DELETE 重用 `public.can_edit_trip()`(管理員或該行程 `can_edit_itinerary` 協作者),UPDATE 不開放(要改就刪了重加)。⚠️ 前端「瀏覽全部分類」開放給所有人使用,但只有管理員/`can_edit_itinerary` 協作者的勾選會真的寫入此表;其餘身分(朋友、無編輯權協作者、匿名訪客)的勾選僅更新前端本地變數,不觸發任何寫入請求,不受此表 RLS 影響

---

## 二、Code-level 已確認的風險(不需等 RLS 結果即可定性的部分)

這一項是讀程式碼直接發現的**設計層級問題**,無論 RLS 政策如何設定都存在,先列出:

### ✅ 已修復(2026-07-11)~~`posts/[id].astro` 完全不做權限過濾~~
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

**修復狀態(2026-07-11)**:已改為 SSR 查不到即渲染無內容外殼,不再無條件渲染全文;同步收緊 `posts` 表 RLS(新增 `is_admin()`/`is_friend()` 判斷)。修復細節見 PROJECT_ARCHITECTURE.md「短文（posts）visibility 權限架構」、PROJECT_PROGRESS.md「隱私修復任務 B」。以下第四節矩陣與風險排序為**修復前**的歷史紀錄,保留供對照,posts 現況已不再是 CRITICAL。

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
| **posts**(✅ 2026-07-11 已修復,見上方說明) | ~~🔴 全表無條件可讀~~(`Anyone can read post metadata`,qual=true,與 visibility 無關) | 否 | ~~全表可讀~~ | ~~🔴 任何登入帳號可 INSERT/UPDATE/DELETE 任何人的貼文~~ | ~~CRITICAL~~ → 已收斂為 public/is_admin()/is_friend() 判斷,寫入僅 is_admin() |
| **transactions**(✅ 2026-07-11 已修復) | 否 | 否 | ~~🔴 任何登入帳號可讀全部財務明細~~ | ~~🔴 任何登入帳號可 INSERT/UPDATE/DELETE~~ | ~~CRITICAL~~ → 已收斂為僅 `is_admin()` 可讀寫 |
| **japan_items**(✅ 2026-07-11 寫入已修復,SELECT 維持公開設計) | 🟡 全表可讀(含 owner_wishlist/owner_quantity,刻意保留) | 否 | 全表可讀(不變) | ~~🔴 任何登入帳號可 CRUD 全部品項~~ → 已收斂為僅 `is_admin()` 可寫入 | 寫入已收斂,SELECT 維持設計原狀 |
| **japan_categories**(✅ 2026-07-11 寫入已修復,SELECT 維持公開設計) | 🟡 全表可讀(taxonomy,刻意保留) | 否 | 全表可讀(不變) | ~~🔴 任何登入帳號可 CRUD~~ → 已收斂為僅 `is_admin()` 可寫入 | 寫入已收斂,SELECT 維持設計原狀 |
| **quotes**(✅ 2026-07-11 已修復) | 🟢 僅 `visibility='public'` | 否 | ~~🟡 任何登入帳號可讀全部語錄~~ | ~~🔴 任何登入帳號可 INSERT/UPDATE/DELETE 任何人的語錄~~ | ~~HIGH~~ → 已收斂為 public/is_admin()/is_friend() 判斷,寫入僅 is_admin() |
| **allowed_users**(白名單,✅ 2026-07-11 已修復) | 否 | 否 | ~~🔴 任何登入帳號可讀/改/刪整份白名單~~ | ~~同左(ALL)~~ | ~~HIGH~~ → 已收斂為管理員全讀/非管理員僅讀自己那一列,寫入僅 `is_admin()` |
| **wishlist_items**(✅ 2026-07-13 已修復) | 否 | 否 | 🟡 任何登入帳號可讀**所有人的**願望清單(非僅自己,刻意保留,「N 人想買」統計依賴此設計) | ~~🟡 任何登入帳號可對**任意品項**寫入願望清單,只檢查 `auth.uid()=user_id`,未檢查是否真的有權限操作該品項~~ → INSERT/UPDATE 新增 `can_wishlist_item(japan_item_id)` 檢查(一般收藏看白名單 `is_friend()`,行程收藏看 `trip_collaborators.can_edit_wishlist`);DELETE(`auth.uid()=user_id`)刻意不動,權限被撤仍可收回自己標過的,不留殘留 | ~~MEDIUM~~ → 寫入已收斂,SELECT 維持設計原狀 |
| **spots / trips / trip_days / day_spots**(✅ 2026-07-13 寫入已修復,SELECT 維持公開設計) | 🟡 全表可讀(完整行程、地點、座標,刻意保留) | 否 | 全表可讀(不變) | ~~🔴 任何登入帳號可 CRUD 任何行程/景點~~ → 已收斂:`trips` 一律僅 `is_admin()`;`trip_days`/`spots`/`day_spots` 改用新函式 `can_edit_trip(trip_id)`(管理員,或該行程 `trip_collaborators.can_edit_itinerary=true` 的協作者);`day_spots` 的 INSERT/UPDATE 新增完整性檢查,擋下「把 A 行程景點塞進 B 行程某一天」 | 寫入已收斂,SELECT 維持設計原狀 |
| **spot_types / spot_subtypes** | 🟡 全表可讀(僅分類名稱) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD | **LOW** |
| **expense_categories / income_categories** | 🟡 全表可讀(記帳分類名稱,非金額) | 否 | 全表可讀 | 🔴 任何登入帳號可 CRUD | **LOW** |
| **cards / status / daily** | 🟢 全表可讀(設計上本就公開:首頁卡片、狀態便條、Polaroid) | 否 | 全表可讀 | 🔴 任何登入帳號可改(cards/status)或 CRUD(daily),非僅管理員 | **LOW**(讀取合理,寫入權限過寬) |
| **travel_coupons / travel_subway_maps**(✅ 2026-07-13 UI 已上線) | 🟢 全表可讀,UI 使用中 | 否 | 全表可讀 | 🟢 **正確示範**:寫入鎖定 `auth.jwt()->>'email' = 'abc19930406@gmail.com'`,真正限定管理員本人 | UI 已上線,結構與寫入權限正確,未異動 |
| **trip_subway_categories**(新增,2026-07-13,建表當下即設計) | 否 | 否 | 🟢 全表可讀(任何人可查詢行程關聯了哪些分類) | 🟢 INSERT/DELETE 用 `can_edit_trip()`(管理員或該行程 can_edit_itinerary 協作者),UPDATE 不開放 | 建表當下即收斂,無歷史包袱 |
| **trip_collaborators**(新增,2026-07-12,建表當下即設計) | 否 | 否 | 🟢 僅讀得到自己那一列(`lower(user_email)=lower(auth.jwt()->>'email')`),非管理員讀不到別人的授權列 | 🟢 INSERT/UPDATE/DELETE 一律僅 `is_admin()` | 建表當下即收斂,無歷史包袱;`can_edit_itinerary`(見上方 spots/trips/trip_days/day_spots 列)與 `can_edit_wishlist`(見上方 wishlist_items 列)均已於 2026-07-13 生效,V2 階段 4 協作者權限系統結案 |

🔴 嚴重 / 🟡 中等 / 🟢 設計合理或已正確收斂

### 明確回答:未登入的陌生人現在能讀到哪些表、寫入哪些表

**能讀(不需要任何帳號,直接呼叫 API 或查看靜態頁面原始碼即可)**:
~~`posts`(含私人與朋友限定文章的完整內容)~~(✅ 2026-07-11 已修復,現況見下方)、`japan_items`、`japan_categories`、`spots`、`trips`、`trip_days`、`day_spots`、`spot_types`、`spot_subtypes`、`expense_categories`、`income_categories`、`cards`、`status`、`daily`、~~`quotes`~~(僅 public 標記的,✅ 已修復,非 public 現況見下方)、`travel_coupons`、`travel_subway_maps`、`trip_subway_categories`(新增,刻意設計為公開可讀)。

**posts 現況(2026-07-11 起)**:匿名者只能讀到 `visibility='public'` 的文章;`friends`/`private` 一律讀不到。

**讀不到**:`transactions`(財務明細)、`allowed_users`(白名單)、`wishlist_items`(願望清單)——這三張表的 SELECT 政策都要求 `authenticated`,匿名者完全無法查詢。(2026-07-11 更新:`transactions`、`allowed_users` 現在連「登入但非管理員」也讀不到/讀不全,不只是擋匿名者)

**寫入**:**沒有任何一張表允許匿名寫入**。所有 INSERT/UPDATE/DELETE 政策都至少要求 `auth.role() = 'authenticated'`、`auth.uid() = user_id`,或管理員 email 比對,匿名者無法新增/修改/刪除任何資料。

### 貫穿多張表的系統性問題:「authenticated」被當成「admin」使用

你的登入設計本來就存在非管理員的登入帳號(Google OAuth 朋友、Email/Password 家人,用於日本收藏願望清單)。~~`posts`~~(✅ 已改為僅 `is_admin()` 可寫入)、~~`allowed_users`~~(✅ 已改為僅 `is_admin()` 可寫入,非管理員 SELECT 也收斂為只讀自己)、~~`transactions`~~(✅ 已改為僅 `is_admin()` 可讀寫)、~~`japan_items`~~、~~`japan_categories`~~(✅ 寫入已改為僅 `is_admin()`,SELECT 維持公開設計不動)、~~`quotes`~~(✅ 已改為僅 `is_admin()` 可寫入,SELECT 收斂為 public/is_admin()/is_friend(),均 2026-07-11 修復)、`spots` 系列、`trip_days`、`cards`、`status`、`daily`、`spot_types/subtypes`、`expense/income_categories` 的寫入政策一律只檢查 `auth.role() = 'authenticated'`,**沒有任何一條額外比對是不是管理員本人**。也就是說,任何一個朋友或家人帳號,只要成功登入(哪怕登入目的只是想勾選日本收藏願望清單),理論上就能透過直接呼叫 Supabase API:
- ~~讀取/刪除你的完整記帳明細~~(✅ 已修復)
- 新增、竄改或刪除你的語錄(posts 已修復)、~~日本收藏品項與分類~~(✅ 已修復)
- ~~修改整份 `allowed_users` 白名單~~(✅ 已修復)
- ~~刪改你的旅行行程(`spots`/`trips`/`trip_days` 等)~~(✅ 2026-07-13 已修復,見上方)

`travel_coupons`、`travel_subway_maps` 這兩張表用 `auth.jwt() ->> 'email' = '特定管理員 email'` 正確做出了「登入 ≠ 管理員」的區分,是本次盤點中**唯一**正確收斂到管理員身分的範例,可作為修復時的參考模式。

### 待釐清項目

`japan_images` 資料表在程式碼中有寫入操作([JapanCollection.astro:1078](src/components/JapanCollection.astro:1078)、[japan.astro:1074](src/pages/japan.astro:1074)),但**未出現在查詢一的 `pg_tables` 結果中**,因此也沒有對應的 RLS 政策資料。可能原因待確認(例如實際表名不同、或查詢時被遺漏),本次不猜測結論,留待下次查詢時一併確認。

Storage bucket 的存取權限屬 `storage.objects` 表的政策,本次盤點當下不在查詢範圍內。**2026-07-11 更新**:`post_media`(短文照片)已在後續任務中完成 RLS 收緊,詳見 PROJECT_ARCHITECTURE.md「短文照片私有化」。`japan_images`、`travel_images` 等其餘 Storage bucket 仍未盤點,權限現況未知,列入下一輪。

---

## 五、本輪任務範圍聲明

- 本文件僅盤點現況,**未修改任何程式碼、未執行任何會變更資料庫的操作**
- 不提出修復方案,修復留待後續任務
- 完整矩陣已根據使用者提供的兩段 SQL 查詢結果(2026-07-11)填入
