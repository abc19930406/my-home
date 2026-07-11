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

## 四、待補完:RLS 矩陣(等你貼回查詢結果後填入)

> 收到查詢一、查詢二的結果後,會在此處填入完整矩陣:
> 每張表 × RLS 是否啟用 × anon/authenticated 角色的 SELECT/INSERT/UPDATE/DELETE 各自允許條件,
> 並標出風險等級,最後回答「未登入的陌生人現在能讀到哪些表、寫入哪些表」。

（尚未填入,等待使用者提供 SQL 查詢結果）

---

## 五、本輪任務範圍聲明

- 本文件僅盤點現況,**未修改任何程式碼、未執行任何會變更資料庫的操作**
- 不提出修復方案,修復留待後續任務
- 完整矩陣需要你貼回 SQL 查詢結果才能完成
