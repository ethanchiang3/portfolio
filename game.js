/**
 * Portfolio — PS Vita Live Area
 * Hex grid with touching edges; real physics: velocity, spring to rest, repulsion.
 */

const PROJECTS = [
  {
    id: 'keyboard-1',
    title: '鍵盤熱區分析工具',
    titleEn: 'Keyboard Heatmap',
    tags: 'Web App · 資料視覺化',
    description: '分析鍵盤使用熱區的互動式網頁，可上傳打字紀錄或即時錄製，以熱力圖呈現各鍵使用頻率，幫助改善打字習慣或鍵位配置。',
    link: 'https://github.com',
    bubbleColor: '#5c6bc0',
  },
  {
    id: 'mouse-1',
    title: '滑鼠軌跡視覺化',
    titleEn: 'Mouse Trail Visualizer',
    tags: 'JavaScript · Canvas',
    description: '記錄並重播滑鼠移動軌跡，產出動態路徑圖與統計（速度、點擊熱區），適合用於 UX 研究或作品展示。',
    link: 'https://github.com',
    bubbleColor: '#26a69a',
  },
  {
    id: 'monitor-1',
    title: '即時儀表板',
    titleEn: 'Realtime Dashboard',
    tags: 'React · API',
    description: '即時資料儀表板，串接後端 API 顯示數據圖表與告警，支援多種圖表類型與自訂時間區間。',
    link: 'https://github.com',
    bubbleColor: '#42a5f5',
  },
  {
    id: 'cup-1',
    title: 'Side Project 精選',
    titleEn: 'Side Projects',
    tags: '全端 · 小品',
    description: '收錄各種 side project：從待辦清單、番茄鐘到小型遊戲，展現全端與前端能力。',
    link: 'https://github.com',
    bubbleColor: '#66bb6a',
  },
];

const NUM_CIRCLES = 19;
let layoutPoints = [];
function getTotalBubbles() {
  return layoutPoints.length;
}

// 19 folders under assets/Ticker: order matches arc mode top-to-bottom (image list)
const TICKER_FOLDERS = [
  { name: '0', firstImage: '2x_return the prompt unchanged.jpg', images: ['2x_return the prompt unchanged.jpg', '3A927DB1-F317-47BF-BA00-4A6DF368173B.jpg'] },
  { name: 'Goldfish Tumbler', firstImage: 'Gemini_Generated_Image_nv1qcinv1qcinv1q.png', images: ['Gemini_Generated_Image_nv1qcinv1qcinv1q.png'] },
  { name: 'Keep an eye on the clock', firstImage: '2x_replace the product in @1  with @2 (2).png', images: ['2x_replace the product in @1  with @2 (2).png', '2x_replace the product in @1  with @2 (4).png', '2x_replace the product in @1  with @2 (5).png', '2x_replace the product in @1  with @2 (6).png'] },
  { name: 'Kohler | Instant hot water purifier', firstImage: '2x_use @2 as art direction, adjust the image style of the render, remove the leaves.png', images: ['2x_use @2 as art direction, adjust the image style of the render, remove the leaves.png'] },
  { name: 'Logitech | Headset design with genetic algorithm', firstImage: 'NSiSQnPolmOJiNeiwU03kSOu84.png', images: ['NSiSQnPolmOJiNeiwU03kSOu84.png'] },
  { name: 'Logitech | MX MASTER4', firstImage: '02252026_canova_only_for_rendering.83.png', images: ['02252026_canova_only_for_rendering.79.png', '02252026_canova_only_for_rendering.80.png', '02252026_canova_only_for_rendering.81.png', '02252026_canova_only_for_rendering.83.png', '02252026_canova_only_for_rendering.85.gif'] },
  { name: 'Logitech | Signature Solar+', firstImage: '452.png', images: ['452.png', '65_W.png', '65_g.png'] },
  { name: 'Logitech | Wave keys Sand Colorway', firstImage: 'Wst8ktbXnbLdfPG0u2yYULITNMg.png', images: ['Wst8ktbXnbLdfPG0u2yYULITNMg.png', 'f5CWz1Z0aud8XSLoZsMmbFWAM.png', 'fp4nvBkUdagCsLmJcPo3CLMCbA.jpg.png'] },
  { name: 'Morph', firstImage: '0wBA3H9BPYhYx2HzNP4h6qFc.png', images: ['0wBA3H9BPYhYx2HzNP4h6qFc.png'] },
  { name: 'Nodes', firstImage: '4x_make this rendering more realistic, use@2 as reference but remove the metal plate (1).png', images: ['4x_make this rendering more realistic, use@2 as reference but remove the metal plate (1).png', 'BLN5kztPlBeUb3sG0DYqC65Kqs.png', 'Grd0PST2Iuf0CXCpXdWbGmrVVYg.png', 'bookend_0220.48.png', 'nPg6ehlYnHX3J7Gb62RtsXHnJhQ.png'] },
  { name: 'Octapus', firstImage: 'apply the aesthetic of@2  to @1  and make the design more realistic, don_t change the aspect and angle of @1.png', images: ['1KK3KonGmBcl1y96J6Uvnf4LU.png', 'apply the aesthetic of@2  to @1  and make the design more realistic, don_t change the aspect and angle of @1.png'] },
  { name: 'Onion', firstImage: '0f1b24164697117.63fcd3551e39e.png', images: ['0f1b24164697117.63fcd3551e39e.png', '16e020164697117.63fb9f23ce9a8.jpg', '47b897164697117.64aed32cca6a7.png', '8c3a85164697117.63fd1d19876e5.png', '9ec514164697117.64aed5efe4b5d.png', 'a09fa1164697117.64aed32ccc1ab.png', 'a7fe07164697117.63fba4a7e0e47.gif', 'apBGgK7PNcyyia6g5kk1NLWHo.png', 'bf55e6164697117.64afc6221cd98.png', 'c4013e164697117.63fc477a75df2.png', 'c6021b164697117.63fd1d19865f6.png', 'd89951164697117.63fd1d198304f.jpg'] },
  { name: 'Post-Purity', firstImage: '4x_apply the details of the red circled part of@2  to the red circled part of @1.png', images: ['4x_apply the details of the red circled part of@2  to the red circled part of @1.png', '4x_change teh pcb color from green to black, 添加顆粒感, change the lens from 50mm to 200mm.png'] },
  { name: 'Pulse', firstImage: '2x_use@2 as art direction, add motion blur but focus on the Cufflinks.png', images: ['2x_use@2 as art direction, add motion blur but focus on the Cufflinks.png'] },
  { name: 'Robin', firstImage: 'IMG_2566.JPG', images: ['IMG_2566.JPG'] },
  { name: 'Sparkle', firstImage: '810ad1123263591.640819e2875ca.png', images: ['810ad1123263591.640819e2875ca.png', 'rd6IPEfTi2wToWIW2Ns6x6oVQ.png'] },
  { name: 'Stool', firstImage: '2x_Front - New view (2).png', images: ['2x_Front - New view (2).png', '2x_Front Left 3_4 View - New view.png', '2x_Left - New view.png', '2x_Top - New view (1).png', '2x_Top - New view (2).png', '4x_use the second image as reference, apply the art direction.png'] },
  { name: 'T4B', firstImage: '4x_Front - New view.png', images: ['4x_Front - New view.png', '4x_Left - New view.png', '4x_add sticker as decoration to the suitcase (1).png', '4x_make every detail more realistic, make the green sofa in light yellow (1)(1).png', '4x_make every detail more realistic, make the green sofa in light yellow (1).png', '4x_make every detail of the suitcase more realistic, use the detail of@2 as reference.png', '4x_place the red circled design in a empty room, use@2 as reference拷貝(1).png', '4x_place the red circled design in a empty room, use@2 as reference拷貝.png'] },
  { name: 'YO YO Cable Arranger', firstImage: '2x_merge this @2 with@1 , fully apply the form design of@1 (1).png', images: ['2x_merge this @2 with@1 , fully apply the form design of@1 (1).png', '4x_make the 3d printed material more realistic, it_s printed in Y axis, enhance the contrast (1).png', '4x_merge this @2 with@1 , apply the form design of@2.png', '4x_merge this @2 with@1 , create a portable wire arrange tool with the material and design of @2  , use the background color of @3 , textile wire.png', '4x_merge this @2 with@1 , fully apply the form design of@1.png'] },
];
const TICKER_BASE = 'assets/Ticker/';
const TICKER_IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp)$/i;
const TICKER_REF_IMAGES = 5; // Nodes image count; duration scales so all folders scroll at same px/s
function tickerImageUrl(folderName, filename, refreshTs) {
  const path = TICKER_BASE + folderName + '/' + filename;
  const encoded = path.replace(/ /g, '%20').replace(/@/g, '%40').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/,/g, '%2C').replace(/#/g, '%23').replace(/\?/g, '%3F').replace(/&/g, '%26');
  const url = ASSET_BASE + encoded;
  return refreshTs != null ? url + (url.includes('?') ? '&' : '?') + '_=' + refreshTs : url;
}
function tickerImagesOnly(images) {
  return images.filter((f) => TICKER_IMAGE_EXT.test(f));
}
// Base path for assets so they load on GitHub Pages (e.g. /portfolio/) and locally
(function () {
  const p = window.location.pathname;
  const base = p.match(/^\/[^/]+\/?$/) ? p.replace(/\/$/, '') + '/' : (p.endsWith('/') ? p : p.split('/').slice(0, -1).join('/') + '/');
  window.__ASSET_BASE__ = base === '/' ? '' : base;
})();
const ASSET_BASE = window.__ASSET_BASE__ || '';
const PADDING = 20;
const EDGE_BUFFER = 28;
let currentRadius = 44;     // 依視窗計算，使 30 球填滿

