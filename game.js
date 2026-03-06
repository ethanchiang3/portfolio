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

const BUBBLE_IMAGES = [
  'assets/3A927DB1-F317-47BF-BA00-4A6DF368173B-8a6cc66b-7b25-40d2-a3aa-a3cee59fbba0.png',
  'assets/IMG_1971-fccc0c5e-fd8e-4347-9e93-2e330e4e0d94.png',
  'assets/Gemini_Generated_Image_nv1qcinv1qcinv1q-52ec0671-bbac-444c-a93c-92a9e2c81510.png',
  'assets/2x_use__2_as_art_direction__adjust_the_image_style_of_the_render__remove_the_leaves-baeb956e-a864-4b34-9b66-195a9f4a26f2.png',
  'assets/4x_change_teh_pcb_color_from_green_to_black_________change_the_lens_from_50mm_to_200mm-fd068790-d942-4cb7-a874-b1863f93bb00.png',
  'assets/2x_use_2_as_art_direction__add_motion_blur_but_focus_on_the_Cufflinks-c4814752-a241-4b99-bcbd-dd05872862f3.png',
  'assets/4x_use_the_second_image_as_reference__apply_the_art_direction-6d815c8d-2bb4-4c7c-9966-d74b5c1476c9.png',
];
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
let scrollMode = 0;  // 0 grid, 2 aligned vertical line

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

