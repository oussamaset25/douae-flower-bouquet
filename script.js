/* =====================================================
   باقة ورد رقمية — المنطق والرسم
   كل الزهور تُرسم كـ SVG بواسطة الجافاسكربت.
   ابدأ التعديل من قسم CONFIG و PALETTES.
   ===================================================== */

/* ---------- 1) الإعدادات القابلة للتخصيص ---------- */
const CONFIG = {
  title:    "For You, Douae ♡",                      // الرسالة الرئيسية
  subtitle: "A little bouquet, made just for you.",  // الجملة الصغيرة تحتها
  speed: 1,          // 1 = السرعة العادية | 0.7 أسرع | 1.4 أبطأ
  stars: 70,         // عدد النجوم في الخلفية
  fallingPetals: 10  // عدد البتلات المتساقطة بعد اكتمال الباقة
};

/* لوحات ألوان الزهور: light = طرف البتلة، dark = قاعدتها */
const PALETTES = {
  red1:  { light: "#ff7d90", base: "#d81e3f", dark: "#5e0716" },
  red2:  { light: "#ff6478", base: "#c11430", dark: "#4d0511" },
  red3:  { light: "#ff9aa9", base: "#e62f4f", dark: "#730c1f" },
  pink:  { light: "#ffd2e0", base: "#f487ab", dark: "#a93b64" },
  white: { light: "#ffffff", base: "#f4ece1", dark: "#c0b2a3" },
  sun:   { light: "#ffe98f", base: "#f4b81f", dark: "#a86504" }
};

const SVGNS = "http://www.w3.org/2000/svg";
const VIEW = { w: 400, h: 660 };      // مساحة الرسم
const BASE = { x: 200, y: 618 };      // النقطة التي تتجمع فيها كل السيقان

/* ---------- 2) أدوات مساعدة ---------- */
function el(name, attrs) {
  const node = document.createElementNS(SVGNS, name);
  for (const key in attrs) node.setAttribute(key, attrs[key]);
  return node;
}
const rnd = (min, max) => min + Math.random() * (max - min);

/* توزيع الزهور على قوس بيضاوي: يعطي شكل الباقة المنتفخ الطبيعي */
function arc(count, rx, ry, startDeg, endDeg) {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180;
    points.push({
      x: BASE.x + Math.cos(a) * rx,
      y: BASE.y - Math.sin(a) * ry
    });
  }
  return points;
}

/* ---------- 3) تركيبة الباقة ---------- */
/* أربع طبقات: الخلفية أعلى وأصغر، والأمامية أكبر وأقرب للأسفل. */
function buildLayout() {
  const rows = [
    // نثار أبيض صغير في الأعلى (جبسوفيلا)
    { pts: arc(6, 196, 372, 148, 32), size: 11, types: ["bb", "bb", "bb", "bb", "bb", "bb"] },
    // الصف الخلفي
    { pts: arc(7, 168, 322, 156, 24), size: 25,
      types: ["rose:red2", "daisy:white", "rose:red1", "sun:sun", "rose:red2", "daisy:white", "rose:red1"] },
    // الصف الأوسط
    { pts: arc(8, 122, 232, 162, 18), size: 30,
      types: ["rose:red1", "tulip:pink", "rose:red3", "rose:red2", "rose:red1", "rose:red3", "tulip:pink", "daisy:white"] },
    // الصف الأمامي: أكبر الورود الحمراء
    { pts: arc(5, 70, 126, 168, 12), size: 36,
      types: ["rose:red2", "rose:red1", "rose:red3", "rose:red1", "rose:red2"] }
  ];

  const flowers = [];
  rows.forEach((row) => {
    row.pts.forEach((p, i) => {
      const [type, color] = row.types[i].split(":");
      flowers.push({
        type,
        color: color || "white",
        x: p.x,
        y: p.y,
        size: row.size * rnd(0.9, 1.08),
        rot: (p.x - BASE.x) * 0.07 + rnd(-4, 4)   // ميلان خفيف باتجاه الخارج
      });
    });
  });
  return flowers;
}