// Physics (defaults; overridden by tuning sliders)
const DT = 1 / 60;
const MASS = 1;
const TOUCH_DIST_FACTOR = 1.08;   // 依接觸算鄰居（略大於直徑）
const RING_NEIGHBOR_DIST_FACTOR = 1.65;  // ring includes near balls (not just touching)
const SCALE_LERP_RING = 0.09;    // 周圍延後（neighbor scale-up speed)
const SCALE_LERP_RETURN_MOVING = 0.015;  // 游標移動時縮回更慢
const POINTER_MOVE_THRESHOLD = 1.5;   // px per frame = cursor moving
const SCROLL_THRESHOLD = 80;
const TICKER_SCROLL_IDLE_MS = 0;    // show ticker immediately when in arc mode (no idle delay)
const ARC_SNAP_IDLE_MS = 25;       // snap highlighted ball to vertical center after this long without scroll (0.025s)
const ARC_SNAP_TO_CENTER_MS = 180;   // snappy scroll so highlighted ball is at vertical center
let scrollMode = 0;  // 0 grid, 2 aligned vertical line
let lastUserScrollTime = 0;
let didSnapToCenterThisIdle = false;
let snapScrollRAF = null;
let isProgrammaticScroll = false;

// Tuning: applied settings (control panel removed)
const tuning = {
  ballSize: 1.4,
  snapback: 1.01,
  hoverScale: 1.35,
  spring: 22,
  damping: 0.91,
  gridShrink: 0.5,
  scaleUp: 0.22,
  scaleReturn: 0.041,
  repel: 1.1,
  overlapIter: 10,
  pullLerp: 0.061,
  polarRings: 9,
  polarDensity: 0.95,
  minDotsPerRing: 6,
  ogDistance: 3,
};

let bubbleAreaEl;
let bubbles = [];
let hoveredBubble = null;
let pointerX = 0;
let pointerY = 0;
let prevPointerX = 0;
let prevPointerY = 0;
let pointerActive = false;
let arcTickerPanel = null;
let carouselViewport = null;
let arcTickerTrack = null;  // carousel track (for visibility check)
let lastTickerFolderIndex = -1;
let arcTickerSettledSince = 0;
const ARC_TICKER_SETTLE_MS = 120;
const ARC_TICKER_PCT_SETTLED = 0.5;
const ARC_TICKER_SETTLE_SPEED = 0.4;
const ARC_TICKER_SETTLE_DIST = 10;

const TICKER_FADE_MS = 520;

// Carousel state (infinite, draggable)
let carouselIndex = 0;
let carouselN = 0;
let carouselCardWidthPx = 0;
let carouselDragStartX = 0;
let carouselDragStartOffset = 0;
let carouselIsDragging = false;
const CAROUSEL_AUTOPLAY_MS = 1500;
const CAROUSEL_RESUME_AFTER_CLICK_MS = 4000;
let carouselAutoplayId = null;
let carouselResumeTimeoutId = null;
let carouselBtnPrev = null;
let carouselBtnNext = null;

let carouselPosition = 0;  // visual position 0..n (n = clone of first for seamless loop right)

function applyCarouselOffset(offsetPx, noTransition) {
  if (!arcTickerTrack) return;
  arcTickerTrack.style.transition = (noTransition || carouselIsDragging) ? 'none' : 'transform 0.35s ease-out';
  arcTickerTrack.style.transform = `translateX(${offsetPx}px)`;
}

function triggerCarouselCardFadeIn(opts) {
  if (!arcTickerTrack || carouselN <= 0) return;
  const slow = opts && opts.slow;
  const fromPosition = opts && opts.fromPosition;
  const cards = arcTickerTrack.querySelectorAll('.carousel-card');
  cards.forEach((el) => {
    el.classList.remove('carousel-card-fade-in', 'carousel-card-fade-in-slow', 'carousel-card-fade-out', 'carousel-card-fade-out-slow');
  });
  const durationMs = slow ? 1450 : 380;
  // Fade out the current (old) card so we transition to the next
  if (fromPosition != null) {
    const oldCard = arcTickerTrack.children[fromPosition];
    if (oldCard && oldCard.classList.contains('carousel-card')) {
      oldCard.classList.add(slow ? 'carousel-card-fade-out-slow' : 'carousel-card-fade-out');
      const oldImg = oldCard.querySelector('img');
      const removeOld = () => {
        oldCard.classList.remove('carousel-card-fade-out', 'carousel-card-fade-out-slow');
        if (oldImg) oldImg.removeEventListener('animationend', removeOld);
      };
      if (oldImg) oldImg.addEventListener('animationend', removeOld, { once: true });
      else setTimeout(removeOld, durationMs);
    }
  }
  // Fade in the next (new) card
  const visible = arcTickerTrack.children[carouselPosition];
  if (visible && visible.classList.contains('carousel-card')) {
    visible.classList.add(slow ? 'carousel-card-fade-in-slow' : 'carousel-card-fade-in');
    const img = visible.querySelector('img');
    const removeClass = () => {
      visible.classList.remove('carousel-card-fade-in', 'carousel-card-fade-in-slow');
      if (img) img.removeEventListener('animationend', removeClass);
    };
    if (img) img.addEventListener('animationend', removeClass, { once: true });
    else setTimeout(removeClass, durationMs);
  }
}