function init() {
  bubbleAreaEl = document.getElementById('bubbleArea');

  buildHexBubbles();
  requestAnimationFrame(buildHexBubbles);
  window.addEventListener('resize', onResize);

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
    if (window.scrollY <= SCROLL_THRESHOLD) {
      scrollMode = 0;
      bubbleAreaEl.style.minHeight = '';  // reset so grid uses CSS 120vh
      const rect = bubbleAreaEl.getBoundingClientRect();
      updateRestPositions(rect.width || window.innerWidth, getLayoutHeight());
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

function updateRestPositions(areaWidth, areaHeight) {
  const layout = getCircleLayout(areaWidth, areaHeight);
  currentRadius = layout.currentRadius * tuning.ballSize;
  const { step, viewCenterX, viewCenterY } = layout;
  layoutPoints = computePolarGridPoints(step, viewCenterX, viewCenterY, areaWidth, areaHeight).slice(0, NUM_CIRCLES);
  const totalBubbles = getTotalBubbles();
  bubbles.forEach((b, i) => {
    if (i >= totalBubbles) return;
    const { x, y } = layoutPoints[i];
    b.restX = x;
    b.restY = y;
  });
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

// Align all circles to a vertical line; first at viewport vertical center, last at vertical center when scrolled to end
const VERTICAL_LINE_BOTTOM_PADDING = 0;  // 0 = last circle exactly at vertical center at max scroll
function updateRestToVerticalLine() {
  const n = bubbles.length;
  if (n === 0) return;
  const refX = bubbles[0].restX;
  const spacing = 2 * currentRadius * 1.02;
  const innerH = window.innerHeight;
  const firstBallY = window.scrollY + innerH / 2;
  // lineHeightPx so that at max scroll (lineHeightPx - innerH) the last circle is at viewport vertical center
  const lineHeightPx = firstBallY + (n - 1) * spacing + innerH / 2 + VERTICAL_LINE_BOTTOM_PADDING;
  bubbleAreaEl.style.minHeight = `${lineHeightPx}px`;
  bubbles.forEach((b, i) => {
    b.restX = refX;
    b.restY = firstBallY + i * spacing;
    b.vx = 0;
    b.vy = 0;
  });
}

function createBubbleEl(project, data, bubbleIndex) {
  const wrap = document.createElement('div');
  wrap.className = 'vita-bubble-wrap';
  wrap.style.width = `${currentRadius * 2}px`;
  wrap.style.height = `${currentRadius * 2}px`;

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'vita-bubble';
  el.setAttribute('aria-label', project.title);
  el.style.width = `${currentRadius * 2}px`;
  el.style.height = `${currentRadius * 2}px`;

  const img = document.createElement('span');
  img.className = 'vita-bubble-img';
  img.style.backgroundImage = `url(${ASSET_BASE}${BUBBLE_IMAGES[bubbleIndex % BUBBLE_IMAGES.length]})`;
  el.appendChild(img);

  const hitArea = document.createElement('span');
  hitArea.className = 'vita-bubble-hit';
  hitArea.setAttribute('aria-hidden', 'true');
  el.appendChild(hitArea);

  const label = document.createElement('span');
  label.className = 'vita-bubble-label';
  label.textContent = project.titleEn || project.title;

  wrap.appendChild(el);
  wrap.appendChild(label);

  hitArea.addEventListener('mouseenter', () => setHovered(data));
  hitArea.addEventListener('mouseleave', () => setHovered(null));

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

  // Forces: spring to rest + repulsion
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  const kRest = (scrollMode === 2 ? tuning.spring * 0.42 : tuning.spring) * tuning.snapback;

  for (let i = 0; i < n; i++) {
    const a = bubbles[i];
    const rA = currentRadius * Math.abs(a.scale);
    // Hovered ball snaps to cursor; others snap to rest
    const targetX = a === hoveredBubble ? pointerX : a.restX;
    const targetY = a === hoveredBubble ? pointerY : a.restY;
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

  // Pull: hovered ball toward cursor, others toward rest
  const SNAP_RADIUS = 2;
  const SNAP_SPEED = 0.8;
  const basePullLerp = scrollMode === 2 ? 0.05 : tuning.pullLerp;
  const pullLerp = basePullLerp * tuning.snapback;
  bubbles.forEach((b) => {
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
      const r = bubbleAreaEl.getBoundingClientRect();
      const screenY = r.top + b.y;
      const centerY = window.innerHeight / 2;
      const distFromCenter = Math.abs(screenY - centerY);
      const falloff = 320;
      const centerScale = 1.45;
      const t = Math.max(0, 1 - distFromCenter / falloff);
      b.scale = 1 + (centerScale - 1) * t;
      // Blur label gradually by distance from center; 90%+ clear → show 100% clear
      const label = b.el.querySelector('.vita-bubble-label');
      if (label) {
        const isHovered = hoveredBubble === b;
        const blurFalloff = 280;
        const maxBlur = 6;
        const blurT = Math.min(1, distFromCenter / blurFalloff);
        const blurPx = isHovered ? 0 : blurT * maxBlur;
        const opacity = isHovered ? 1 : 1 - 0.35 * blurT;
        const nearlyClear = blurT <= 0.1 || opacity >= 0.9;
        label.style.filter = nearlyClear || isHovered ? 'none' : (blurPx > 0.1 ? `blur(${blurPx}px)` : 'none');
        label.style.opacity = nearlyClear || isHovered ? '1' : String(opacity);
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

  // Position correction: resolve overlaps; hovered ball stays fixed at center, others get pushed
  function resolveOverlaps() {
    for (let iter = 0; iter < tuning.overlapIter; iter++) {
      for (let i = 0; i < n; i++) {
        const a = bubbles[i];
        const rA = currentRadius * Math.abs(a.scale);
        const aFixed = a === hoveredBubble;
        for (let j = i + 1; j < n; j++) {
          const b = bubbles[j];
          const rB = currentRadius * Math.abs(b.scale);
          const d = dist(a.x, a.y, b.x, b.y);
          const minD = rA + rB;
          if (d < minD && d > 1e-6) {
            const overlap = minD - d;
            const nx = (a.x - b.x) / d;
            const ny = (a.y - b.y) / d;
            const bFixed = b === hoveredBubble;
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
  const rect = bubbleAreaEl.getBoundingClientRect();
  const areaW = rect.width || 800;
  const areaH = rect.height || 600;
  const edgeL = PADDING + EDGE_BUFFER;
  const edgeR = areaW - PADDING - EDGE_BUFFER;
  const edgeT = PADDING + EDGE_BUFFER;
  const lineBottom = scrollMode === 2
    ? (bubbles[0]?.restY ?? 0) + (n - 1) * 2 * currentRadius * 1.02 + currentRadius + 50
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
