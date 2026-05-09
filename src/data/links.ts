export interface SubLink {
  title: string;
  url: string;
}

export interface CardLink {
  section: string;
  title: string;
  icon: string;
  description: string;
  url: string;
  children?: SubLink[];
}

export const linksData: CardLink[] = [
  // === 知識與創作 ===
  {
    section: "知識與創作",
    title: "知識庫",
    icon: "plant-2",
    description: "筆記・思考碎片・主題整理",
    url: "",
    children: [
      { title: "Obsidian 筆記", url: "https://quartz-five-sigma.vercel.app" }
    ]
  },
  {
    section: "知識與創作",
    title: "短文",
    icon: "feather",
    description: "隨筆・觀察・不成文的想法",
    url: ""
  },
  {
    section: "知識與創作",
    title: "讀書筆記",
    icon: "books",
    description: "讀過的書・摘錄・評分",
    url: ""
  },
  {
    section: "知識與創作",
    title: "語錄收藏",
    icon: "quote",
    description: "喜歡的句子・值得記住的話",
    url: ""
  },

  // === 生活記錄 ===
  {
    section: "生活記錄",
    title: "視覺日記",
    icon: "camera",
    description: "照片・日常・光與影",
    url: ""
  },
  {
    section: "生活記錄",
    title: "旅行地圖",
    icon: "map-pin",
    description: "去過的地方・還想去的地方",
    url: ""
  },
  {
    section: "生活記錄",
    title: "年度回顧",
    icon: "calendar-stats",
    description: "每年的總結・成長與記憶",
    url: ""
  },
  {
    section: "生活記錄",
    title: "作品集",
    icon: "layout-grid",
    description: "做過的東西・值得留下來的",
    url: ""
  },

  // === 工具 ===
  {
    section: "工具",
    title: "記帳系統",
    icon: "coin",
    description: "個人收支・每月概況",
    url: ""
  },
  {
    section: "工具",
    title: "習慣打卡",
    icon: "checklist",
    description: "每日追蹤・進度視覺化",
    url: ""
  },
  {
    section: "工具",
    title: "語言學習",
    icon: "language",
    description: "單字・進度・練習記錄",
    url: ""
  },
  {
    section: "工具",
    title: "書籤收藏",
    icon: "bookmark",
    description: "好用的資源・常去的網站",
    url: ""
  }
];