/* ---------- 4) أشكال البتلات ---------- */
/* بتلة قاعدتها في النقطة (0,0) ورأسها للأعلى */
function petalPath(h, w) {
  return `M0,0 C${-w},${-h * 0.2} ${-w * 1.12},${-h * 0.74} 0,${-h}
          C${w * 1.12},${-h * 0.74} ${w},${-h * 0.2} 0,0 Z`;
}

/* حلزون مركز الوردة */
function spiralPath(r, turns) {
  let d = "";
  for (let i = 0; i <= 44; i++) {
    const t = i / 44;
    const a = t * turns * Math.PI * 2;
    const rr = r * (0.12 + 0.88 * t);
    d += (i ? "L" : "M") + (Math.cos(a) * rr).toFixed(2) + "," + (Math.sin(a) * rr).toFixed(2);
  }
  return d;
}

/* ---------- 5) بناء أنواع الزهور ---------- */

/* وردة حمراء: أربع حلقات من البتلات + ظل مركزي + حلزون */
function buildRose(size, key) {
  const g = el("g", {});
  const pal = PALETTES[key];
  const layers = [
    { n: 8, r: 1.00, w: 0.40, off: 0 },
    { n: 7, r: 0.82, w: 0.38, off: 24 },
    { n: 6, r: 0.62, w: 0.35, off: 12 },
    { n: 5, r: 0.44, w: 0.31, off: 38 }
  ];
  layers.forEach((L) => {
    for (let i = 0; i < L.n; i++) {
      const angle = (360 / L.n) * i + L.off;
      g.appendChild(el("path", {
        d: petalPath(size * L.r, size * L.w),
        fill: `url(#pet-${key})`,
        stroke: "rgba(40,0,8,0.22)",
        "stroke-width": size * 0.016,
        transform: `rotate(${angle})`
      }));
    }
  });
  // ظل ناعم في القلب يعطي الإحساس بالعمق
  g.appendChild(el("circle", { r: size * 0.5, fill: `url(#core-${key})` }));
  // حلزون القلب
  g.appendChild(el("path", {
    d: spiralPath(size * 0.26, 1.7),
    fill: "none",
    stroke: pal.dark,
    "stroke-width": size * 0.055,
    "stroke-linecap": "round",
    opacity: 0.7
  }));
  g.appendChild(el("path", {
    d: spiralPath(size * 0.2, 1.4),
    fill: "none",
    stroke: pal.light,
    "stroke-width": size * 0.02,
    "stroke-linecap": "round",
    opacity: 0.45
  }));
  return g;
}

/* أقحوان أبيض */
function buildDaisy(size, key) {
  const g = el("g", {});
  for (let i = 0; i < 14; i++) {
    g.appendChild(el("path", {
      d: petalPath(size * rnd(0.92, 1.02), size * 0.2),
      fill: `url(#pet-${key})`,
      stroke: "rgba(70,40,40,0.14)",
      "stroke-width": size * 0.012,
      transform: `rotate(${(360 / 14) * i})`
    }));
  }
  g.appendChild(el("circle", { r: size * 0.26, fill: "#f2b722" }));
  g.appendChild(el("circle", { r: size * 0.26, fill: "url(#core-sun)" }));
  return g;
}

/* دوّار الشمس */
function buildSunflower(size, key) {
  const g = el("g", {});
  [{ n: 16, r: 1.05, off: 0 }, { n: 16, r: 0.82, off: 11 }].forEach((L) => {
    for (let i = 0; i < L.n; i++) {
      g.appendChild(el("path", {
        d: petalPath(size * L.r, size * 0.17),
        fill: `url(#pet-${key})`,
        stroke: "rgba(90,50,0,0.2)",
        "stroke-width": size * 0.012,
        transform: `rotate(${(360 / L.n) * i + L.off})`
      }));
    }
  });
  g.appendChild(el("circle", { r: size * 0.42, fill: "#4a2a10" }));
  g.appendChild(el("circle", { r: size * 0.42, fill: "url(#seed)" }));
  // بذور صغيرة
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996, rr = size * 0.4 * Math.sqrt(i / 26);
    g.appendChild(el("circle", {
      cx: (Math.cos(a) * rr).toFixed(2),
      cy: (Math.sin(a) * rr).toFixed(2),
      r: size * 0.035,
      fill: "#2e1806",
      opacity: 0.75
    }));
  }
  return g;
}

