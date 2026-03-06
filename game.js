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

const TOTAL_BUBBLES = 25;   // 5×5 共 25 顆球

const BUBBLE_IMAGES = [
  'assets/3A927DB1-F317-47BF-BA00-4A6DF368173B-8a6cc66b-7b25-40d2-a3aa-a3cee59fbba0.png',
  'assets/IMG_1971-fccc0c5e-fd8e-4347-9e93-2e330e4e0d94.png',
  'assets/Gemini_Generated_Image_nv1qcinv1qcinv1q-52ec0671-bbac-444c-a93c-92a9e2c81510.png',
  'assets/2x_use__2_as_art_direction__adjust_the_image_style_of_the_render__remove_the_leaves-baeb956e-a864-4b34-9b66-195a9f4a26f2.png',
  'assets/4x_change_teh_pcb_color_from_green_to_black_________change_the_lens_from_50mm_to_200mm-fd068790-d942-4cb7-a874-b1863f93bb00.png',
  'assets/2x_use_2_as_art_direction__add_motion_blur_but_focus_on_the_Cufflinks-c4814752-a241-4b99-bcbd-dd05872862f3.png',
  'assets/4x_use_the_second_image_as_reference__apply_the_art_direction-6d815c8d-2bb4-4c7c-9966-d74b5c1476c9.png',
  'assets/4x_use__2and_3__as_art_direction_of_the_render__zeep_the_zoom-in_position_don_t_change_the_design_and_size_and_aspect_of_the_first_image_1-c68c6fb9-8eec-49c7-9d20-287f317c2ec9.png',
];
const PADDING = 20;
const EDGE_BUFFER = 28;
const HOVER_SCALE = 2.5;
let currentRadius = 44;     // 依視窗計算，使 30 球填滿

// Physics
const DT = 1 / 60;
const MASS = 1;
const K_REST = 52;         // very strong spring: return to og position fast
const K_REPEL = 1.12;      // strong repulsion so balls never overlap
const DAMPING = 0.88;      // allow overshoot so fast pull-back causes visible shake
const OVERLAP_ITERATIONS = 10;  // more passes so overlap is fully resolved
const TOUCH_DIST_FACTOR = 1.08;   // 依接觸算鄰居（略大於直徑）
const RING_SCALE = [1, 0.58, 0.32, 0.16];  // 第 0～3 圈的放大係數 (0=hovered 滿倍)
const SCALE_LERP_CENTER = 0.22;  // 第一顆先放大（較快）
const SCALE_LERP_RING = 0.09;    // 周圍延後、往外擴散（較慢）
// Scroll modes: 0 = grid, 2 = aligned (vertical line) — no stack-on-bottom state
const SCROLL_THRESHOLD = 80;
let scrollMode = 0;  // 0 grid, 2 aligned vertical line

let modalEl, bubbleAreaEl;
let bubbles = [];
let hoveredBubble = null;
let pointerX = 0;
let pointerY = 0;
let pointerActive = false;

