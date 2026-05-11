# PROJECT_ARCHITECTURE.md
# The Corner Table — 網站架構與開發規則

> 每次開始新任務前，請先完整閱讀本文件。

---

## 一、專案基本資訊

| 項目 | 內容 |
|------|------|
| 網站名稱 | The Corner Table |
| 主站網址 | https://my-home-blond-tau.vercel.app |
| 知識庫網址 | https://quartz-five-sigma.vercel.app |
| GitHub | https://github.com/abc19930406/my-home |
| 本地路徑 | /Users/wangyusheng/Desktop/my-home |
| 開發者系統 | macOS |

---

## 二、技術架構

### 主站框架
- **Astro v6.3.1**（靜態優先 SSG 模式，output: "static"）
- **Tailwind CSS v4.3.0**
- **TypeScript**
- **Noto Serif TC**（Google Fonts，主要字體）

### 資料庫與後端
- **Supabase**（PostgreSQL 資料庫 + Auth + Storage）
  - Project ID: `ltmrkdldmgysczfnidra`
  - Project URL: `https://ltmrkdldmgysczfnidra.supabase.co`
  - RLS（Row Level Security）已啟用

### 部署
- **Vercel**（自動從 GitHub main 分支部署）
- **GitHub Actions**：無，純 Vercel 自動部署

### 子站（獨立專案）
- Quartz + Obsidian，獨立部署於 Vercel，主站以外部連結方式串接

---

## 三、專案目錄結構

```
my-home/
├── src/
│   ├── components/
│   │   ├── CardSection.astro    # 首頁卡片自動渲染元件
│   │   ├── Starfield.astro      # 夜晚星星背景
│   │   ├── ThemeToggle.astro    # 日夜切換按鈕
│   │   └── Welcome.astro        # 首頁主體元件
│   ├── data/
│   │   └── links.ts             # 首頁卡片資料（唯一需要修改的資料來源）
│   ├── layouts/
│   │   └── Layout.astro         # 全域 Layout（含 body background #2C1E14）
│   ├── lib/
│   │   └── supabase-client.ts   # Supabase 客戶端
│   ├── pages/
│   │   ├── index.astro          # 首頁
│   │   ├── login.astro          # 登入頁（/login）
│   │   ├── admin.astro          # 管理後台（/admin，需登入）
│   │   └── posts/
│   │       ├── index.astro      # 短文列表頁（/posts）
│   │       └── [id].astro       # 單篇短文頁（/posts/[id]）
│   └── styles/
│       ├── global.css           # 全域樣式
│       ├── posts.css            # 短文頁面專用樣式
│       └── welcome.css          # 首頁樣式
├── public/                      # 靜態資源
├── .env                         # 本地環境變數（不進 Git）
├── .gitignore
├── astro.config.mjs
├── package.json
├── PROJECT_ARCHITECTURE.md      # 本文件
└── PROJECT_PROGRESS.md          # 功能進度文件
```

---

## 四、環境變數

### 本地 .env 檔案（/Users/wangyusheng/Desktop/my-home/.env）
```
PUBLIC_SUPABASE_URL=https://ltmrkdldmgysczfnidra.supabase.co
PUBLIC_SUPABASE_ANON_KEY=（已設定）
PUBLIC_VERCEL_DEPLOY_HOOK=（已設定）
```

### Vercel 環境變數（已設定）
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `PUBLIC_VERCEL_DEPLOY_HOOK`

---

## 五、資料庫 Schema

### `cards` 資料表（首頁卡片）
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | bigint | 主鍵，自動產生 |
| section | text | 所屬分區 |
| title | text | 卡片標題 |
| icon | text | Tabler icon 名稱 |
| description | text | 一句話描述 |
| url | text | 連結網址 |
| children | jsonb | 子連結陣列（選填） |
| sort_order | int | 排列順序 |

### `posts` 資料表（短文）
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | bigint | 主鍵，自動產生 |
| title | text | 標題 |
| content | text | 正文（Markdown 格式） |
| visibility | text | public / friends / private |
| weather | text | 天氣與地點（例：晴・台南） |
| image_url | text | 照片網址（選填） |
| reading_time | int | 閱讀時間（分鐘，自動計算） |
| created_at | timestamptz | 建立時間（自動產生） |

### Storage Bucket
- `post_images`：短文照片儲存，PUBLIC 公開讀取

---

## 六、重要開發規則

### 架構原則
1. **靜態優先**：所有頁面維持 `output: "static"`，絕對不改 `astro.config.mjs` 的 output 設定
2. **Fallback 保護**：所有 Supabase 的 Build Time fetch 必須有 try/catch，失敗時使用本地備用資料
3. **首頁不能壞**：任何 Supabase 錯誤都不能導致首頁 500

### CSS 規則
1. `Layout.astro` 的 `body` 有全域背景色 `#2C1E14`（深木色）
2. 需要自訂背景的頁面（如 posts）必須在頁面最頂部加入 `<style is:global>` 覆蓋
3. `posts.css` 需用 `import` 在 frontmatter 載入，不要放在 `<style>` 標籤裡（避免 Astro scoping 問題）

### Script 規則
1. Astro `<script>` 標籤內**不能**用 `import.meta.env.XXX` 讀取變數
2. 需要傳入環境變數時，用 `define:vars` 從 frontmatter 傳入：
   ```astro
   ---
   const webhookUrl = import.meta.env.PUBLIC_VERCEL_DEPLOY_HOOK ?? '';
   ---
   <script define:vars={{ webhookUrl }}>
   ```
3. 不要在 script 裡用反引號（`` ` ``）在 Astro 模板的 HTML 屬性值中

### 身分驗證規則
1. 使用 Supabase Auth（Email + Password）
2. 只有一個管理員帳號
3. 未登入者：只能看 `public` 內容
4. 登入者（管理員）：可看所有內容，可新增/編輯/刪除
5. 管理功能用客戶端 JS 判斷登入狀態後顯示，HTML 預設隱藏（`style="display: none;"`）

### Git 規則
1. `.env` 絕對不進 Git
2. 推送前必須在本地執行 `npm run build` 確認編譯成功
3. Commit message 格式：`feat:` / `fix:` / `chore:` / `docs:`

### 月亮光暈特殊解法
月亮用純漸層實作，容器必須夠大（280x280px）才不會出現方形邊框：
```css
.halo-moon {
  position: fixed;
  top: -60px; right: -60px;
  width: 280px; height: 280px;
  background:
    radial-gradient(ellipse 38px 38px at 64% 36%, rgba(240,232,200,0.7) 0%, transparent 70%),
    radial-gradient(ellipse 90px 90px at 64% 36%, rgba(200,185,140,0.15) 0%, transparent 70%),
    radial-gradient(ellipse 200px 200px at 64% 36%, rgba(180,165,120,0.05) 0%, transparent 80%);
}
```

---

## 七、常用指令

```bash
# 啟動本地開發伺服器
cd /Users/wangyusheng/Desktop/my-home && npm run dev

# 編譯確認
npm run build

# 推送到 GitHub（觸發 Vercel 自動部署）
git add . && git commit -m "feat: 描述" && git push origin main

# 停止所有 dev server
pkill -f "astro dev" && pkill -f "node"
```