function carouselGoToSlide(index) {
  if (carouselN <= 0) return;
  const n = carouselN;
  const wrapped = ((index % n) + n) % n;
  // Track layout: [clone(last), card0, ..., card(n-1), clone(first)]. Position 0 = clone last, 1..n = real 0..n-1, n+1 = clone first.
  // Going "next" from last: animate to position n+1 (clone first), then reset to position 1
  if (index >= n && carouselPosition === n) {
    carouselPosition = n + 1;
    carouselIndex = n - 1;
    applyCarouselOffset(-carouselPosition * carouselCardWidthPx, false);
    const onEnd = () => {
      arcTickerTrack.removeEventListener('transitionend', onEnd);
      carouselPosition = 1;
      carouselIndex = 0;
      arcTickerTrack.style.transition = 'none';
      arcTickerTrack.style.transform = `translateX(${-1 * carouselCardWidthPx}px)`;
      void arcTickerTrack.offsetHeight; // force reflow so reset paints without extra frame
      updateCarouselButtonIconColor();
      // No fade here: we jumped to same image (real first = clone first), fade would look like current re-fading
    };
    arcTickerTrack.addEventListener('transitionend', onEnd);
    return;
  }
  // Going "prev" from first: animate to position 0 (clone last), then reset to position n
  if (index < 0 && carouselPosition === 1) {
    carouselPosition = 0;
    carouselIndex = 0;
    applyCarouselOffset(0, false);
    const onEnd = () => {
      arcTickerTrack.removeEventListener('transitionend', onEnd);
      carouselPosition = n;
      carouselIndex = n - 1;
      arcTickerTrack.style.transition = 'none';
      arcTickerTrack.style.transform = `translateX(${-n * carouselCardWidthPx}px)`;
      void arcTickerTrack.offsetHeight; // force reflow so reset paints without extra frame
      updateCarouselButtonIconColor();
      // No fade here: we jumped to same image (real last = clone last)
    };
    arcTickerTrack.addEventListener('transitionend', onEnd);
    return;
  }
  // If we're on a clone, reset to the real card first (instant)
  if (carouselPosition === 0) {
    carouselPosition = n;
    carouselIndex = n - 1;
    applyCarouselOffset(-n * carouselCardWidthPx, true);
  }
  if (carouselPosition === n + 1) {
    carouselPosition = 1;
    carouselIndex = 0;
    applyCarouselOffset(-1 * carouselCardWidthPx, true);
  }
  const fromPos = carouselPosition;
  carouselIndex = wrapped;
  carouselPosition = wrapped + 1;  // position 1 = logical 0
  applyCarouselOffset(-carouselPosition * carouselCardWidthPx);
  requestAnimationFrame(() => {
    updateCarouselButtonIconColor();
    triggerCarouselCardFadeIn({ fromPosition: fromPos });
  });
}

function carouselStartAutoplay() {
  if (carouselAutoplayId) clearInterval(carouselAutoplayId);
  carouselAutoplayId = setInterval(() => carouselGoToSlide(carouselIndex + 1), CAROUSEL_AUTOPLAY_MS);
}

function carouselOnControlClick() {
  if (carouselResumeTimeoutId) clearTimeout(carouselResumeTimeoutId);
  if (carouselAutoplayId) clearInterval(carouselAutoplayId);
  carouselAutoplayId = null;
  carouselResumeTimeoutId = setTimeout(() => {
    carouselResumeTimeoutId = null;
    carouselStartAutoplay();
  }, CAROUSEL_RESUME_AFTER_CLICK_MS);
}

function sampleLuminance(img, leftFraction, rightFraction) {
  if (!img || !img.complete || img.naturalWidth === 0) return { left: 255, right: 255 };
  try {
    const c = document.createElement('canvas');
    const w = Math.min(100, img.naturalWidth);
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return { left: 255, right: 255 };
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const leftStrip = Math.max(1, Math.floor(w * (leftFraction || 0.15)));
    const rightStrip = Math.max(1, Math.floor(w * (rightFraction || 0.15)));
    let leftSum = 0, rightSum = 0, leftCount = 0, rightCount = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < leftStrip; x++) {
        const i = (y * w + x) * 4;
        leftSum += 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
        leftCount++;
      }
      for (let x = w - rightStrip; x < w; x++) {
        const i = (y * w + x) * 4;
        rightSum += 0.299 * data.data[i] + 0.587 * data.data[i + 1] + 0.114 * data.data[i + 2];
        rightCount++;
      }
    }
  return {
      left: leftCount ? leftSum / leftCount : 255,
      right: rightCount ? rightSum / rightCount : 255
    };
  } catch (e) {
    return { left: 255, right: 255 };
  }
}

function updateCarouselButtonIconColor() {
  if (!carouselBtnPrev || !carouselBtnNext || !arcTickerTrack || carouselN <= 0) return;
  const card = arcTickerTrack.children[carouselPosition];
  const img = card ? card.querySelector('img') : null;
  const lum = sampleLuminance(img, 0.15, 0.15);
  const darkThreshold = 140;
  carouselBtnPrev.classList.toggle('dark-bg', lum.left < darkThreshold);
  carouselBtnNext.classList.toggle('dark-bg', lum.right < darkThreshold);
}