function init() {
  modalEl = document.getElementById('projectModal');
  const modalCloseEl = document.getElementById('modalClose');
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

  modalCloseEl.addEventListener('click', closeModal);
  modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

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

// Braun 音響網孔：規則圓點網格（5×6），等距排列
const BRAUN_COLS = 5;
const BRAUN_ROWS = 5;

function getCircleLayout(areaWidth, areaHeight) {
  const w = areaWidth - PADDING * 2 - EDGE_BUFFER * 2;
  const h = areaHeight - PADDING * 2 - EDGE_BUFFER * 2;
  if (w <= 0 || h <= 0) return { step: 48, currentRadius: 24, viewCenterX: areaWidth / 2, viewCenterY: areaHeight / 2 };
  const stepFromW = w / (BRAUN_COLS - 1 + 1);
  const stepFromH = h / (BRAUN_ROWS - 1 + 1);
  const step = Math.max(36, Math.min(140, Math.min(stepFromW, stepFromH) * 1.4));
  const currentRadius = step * 0.48;
  const viewCenterX = (areaWidth - PADDING * 2 - EDGE_BUFFER * 2) / 2 + PADDING + EDGE_BUFFER;
  const viewCenterY = (areaHeight - PADDING * 2 - EDGE_BUFFER * 2) / 2 + PADDING + EDGE_BUFFER;
  return { step, currentRadius, viewCenterX, viewCenterY };
}

function circlePosition30(i, step, viewCenterX, viewCenterY) {
  const col = i % BRAUN_COLS;
  const row = Math.floor(i / BRAUN_COLS);
  const gridCenterCol = (BRAUN_COLS - 1) / 2;
  const gridCenterRow = (BRAUN_ROWS - 1) / 2;
  const x = viewCenterX + (col - gridCenterCol) * step;
  const y = viewCenterY + (row - gridCenterRow) * step;
  return { x, y };
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
  currentRadius = layout.currentRadius;
  const { step, viewCenterX, viewCenterY } = layout;

  const current = bubbles.length;

  if (current >= TOTAL_BUBBLES) {
    if (current > TOTAL_BUBBLES) {
      const toRemove = bubbles.splice(TOTAL_BUBBLES);
      toRemove.forEach((b) => b.el.remove());
      if (hoveredBubble && !bubbleAreaEl.contains(hoveredBubble.el)) hoveredBubble = null;
    }
    updateRestPositions(w, h);
    return;
  }

  for (let i = current; i < TOTAL_BUBBLES; i++) {
    const { x, y } = circlePosition30(i, step, viewCenterX, viewCenterY);
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
  currentRadius = layout.currentRadius;
  const { step, viewCenterX, viewCenterY } = layout;
  bubbles.forEach((b, i) => {
    const { x, y } = circlePosition30(i, step, viewCenterX, viewCenterY);
    b.restX = x;
    b.restY = y;
  });
  bubbles.forEach((b) => {
    b.el.style.width = `${currentRadius * 2}px`;
    b.el.style.height = `${currentRadius * 2}px`;
  });
}

// Offset so the top circle is fully visible below the header/name
const VERTICAL_LINE_TOP_OFFSET = 320;

// Align all circles to a vertical line; first ball at viewport vertical center after scroll
function updateRestToVerticalLine() {
  const n = bubbles.length;
  if (n === 0) return;
  const refX = bubbles[0].restX;  // left column x from grid
  const spacing = 2 * currentRadius * 1.02;
  // First ball center at viewport vertical center (in bubble-area coords: scrollY + center)
  const firstBallY = window.scrollY + window.innerHeight / 2;
  const lineHeightPx = firstBallY + (n - 1) * spacing + currentRadius + PADDING + EDGE_BUFFER;
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
  img.style.backgroundImage = `url(${BUBBLE_IMAGES[bubbleIndex % BUBBLE_IMAGES.length]})`;
  el.appendChild(img);

  const label = document.createElement('span');
  label.className = 'vita-bubble-label';
  label.textContent = project.titleEn || project.title;

  wrap.appendChild(el);
  wrap.appendChild(label);

  el.addEventListener('click', (e) => {
    e.preventDefault();
    openProject(project);
  });
  el.addEventListener('mouseenter', () => setHovered(data));
  el.addEventListener('mouseleave', () => setHovered(null));

  return wrap;
}

function setHovered(bubbleData) {
  hoveredBubble = bubbleData;
}

function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// 依「接觸」做 BFS：第 0 圈 = hovered，第 1～3 圈 = 沿接觸往外擴散
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
    if (ri >= 3) continue;
    const ax = bubbles[i].restX;
    const ay = bubbles[i].restY;
    for (let j = 0; j < n; j++) {
      if (ring[j] >= 0) continue;
      const d = dist(ax, ay, bubbles[j].restX, bubbles[j].restY);
      if (d <= currentRadius * 2 * TOUCH_DIST_FACTOR) {
        ring[j] = ri + 1;
        queue.push(j);
      }
    }
  }
  return ring;
}

