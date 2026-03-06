# 作品集 · Portfolio · PS Vita Style

以 PlayStation Vita Live Area 風格呈現的作品集首頁：圓形氣泡代表專案，點擊氣泡可開啟作品介紹（Live Area 彈窗）。

## 介面

- **狀態列**：時間、Wi‑Fi／電池圖示、通知藍色圓鈕（Vita 風格）
- **氣泡區**：交替 3–4–3–4 排列的圓形專案圖示，點擊開啟作品詳情
- **彈窗**：作品標題、標籤、說明與專案連結；右上角 × 關閉

## 專案結構

```
PORTFOLIO_CURSOR/
├── index.html    # Vita Live Area 結構（狀態列、氣泡區、彈窗）
├── styles.css    # Vita 風格：狀態列、氣泡、彈窗
├── game.js       # 氣泡渲染、時間更新、作品彈窗邏輯、PROJECTS 資料
└── README.md
```

## 如何放上自己的作品

編輯 `game.js` 裡的 `PROJECTS` 陣列，每個作品需要：

| 欄位 | 說明 |
|------|------|
| `id` | 唯一代號 |
| `title` | 作品標題（會顯示在氣泡下方） |
| `tags` | 標籤（例如技術、類型） |
| `description` | 作品介紹文字 |
| `link` | 專案連結（可留空則不顯示連結） |
| `bubbleColor` | 氣泡主色（CSS 顏色，如 `#5c6bc0`） |

新增專案時，氣泡會依序填入第一頁的 3–4–3–4 格；超過 10 個可再擴充為多頁。

## 本地預覽

用瀏覽器直接開啟 `index.html`，或使用本地伺服器：

```bash
python3 -m http.server 8000
# 瀏覽 http://localhost:8000
```

## 發布到 GitHub Pages

1. **第一次推送到 GitHub**（在本機終端機執行，會要求登入）：
   ```bash
   cd /Users/jiangyichen/PORTFOLIO_CURSOR
   git push -u origin main
   ```
   或執行：`./publish.sh`

2. **在 GitHub 開啟 Pages**  
   到 https://github.com/ethanchiang3/portfolio → **Settings** → **Pages** → **Source**: Deploy from a branch → **Branch**: `main`，**Folder**: `/ (root)` → **Save**。

3. **網站網址**  
   https://ethanchiang3.github.io/portfolio/

## 技術

- 純 HTML / CSS / JavaScript，無框架
- 字型：Noto Sans TC
