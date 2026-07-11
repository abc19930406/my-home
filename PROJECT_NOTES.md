> ⚠️ 本文件已於 2026-07 廢棄,內容為 2026-05 的過時版本,僅供歷史參考。專案現況一律以 PROJECT_ARCHITECTURE.md、PROJECT_ARCHITECTURE_V2.md、PROJECT_PROGRESS.md 為準。

# The Corner Table — 專案架構與開發說明書


---

## 📌 專案基本資訊

| 項目 | 內容 |
|------|------|
| 專案名稱 | The Corner Table（我的個人入口首頁） |
| 本地路徑 | `/Users/wangyusheng/Desktop/my-home` |
| GitHub | `https://github.com/abc19930406/my-home` |
| 線上網址 | `https://my-home-blond-tau.vercel.app` |
| 技術框架 | Astro v6 + Tailwind CSS v4 |
| 部署平台 | Vercel（連結至 GitHub main 分支，自動部署） |
| 建立日期 | 2026-05-09 |

---

## 🗂️ 專案資料夾結構

```
my-home/
├── src/
│   ├── assets/              # 靜態圖片（Astro 預設留存）
│   ├── components/
│   │   ├── Welcome.astro    # 首頁主體元件（Header + 卡片 + 狀態 + Footer）
│   │   └── CardSection.astro # 分區卡片元件（自動由資料渲染）
│   ├── data/
│   │   └── links.ts         # ⭐ 所有卡片連結的集中管理資料來源
│   ├── layouts/
│   │   └── Layout.astro     # 全站 HTML 框架（字型、CDN、背景色）
│   ├── pages/
│   │   └── index.astro      # 首頁入口（僅負責引入 Layout + Welcome）
│   └── styles/
│       └── global.css       # 全域樣式（目前僅包含 @import "tailwindcss"）
├── public/                  # 靜態資源（favicon 等）
├── astro.config.mjs         # Astro 設定（包含 Tailwind vite plugin）
├── package.json
├── tsconfig.json
└── PROJECT_NOTES.md         # 📖 本文件
```

---

## 🎨 視覺設計規格（深木奶油風格）

**請嚴格遵守以下色碼，不可隨意更改：**

| 用途 | 色碼 |
|------|------|
| 頁面背景 | `#2C1E14` |
| 卡片背景 | `#3A2818` |
| 邊框線條 | `#4A3525` |
| 主標題文字 | `#F5E6CC` |
| 副標題／說明文字 | `#A08060` |
| 淡色提示文字 | `#8A6E52` |
| 圖示與強調色 | `#C4956A` |

**字型：** `Noto Serif TC`（繁體中文楷書感，已透過 Google Fonts 載入）

**圖示庫：** Tabler Icons Webfont（透過 jsDelivr CDN 載入）
- 使用方式：`<i class="ti ti-[icon-name]"></i>`
- 可用圖示：https://tabler.io/icons

---

## ⭐ 最重要原則：資料驅動架構

**所有卡片連結的唯一修改入口是 `src/data/links.ts`。**

### CardLink 的資料格式：

```typescript
interface CardLink {
  section: string;     // 所屬分區："知識與創作" | "生活記錄" | "工具"
  title: string;       // 卡片標題
  icon: string;        // Tabler icon 名稱（不含 "ti-" 前綴）
  description: string; // 一句話描述
  url: string;         // 連結網址（尚未建立先填 "" 空字串）
  children?: {         // （選填）子連結，用於知識庫展開分支
    title: string;
    url: string;
  }[];
}
```

### 新增卡片的步驟：
1. 打開 `src/data/links.ts`
2. 在對應的分區下新增一筆物件
3. **儲存即可，其他任何檔案都不需要修改。**

---

## 📋 目前卡片清單與進度

