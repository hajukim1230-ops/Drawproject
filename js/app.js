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
  let currentCat = "human";
  const thumbs = []; // {canvas, pose} for theme redraws
  let currentDetailPose = null;
  let currentDetailName = "";

  traceBtn.addEventListener("click", () => {
    if (!currentDetailPose) return;
    window.dispatchEvent(new CustomEvent("gridpose", {
      detail: { pose: currentDetailPose, name: currentDetailName },
    }));
    showSection("grid");
  });

  function renderPoseGrid(cat) {
    currentCat = cat;
    poseGrid.innerHTML = "";
    thumbs.length = 0;
    detail.classList.add("hidden");
    const group = window.POSES[cat];
    Object.keys(group).forEach((name) => {
      const pose = group[name];
      const card = document.createElement("div");
      card.className = "pose-card";
      const cv = document.createElement("canvas");
      cv.width = 150;
      cv.height = 150;
      const label = document.createElement("div");
      label.className = "pose-name";
      label.textContent = name;
      card.appendChild(cv);
      card.appendChild(label);
      poseGrid.appendChild(card);
      drawPose(cv, pose, { boneWidth: 3 });
      thumbs.push({ canvas: cv, pose });
      card.addEventListener("click", () => openDetail(name, pose));
    });
  }

  function openDetail(name, pose) {
    currentDetailPose = pose;
    currentDetailName = name;
    detailName.textContent = name;
    detailTip.textContent = pose.tip || "";
    drawPose(detailCanvas, pose, { boneWidth: 6 });
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

  // Redraw pose canvases on theme change (colors are CSS-var based)
  window.addEventListener("themechange", () => {
    thumbs.forEach((t) => drawPose(t.canvas, t.pose, { boneWidth: 3 }));
    if (currentDetailPose && !detail.classList.contains("hidden")) {
      drawPose(detailCanvas, currentDetailPose, { boneWidth: 6 });
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

  function renderHomePreviews() {
    document.querySelectorAll(".home-canvas").forEach((cv) => {
      const ctx = cv.getContext("2d");
      const w = cv.width;
      const h = cv.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = cssVar("--canvas-bg") || "#fff";
      ctx.fillRect(0, 0, w, h);

      switch (cv.dataset.preview) {
        case "grid": {
          ctx.strokeStyle = "rgba(99,102,241,0.28)";
          ctx.lineWidth = 1;
          const cell = h / 4;
          for (let x = cell; x < w; x += cell) {
            ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke();
          }
          for (let y = cell; y < h; y += cell) {
            ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
          }
          ctx.setLineDash([7, 6]);
          ctx.strokeStyle = "rgba(139,92,246,0.65)";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
          ctx.setLineDash([]);
          drawPose(cv, window.POSES.human.standing, {
            clear: false, bg: false, alpha: 0.5, pad: 0.16,
          });
          break;
        }
        case "palette": {
          const cols = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
          const gap = 12;
          const bw = (w - gap * (cols.length + 1)) / cols.length;
          const top = 28;
          cols.forEach((c, i) => {
            roundRect(ctx, gap + i * (bw + gap), top, bw, h - top * 2, 16);
            ctx.fillStyle = c;
            ctx.fill();
          });
          break;
        }
        case "poses":
          drawPose(cv, window.POSES.human.reaching, { pad: 0.12 });
          break;
        case "tutorials":
          drawTutorialStep(cv, "face", 7);
          break;
      }
    });
  }

  renderHomePreviews();
  window.addEventListener("themechange", renderHomePreviews);

  /* ---------- Art Styles gallery ---------- */
  const styleGrid = document.getElementById("styleGrid");
  const styleCanvases = [];
  function renderStyles() {
    if (!styleGrid) return;
    styleGrid.innerHTML = "";
    styleCanvases.length = 0;
    window.ART_STYLES.forEach((st) => {
      const card = document.createElement("div");
      card.className = "style-card style-" + st.key;
      if (st.img) {
        const img = document.createElement("img");
        img.className = "style-img";
        img.src = st.img;
        img.alt = st.name + " example";
        img.loading = "lazy";
        card.appendChild(img);
      } else {
        const cv = document.createElement("canvas");
        cv.width = 384;
        cv.height = 240;
        cv.className = "style-canvas";
        card.appendChild(cv);
        drawArtStyle(cv, st.key);
        styleCanvases.push({ cv, key: st.key });
      }
      const name = document.createElement("div");
      name.className = "style-name";
      name.textContent = st.name;
      const desc = document.createElement("div");
      desc.className = "style-desc";
      desc.textContent = st.desc;
      card.append(name, desc);
      if (st.credit) {
        const cr = document.createElement("div");
        cr.className = "style-credit";
        cr.textContent = st.credit;
        card.appendChild(cr);
      }
      styleGrid.appendChild(card);
    });
  }
  renderStyles();
  window.addEventListener("themechange", () => {
    styleCanvases.forEach((s) => drawArtStyle(s.cv, s.key));
  });
})();