function physicsLoop() {
  const n = bubbles.length;
  const ring = getRingIndices();

  // Aligned vertical line: no scaling. Grid: hover scale by ring
  bubbleAreaEl.classList.toggle('vita-aligned-line', scrollMode === 2);
  bubbles.forEach((b, i) => {
    if (scrollMode === 2) {
      b.targetScale = 1;
    } else {
      const r = ring[i];
      if (r === 0) b.targetScale = HOVER_SCALE;
      else if (r >= 1 && r <= 3) b.targetScale = 1 + (HOVER_SCALE - 1) * RING_SCALE[r];
      else b.targetScale = 1;
    }
  });

  // Forces: spring to rest + repulsion
  const fx = new Float64Array(n);
  const fy = new Float64Array(n);
  const kRest = scrollMode === 2 ? K_REST * 1.8 : K_REST;

  for (let i = 0; i < n; i++) {
    const a = bubbles[i];
    const rA = currentRadius * a.scale;

    fx[i] = kRest * (a.restX - a.x);
    fy[i] = kRest * (a.restY - a.y);

    for (let j = i + 1; j < n; j++) {
      const b = bubbles[j];
      const rB = currentRadius * b.scale;
      const d = dist(a.x, a.y, b.x, b.y);
      const minD = rA + rB;
      if (d < minD && d > 1e-6) {
        const overlap = minD - d;
        const nx = (a.x - b.x) / d;
        const ny = (a.y - b.y) / d;
        const f = K_REPEL * overlap;
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
    b.vx *= DAMPING;
    b.vy *= DAMPING;
  });

  // 結束 hover 後：強彈簧 + 輕微直接拉回，快速回原位；接近時鎖回 5×5 / 垂直線
  if (!hoveredBubble) {
    const SNAP_RADIUS = 3;
    const SNAP_SPEED = 3;
    bubbles.forEach((b) => {
      b.x += (b.restX - b.x) * 0.18;
      b.y += (b.restY - b.y) * 0.18;
      b.vx *= 0.92;
      b.vy *= 0.92;
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
    });
  }

  // Scale: in vertical array, larger at vertical center of screen; otherwise hover ring
  bubbles.forEach((b, i) => {
    if (scrollMode === 2) {
      const r = bubbleAreaEl.getBoundingClientRect();
      const screenY = r.top + b.y;
      const centerY = window.innerHeight / 2;
      const distFromCenter = Math.abs(screenY - centerY);
      const falloff = 320;
      const centerScale = 2;
      const t = Math.max(0, 1 - distFromCenter / falloff);
      b.scale = 1 + (centerScale - 1) * t;
    } else {
      const scaleLerp = ring[i] === 0 ? SCALE_LERP_CENTER : SCALE_LERP_RING;
      b.scale += (b.targetScale - b.scale) * scaleLerp;
      b.scale = Math.max(0.4, Math.min(HOVER_SCALE + 0.15, b.scale));
    }
  });

  // Position correction: resolve all ball-ball overlaps (no overlapping)
  function resolveOverlaps() {
    for (let iter = 0; iter < OVERLAP_ITERATIONS; iter++) {
      for (let i = 0; i < n; i++) {
        const a = bubbles[i];
        const rA = currentRadius * a.scale;
        for (let j = i + 1; j < n; j++) {
          const b = bubbles[j];
          const rB = currentRadius * b.scale;
          const d = dist(a.x, a.y, b.x, b.y);
          const minD = rA + rB;
          if (d < minD && d > 1e-6) {
            const overlap = minD - d;
            const nx = (a.x - b.x) / d;
            const ny = (a.y - b.y) / d;
            a.x += nx * (overlap * 0.5);
            a.y += ny * (overlap * 0.5);
            b.x -= nx * (overlap * 0.5);
            b.y -= ny * (overlap * 0.5);
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
    const r = currentRadius * b.scale;
    b.x = Math.max(edgeL + r, Math.min(edgeR - r, b.x));
    b.y = Math.max(edgeT + r, Math.min(edgeB - r, b.y));
  });

  // Resolve again after boundary clamp so no overlap remains
  resolveOverlaps();

  bubbles.forEach((b) => {
    b.el.style.transform = `translate(${b.x - currentRadius}px, ${b.y - currentRadius}px) scale(${b.scale})`;
  });

  requestAnimationFrame(physicsLoop);
}

function onResize() {
  const rect = bubbleAreaEl.getBoundingClientRect();
  const w = rect.width || window.innerWidth;
  const h = getLayoutHeight();

  if (bubbles.length < TOTAL_BUBBLES) {
    buildHexBubbles();
  } else if (bubbles.length > TOTAL_BUBBLES) {
    const toRemove = bubbles.splice(TOTAL_BUBBLES);
    toRemove.forEach((b) => b.el.remove());
    if (hoveredBubble && !bubbleAreaEl.contains(hoveredBubble.el)) hoveredBubble = null;
  }
  updateRestPositions(w, h);
}

function openProject(project) {
  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalTags').textContent = project.tags;
  document.getElementById('modalDescription').textContent = project.description;
  const linkEl = document.getElementById('modalLink');
  linkEl.href = project.link || '#';
  linkEl.style.display = project.link ? 'inline' : 'none';
  modalEl.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalEl.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