function setTickerContent(folderIndex) {
  if (!arcTickerTrack || !carouselViewport || folderIndex < 0 || folderIndex >= TICKER_FOLDERS.length) return;
  const folder = TICKER_FOLDERS[folderIndex];
  if (!folder || !folder.images.length) return;
  const images = tickerImagesOnly(folder.images);
  if (!images.length) return;
  const n = images.length;
  const hasExisting = arcTickerTrack.children.length > 0;

  function buildContent() {
    arcTickerTrack.innerHTML = '';
    arcTickerTrack.classList.remove('is-dragging');
    carouselIsDragging = false;
    const refreshTs = Date.now(); // cache-bust so images reload on each build
    const viewportWidth = carouselViewport.offsetWidth || 400;
    carouselCardWidthPx = Math.floor(viewportWidth); // integer px to avoid right-edge sub-pixel flicker
    carouselN = n;
    carouselIndex = 0;
    carouselPosition = 1;  // position 1 = first real card (track[1])
    const totalCards = n + 2;  // + clone of last at start, + clone of first at end
    arcTickerTrack.style.width = `${totalCards * carouselCardWidthPx}px`;
    arcTickerTrack.style.transform = `translateX(${-carouselCardWidthPx}px)`;  // show position 1 (first card)
    arcTickerTrack.style.transition = 'transform 0.35s ease-out';

    // Clone of LAST at start so "prev" from first animates left to clone, then we reset (no right jump)
    const lastFilename = images[n - 1];
    const cloneLastCard = document.createElement('div');
    cloneLastCard.className = 'carousel-card';
    cloneLastCard.style.width = `${carouselCardWidthPx}px`;
    const imgLast = document.createElement('img');
    imgLast.src = tickerImageUrl(folder.name, lastFilename, refreshTs);
    imgLast.alt = '';
    imgLast.decoding = 'async';
    cloneLastCard.appendChild(imgLast);
    arcTickerTrack.appendChild(cloneLastCard);

    images.forEach((filename, i) => {
      const card = document.createElement('div');
      card.className = 'carousel-card';
      card.style.width = `${carouselCardWidthPx}px`;
      const img = document.createElement('img');
      img.src = tickerImageUrl(folder.name, filename, refreshTs);
      img.alt = '';
      img.decoding = 'async';
      img.loading = i < 3 ? 'eager' : 'lazy';
      card.appendChild(img);
      arcTickerTrack.appendChild(card);
    });
    // Clone first card at end so "next" from last animates right to clone, then we reset (no left jump)
    const firstCard = arcTickerTrack.children[1];
    if (firstCard) {
      const clone = firstCard.cloneNode(true);
      arcTickerTrack.appendChild(clone);
    }
    requestAnimationFrame(() => triggerCarouselCardFadeIn());

    // Drag
    function onPointerDown(e) {
      if (e.button !== 0 && e.type === 'mousedown') return;
      carouselIsDragging = true;
      carouselDragStartX = e.clientX;
      const tx = arcTickerTrack.style.transform;
      const match = /translateX\(([-\d.]+)px\)/.exec(tx);
      carouselDragStartOffset = match ? parseFloat(match[1]) : -carouselPosition * carouselCardWidthPx;
      arcTickerTrack.classList.add('is-dragging');
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!carouselIsDragging) return;
      const dx = e.clientX - carouselDragStartX;
      applyCarouselOffset(carouselDragStartOffset + dx);
    }
    function onPointerUp() {
      if (!carouselIsDragging) return;
      carouselIsDragging = false;
      arcTickerTrack.classList.remove('is-dragging');
      const fromPos = carouselPosition;
      const tx = arcTickerTrack.style.transform;
      const match = /translateX\(([-\d.]+)px\)/.exec(tx);
      const currentOffset = match ? parseFloat(match[1]) : 0;
      const nearest = Math.round(-currentOffset / carouselCardWidthPx);
      if (nearest === 0) {
        carouselPosition = carouselN;
        carouselIndex = carouselN - 1;
        applyCarouselOffset(-carouselN * carouselCardWidthPx, true);
      } else if (nearest === carouselN + 1) {
        carouselPosition = 1;
        carouselIndex = 0;
        applyCarouselOffset(-1 * carouselCardWidthPx, true);
      } else {
        const pos = Math.max(1, Math.min(carouselN, nearest));
        carouselIndex = pos - 1;
        carouselPosition = pos;
        applyCarouselOffset(-carouselPosition * carouselCardWidthPx);
      }
      updateCarouselButtonIconColor();
      triggerCarouselCardFadeIn({ fromPosition: fromPos });
      carouselOnControlClick();
    }
    arcTickerTrack.onpointerdown = onPointerDown;
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    arcTickerTrack._carouselCleanup = () => {
      if (carouselAutoplayId) clearInterval(carouselAutoplayId);
      carouselAutoplayId = null;
      if (carouselResumeTimeoutId) clearTimeout(carouselResumeTimeoutId);
      carouselResumeTimeoutId = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      arcTickerTrack.onpointerdown = null;
    };
    carouselStartAutoplay();
    setTimeout(updateCarouselButtonIconColor, 350);
  }

  if (hasExisting && arcTickerTrack._carouselCleanup) {
    arcTickerTrack._carouselCleanup();
    arcTickerPanel.style.opacity = '0';
    arcTickerPanel.style.transition = `opacity ${TICKER_FADE_MS}ms ease`;
    setTimeout(() => {
      buildContent();
      requestAnimationFrame(() => {
        arcTickerPanel.style.opacity = '';
        arcTickerPanel.style.transition = '';
      });
    }, TICKER_FADE_MS);
  } else {
    buildContent();
  }
}

function snapArcBallToCenter(highlightedBubble) {
  if (!bubbleAreaEl || !highlightedBubble || snapScrollRAF) return;
  const targetScrollY = bubbleAreaEl.offsetTop + highlightedBubble.restY - window.innerHeight / 2;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clamped = Math.max(0, Math.min(maxScroll, targetScrollY));
  const startY = window.scrollY;
  const dist = clamped - startY;
  if (Math.abs(dist) < 2) return;
  isProgrammaticScroll = true;
  const startTime = performance.now();
  const duration = ARC_SNAP_TO_CENTER_MS;
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - (1 - t) * (1 - t);  // easeOutQuad
    window.scrollTo(0, startY + dist * ease);
    if (t < 1) {
      snapScrollRAF = requestAnimationFrame(tick);
    } else {
      snapScrollRAF = null;
      isProgrammaticScroll = false;
    }
  }
  snapScrollRAF = requestAnimationFrame(tick);
}

