// Color Palette Generator
(function () {
  const bar = document.getElementById("harmonyBar");
  const container = document.getElementById("swatches");
  const baseInput = document.getElementById("baseColor");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const copyBtn = document.getElementById("copyBtn");
  const saveBtn = document.getElementById("saveBtn");
  const savedWrap = document.getElementById("savedWrap");
  const savedList = document.getElementById("savedList");
  const toastEl = document.getElementById("paletteToast");
  const SAVE_KEY = "drawref-palettes";

  // ---- color math ----
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
    return "#" + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }
  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
    }
    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
  }

  function nameForHue(h, l) {
    if (l > 90) return "Near White";
    if (l < 12) return "Near Black";
    const names = [
      [0, "Red"], [15, "Vermilion"], [30, "Orange"], [45, "Amber"],
      [60, "Yellow"], [80, "Lime"], [100, "Green"], [140, "Emerald"],
      [170, "Teal"], [190, "Cyan"], [210, "Azure"], [230, "Blue"],
      [255, "Indigo"], [275, "Violet"], [300, "Magenta"], [330, "Rose"], [360, "Red"],
    ];
    let best = names[0][1];
    for (const [deg, name] of names) if (h >= deg) best = name;
    return best;
  }
  function swatch(h, s, l, label) {
    const hex = hslToHex(h, s, l);
    return { hex, name: label || nameForHue(((h % 360) + 360) % 360, l), locked: false };
  }
  function fromHex(hex) {
    const [h, , l] = hexToHsl(hex);
    return { hex, name: nameForHue(h, l), locked: false };
  }

  // ---- harmonies ----
  const generators = {
    complementary: (b) => [
      swatch(b, 72, 55), swatch(b, 48, 72), swatch(b, 28, 88),
      swatch((b + 180) % 360, 70, 55), swatch((b + 180) % 360, 48, 72),
    ],
    "split-complementary": (b) => [
      swatch(b, 72, 55), swatch(b, 45, 74),
      swatch((b + 150) % 360, 65, 58), swatch((b + 210) % 360, 65, 58),
      swatch((b + 180) % 360, 22, 88),
    ],
    analogous: (b) => [-40, -20, 0, 20, 40].map((d) => swatch((b + d + 360) % 360, 65, 60)),
    triadic: (b) => {
      const out = [];
      [0, 120, 240].forEach((d) => {
        out.push(swatch((b + d) % 360, 68, 55));
        out.push(swatch((b + d) % 360, 40, 78));
      });
      return out;
    },
    tetradic: (b) => [
      ...[0, 90, 180, 270].map((d) => swatch((b + d) % 360, 65, 58)),
      swatch(b, 28, 86),
    ],
    monochromatic: (b) => [90, 76, 62, 48, 34, 22].map((l) => swatch(b, 62, l)),
    warm: () => [5, 20, 35, 48, 60, 350].map((h) => swatch(h, 75, 58)),
    cool: () => [160, 185, 205, 225, 250, 275].map((h) => swatch(h, 60, 56)),
    pastel: (b) => [-40, -20, 0, 20, 40].map((d) => swatch((b + d + 360) % 360, 55, 84)),
    neon: (b) => [0, 60, 150, 210, 300].map((d) => swatch((b + d) % 360, 95, 58)),
    earth: () => [
      swatch(28, 45, 45, "Sienna"), swatch(36, 42, 60, "Ochre"),
      swatch(80, 30, 45, "Olive"), swatch(95, 24, 38, "Moss"),
      swatch(22, 35, 30, "Umber"), swatch(40, 28, 76, "Sand"),
    ],
    skin: () => [
      swatch(28, 55, 86, "Porcelain"), swatch(26, 50, 76, "Light"),
      swatch(24, 48, 64, "Medium"), swatch(22, 45, 50, "Tan"),
      swatch(20, 42, 38, "Brown"), swatch(18, 38, 26, "Deep"),
    ],
  };

  let currentType = "complementary";
  let currentBase = Math.floor(Math.random() * 360);
  let colors = [];

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => (toastEl.hidden = true), 250);
    }, 1100);
  }

  function copyHex(hex, feedbackEl) {
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
    if (window.addBrushColor) window.addBrushColor(hex); // feed into brush recents
    if (feedbackEl) {
      const orig = feedbackEl.textContent;
      feedbackEl.textContent = "Copied!";
      setTimeout(() => (feedbackEl.textContent = orig), 800);
    }
  }

  function render() {
    container.innerHTML = "";
    colors.forEach((c, i) => {
      const card = document.createElement("div");
      card.className = "swatch" + (c.locked ? " locked" : "");
      card.title = "Click to copy " + c.hex;
      card.innerHTML =
        '<div class="color" style="background:' + c.hex + '">' +
          '<button class="lockbtn" title="Lock this color">' + (c.locked ? "🔒" : "🔓") + "</button>" +
        "</div>" +
        '<div class="meta"><div class="name">' + c.name + "</div>" +
        '<div class="hex">' + c.hex.toUpperCase() + "</div></div>";
      card.addEventListener("click", () => copyHex(c.hex, card.querySelector(".hex")));
      card.querySelector(".lockbtn").addEventListener("click", (e) => {
        e.stopPropagation();
        colors[i].locked = !colors[i].locked;
        render();
      });
      container.appendChild(card);
    });
  }

  function applyLocks(list) {
    return list.map((c, i) => (colors[i] && colors[i].locked ? colors[i] : c));
  }
  function regen(syncBase) {
    colors = applyLocks(generators[currentType](currentBase));
    render();
    if (syncBase && colors[0]) baseInput.value = colors[0].hex;
  }
  function shuffle() {
    currentBase = Math.floor(Math.random() * 360);
    regen(true);
  }

  // ---- saved palettes (localStorage) ----
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || []; } catch (e) { return []; }
  }
  function writeSaved(arr) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function renderSaved() {
    const all = loadSaved();
    savedWrap.hidden = all.length === 0;
    savedList.innerHTML = "";
    all.forEach((hexes, idx) => {
      const item = document.createElement("div");
      item.className = "saved-item";
      item.title = "Load this palette";
      item.innerHTML =
        hexes.map((h) => '<span class="chip" style="background:' + h + '"></span>').join("") +
        '<button class="saved-del" title="Delete">×</button>';
      item.addEventListener("click", () => {
        colors = hexes.map(fromHex);
        bar.querySelectorAll(".harmonybtn").forEach((b) => b.classList.remove("active"));
        render();
      });
      item.querySelector(".saved-del").addEventListener("click", (e) => {
        e.stopPropagation();
        const a = loadSaved(); a.splice(idx, 1); writeSaved(a); renderSaved();
      });
      savedList.appendChild(item);
    });
  }

  // ---- events ----
  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".harmonybtn");
    if (!btn) return;
    bar.querySelectorAll(".harmonybtn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.harmony;
    colors = []; // new harmony clears locks
    shuffle();
  });

  baseInput.addEventListener("input", () => {
    currentBase = hexToHsl(baseInput.value)[0];
    regen(false);
  });
  shuffleBtn.addEventListener("click", shuffle);

  copyBtn.addEventListener("click", () => {
    const css = ":root {\n" +
      colors.map((c, i) => "  --color-" + (i + 1) + ": " + c.hex + ";").join("\n") +
      "\n}";
    if (navigator.clipboard) navigator.clipboard.writeText(css);
    toast("CSS variables copied");
  });

  saveBtn.addEventListener("click", () => {
    const all = loadSaved();
    all.unshift(colors.map((c) => c.hex));
    writeSaved(all.slice(0, 20));
    renderSaved();
    toast("Palette saved");
  });

  // Spacebar shuffles while the palette section is open
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;
    const sec = document.getElementById("palette");
    if (!sec || !sec.classList.contains("active")) return;
    const t = e.target.tagName;
    if (t === "INPUT" || t === "BUTTON" || t === "TEXTAREA") return;
    e.preventDefault();
    shuffle();
  });

  shuffle();
  renderSaved();
})();
