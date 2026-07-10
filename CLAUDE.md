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

## 硬性技術規則(完整細節與原因見 PROJECT_ARCHITECTURE.md)

- Astro `<script>`(非 frontmatter)**禁用 TypeScript 語法**:型別標註、`as` 斷言會導致 esbuild 編譯失敗
- Supabase 走 CDN 動態注入(Layout.astro),版本鎖定**確切版號** `@supabase/supabase-js@2.110.2/+esm`(2026-07-11 凍結,禁止浮動 `@2`;升版屬依賴變更,須先問);**不可**改為直接 import CDN URL
- `/trip` 頁面採 Supabase 單一入口:只有 trip.astro 可呼叫 `createClient` / `getSession` / `onAuthStateChange`;TripPlanner.astro 與 JapanCollection.astro **絕不**自行呼叫,只透過 `auth-state-changed` 事件 + `window.__latestAuthState` 快照接收狀態
- `window.__latestAuthState` 快照機制周邊的任何修改,必須完整貼出修改後程式碼供使用者肉眼確認(曾被格式化工具誤刪)
- 多元件共存頁面:Modal/Toast 的 ID 與 CSS class 必須加 `japan-` / `travel-` 前綴隔離
- 每個 Modal 的**所有**關閉路徑(按鈕、背景點擊、ESC)都必須清除 `body.modal-open`
- 靜態頁面加 `export const prerender = true`;API 路由加 `export const prerender = false`
- 日期一律本地時區;涉及相對時間以系統當前日期為準,不確定就問

## 經驗外部化

- 被使用者糾正後:立即把教訓改寫成可判斷違反與否的具體規則,寫入本檔或對應的 PROJECT_*.md,不是「內部記住」
- 完成階段性工作後,更新 PROJECT_PROGRESS.md 的對應章節與待辦清單