function init() {
  if (typeof history !== 'undefined' && history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  bubbleAreaEl = document.getElementById('bubbleArea');

  buildHexBubbles();
  requestAnimationFrame(buildHexBubbles);

  // Decode bubble images in idle time so main thread stays responsive
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  idle(() => {
    TICKER_FOLDERS.forEach((folder) => {
      if (!folder || !folder.firstImage) return;
      const img = new Image();
      img.src = tickerImageUrl(folder.name, folder.firstImage);
      if (img.decode) img.decode().catch(() => {});
    });
  });

  window.addEventListener('resize', onResize);

  // Right-half panel: draggable infinite carousel with prev/next buttons
  arcTickerPanel = document.createElement('div');
  arcTickerPanel.className = 'arc-ticker-panel';
  arcTickerPanel.setAttribute('aria-hidden', 'true');
  carouselViewport = document.createElement('div');
  carouselViewport.className = 'carousel-viewport';
  arcTickerTrack = document.createElement('div');
  arcTickerTrack.className = 'carousel-track';
  carouselViewport.appendChild(arcTickerTrack);
  arcTickerPanel.appendChild(carouselViewport);

  carouselBtnPrev = document.createElement('button');
  carouselBtnPrev.type = 'button';
  carouselBtnPrev.className = 'carousel-nav carousel-nav-prev';
  carouselBtnPrev.setAttribute('aria-label', 'Previous');
  carouselBtnPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
  carouselBtnPrev.onclick = () => { carouselGoToSlide(carouselIndex - 1); carouselOnControlClick(); };
  carouselBtnNext = document.createElement('button');
  carouselBtnNext.type = 'button';
  carouselBtnNext.className = 'carousel-nav carousel-nav-next';
  carouselBtnNext.setAttribute('aria-label', 'Next');
  carouselBtnNext.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
  carouselBtnNext.onclick = () => { carouselGoToSlide(carouselIndex + 1); carouselOnControlClick(); };
  arcTickerPanel.appendChild(carouselBtnPrev);
  arcTickerPanel.appendChild(carouselBtnNext);

  new ResizeObserver(() => {
    if (carouselN > 0 && carouselViewport && arcTickerTrack.children.length) {
      const w = Math.floor(carouselViewport.offsetWidth || 400);
      carouselCardWidthPx = w;
      arcTickerTrack.style.width = `${(carouselN + 2) * w}px`;
      arcTickerTrack.querySelectorAll('.carousel-card').forEach((el) => { el.style.width = `${w}px`; });
      applyCarouselOffset(-carouselPosition * w, true);
    }
  }).observe(carouselViewport);

  document.body.appendChild(arcTickerPanel);

  bubbleAreaEl.addEventListener('pointermove', (e) => {
    pointerActive = true;
    const rect = bubbleAreaEl.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
  });
  bubbleAreaEl.addEventListener('pointerleave', () => { pointerActive = false; });
  bubbleAreaEl.addEventListener('pointerenter', (e) => {
    pointerActive = true;
    const rect = bubbleAreaEl.getBoundingClientRect();
    pointerX = e.clientX - rect.left;
    pointerY = e.clientY - rect.top;
  });

  window.addEventListener('scroll', () => {
    if (isProgrammaticScroll) return;
    lastUserScrollTime = performance.now();
    didSnapToCenterThisIdle = false;
    if (snapScrollRAF) cancelAnimationFrame(snapScrollRAF);
    snapScrollRAF = null;
    if (arcTickerPanel) arcTickerPanel.classList.remove('is-visible');
    if (window.scrollY <= SCROLL_THRESHOLD) {
      const fromArc = scrollMode === 2;
      scrollMode = 0;
      bubbleAreaEl.style.minHeight = '';  // reset so grid uses CSS 120vh
      const rect = bubbleAreaEl.getBoundingClientRect();
      updateRestPositions(rect.width || window.innerWidth, getLayoutHeight(), fromArc);
    } else {
      if (scrollMode !== 2) {
        scrollMode = 2;
        updateRestToVerticalLine();
      }
    }
  }, { passive: true });

  physicsLoop();
}

// Polar grid layout: step derived from num rings and available radius
function getCircleLayout(areaWidth, areaHeight) {
  const w = areaWidth - PADDING * 2 - EDGE_BUFFER * 2;
  const h = areaHeight - PADDING * 2 - EDGE_BUFFER * 2;
  const maxRadius = Math.min(w, h) / 2 - 20;
  const numRings = Math.max(1, Math.min(25, Math.round(tuning.polarRings)));
  if (w <= 0 || h <= 0) {
    return { step: 48, currentRadius: 24, viewCenterX: areaWidth / 2, viewCenterY: areaHeight / 2 };
  }
  let step = maxRadius / Math.max(1, numRings);
  step *= Math.max(0.2, Math.min(3, tuning.ogDistance));
  step = Math.max(18, Math.min(120, step));
  const currentRadius = step * 0.48;
  const viewCenterX = (areaWidth - PADDING * 2 - EDGE_BUFFER * 2) / 2 + PADDING + EDGE_BUFFER;
  const viewCenterY = (areaHeight - PADDING * 2 - EDGE_BUFFER * 2) / 2 + PADDING + EDGE_BUFFER;
  return { step, currentRadius, viewCenterX, viewCenterY };
}

function circlePosition30(i, step, viewCenterX, viewCenterY, cols, rows) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const gridCenterCol = (cols - 1) / 2;
  const gridCenterRow = (rows - 1) / 2;
  const x = viewCenterX + (col - gridCenterCol) * step + (row % 2) * (step / 2);
  const y = viewCenterY + (row - gridCenterRow) * step * HEX_VERT_RATIO;
  return { x, y };
}

// Polar grid: concentric circles, one central dot, dots per ring increase to keep density even (speaker grille style)
// Don't cull dots when og distance increases: ensure at least NUM_CIRCLES points by not over-limiting numRings
function computePolarGridPoints(step, viewCenterX, viewCenterY, areaWidth, areaHeight) {
  const maxRadius = Math.min(areaWidth, areaHeight) / 2 - PADDING - EDGE_BUFFER - step * 2;
  let numRings = Math.min(
    Math.max(1, Math.floor(maxRadius / step)),
    Math.max(1, Math.round(tuning.polarRings))
  );
  const minDots = Math.max(4, Math.min(24, Math.round(tuning.minDotsPerRing)));
  const density = Math.max(0.3, Math.min(2.5, tuning.polarDensity));
  // Ensure enough rings for NUM_CIRCLES (1 center + ring dots); avoid culling when og distance changes
  const maxRingsByTuning = Math.max(1, Math.round(tuning.polarRings));
  let n = 1;
  let r = 1;
  while (n < NUM_CIRCLES && r <= maxRingsByTuning) {
    const circumference = 2 * Math.PI * r * step;
    n += Math.max(minDots, Math.round((circumference / step) * density));
    r++;
  }
  numRings = Math.max(numRings, Math.min(r - 1, maxRingsByTuning));
  const pts = [];
  pts.push({ x: viewCenterX, y: viewCenterY });
  for (let ring = 1; ring <= numRings; ring++) {
    const r = ring * step;
    const circumference = 2 * Math.PI * r;
    const numDots = Math.max(minDots, Math.round((circumference / step) * density));
    for (let i = 0; i < numDots; i++) {
      const angle = (2 * Math.PI * i) / numDots;
      pts.push({
        x: viewCenterX + r * Math.cos(angle),
        y: viewCenterY + r * Math.sin(angle),
      });
    }
  }
  return pts;
}

// Grid sits in first viewport; floor for scatter is bottom of full scroll area
function getLayoutHeight() {
  return Math.min(bubbleAreaEl ? bubbleAreaEl.getBoundingClientRect().height : window.innerHeight, window.innerHeight);
}