/* توليب وردي: كأس من ثلاث بتلات */
function buildTulip(size, key) {
  const g = el("g", { transform: `translate(0, ${size * 0.35})` });
  const h = size * 1.25, w = size * 0.62;
  const cup = (hh, ww) =>
    `M0,0 C${-ww},${-hh * 0.35} ${-ww * 0.86},${-hh} 0,${-hh}
     C${ww * 0.86},${-hh} ${ww},${-hh * 0.35} 0,0 Z`;
  [[-24, 0.9], [24, 0.9], [0, 1]].forEach(([rot, s]) => {
    g.appendChild(el("path", {
      d: cup(h * s, w * s),
      fill: `url(#pet-${key})`,
      stroke: "rgba(90,20,50,0.2)",
      "stroke-width": size * 0.016,
      transform: `rotate(${rot})`
    }));
  });
  return g;
}

/* جبسوفيلا: عنقود نقاط بيضاء صغيرة */
function buildBabysBreath(size) {
  const g = el("g", {});
  for (let i = 0; i < 7; i++) {
    const a = rnd(0, Math.PI * 2), rr = rnd(0, size * 1.1);
    g.appendChild(el("circle", {
      cx: (Math.cos(a) * rr).toFixed(2),
      cy: (Math.sin(a) * rr).toFixed(2),
      r: size * rnd(0.22, 0.38),
      fill: "#fdf6ee",
      opacity: rnd(0.65, 0.95)
    }));
  }
  return g;
}

function buildHead(f) {
  if (f.type === "rose")  return buildRose(f.size, f.color);
  if (f.type === "daisy") return buildDaisy(f.size, f.color);
  if (f.type === "sun")   return buildSunflower(f.size, f.color);
  if (f.type === "tulip") return buildTulip(f.size, f.color);
  return buildBabysBreath(f.size);
}

/* ---------- 6) التدرجات اللونية ---------- */
function buildDefs() {
  const defs = el("defs", {});

  for (const key in PALETTES) {
    const p = PALETTES[key];
    // التدرج داخل البتلة: فاتح عند الطرف، غامق عند القاعدة
    const lg = el("linearGradient", { id: "pet-" + key, x1: "0", y1: "0", x2: "0.3", y2: "1" });
    lg.appendChild(el("stop", { offset: "0",    "stop-color": p.light }));
    lg.appendChild(el("stop", { offset: "0.55", "stop-color": p.base }));
    lg.appendChild(el("stop", { offset: "1",    "stop-color": p.dark }));
    defs.appendChild(lg);

    // ظل دائري لقلب الزهرة
    const rg = el("radialGradient", { id: "core-" + key });
    rg.appendChild(el("stop", { offset: "0",   "stop-color": p.dark, "stop-opacity": "0.85" }));
    rg.appendChild(el("stop", { offset: "0.6", "stop-color": p.dark, "stop-opacity": "0.3" }));
    rg.appendChild(el("stop", { offset: "1",   "stop-color": p.dark, "stop-opacity": "0" }));
    defs.appendChild(rg);
  }

  const seed = el("radialGradient", { id: "seed" });
  seed.appendChild(el("stop", { offset: "0",   "stop-color": "#6b4018" }));
  seed.appendChild(el("stop", { offset: "1",   "stop-color": "#2a1505" }));
  defs.appendChild(seed);

  const stem = el("linearGradient", { id: "stemGrad", x1: "0", y1: "1", x2: "0", y2: "0" });
  stem.appendChild(el("stop", { offset: "0", "stop-color": "#1f4429" }));
  stem.appendChild(el("stop", { offset: "1", "stop-color": "#43754a" }));
  defs.appendChild(stem);

  const leaf = el("linearGradient", { id: "leafGrad", x1: "0", y1: "1", x2: "0.4", y2: "0" });
  leaf.appendChild(el("stop", { offset: "0", "stop-color": "#20492b" }));
  leaf.appendChild(el("stop", { offset: "1", "stop-color": "#578a4f" }));
  defs.appendChild(leaf);

  const paper = el("linearGradient", { id: "paperGrad", x1: "0", y1: "0", x2: "0.6", y2: "1" });
  paper.appendChild(el("stop", { offset: "0",   "stop-color": "#5e1733" }));
  paper.appendChild(el("stop", { offset: "0.5", "stop-color": "#3d0d22" }));
  paper.appendChild(el("stop", { offset: "1",   "stop-color": "#250614" }));
  defs.appendChild(paper);

  return defs;
}

