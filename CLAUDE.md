# CLAUDE.md — The Corner Table

個人網站專案。Astro v6 + Tailwind v4 + Supabase + Vercel(`output: 'server'`)。
開發者非技術背景,所有溝通使用繁體中文(程式碼、指令、技術名詞保留英文)。

## 每次開工前(必做)

1. 依序閱讀:`PROJECT_ARCHITECTURE.md`(全站架構規則)→ `PROJECT_ARCHITECTURE_V2.md`(/trip 整合頁面規劃)→ `PROJECT_PROGRESS.md`(進度與待辦,第六節為當前優先順序)
2. 目前進度以 `PROJECT_PROGRESS.md` 為唯一事實來源,不要依賴對話記憶

## 工作流程

- 新功能、架構變更、跨模組修改:先提出計畫(plan mode),等使用者確認後才動工
- Bug 修復且影響 ≤ 3 個檔案:直接修,找 root cause,禁止表面修補,事後摘要說明
- 執行中偏離預期:立刻停下重新規劃,不要硬推
- 有歧義:先列出假設再動工
- 完成定義:既有測試通過(無測試則寫最小重現腳本)、行為變更附前後對比、diff 最小必要範圍、提供最終摘要(改了什麼/為什麼/如何驗證)

## 安全紅線(以下一律先問,不得自行執行)

- 刪除檔案或資料、清空目錄
- git force push、改寫歷史、動 main 分支保護
- 修改 CI/CD、部署設定、環境變數、.env、任何憑證
- 安裝或升級依賴套件
- 資料庫 migration 或不可逆的資料操作

## 部署規則(重要教訓,違反曾造成多輪誤判)

- 任何程式碼修改完成後,**同一輪**必須執行 `git add` / `git commit` / `git push`,並貼出終端機輸出確認推送成功
- 驗證測試必須等 Vercel Deployments 出現新的 Ready 部署(commit SHA 相符)後才進行
- Vercel build Success ≠ 前端無誤,最終以使用者本人瀏覽器實測為準
- 不可只回報「測試通過」;診斷階段先不改程式碼、只回報資訊
- **任務的文件同步與程式碼屬同一任務範圍,文件未更新前不得回報任務完成**:曾發生 V2 階段 5 任務二(地鐵圖分類庫,commit `f358a68`、`f82b4ee`、`8cb9614`)程式碼已上線、使用者也驗收通過,但 PROJECT_ARCHITECTURE_V2.md、PROJECT_PROGRESS.md、SECURITY_AUDIT.md 三份文件完全沒有同步更新,直到使用者主動指出才補做。驗收通過後的「更新文件 → commit → push」是任務的必要步驟,不是可延後的收尾雜務;任務進行到最後仍需明確檢查這一步是否已完成
- **「資料庫 schema/RLS/外鍵變更」+「會觸發該變更所保護行為的功能」同時交付時,指引測試前必須明確確認 SQL 已執行完成,不能只用「等 Vercel Ready 後測試」帶過**:曾發生刪除行程功能上線時,SQL(spots.trip_id 外鍵刪除規則由 CASCADE 改 SET NULL)與程式碼同一則訊息交付,只交代「等 Vercel Ready 後測試」,使用者先測試了刪除、SQL 後補執行,當下外鍵仍是舊的 CASCADE 規則,實際刪除行程時把底下景點資料一併永久刪除(該專案 Supabase 為免費方案無自動備份,無法復原,所幸為測試資料)。往後只要 SQL 會改變某個危險操作(刪除、覆寫)的資料庫端後果,必須把「SQL 已執行」列為測試的明確前置條件單獨講出來,不能跟「部署完成」合併成一句話

## 硬性技術規則(完整細節與原因見 PROJECT_ARCHITECTURE.md)

- `is:inline` 與 `define:vars` 的 `<script>` **禁用 TypeScript 語法**:這類 script 不經過 Vite 打包器,型別標註、`as` 斷言會直接送進瀏覽器導致執行期語法錯誤。一般 `<script>`(非 `is:inline`、非 `define:vars`)會經 Vite/esbuild 打包,**可以**使用 TS 語法(型別標註、`as` 斷言皆可),專案內既有大量此類寫法且建置與執行皆正常,不要移除
- ⚠️ **過渡性註記(2026-07-13)**:下面這條「Supabase 走 CDN 動態注入」規則正在遷移至 npm 匯入(V2 階段 9 核心任務,第一至三波已完成,現於浸泡觀察期),**目前程式碼實際上已不再使用 CDN**,下面規則描述已過時,待第四波浸泡確認穩定後正式改寫。過渡期間若要修改瀏覽器端 Supabase 載入相關程式碼,以 `PROJECT_PROGRESS.md`「V2 階段 9 核心任務」章節的實際現況為準,不要依下面這條舊規則行動
- Supabase 走 CDN 動態注入(Layout.astro),版本鎖定**確切版號** `@supabase/supabase-js@2.110.2/+esm`(2026-07-11 凍結,禁止浮動 `@2`;升版屬依賴變更,須先問);**不可**改為直接 import CDN URL
- `/trip` 頁面採 Supabase 單一入口:只有 trip.astro 可呼叫 `createClient` / `getSession` / `onAuthStateChange`;TripPlanner.astro 與 JapanCollection.astro **絕不**自行呼叫,只透過 `auth-state-changed` 事件 + `window.__latestAuthState` 快照接收狀態
- `window.__latestAuthState` 快照機制周邊的任何修改,必須完整貼出修改後程式碼供使用者肉眼確認(曾被格式化工具誤刪)
- 多元件共存頁面:Modal/Toast 的 ID 與 CSS class 必須加 `japan-` / `travel-` 前綴隔離
- 每個 Modal 的**所有**關閉路徑(按鈕、背景點擊、ESC)都必須清除 `body.modal-open`
- 靜態頁面加 `export const prerender = true`;API 路由加 `export const prerender = false`
- 日期一律本地時區;涉及相對時間以系統當前日期為準,不確定就問
- `/japan` 與 `/travel` 已於 2026-07-13(V2 階段 9)正式退役:原網址在 `astro.config.mjs` 設定 301 redirect 導向 `/trip`,原始檔案封存於 `src/_archived/`(不刪除,保留至階段 9 收尾批次)。`src/_archived/` 內的檔案不得修改或復用;所有收藏與行程相關的 bug 修復和功能開發,一律只改 `/trip` 使用的 TripPlanner.astro 與 JapanCollection.astro

## 經驗外部化

- 被使用者糾正後:立即把教訓改寫成可判斷違反與否的具體規則,寫入本檔或對應的 PROJECT_*.md,不是「內部記住」
- 完成階段性工作後,更新 PROJECT_PROGRESS.md 的對應章節與待辦清單