function buildHexBubbles() {
  if (!bubbleAreaEl) return;
  const rect = bubbleAreaEl.getBoundingClientRect();
  const w = rect.width || window.innerWidth;
  const h = getLayoutHeight();
  const layout = getCircleLayout(w, h);
  currentRadius = layout.currentRadius * tuning.ballSize;
  const { step, viewCenterX, viewCenterY } = layout;
  const w2 = rect.width || window.innerWidth;
  const h2 = getLayoutHeight();
  layoutPoints = computePolarGridPoints(step, viewCenterX, viewCenterY, w2, h2).slice(0, NUM_CIRCLES);
  layoutPoints.sort((a, b) => a.y - b.y);  // top-to-bottom order = bubble index order for shortest transition to arc
  const totalBubbles = getTotalBubbles();

  const current = bubbles.length;

  if (current >= totalBubbles) {
    if (current > totalBubbles) {
      const toRemove = bubbles.splice(totalBubbles);
      toRemove.forEach((b) => b.el.remove());
      if (hoveredBubble && !bubbleAreaEl.contains(hoveredBubble.el)) hoveredBubble = null;
    }
    updateRestPositions(w, h);
    return;
  }

  for (let i = current; i < totalBubbles; i++) {
    const { x, y } = layoutPoints[i];
    const project = PROJECTS[i % PROJECTS.length];
    const data = {
      project,
      restX: x,
      restY: y,
      x,
      y,
      vx: 0,
      vy: 0,
      scale: 1,
      targetScale: 1,
      el: null,
    };
    data.el = createBubbleEl(project, data, i);
    bubbleAreaEl.appendChild(data.el);
    bubbles.push(data);
  }
}

function updateRestPositions(areaWidth, areaHeight, fromArc) {
  const layout = getCircleLayout(areaWidth, areaHeight);
  currentRadius = layout.currentRadius * tuning.ballSize;
  const { step, viewCenterX, viewCenterY } = layout;
  layoutPoints = computePolarGridPoints(step, viewCenterX, viewCenterY, areaWidth, areaHeight).slice(0, NUM_CIRCLES);
  layoutPoints.sort((a, b) => a.y - b.y);  // top-to-bottom = same order as arc for shortest transition
  const totalBubbles = getTotalBubbles();
  if (fromArc && bubbles.length > 0) {
    const sortedByArcY = bubbles.map((_, i) => i).sort((a, b) => bubbles[a].restY - bubbles[b].restY);
    const gridPointsByY = layoutPoints.map((p, i) => ({ ...p, i })).sort((a, b) => a.y - b.y);
    bubbles.forEach((b, i) => {
      if (i >= totalBubbles) return;
      const arcRank = sortedByArcY.indexOf(i);
      const pt = gridPointsByY[arcRank];
      if (pt) {
        b.restX = pt.x;
        b.restY = pt.y;
      }
    });
  } else {
    bubbles.forEach((b, i) => {
      if (i >= totalBubbles) return;
      const { x, y } = layoutPoints[i];
      b.restX = x;
      b.restY = y;
    });
  }
  const size = currentRadius * 2;
  bubbles.forEach((b) => {
    b.el.style.width = `${size}px`;
    b.el.style.height = `${size}px`;
    const inner = b.el.querySelector('.vita-bubble');
    if (inner) {
      inner.style.width = `${size}px`;
      inner.style.height = `${size}px`;
    }
  });
}

// Offset so the top circle is fully visible below the header/name
const VERTICAL_LINE_TOP_OFFSET = 320;
// Horizontal offset for vertical line: negative = left
const VERTICAL_LINE_X_OFFSET = -450;

// Align all circles along an R2000 arc; assign arc slots by grid Y-order so transition settles faster
const VERTICAL_LINE_ARC_RADIUS = 15000;
const VERTICAL_LINE_SPACING = 1.35;
const VERTICAL_LINE_BOTTOM_PADDING = 0;
function updateRestToVerticalLine() {
  const n = bubbles.length;
  if (n === 0) return;
  const refX = bubbles[0].restX + VERTICAL_LINE_X_OFFSET;
  const spacing = 2 * currentRadius * VERTICAL_LINE_SPACING;
  const innerH = window.innerHeight;
  const firstBallY = window.scrollY + innerH / 2;
  const lineHeightPx = firstBallY + (n - 1) * spacing + innerH / 2 + VERTICAL_LINE_BOTTOM_PADDING;
  bubbleAreaEl.style.minHeight = `${lineHeightPx}px`;

  const R = VERTICAL_LINE_ARC_RADIUS;
  const arcSpanY = (n - 1) * spacing;
  const angleSpan = n > 1 ? arcSpanY / R : 0;
  const cy = firstBallY + arcSpanY / 2;
  const cx = refX - R;

  // Arc order = project list order (bubble index 0 at top, 1 next, …) so balls match the image list
  const arcSlot = new Int32Array(n);
  for (let i = 0; i < n; i++) arcSlot[i] = i;

  const arcX = [];
  const arcY = [];
  for (let j = 0; j < n; j++) {
    const theta = n > 1 ? -angleSpan / 2 + (angleSpan * j / (n - 1)) : 0;
    arcX[j] = cx + R * Math.cos(theta);
    arcY[j] = cy + R * Math.sin(theta);
  }

  bubbles.forEach((b, i) => {
    const j = arcSlot[i];
    b.restX = arcX[j];
    b.restY = arcY[j];
    b.vx = 0;
    b.vy = 0;
  });
}

