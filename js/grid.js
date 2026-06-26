// Grid & Guides canvas
(function () {
  const canvas = document.getElementById("gridCanvas");
  const ctx = canvas.getContext("2d");

  const els = {
    cellSize: document.getElementById("cellSize"),
    cellVal: document.getElementById("cellVal"),
    opacity: document.getElementById("gridOpacity"),
    opacityVal: document.getElementById("opacityVal"),
    color: document.getElementById("gridColor"),
    showGrid: document.getElementById("showGrid"),
    symH: document.getElementById("symH"),
    symV: document.getElementById("symV"),
    refControl: document.getElementById("refControl"),
    refName: document.getElementById("refName"),
    refOpacity: document.getElementById("refOpacity"),
    refOpacityVal: document.getElementById("refOpacityVal"),
    clearRef: document.getElementById("clearRef"),
  };

  const colors = { gray: "120,128,140", blue: "79,124,255", red: "230,80,80" };

  // Active reference pose drawn faintly behind the grid.
  let refPose = null;

  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cssVar("--canvas-bg") || "#fff";
    ctx.fillRect(0, 0, w, h);

    // Faint reference figure, drawn first so the grid sits on top.
    if (refPose) {
      const refAlpha = parseInt(els.refOpacity.value, 10) / 100;
      drawPose(canvas, refPose, {
        clear: false,
        bg: false,
        ghost: true,
        alpha: refAlpha,
        boneWidth: 5,
        pad: 0.16,
      });
    }

    const cell = parseInt(els.cellSize.value, 10);
    const opacity = parseInt(els.opacity.value, 10) / 100;
    const rgb = colors[els.color.value];

    if (els.showGrid.checked && opacity > 0) {
      ctx.strokeStyle = `rgba(${rgb},${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = cell; x < w; x += cell) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = cell; y < h; y += cell) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();
    }

    // Symmetry axes drawn bolder, dashed
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(${rgb},${Math.max(opacity, 0.55)})`;
    if (els.symV.checked) {
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
    }
    if (els.symH.checked) {
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function update() {
    els.cellVal.textContent = els.cellSize.value + "px";
    els.opacityVal.textContent = els.opacity.value + "%";
    els.refOpacityVal.textContent = els.refOpacity.value + "%";
    draw();
  }

  [
    els.cellSize, els.opacity, els.color,
    els.showGrid, els.symH, els.symV, els.refOpacity,
  ].forEach((el) => {
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  els.clearRef.addEventListener("click", () => {
    refPose = null;
    els.refControl.hidden = true;
    draw();
  });

  // A pose reference was sent over from the Pose section.
  window.addEventListener("gridpose", (e) => {
    refPose = e.detail.pose;
    els.refName.textContent = e.detail.name;
    els.refControl.hidden = false;
    draw();
  });

  // Redraw when theme changes so canvas bg matches
  window.addEventListener("themechange", draw);

  update();
})();
