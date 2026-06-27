// App wiring: navigation, theme, poses UI, tutorials UI.
(function () {
  /* ---------- Section navigation ---------- */
  const navButtons = document.querySelectorAll(".navbtn");
  const sections = document.querySelectorAll(".section");
  function showSection(name) {
    navButtons.forEach((b) => b.classList.toggle("active", b.dataset.section === name));
    sections.forEach((s) => s.classList.toggle("active", s.id === name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // Any element with [data-section] navigates: nav buttons, brand, home cards.
  document.querySelectorAll("[data-section]").forEach((el) => {
    el.addEventListener("click", () => showSection(el.dataset.section));
  });

  /* ---------- Theme toggle ---------- */
  const themeToggle = document.getElementById("themeToggle");
  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.setAttribute("data-theme", "dark");
      themeToggle.textContent = "☀️";
    } else {
      document.body.removeAttribute("data-theme");
      themeToggle.textContent = "🌙";
    }
    try { localStorage.setItem("drawref-theme", theme); } catch (e) {}
    window.dispatchEvent(new Event("themechange"));
  }
  let saved = "light";
  try { saved = localStorage.getItem("drawref-theme") || "light"; } catch (e) {}
  applyTheme(saved);
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    applyTheme(isDark ? "light" : "dark");
  });

  /* ---------- Poses ---------- */
  const poseGrid = document.getElementById("poseGrid");
  const poseTabs = document.getElementById("poseTabs");
  const detail = document.getElementById("poseDetail");
  const detailCanvas = document.getElementById("poseDetailCanvas");
  const detailName = document.getElementById("poseDetailName");
  const detailTip = document.getElementById("poseDetailTip");
  document.getElementById("poseDetailClose").addEventListener("click", () =>
    detail.classList.add("hidden")
  );

  const traceBtn = document.getElementById("poseDetailTrace");
  const thumbs = []; // {canvas, redraw} for theme redraws
  let currentDetail = null; // {name, tip, drawBig, render}

  traceBtn.addEventListener("click", () => {
    if (!currentDetail) return;
    window.dispatchEvent(new CustomEvent("gridpose", {
      detail: { name: currentDetail.name, render: currentDetail.render },
    }));
    showSection("grid");
  });

  function makeCard(name, drawThumb, onOpen) {
    const card = document.createElement("div");
    card.className = "pose-card";
    const cv = document.createElement("canvas");
    cv.width = 150;
    cv.height = 150;
    const label = document.createElement("div");
    label.className = "pose-name";
    label.textContent = name;
    card.append(cv, label);
    poseGrid.appendChild(card);
    drawThumb(cv);
    thumbs.push({ canvas: cv, redraw: () => drawThumb(cv) });
    card.addEventListener("click", onOpen);
  }

  function renderPoseGrid(cat) {
    poseGrid.innerHTML = "";
    thumbs.length = 0;
    detail.classList.add("hidden");
    const group = window.POSES[cat];
    Object.keys(group).forEach((name) => {
      const pose = group[name];
      makeCard(
        name,
        (cv) => drawPose(cv, pose, { boneWidth: 3 }),
        () => openDetail({
          name: name,
          tip: pose.tip,
          drawBig: (cv) => drawPose(cv, pose, { boneWidth: 6 }),
          render: (cv) => drawPose(cv, pose, { bg: false, pad: 0.16 }),
        })
      );
    });
  }

  function openDetail(d) {
    currentDetail = d;
    detailName.textContent = d.name;
    detailTip.textContent = d.tip || "";
    d.drawBig(detailCanvas);
    detail.classList.remove("hidden");
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  poseTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".subtab");
    if (!tab) return;
    poseTabs.querySelectorAll(".subtab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    renderPoseGrid(tab.dataset.cat);
  });

  // Redraw thumbnails + open detail on theme change (colors are CSS-var based)
  window.addEventListener("themechange", () => {
    thumbs.forEach((t) => t.redraw());
    if (currentDetail && !detail.classList.contains("hidden")) {
      currentDetail.drawBig(detailCanvas);
    }
  });

  renderPoseGrid("human");

  /* ---------- Tutorials ---------- */
  const tutorialTabs = document.getElementById("tutorialTabs");
  const stepsList = document.getElementById("tutorialSteps");
  const progress = document.getElementById("tutorialProgress");
  const nextBtn = document.getElementById("nextStep");
  const resetBtn = document.getElementById("startOver");

  let currentTut = "face";
  let revealed = 0;
  const tutorialCanvases = []; // {canvas, key, step} for theme redraws

  function loadTutorial(key) {
    currentTut = key;
    revealed = 0;
    const tut = window.TUTORIALS[key];
    stepsList.innerHTML = "";
    tutorialCanvases.length = 0;
    tut.steps.forEach((text, i) => {
      const li = document.createElement("li");
      const cv = document.createElement("canvas");
      cv.width = 170;
      cv.height = 170;
      cv.className = "step-canvas";
      const span = document.createElement("span");
      span.className = "step-text";
      span.textContent = text;
      li.appendChild(cv);
      li.appendChild(span);
      stepsList.appendChild(li);
      drawTutorialStep(cv, key, i);
      tutorialCanvases.push({ canvas: cv, key, step: i });
    });
    updateSteps();
  }

  function updateSteps() {
    const items = stepsList.querySelectorAll("li");
    items.forEach((li, i) => {
      li.classList.toggle("revealed", i < revealed);
      li.classList.toggle("current", i === revealed - 1);
    });
    const total = items.length;
    if (revealed === 0) {
      progress.textContent = "Press “Next step” to begin.";
    } else {
      progress.textContent = `Step ${revealed} of ${total}`;
    }
    nextBtn.disabled = revealed >= total;
    nextBtn.textContent = revealed >= total ? "Complete! 🎉" : "Next step";
  }

  nextBtn.addEventListener("click", () => {
    const total = window.TUTORIALS[currentTut].steps.length;
    if (revealed < total) {
      revealed++;
      updateSteps();
    }
  });
  resetBtn.addEventListener("click", () => {
    revealed = 0;
    updateSteps();
  });

  tutorialTabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".subtab");
    if (!tab) return;
    tutorialTabs.querySelectorAll(".subtab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    loadTutorial(tab.dataset.tut);
  });

  window.addEventListener("themechange", () => {
    tutorialCanvases.forEach((t) => drawTutorialStep(t.canvas, t.key, t.step));
  });

  loadTutorial("face");

  /* ---------- Home preview canvases ---------- */
  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  const homeCanvas = (k) => document.querySelector('.home-canvas[data-preview="' + k + '"]');
  const gridCv = homeCanvas("grid"), palCv = homeCanvas("palette"),
    poseCv = homeCanvas("poses"), tutCv = homeCanvas("tutorials");
  const poseList = [
    window.POSES.human.reaching, window.POSES.human.standing,
    window.POSES.action.running, window.POSES.human.walking, window.POSES.animal.cat,
  ];

  function hsl2hex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const to = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
    return "#" + to(f(0)) + to(f(8)) + to(f(4));
  }
  function randomPalette() {
    const base = Math.random() * 360;
    return [-40, -20, 0, 20, 40].map((d) => hsl2hex((base + d + 360) % 360, 65, 60));
  }

  let gridBackdrop = null;
  function buildGridBackdrop(cv) {
    const off = document.createElement("canvas");
    off.width = cv.width; off.height = cv.height;
    const ctx = off.getContext("2d"), w = off.width, h = off.height;
    ctx.fillStyle = cssVar("--canvas-bg") || "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(99,102,241,0.28)"; ctx.lineWidth = 1;
    const cell = h / 4;
    for (let x = cell; x < w; x += cell) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
    for (let y = cell; y < h; y += cell) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
    ctx.setLineDash([7, 6]); ctx.strokeStyle = "rgba(139,92,246,0.6)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.setLineDash([]);
    drawPose(off, window.POSES.human.standing, { clear: false, bg: false, alpha: 0.4, pad: 0.16 });
    return off;
  }
  function drawGridFrame(prog) {
    if (!gridCv) return;
    if (!gridBackdrop) gridBackdrop = buildGridBackdrop(gridCv);
    const ctx = gridCv.getContext("2d"), w = gridCv.width, h = gridCv.height;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(gridBackdrop, 0, 0);
    const N = 60, last = Math.floor(prog * N);
    ctx.strokeStyle = cssVar("--accent") || "#6366f1";
    ctx.lineWidth = Math.max(2, w * 0.018); ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= last; i++) {
      const x = 0.16 * w + 0.68 * w * (i / N);
      const y = 0.5 * h + 0.16 * h * Math.sin((i / N) * Math.PI * 2);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    if (last > 0) ctx.stroke();
  }
  function paintPalette(off, cols) {
    const ctx = off.getContext("2d"), w = off.width, h = off.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cssVar("--canvas-bg") || "#fff"; ctx.fillRect(0, 0, w, h);
    const gap = 12, bw = (w - gap * (cols.length + 1)) / cols.length, top = 28;
    cols.forEach((c, i) => { roundRect(ctx, gap + i * (bw + gap), top, bw, h - top * 2, 16); ctx.fillStyle = c; ctx.fill(); });
  }

  const FADE = 450;
  const offLike = (cv) => { const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; return c; };
  const paintPose = (off, pose) => drawPose(off, pose, { pad: 0.12 });
  function composite(cv, fromC, toC, p) {
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    if (fromC && p < 1) { ctx.globalAlpha = 1; ctx.drawImage(fromC, 0, 0); }
    ctx.globalAlpha = p; ctx.drawImage(toC, 0, 0); ctx.globalAlpha = 1;
  }

  let palCols = randomPalette(), poseIdx = 0, lastTut = -1;
  let tPal = 0, tPose = 0;
  let palFrom = null, palTo = null, palStart = 0, palActive = false;
  let poseFrom = null, poseTo = null, poseStart = 0, poseActive = false;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initLayers() {
    palTo = offLike(palCv); paintPalette(palTo, palCols);
    poseTo = offLike(poseCv); paintPose(poseTo, poseList[poseIdx]);
  }
  function swapPalette(t) {
    palFrom = palTo; palTo = offLike(palCv); palCols = randomPalette();
    paintPalette(palTo, palCols); palStart = t; palActive = true;
  }
  function swapPose(t) {
    poseFrom = poseTo; poseIdx = (poseIdx + 1) % poseList.length;
    poseTo = offLike(poseCv); paintPose(poseTo, poseList[poseIdx]); poseStart = t; poseActive = true;
  }

  function homeLoop(t) {
    const home = document.getElementById("home");
    if (home && home.classList.contains("active") && !document.hidden) {
      drawGridFrame((t % 2600) / 2600);
      if (t - tPal > 2000) { tPal = t; swapPalette(t); }
      if (palActive) { const p = Math.min(1, (t - palStart) / FADE); composite(palCv, palFrom, palTo, p); if (p >= 1) palActive = false; }
      if (t - tPose > 2500) { tPose = t; swapPose(t); }
      if (poseActive) { const p = Math.min(1, (t - poseStart) / FADE); composite(poseCv, poseFrom, poseTo, p); if (p >= 1) poseActive = false; }
      const step = Math.floor(t / 950) % 8;
      if (step !== lastTut) { lastTut = step; drawTutorialStep(tutCv, "face", step); }
    }
    requestAnimationFrame(homeLoop);
  }

  function startHome() {
    initLayers();
    composite(palCv, null, palTo, 1);
    composite(poseCv, null, poseTo, 1);
    drawTutorialStep(tutCv, "face", reduced ? 7 : 0);
    drawGridFrame(reduced ? 1 : 0);
    if (!reduced) requestAnimationFrame(homeLoop);
  }
  startHome();
  window.addEventListener("themechange", () => {
    gridBackdrop = null;
    palTo = offLike(palCv); paintPalette(palTo, palCols); palActive = false;
    poseTo = offLike(poseCv); paintPose(poseTo, poseList[poseIdx]); poseActive = false;
    composite(palCv, null, palTo, 1);
    composite(poseCv, null, poseTo, 1);
    drawTutorialStep(tutCv, "face", lastTut < 0 ? 0 : lastTut);
    drawGridFrame(reduced ? 1 : 0);
  });

  /* ---------- Art Styles gallery (text-only, genre-themed cards) ---------- */
  const styleGrid = document.getElementById("styleGrid");
  function renderStyles() {
    if (!styleGrid) return;
    styleGrid.innerHTML = "";
    window.ART_STYLES.forEach((st) => {
      const card = document.createElement("div");
      card.className = "style-card style-" + st.key;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      const name = document.createElement("div");
      name.className = "style-name";
      name.textContent = st.name;
      const desc = document.createElement("div");
      desc.className = "style-desc";
      desc.textContent = st.desc;
      const go = document.createElement("div");
      go.className = "style-go";
      go.textContent = "Learn more →";
      card.append(name, desc, go);
      const open = () => openStyleDetail(st.key);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
      styleGrid.appendChild(card);
    });
  }

  /* ---------- Art Style detail page ---------- */
  const styleDetailBody = document.getElementById("styleDetailBody");
  const styleBack = document.getElementById("styleBack");
  if (styleBack) styleBack.addEventListener("click", () => showSection("styles"));

  function list(items) {
    return "<ul>" + items.map((t) => "<li>" + t + "</li>").join("") + "</ul>";
  }
  function openStyleDetail(key) {
    const st = window.ART_STYLES.find((s) => s.key === key);
    const info = window.STYLE_INFO[key];
    if (!st || !info || !styleDetailBody) return;
    styleDetailBody.innerHTML =
      '<div class="style-detail-hero style-' + key + '">' +
        "<h1>" + st.name + "</h1>" +
        '<p class="style-tagline">' + info.tagline + "</p>" +
      "</div>" +
      '<p class="style-about">' + info.about + "</p>" +
      "<h2>Where it came from</h2><p>" + info.origin + "</p>" +
      "<h2>Key characteristics</h2>" + list(info.traits) +
      "<h2>Tips for drawing it</h2>" + list(info.tips);
    showSection("styleDetail");
  }

  renderStyles();
})();