### 知識與創作（4 張）
| 卡片 | icon | URL 狀態 | 備註 |
|------|------|----------|------|
| 知識庫 | `plant-2` | ⚠️ 留空 | 含子連結：Obsidian 筆記 ✅ |
| 短文 | `feather` | ❌ 留空 | 尚未建立 |
| 讀書筆記 | `books` | ❌ 留空 | 尚未建立 |
| 語錄收藏 | `quote` | ❌ 留空 | 尚未建立 |

### 生活記錄（4 張）
| 卡片 | icon | URL 狀態 | 備註 |
|------|------|----------|------|
| 視覺日記 | `camera` | ❌ 留空 | 尚未建立 |
| 旅行地圖 | `map-pin` | ❌ 留空 | 尚未建立 |
| 年度回顧 | `calendar-stats` | ❌ 留空 | 尚未建立 |
| 作品集 | `layout-grid` | ❌ 留空 | 尚未建立 |

### 工具（4 張）
| 卡片 | icon | URL 狀態 | 備註 |
|------|------|----------|------|
| 記帳系統 | `coin` | ❌ 留空 | 尚未建立 |
| 習慣打卡 | `checklist` | ❌ 留空 | 尚未建立 |
| 語言學習 | `language` | ❌ 留空 | 尚未建立 |
| 書籤收藏 | `bookmark` | ❌ 留空 | 尚未建立 |

---

## 🔗 子站清單

| 子站名稱 | 框架 | 線上網址 | 用途 |
|----------|------|----------|------|
| Quartz 知識庫 | Quartz (GitHub Pages/Vercel) | `https://quartz-five-sigma.vercel.app` | Obsidian 筆記的公開發布 |

> 未來每建立一個新的子站，請在這裡補充記錄。

---

## ✏️ 待手動填寫的內容

以下項目在程式碼中以 `<!-- 請手動填寫 -->` 標記，請使用者自行編輯 `Welcome.astro`：

- **閱讀中**：目前正在讀的書
- **正在學**：目前學習的技能或課程
- **最近去了**：最近造訪的地點
- **聽歌中**：目前在聽的音樂或專輯

**位置：** `src/components/Welcome.astro` → 「現在狀態」區塊

---

## 🚀 未來開發的注意事項

### 新增子頁面（Sub-pages）時：
- 在 `src/pages/` 新增 `.astro` 檔案（例如 `notes.astro`）
- 記得在 `links.ts` 補上該頁面的 URL
- 如果是獨立子站（另一個 Vercel 專案），直接在 URL 填入外部網址

### 新增分區時：
- 在 `src/data/links.ts` 的 `linksData` 陣列中新增卡片，填入新的 `section` 名稱
- 在 `src/components/Welcome.astro` 的 `sectionOrder` 陣列中加入新的分區名稱
- `CardSection.astro` 元件完全不需要修改

### 修改設計樣式時：
- 所有通用樣式在 `src/styles/global.css`
- 卡片與分區樣式在 `src/components/CardSection.astro` 的 `<style>` 區塊
- 頁面結構樣式在 `src/components/Welcome.astro` 的 `<style>` 區塊
- **色碼請務必遵守上方的設計規格表，不可隨意更換**

### 部署流程：
```bash
# 本地預覽
npm run dev

# 推送到 GitHub（Vercel 會自動觸發部署）
git add .
git commit -m "feat: [說明你做了什麼]"
git push
```
> ⚠️ 這個專案的 GitHub 認證使用 GitHub CLI (`gh`) 完成授權。若出現 `Permission denied` 錯誤，請重新執行 `/tmp/gh_2.60.0_macOS_arm64/bin/gh auth login` 重新授權。

### Supabase（尚未設定）：
- 目前尚未整合任何後端資料庫
- 未來若要加入「記帳系統」或「習慣打卡」等需要資料庫的功能，再討論 Supabase 的設定方式

---

## 📅 開發日誌

| 日期 | 版本 | 內容 |
|------|------|------|
| 2026-05-09 | v1.0 | 初始化 Astro 專案、完成深木奶油首頁、部署到 Vercel |

> 每次完成重大更新，請在這裡補充一行記錄。