/* ---------- 7) بناء الباقة كاملة ---------- */
function buildBouquet() {
  const flowers = buildLayout();
  const S = CONFIG.speed;

  const svg = el("svg", {
    viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
    "aria-label": "A bouquet of red roses"
  });
  svg.appendChild(buildDefs());

  const stemsG = el("g", {});   // كل السيقان في الخلف
  const wrapG  = el("g", { class: "wrap" });
  const headsG = el("g", {});   // ثم رؤوس الزهور فوقها

  flowers.forEach((f, i) => {
    const gd = 0.06 * i * S;           // متى تبدأ الساق بالنمو
    const bd = (0.06 * i + 1.15) * S;  // متى تتفتح الزهرة
    f.bloomDelay = bd;

    /* --- الساق: منحنى من قاعدة الباقة إلى الزهرة --- */
    const endY = f.y + f.size * 0.45;
    const cx = BASE.x + (f.x - BASE.x) * 0.22;
    const cy = BASE.y - (BASE.y - endY) * 0.58;
    const stem = el("path", {
      class: "stem",
      d: `M${BASE.x},${BASE.y} Q${cx.toFixed(1)},${cy.toFixed(1)} ${f.x.toFixed(1)},${endY.toFixed(1)}`,
      stroke: "url(#stemGrad)",
      "stroke-width": (2.2 + f.size * 0.05).toFixed(2)
    });
    stem.style.setProperty("--gd", gd + "s");
    stemsG.appendChild(stem);

    /* --- ورقتان على بعض السيقان فقط حتى لا تزدحم --- */
    if (i % 3 === 0) {
      f.leafStem = stem;
      f.leafDelay = gd + 0.9 * S;
    }

    /* --- رأس الزهرة --- */
    const head = el("g", { transform: `translate(${f.x.toFixed(1)},${f.y.toFixed(1)}) rotate(${f.rot.toFixed(1)})` });
    const sway = el("g", { class: "sway" });
    sway.style.setProperty("--sd", rnd(4.2, 6.5).toFixed(2) + "s");
    sway.style.setProperty("--sdl", (bd + 1).toFixed(2) + "s");
    const bloom = el("g", { class: "bloom" });
    bloom.style.setProperty("--bd", bd.toFixed(2) + "s");

    bloom.appendChild(buildHead(f));
    sway.appendChild(bloom);
    head.appendChild(sway);
    headsG.appendChild(head);
  });

  /* --- غلاف الباقة والشريط --- */
  wrapG.appendChild(el("path", {
    d: "M128,486 Q200,512 272,486 L232,632 Q200,646 168,632 Z",
    fill: "url(#paperGrad)",
    stroke: "rgba(227,187,134,0.45)",
    "stroke-width": "1.2"
  }));
  wrapG.appendChild(el("path", {
    d: "M168,560 Q200,572 232,560 L234,576 Q200,589 166,576 Z",
    fill: "#e3bb86", opacity: "0.85"
  }));
  wrapG.appendChild(el("path", {
    d: "M196,572 q-26,16 -34,34 q22,-4 36,-22 q14,18 36,22 q-8,-18 -34,-34 z",
    fill: "#e3bb86", opacity: "0.6"
  }));

  const totalTime = 0.06 * (flowers.length - 1) * S + 1.15 * S + 1;
  wrapG.style.setProperty("--wd", (totalTime - 1.3).toFixed(2) + "s");

  svg.appendChild(stemsG);
  svg.appendChild(wrapG);
  svg.appendChild(headsG);

  document.getElementById("bouquet").appendChild(svg);

  /* بعد الإضافة إلى الصفحة نستطيع قياس أطوال السيقان ورسم الأوراق */
  stemsG.querySelectorAll(".stem").forEach((s) => {
    const len = Math.ceil(s.getTotalLength());
    s.style.setProperty("--len", len);
  });

  flowers.forEach((f) => {
    if (!f.leafStem) return;
    addLeaves(stemsG, f.leafStem, f.leafDelay);
  });

  return totalTime;
}