function createBubbleEl(project, data, bubbleIndex) {
  const folder = TICKER_FOLDERS[bubbleIndex];
  const wrap = document.createElement('div');
  wrap.className = 'vita-bubble-wrap';
  wrap.style.width = `${currentRadius * 2}px`;
  wrap.style.height = `${currentRadius * 2}px`;

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'vita-bubble';
  el.setAttribute('aria-label', folder ? folder.name : project.title);
  el.style.width = `${currentRadius * 2}px`;
  el.style.height = `${currentRadius * 2}px`;

  const img = document.createElement('span');
  img.className = 'vita-bubble-img';
  const ballSrc = folder ? tickerImageUrl(folder.name, folder.firstImage) : (ASSET_BASE + 'assets/nodes/BLN5kztPlBeUb3sG0DYqC65Kqs.png');
  img.style.backgroundImage = `url("${String(ballSrc).replace(/"/g, '%22')}")`;
  el.appendChild(img);

  const hitArea = document.createElement('span');
  hitArea.className = 'vita-bubble-hit';
  hitArea.setAttribute('aria-hidden', 'true');
  el.appendChild(hitArea);

  const label = document.createElement('span');
  label.className = 'vita-bubble-label';
  label.textContent = folder ? folder.name : (project.titleEn || project.title);

  wrap.appendChild(el);
  wrap.appendChild(label);

  hitArea.addEventListener('mouseenter', () => setHovered(data));
  hitArea.addEventListener('mouseleave', () => setHovered(null));
  hitArea.addEventListener('click', (e) => {
    if (scrollMode === 2 && wrap) {
    e.preventDefault();
      wrap.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  });

  return wrap;
}

function setHovered(bubbleData) {
  hoveredBubble = bubbleData;
}

function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// 依「接觸」做 BFS：第 0 圈 = hovered，往外多圈，遠的球縮更小留空間
const MAX_RING = 6;
function getRingIndices() {
  const n = bubbles.length;
  const ring = new Int32Array(n).fill(-1);
  if (!hoveredBubble) return ring;
  const hoverIdx = bubbles.indexOf(hoveredBubble);
  if (hoverIdx < 0) return ring;
  ring[hoverIdx] = 0;
  const queue = [hoverIdx];
  let head = 0;
  while (head < queue.length) {
    const i = queue[head++];
    const ri = ring[i];
    if (ri >= MAX_RING) continue;
    const ax = bubbles[i].restX;
    const ay = bubbles[i].restY;
    for (let j = 0; j < n; j++) {
      if (ring[j] >= 0) continue;
      const d = dist(ax, ay, bubbles[j].restX, bubbles[j].restY);
      if (d <= currentRadius * 2 * RING_NEIGHBOR_DIST_FACTOR) {
        ring[j] = ri + 1;
        queue.push(j);
      }
    }
  }
  return ring;
}

function physicsLoop() {
  const n = bubbles.length;
  const areaRect = bubbleAreaEl.getBoundingClientRect();

  // Aligned vertical line: no scaling. Grid: scale by distance to cursor when cursor is near (pointer in area)
  bubbleAreaEl.classList.toggle('vita-aligned-line', scrollMode === 2);
  // Tighter falloff = less sensitive before hover (react only when cursor is closer)
  const falloffDist = currentRadius * 2 * 1.35;
  const falloffPower = 1.6;  // >1 = steeper curve, less reaction at medium distance
  bubbles.forEach((b, i) => {
    if (scrollMode === 2) {
      b.targetScale = 1;
    } else if (!pointerActive) {
      b.targetScale = 1;  // cursor left area: all normal size
    } else {
      const d = dist(b.restX, b.restY, pointerX, pointerY);
      const t = Math.min(1, Math.pow(d / falloffDist, falloffPower));
      const floor = Math.max(-5, Math.min(5, tuning.gridShrink));
      b.targetScale = tuning.hoverScale + (floor - tuning.hoverScale) * t;
      b.targetScale = Math.max(-5, Math.min(5, b.targetScale));
    }
  });

  // Arc mode: don't move hovered ball to cursor (spring/pull/overlap all use rest for it)
  const followCursor = hoveredBubble && scrollMode !== 2;

  // Forces: spring to rest + repulsion
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  const kRest = (scrollMode === 2 ? tuning.spring * 0.58 : tuning.spring) * tuning.snapback;

  for (let i = 0; i < n; i++) {
    const a = bubbles[i];
    const rA = currentRadius * Math.abs(a.scale);
    // Hovered ball snaps to cursor (grid only); others snap to rest
    const targetX = (a === hoveredBubble && followCursor) ? pointerX : a.restX;
    const targetY = (a === hoveredBubble && followCursor) ? pointerY : a.restY;
    fx[i] = kRest * (targetX - a.x);
    fy[i] = kRest * (targetY - a.y);

    for (let j = i + 1; j < n; j++) {
      const b = bubbles[j];
      const rB = currentRadius * Math.abs(b.scale);
      const d = dist(a.x, a.y, b.x, b.y);
      const minD = rA + rB;
      if (d < minD && d > 1e-6) {
        const overlap = minD - d;
        const nx = (a.x - b.x) / d;
        const ny = (a.y - b.y) / d;
        const f = tuning.repel * overlap;
        fx[i] += nx * f;
        fy[i] += ny * f;
        fx[j] -= nx * f;
        fy[j] -= ny * f;
      }
    }
  }

  // Integrate: a = F/m, v += a*dt, x += v*dt, damping
  bubbles.forEach((b, i) => {
    b.vx += (fx[i] / MASS) * DT;
    b.vy += (fy[i] / MASS) * DT;
    b.x += b.vx * DT;
    b.y += b.vy * DT;
    b.vx *= tuning.damping;
    b.vy *= tuning.damping;
  });

  // Grid mode: no hard pin so balls can ease back naturally; hovered stays at rest later
  // (removed: pin all to rest here — let spring + pullLerp do a slower, natural snap)

  // Pull: hovered ball toward cursor, others toward rest (in arc mode don't pull hovered at all)
  const SNAP_RADIUS = 2;
  const SNAP_SPEED = 0.8;
  const basePullLerp = scrollMode === 2 ? 0.078 : tuning.pullLerp;
  const pullLerp = basePullLerp * tuning.snapback;
  bubbles.forEach((b) => {
    if (scrollMode === 2 && b === hoveredBubble) return;
    const targetX = b === hoveredBubble ? pointerX : b.restX;
    const targetY = b === hoveredBubble ? pointerY : b.restY;
    b.x += (targetX - b.x) * pullLerp;
    b.y += (targetY - b.y) * pullLerp;
    b.vx *= 0.94;
    b.vy *= 0.94;
    if (b !== hoveredBubble) {
      const dx = b.restX - b.x;
      const dy = b.restY - b.y;
      const distToRest = Math.hypot(dx, dy);
      const speed = Math.hypot(b.vx, b.vy);
      if (distToRest < SNAP_RADIUS && speed < SNAP_SPEED) {
        b.x = b.restX;
        b.y = b.restY;
        b.vx = 0;
        b.vy = 0;
      }
    }
  });

  // Scale: in vertical array, larger at vertical center of screen; otherwise hover ring
  bubbles.forEach((b, i) => {
    if (scrollMode === 2) {
      const screenY = areaRect.top + b.y;
      const centerY = window.innerHeight / 2;
      const distFromCenter = Math.abs(screenY - centerY);
      const falloff = 520;
      const centerScale = 0.88;  // arc balls smaller than grid
      const t = Math.max(0, 1 - distFromCenter / falloff);
      const targetScale = 1 + (centerScale - 1) * t;
      const scaleLerp = 0.1;
      b.scale += (targetScale - b.scale) * scaleLerp;
      b.scale = Math.max(0.4, Math.min(1.2, b.scale));
      // Blur label: smooth lerp toward target so text transition is smooth
      const label = b.el.querySelector('.vita-bubble-label');
      if (label) {
        const isHovered = hoveredBubble === b;
        const blurFalloff = 480;
        const maxBlur = 6;
        const blurT = Math.min(1, distFromCenter / blurFalloff);
        let targetBlurPx = isHovered ? 0 : blurT * maxBlur;
        let targetOpacity = isHovered ? 1 : 1 - 0.35 * blurT;
        let targetFontRem = (blurT <= 0.1 || targetOpacity >= 0.9 || isHovered) ? 1.05 : 0.72;
        if (targetOpacity >= 0.9 && !isHovered) {
          targetOpacity = 1;
          targetBlurPx = 0;
          targetFontRem = 1.05;
        }
        const labelLerp = 0.09;  // smooth follow per frame
        if (b.labelOpacity == null) b.labelOpacity = targetOpacity;
        if (b.labelBlurPx == null) b.labelBlurPx = targetBlurPx;
        if (b.labelFontRem == null) b.labelFontRem = targetFontRem;
        b.labelOpacity += (targetOpacity - b.labelOpacity) * labelLerp;
        b.labelBlurPx += (targetBlurPx - b.labelBlurPx) * labelLerp;
        b.labelFontRem += (targetFontRem - b.labelFontRem) * labelLerp;
        label.style.filter = b.labelBlurPx < 0.1 ? 'none' : `blur(${b.labelBlurPx.toFixed(2)}px)`;
        label.style.opacity = String(Math.max(0, Math.min(1, b.labelOpacity)));
        label.style.fontSize = `${b.labelFontRem.toFixed(2)}rem`;
      }
    } else {
      // Same lerp for all (center, rings, grid shrink) so they scale in sync
      const scalingDown = b.targetScale < b.scale;
      const pointerSpeed = Math.hypot(pointerX - prevPointerX, pointerY - prevPointerY);
      const cursorMoving = pointerSpeed > POINTER_MOVE_THRESHOLD;
      const returnLerp = cursorMoving ? SCALE_LERP_RETURN_MOVING : tuning.scaleReturn;
      const scaleLerp = scalingDown ? returnLerp : tuning.scaleUp;
      b.scale += (b.targetScale - b.scale) * scaleLerp;
      b.scale = Math.max(-5, Math.min(5, b.scale));
    }
  });

  // Show ticker only after 90% of balls on the arc are settled
  if (arcTickerPanel && arcTickerTrack) {
    if (scrollMode === 2 && bubbles.length > 0) {
      let settledCount = 0;
      bubbles.forEach((b) => {
        const speed = Math.hypot(b.vx, b.vy);
        const distToRest = Math.hypot(b.x - b.restX, b.y - b.restY);
        if (speed < ARC_TICKER_SETTLE_SPEED && distToRest < ARC_TICKER_SETTLE_DIST) settledCount++;
      });
      const threshold = Math.ceil(bubbles.length * ARC_TICKER_PCT_SETTLED);
      const ninetyPctSettled = settledCount >= threshold;

      const centerY = window.innerHeight / 2;
      let minD = Infinity;
      let highlightedBubble = null;
      bubbles.forEach((b) => {
        const screenY = areaRect.top + b.y;
        const d = Math.abs(screenY - centerY);
        if (d < minD) {
          minD = d;
          highlightedBubble = b;
        }
      });

      const now = performance.now();
      const scrollIdleLongEnough = (now - lastUserScrollTime) >= TICKER_SCROLL_IDLE_MS;
      const snapIdleLongEnough = (now - lastUserScrollTime) >= ARC_SNAP_IDLE_MS;
      if (snapIdleLongEnough && highlightedBubble && !didSnapToCenterThisIdle) {
        snapArcBallToCenter(highlightedBubble);
        didSnapToCenterThisIdle = true;
      }
      if (ninetyPctSettled && highlightedBubble && scrollIdleLongEnough) {
        if (arcTickerSettledSince === 0) arcTickerSettledSince = now;
        const elapsed = now - arcTickerSettledSince;
        if (elapsed >= ARC_TICKER_SETTLE_MS) {
          const folderIndex = bubbles.indexOf(highlightedBubble);
          if (folderIndex !== lastTickerFolderIndex) {
            setTickerContent(folderIndex);
            lastTickerFolderIndex = folderIndex;
          }
          arcTickerPanel.classList.add('is-visible');
        } else {
          arcTickerPanel.classList.remove('is-visible');
        }
      } else {
        arcTickerSettledSince = 0;
        arcTickerPanel.classList.remove('is-visible');
      }
    } else {
      arcTickerSettledSince = 0;
      arcTickerPanel.classList.remove('is-visible');
      lastTickerFolderIndex = -1;
    }
  }
  if (arcTickerPanel) {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const distFromBottom = maxScroll - window.scrollY;
    if (distFromBottom < 320) {
      arcTickerPanel.classList.add('fade-near-footer');
    } else {
      arcTickerPanel.classList.remove('fade-near-footer');
    }
  }

  // Position correction: resolve overlaps; hovered ball fixed (grid only), others get pushed
  function resolveOverlaps() {
    for (let iter = 0; iter < tuning.overlapIter; iter++) {
      for (let i = 0; i < n; i++) {
        const a = bubbles[i];
        const rA = currentRadius * Math.abs(a.scale);
        const aFixed = a === hoveredBubble && followCursor;
        for (let j = i + 1; j < n; j++) {
          const b = bubbles[j];
          const rB = currentRadius * Math.abs(b.scale);
          const d = dist(a.x, a.y, b.x, b.y);
          const minD = rA + rB;
          if (d < minD && d > 1e-6) {
            const overlap = minD - d;
            const nx = (a.x - b.x) / d;
            const ny = (a.y - b.y) / d;
            const bFixed = b === hoveredBubble && followCursor;
            if (aFixed) {
              b.x -= nx * overlap;
              b.y -= ny * overlap;
            } else if (bFixed) {
              a.x += nx * overlap;
              a.y += ny * overlap;
            } else {
              a.x += nx * (overlap * 0.5);
              a.y += ny * (overlap * 0.5);
              b.x -= nx * (overlap * 0.5);
              b.y -= ny * (overlap * 0.5);
            }
          }
        }
      }
    }
  }
  resolveOverlaps();

  // Boundary: keep balls inside screen; aligned line can extend down
  const areaW = areaRect.width || 800;
  const areaH = areaRect.height || 600;
  const edgeL = PADDING + EDGE_BUFFER;
  const edgeR = areaW - PADDING - EDGE_BUFFER;
  const edgeT = PADDING + EDGE_BUFFER;
  const lineBottom = scrollMode === 2
    ? (bubbles[0]?.restY ?? 0) + (n - 1) * 2 * currentRadius * VERTICAL_LINE_SPACING + currentRadius + 50
    : areaH - PADDING - EDGE_BUFFER;
  const edgeB = scrollMode === 2 ? lineBottom : areaH - PADDING - EDGE_BUFFER;
  bubbles.forEach((b) => {
    const r = currentRadius * Math.abs(b.scale);
    b.x = Math.max(edgeL + r, Math.min(edgeR - r, b.x));
    b.y = Math.max(edgeT + r, Math.min(edgeB - r, b.y));
  });

  // Resolve again after boundary clamp so no overlap remains
  resolveOverlaps();

  // Hovered ball follows cursor (no pin to rest); scaling from center via CSS transform-origin

  bubbles.forEach((b) => {
    b.el.style.transform = `translate(${b.x - currentRadius}px, ${b.y - currentRadius}px) scale(${b.scale})`;
    const hit = b.el.querySelector('.vita-bubble-hit');
    if (hit) hit.style.transform = `scale(${1 / b.scale})`;  // hit area stays same visual size
  });

  prevPointerX = pointerX;
  prevPointerY = pointerY;
  requestAnimationFrame(physicsLoop);
}

function onResize() {
  const rect = bubbleAreaEl.getBoundingClientRect();
  const w = rect.width || window.innerWidth;
  const h = getLayoutHeight();

  // Recompute polar grid so counts are correct on resize
  const layout = getCircleLayout(w, h);
  layoutPoints = computePolarGridPoints(layout.step, layout.viewCenterX, layout.viewCenterY, w, h).slice(0, NUM_CIRCLES);
  layoutPoints.sort((a, b) => a.y - b.y);
  const totalBubbles = getTotalBubbles();
  if (bubbles.length < totalBubbles) {
    buildHexBubbles();
  } else if (bubbles.length > totalBubbles) {
    const toRemove = bubbles.splice(totalBubbles);
    toRemove.forEach((b) => b.el.remove());
    if (hoveredBubble && !bubbleAreaEl.contains(hoveredBubble.el)) hoveredBubble = null;
  }
  updateRestPositions(w, h);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
