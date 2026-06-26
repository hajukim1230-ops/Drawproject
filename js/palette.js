// Color Palette Generator
(function () {
  const bar = document.getElementById("harmonyBar");
  const container = document.getElementById("swatches");

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) =>
      Math.round(255 * x).toString(16).padStart(2, "0");
    return "#" + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  // Rough human-friendly color naming by hue
  function nameForHue(h, l) {
    if (l > 88) return "Near White";
    if (l < 14) return "Near Black";
    const names = [
      [0, "Red"], [15, "Vermilion"], [30, "Orange"], [45, "Amber"],
      [60, "Yellow"], [80, "Lime"], [100, "Green"], [140, "Emerald"],
      [170, "Teal"], [190, "Cyan"], [210, "Azure"], [230, "Blue"],
      [255, "Indigo"], [275, "Violet"], [300, "Magenta"], [330, "Rose"], [360, "Red"],
    ];
    let best = names[0][1];
    for (const [deg, name] of names) {
      if (h >= deg) best = name;
    }
    return best;
  }

  function swatch(h, s, l, label) {
    const hex = hslToHex(h, s, l);
    const name = label || nameForHue(((h % 360) + 360) % 360, l);
    return { hex, name };
  }

  const generators = {
    complementary(base) {
      return [
        swatch(base, 70, 55),
        swatch(base, 45, 70),
        swatch(base, 30, 85),
        swatch((base + 180) % 360, 70, 55),
        swatch((base + 180) % 360, 45, 72),
      ];
    },
    analogous(base) {
      return [-40, -20, 0, 20, 40].map((d) =>
        swatch((base + d + 360) % 360, 65, 60)
      );
    },
    triadic(base) {
      const out = [];
      [0, 120, 240].forEach((d) => {
        out.push(swatch((base + d) % 360, 68, 55));
        out.push(swatch((base + d) % 360, 40, 78));
      });
      return out;
    },
    warm() {
      const hues = [5, 20, 35, 48, 60, 350];
      return hues.map((h) => swatch(h, 75, 58));
    },
    cool() {
      const hues = [160, 185, 205, 225, 250, 275];
      return hues.map((h) => swatch(h, 60, 56));
    },
    skin() {
      // Range of skin tones, light -> deep
      return [
        swatch(28, 55, 86, "Porcelain"),
        swatch(26, 50, 76, "Light"),
        swatch(24, 48, 64, "Medium"),
        swatch(22, 45, 50, "Tan"),
        swatch(20, 42, 38, "Brown"),
        swatch(18, 38, 26, "Deep"),
      ];
    },
  };

  function render(list) {
    container.innerHTML = "";
    list.forEach((c) => {
      const card = document.createElement("div");
      card.className = "swatch";
      card.title = "Click to copy " + c.hex;
      card.innerHTML = `
        <div class="color" style="background:${c.hex}"></div>
        <div class="meta">
          <div class="name">${c.name}</div>
          <div class="hex">${c.hex.toUpperCase()}</div>
        </div>`;
      card.addEventListener("click", () => {
        if (navigator.clipboard) navigator.clipboard.writeText(c.hex);
        const hexEl = card.querySelector(".hex");
        const orig = hexEl.textContent;
        hexEl.textContent = "Copied!";
        setTimeout(() => (hexEl.textContent = orig), 800);
      });
      container.appendChild(card);
    });
  }

  function generate(type) {
    const base = Math.floor(Math.random() * 360);
    render(generators[type](base));
  }

  bar.addEventListener("click", (e) => {
    const btn = e.target.closest(".harmonybtn");
    if (!btn) return;
    bar.querySelectorAll(".harmonybtn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    generate(btn.dataset.harmony);
  });

  generate("complementary");
})();