/* ورقتان على الساق، باتجاه ميل الساق نفسه */
function addLeaves(parent, stemPath, delay) {
  const len = stemPath.getTotalLength();
  [[0.42, -1], [0.66, 1]].forEach(([t, side], idx) => {
    const p = stemPath.getPointAtLength(len * t);
    const p2 = stemPath.getPointAtLength(Math.min(len, len * t + 6));
    const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI + 90;
    // المجموعة الخارجية للموضع (transform كخاصية SVG)
    // والداخلية للحركة (transform عبر CSS) حتى لا يلغي أحدهما الآخر
    const holder = el("g", {
      transform: `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(angle + side * 46).toFixed(1)})`
    });
    const g = el("g", { class: "leaf" });
    g.style.setProperty("--ld", (delay + idx * 0.15).toFixed(2) + "s");
    holder.appendChild(g);
    g.appendChild(el("path", {
      d: "M0,0 C10,-9 12,-26 0,-38 C-12,-26 -10,-9 0,0 Z",
      fill: "url(#leafGrad)"
    }));
    g.appendChild(el("path", {
      d: "M0,-2 L0,-34", stroke: "rgba(220,255,220,0.25)", "stroke-width": "1", fill: "none"
    }));
    parent.appendChild(holder);
  });
}

/* ---------- 8) خلفية النجوم والأضواء ---------- */
function buildSky() {
  const sky = document.getElementById("sky");
  for (let i = 0; i < CONFIG.stars; i++) {
    const s = document.createElement("span");
    s.className = "star";
    const size = rnd(1, 2.6);
    s.style.cssText =
      `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;width:${size}px;height:${size}px;` +
      `--dur:${rnd(3, 8)}s;--del:${rnd(0, 6)}s;--max:${rnd(0.4, 0.95)}`;
    sky.appendChild(s);
  }
  for (let i = 0; i < 9; i++) {
    const b = document.createElement("span");
    b.className = "bokeh";
    const size = rnd(14, 46);
    b.style.cssText =
      `left:${rnd(0, 100)}%;top:${rnd(60, 105)}%;width:${size}px;height:${size}px;` +
      `--dur:${rnd(18, 34)}s;--del:${rnd(0, 14)}s;--dx:${rnd(-60, 60)}px`;
    sky.appendChild(b);
  }
}

/* بتلات متساقطة تظهر بعد اكتمال الباقة */
function buildFallingPetals() {
  const box = document.getElementById("petals");
  for (let i = 0; i < CONFIG.fallingPetals; i++) {
    const p = document.createElement("span");
    p.style.cssText =
      `left:${rnd(0, 100)}%;--dur:${rnd(9, 17)}s;--del:${rnd(0, 10)}s;--dx:${rnd(-70, 70)}px;` +
      `transform:scale(${rnd(0.7, 1.3)})`;
    box.appendChild(p);
  }
}

/* ---------- 9) تشغيل التجربة ---------- */
function start() {
  const total = buildBouquet();

  // الرسالة تظهر فقط بعد تفتّح كل الزهور
  setTimeout(() => {
    document.getElementById("message").classList.add("show");
    buildFallingPetals();
  }, (total + 0.4) * 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("messageTitle").innerHTML =
    CONFIG.title.replace("♡", '<span class="heart">♡</span>');
  document.getElementById("messageSub").textContent = CONFIG.subtitle;

  buildSky();

  const intro = document.getElementById("intro");
  document.getElementById("tap").addEventListener("click", () => {
    intro.classList.add("hide");
    start();
  }, { once: true });
});
