// Infinite pan/zoom canvas for Grid & Guides.
// The grid is drawn procedurally for the visible region (so it's endless),
// strokes are stored in world coordinates (unbounded + crisp at any zoom),
// and a traced reference floats on the board near the origin.
(function () {
  const canvas = document.getElementById("boardCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const strokeLayer = document.createElement("canvas");
  const sctx = strokeLayer.getContext("2d");

  const el = (id) => document.getElementById(id);
  const els = {
    cellSize: el("cellSize"), cellVal: el("cellVal"),
    opacity: el("gridOpacity"), opacityVal: el("opacityVal"),
    color: el("gridColor"), showGrid: el("showGrid"),
    symH: el("symH"), symV: el("symV"),
    refOpacity: el("refOpacity"), refOpacityVal: el("refOpacityVal"),
    refControl: el("refControl"), refName: el("refName"),
    penColor: el("penColor"), brushSize: el("brushSize"), brushVal: el("brushVal"),
    inkOpacity: el("inkOpacity"), inkOpacityVal: el("inkOpacityVal"),
    eraser: el("eraser"), clearDraw: el("clearDraw"),
    zoomIn: el("zoomIn"), zoomOut: el("zoomOut"), zoomReset: el("zoomReset"), zoomVal: el("zoomVal"),
    panMode: el("panMode"),
  };
  const gridColors = { gray: "120,128,140", blue: "79,124,255", red: "230,80,80" };
  const REF = 480; // reference box size in world units, centred on origin
  const TAU = Math.PI * 2;

  function cssVar(n) { return getComputedStyle(document.body).getPropertyValue(n).trim(); }

  // Camera: screen = world * scale + origin   (screen in CSS pixels)
  let scale = 1, originX = 0, originY = 0;
  let cw = 0, ch = 0, dpr = 1, needsCenter = true;
  const toWorldX = (sx) => (sx - originX) / scale;
  const toWorldY = (sy) => (sy - originY) / scale;
  const toScreenX = (wx) => wx * scale + originX;
  const toScreenY = (wy) => wy * scale + originY;

  // strokes: freehand {color,w,alpha,erase,pts:[...]}  or  shape {…,shape,a,b}
  const strokes = [];
  let refRender = null, refImg = null, refW = REF, refH = REF;
  let currentTool = "draw"; // draw | line | rect | ellipse | eyedropper

  // ---- sizing ----
  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    cw = r.width; ch = r.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    strokeLayer.width = canvas.width; strokeLayer.height = canvas.height;
    if (needsCenter && cw > 0) { needsCenter = false; resetView(); }
    else render();
  }

  // ---- render ----
  function render() {
    if (!cw) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = cssVar("--canvas-bg") || "#fff";
    ctx.fillRect(0, 0, cw, ch);

    // faint reference, centred on world origin
    if (refImg) {
      ctx.save();
      ctx.globalAlpha = parseInt(els.refOpacity.value, 10) / 100;
      ctx.drawImage(refImg, toScreenX(-refW / 2), toScreenY(-refH / 2), refW * scale, refH * scale);
      ctx.restore();
    }

    const cell = parseInt(els.cellSize.value, 10);
    const opacity = parseInt(els.opacity.value, 10) / 100;
    const rgb = gridColors[els.color.value];
    const step = cell * scale;

    if (els.showGrid.checked && opacity > 0 && step >= 5) {
      ctx.strokeStyle = `rgba(${rgb},${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const startWX = Math.ceil(toWorldX(0) / cell) * cell;
      for (let wx = startWX; toScreenX(wx) <= cw; wx += cell) {
        const x = Math.round(toScreenX(wx)) + 0.5;
        ctx.moveTo(x, 0); ctx.lineTo(x, ch);
      }
      const startWY = Math.ceil(toWorldY(0) / cell) * cell;
      for (let wy = startWY; toScreenY(wy) <= ch; wy += cell) {
        const y = Math.round(toScreenY(wy)) + 0.5;
        ctx.moveTo(0, y); ctx.lineTo(cw, y);
      }
      ctx.stroke();
    }

    // symmetry axes at world origin
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = `rgba(${rgb},${Math.max(opacity, 0.55)})`;
    if (els.symV.checked) {
      const x = toScreenX(0);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke();
    }
    if (els.symH.checked) {
      const y = toScreenY(0);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke();
    }
    ctx.restore();

    renderStrokes();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(strokeLayer, 0, 0);
    ctx.restore();
  }

  // Paint one stroke (freehand or shape) using world→target mapping functions.
  function paintOneStroke(c, s, mx, my, ws) {
    c.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
    c.globalAlpha = s.erase ? 1 : (s.alpha == null ? 1 : s.alpha);
    c.strokeStyle = s.color; c.fillStyle = s.color;
    c.lineWidth = Math.max(0.3, s.w * ws);
    if (s.shape) {
      const ax = mx(s.a.x), ay = my(s.a.y), bx = mx(s.b.x), by = my(s.b.y);
      c.beginPath();
      if (s.shape === "line") { c.moveTo(ax, ay); c.lineTo(bx, by); }
      else if (s.shape === "rect") { c.rect(Math.min(ax, bx), Math.min(ay, by), Math.abs(bx - ax), Math.abs(by - ay)); }
      else if (s.shape === "ellipse") { c.ellipse((ax + bx) / 2, (ay + by) / 2, Math.abs(bx - ax) / 2, Math.abs(by - ay) / 2, 0, 0, TAU); }
      c.stroke();
    } else {
      const p = s.pts;
      if (p.length === 1) {
        c.beginPath(); c.arc(mx(p[0].x), my(p[0].y), Math.max(0.3, (s.w * ws) / 2), 0, TAU); c.fill();
      } else {
        c.beginPath(); c.moveTo(mx(p[0].x), my(p[0].y));
        for (let i = 1; i < p.length; i++) c.lineTo(mx(p[i].x), my(p[i].y));
        c.stroke();
      }
    }
  }

  function renderStrokes() {
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, cw, ch);
    sctx.lineCap = "round"; sctx.lineJoin = "round";
    strokes.forEach((s) => paintOneStroke(sctx, s, toScreenX, toScreenY, scale));
    sctx.globalCompositeOperation = "source-over";
    sctx.globalAlpha = 1;
  }

  // ---- pointer: draw or pan ----
  let drawing = false, panning = false, last = null, spaceDown = false;
  function rel(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function wantPan(e) { return els.panMode.checked || spaceDown || e.button === 1; }

  canvas.addEventListener("pointerdown", (e) => {
    const p = rel(e);
    canvas.setPointerCapture(e.pointerId);
    if (wantPan(e)) {
      panning = true; last = p; canvas.style.cursor = "grabbing";
    } else if (currentTool === "eyedropper") {
      pickColor(p);
    } else {
      drawing = true;
      const wp = { x: toWorldX(p.x), y: toWorldY(p.y) };
      // Brush size is a fixed world-space width, so every stroke of the same
      // brush value is the same actual size on the grid regardless of zoom.
      const base = {
        color: els.penColor.value,
        w: parseInt(els.brushSize.value, 10),
        alpha: parseInt(els.inkOpacity.value, 10) / 100,
        erase: els.eraser.checked,
      };
      if (currentTool === "draw") base.pts = [wp];
      else { base.shape = currentTool; base.a = wp; base.b = wp; }
      strokes.push(base);
      render();
    }
    e.preventDefault();
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = rel(e);
    if (panning) {
      originX += p.x - last.x; originY += p.y - last.y; last = p; render();
    } else if (drawing) {
      const s = strokes[strokes.length - 1];
      const wp = { x: toWorldX(p.x), y: toWorldY(p.y) };
      if (s.shape) s.b = wp; else s.pts.push(wp);
      render();
    }
    e.preventDefault();
  });
  function endPointer(e) {
    drawing = false; panning = false; last = null;
    updateCursor();
    if (e && e.pointerId != null && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);

  // ---- wheel: zoom (ctrl/cmd) or pan ----
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const p = rel(e);
    if (e.ctrlKey || e.metaKey) {
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.1 : 1 / 1.1);
    } else {
      originX -= e.deltaX; originY -= e.deltaY; render();
    }
  }, { passive: false });

  function zoomAt(sx, sy, factor) {
    const wx = toWorldX(sx), wy = toWorldY(sy);
    scale = Math.min(8, Math.max(0.1, scale * factor));
    originX = sx - wx * scale;
    originY = sy - wy * scale;
    els.zoomVal.textContent = Math.round(scale * 100) + "%";
    render();
  }
  function resetView() {
    scale = 1; originX = cw / 2; originY = ch / 2;
    els.zoomVal.textContent = "100%";
    render();
  }

  // ---- controls ----
  function refreshLabels() {
    els.cellVal.textContent = els.cellSize.value + "px";
    els.opacityVal.textContent = els.opacity.value + "%";
    els.refOpacityVal.textContent = els.refOpacity.value + "%";
    els.brushVal.textContent = els.brushSize.value + "px";
    els.inkOpacityVal.textContent = els.inkOpacity.value + "%";
  }
  [els.cellSize, els.opacity, els.color, els.showGrid, els.symH, els.symV, els.refOpacity]
    .forEach((c) => { c.addEventListener("input", () => { refreshLabels(); render(); }); c.addEventListener("change", render); });
  els.brushSize.addEventListener("input", refreshLabels);
  els.inkOpacity.addEventListener("input", refreshLabels);

  // Tool selection (freehand / line / rect / ellipse / eyedropper)
  const toolRow = el("toolRow");
  function setTool(t) {
    currentTool = t;
    if (toolRow) toolRow.querySelectorAll(".tool-btn").forEach((b) => b.classList.toggle("active", b.dataset.tool === t));
  }
  if (toolRow) toolRow.addEventListener("click", (e) => {
    const b = e.target.closest(".tool-btn");
    if (b) setTool(b.dataset.tool);
  });

  function pickColor(p) {
    try {
      const x = Math.max(0, Math.min(canvas.width - 1, Math.round(p.x * dpr)));
      const y = Math.max(0, Math.min(canvas.height - 1, Math.round(p.y * dpr)));
      const d = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
      els.penColor.value = hex;
      addRecentColor(hex);
    } catch (err) { /* canvas may be unreadable */ }
    setTool("draw");
  }

  // Recent colors (shared with palette swatches via window.addBrushColor)
  const RECENT_KEY = "drawref-recent";
  function getRecent() { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch (e) { return []; } }
  function addRecentColor(hex) {
    hex = hex.toLowerCase();
    let a = getRecent().filter((c) => c !== hex);
    a.unshift(hex);
    a = a.slice(0, 10);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(a)); } catch (e) {}
    renderRecents();
  }
  function renderRecents() {
    const box = el("recentColors");
    if (!box) return;
    box.innerHTML = "";
    getRecent().forEach((hex) => {
      const b = document.createElement("button");
      b.className = "recent-swatch";
      b.style.background = hex;
      b.setAttribute("data-tip", hex.toUpperCase());
      b.addEventListener("click", () => { els.penColor.value = hex; });
      box.appendChild(b);
    });
  }
  window.addBrushColor = addRecentColor;
  els.penColor.addEventListener("change", () => addRecentColor(els.penColor.value));
  renderRecents();
  els.panMode.addEventListener("change", updateCursor);

  els.zoomIn.addEventListener("click", () => zoomAt(cw / 2, ch / 2, 1.25));
  els.zoomOut.addEventListener("click", () => zoomAt(cw / 2, ch / 2, 1 / 1.25));
  els.zoomReset.addEventListener("click", resetView);

  els.clearDraw.addEventListener("click", async () => {
    if (!strokes.length && !refImg) return;
    // (the reference is cleared together with the drawing below)
    const ok = await openDialog({ title: "Clear the canvas? This can't be undone.", okText: "Clear" });
    if (!ok) return;
    strokes.length = 0;
    refRender = null; refImg = null; els.refControl.hidden = true;
    render();
  });

  const panBtn = el("panBtn");
  function updateCursor() {
    canvas.style.cursor = (els.panMode.checked || spaceDown) ? "grab" : "crosshair";
    if (panBtn) panBtn.classList.toggle("active", els.panMode.checked);
  }
  if (panBtn) panBtn.addEventListener("click", () => {
    els.panMode.checked = !els.panMode.checked;
    updateCursor();
  });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && document.getElementById("grid").classList.contains("active")) {
      const t = e.target.tagName;
      if (t === "INPUT" || t === "BUTTON" || t === "TEXTAREA") return;
      spaceDown = true; updateCursor(); e.preventDefault();
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.code === "Space") { spaceDown = false; updateCursor(); }
  });

  // Reference sent from the Pose section (carries a draw function).
  window.addEventListener("gridpose", (e) => {
    refRender = e.detail.render;
    refImg = document.createElement("canvas");
    refImg.width = REF; refImg.height = REF;
    refW = REF; refH = REF;
    refRender(refImg);
    els.refName.textContent = e.detail.name;
    els.refControl.hidden = false;
    render();
  });

  window.addEventListener("themechange", () => { if (refRender) { refImg = document.createElement("canvas"); refImg.width = REF; refImg.height = REF; refRender(refImg); } render(); });

  // Fullscreen toggle on the canvas wrapper.
  const fsBtn = el("fsBtn");
  const wrap = canvas.closest(".canvas-wrap");
  function isFs() { return document.fullscreenElement || document.webkitFullscreenElement; }
  // Draw controls get moved into the fullscreen wrapper so they stay visible.
  const drawControl = el("drawControl");
  let dcParent = null, dcNext = null;
  if (fsBtn && wrap) {
    fsBtn.addEventListener("click", () => {
      if (isFs()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        (wrap.requestFullscreen || wrap.webkitRequestFullscreen).call(wrap);
      }
    });
    const onFs = () => {
      const full = isFs();
      fsBtn.textContent = full ? "✕" : "⛶";
      fsBtn.setAttribute("data-tip", full ? "Exit full screen" : "Full screen");
      if (drawControl) {
        if (full) {
          dcParent = drawControl.parentNode;
          dcNext = drawControl.nextSibling;
          wrap.appendChild(drawControl);
          drawControl.classList.add("fs-tools");
        } else if (dcParent) {
          drawControl.classList.remove("fs-tools", "show");
          dcParent.insertBefore(drawControl, dcNext);
        }
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);

    // Reveal the toolbar only when the pointer is near the left edge.
    wrap.addEventListener("pointermove", (e) => {
      if (!isFs() || !drawControl) return;
      const near = e.clientX - wrap.getBoundingClientRect().left < 230;
      drawControl.classList.toggle("show", near);
    });
    wrap.addEventListener("pointerleave", () => {
      if (drawControl) drawControl.classList.remove("show");
    });
  }

  // ---- Save / export / gallery of drawings ----
  const DRAW_KEY = "drawref-drawings";
  const saveBtn = el("saveBtn");
  const folderBtn = el("folderBtn");
  const exportBtn = el("exportBtn");
  const gallery = el("boardGallery");
  const galleryGrid = el("galleryGrid");
  const galleryClose = el("galleryClose");

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(DRAW_KEY)) || []; } catch (e) { return []; }
  }
  function writeAll(a) {
    try { localStorage.setItem(DRAW_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function bboxOf(list) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    list.forEach((s) => s.pts.forEach((p) => {
      if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y;
    }));
    return { minX, minY, maxX, maxY };
  }
  // Paint all strokes (erase-aware) onto ctx using a world→canvas transform.
  function paintStrokes(ctx2, ox, oy, sc) {
    const layer = document.createElement("canvas");
    layer.width = ctx2.canvas.width; layer.height = ctx2.canvas.height;
    const lx = layer.getContext("2d");
    lx.lineCap = "round"; lx.lineJoin = "round";
    strokes.forEach((s) => paintOneStroke(lx, s, (wx) => ox + wx * sc, (wy) => oy + wy * sc, sc));
    ctx2.drawImage(layer, 0, 0);
  }

  function makeThumb() {
    const tw = 280, th = 200, pad = 18;
    const c = document.createElement("canvas");
    c.width = tw; c.height = th;
    const cx = c.getContext("2d");
    cx.fillStyle = cssVar("--canvas-bg") || "#fff";
    cx.fillRect(0, 0, tw, th);
    if (strokes.length) {
      const b = bboxOf(strokes);
      const bw = Math.max(1, b.maxX - b.minX), bh = Math.max(1, b.maxY - b.minY);
      const sc = Math.min((tw - 2 * pad) / bw, (th - 2 * pad) / bh);
      paintStrokes(cx, (tw - bw * sc) / 2 - b.minX * sc, (th - bh * sc) / 2 - b.minY * sc, sc);
    }
    return c.toDataURL("image/png");
  }

  function fitToContent() {
    if (!strokes.length || !cw) return;
    const b = bboxOf(strokes), pad = 50;
    const bw = Math.max(1, b.maxX - b.minX), bh = Math.max(1, b.maxY - b.minY);
    scale = Math.min(8, Math.max(0.1, Math.min((cw - 2 * pad) / bw, (ch - 2 * pad) / bh)));
    originX = cw / 2 - (b.minX + bw / 2) * scale;
    originY = ch / 2 - (b.minY + bh / 2) * scale;
    els.zoomVal.textContent = Math.round(scale * 100) + "%";
    render();
  }

  // Lightweight in-canvas dialog (works in fullscreen). Returns a Promise.
  let dlg, dlgPanel;
  function buildDialog() {
    dlg = document.createElement("div");
    dlg.className = "board-gallery";
    dlg.hidden = true;
    dlgPanel = document.createElement("div");
    dlgPanel.className = "dialog-panel";
    dlg.appendChild(dlgPanel);
    wrap.appendChild(dlg);
    dlg.addEventListener("click", (e) => { if (e.target === dlg && dlg._resolve) dlg._resolve(null); });
  }
  function openDialog(opts) {
    return new Promise((resolve) => {
      dlgPanel.innerHTML =
        "<h3>" + opts.title + "</h3>" +
        (opts.input ? '<input class="dialog-input" type="text" />' : "") +
        '<div class="dialog-row"><button class="btn cancel">Cancel</button>' +
        '<button class="btn primary ok">' + (opts.okText || "OK") + "</button></div>";
      dlg.hidden = false;
      const inp = dlgPanel.querySelector(".dialog-input");
      if (inp) { inp.value = opts.defaultVal || ""; setTimeout(() => { inp.focus(); inp.select(); }, 0); }
      const done = (val) => { dlg.hidden = true; dlg._resolve = null; resolve(val); };
      dlg._resolve = done;
      dlgPanel.querySelector(".ok").onclick = () => done(opts.input ? (inp.value.trim() || opts.defaultVal || "") : true);
      dlgPanel.querySelector(".cancel").onclick = () => done(null);
      if (inp) inp.onkeydown = (e) => {
        if (e.key === "Enter") done(inp.value.trim() || opts.defaultVal || "");
        else if (e.key === "Escape") done(null);
      };
    });
  }

  function flash(msg) {
    saveBtn.textContent = "✓"; saveBtn.setAttribute("data-tip", msg);
    setTimeout(() => { saveBtn.textContent = "💾"; saveBtn.setAttribute("data-tip", "Save drawing"); }, 900);
  }

  async function saveDrawing() {
    if (!strokes.length) { flash("Nothing to save"); return; }
    const name = await openDialog({
      title: "Name your drawing", input: true,
      defaultVal: "Drawing " + (loadAll().length + 1), okText: "Save",
    });
    if (name === null) return;
    const all = loadAll();
    all.unshift({
      id: Date.now(), name: name, date: new Date().toLocaleString(),
      thumb: makeThumb(), strokes: JSON.parse(JSON.stringify(strokes)),
    });
    writeAll(all.slice(0, 60));
    flash("✓ Saved");
  }

  function exportPNG() {
    if (!strokes.length) { flash("Nothing to export"); return; }
    const b = bboxOf(strokes), pad = 40;
    const bw = Math.max(1, b.maxX - b.minX), bh = Math.max(1, b.maxY - b.minY);
    const sc = Math.min(8, Math.min(1600 / bw, 1600 / bh));
    const c = document.createElement("canvas");
    c.width = Math.round(bw * sc + 2 * pad);
    c.height = Math.round(bh * sc + 2 * pad);
    const cx = c.getContext("2d");
    cx.fillStyle = cssVar("--canvas-bg") || "#fff";
    cx.fillRect(0, 0, c.width, c.height);
    paintStrokes(cx, pad - b.minX * sc, pad - b.minY * sc, sc);
    const a = document.createElement("a");
    a.download = "drawing.png";
    a.href = c.toDataURL("image/png");
    a.click();
  }

  function renderGallery() {
    const all = loadAll();
    galleryGrid.innerHTML = "";
    if (!all.length) {
      galleryGrid.innerHTML = '<div class="gallery-empty">No saved drawings yet. Draw something, then press 💾 Save.</div>';
      return;
    }
    all.forEach((d) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.innerHTML =
        '<img src="' + d.thumb + '" alt="saved drawing" title="Load this drawing">' +
        '<div class="gallery-meta">' +
          '<span class="gallery-name">' + (d.name || "Untitled") + "</span>" +
          '<span class="gallery-date">' + d.date + "</span>" +
          '<div class="gallery-row"><button class="btn load">Load</button>' +
          '<button class="btn del">Delete</button></div></div>';
      const load = () => loadDrawing(d);
      item.querySelector("img").addEventListener("click", load);
      item.querySelector(".load").addEventListener("click", load);
      item.querySelector(".del").addEventListener("click", async () => {
        const ok = await openDialog({ title: "Delete “" + (d.name || "Untitled") + "”?", okText: "Delete" });
        if (!ok) return;
        writeAll(loadAll().filter((x) => x.id !== d.id));
        renderGallery();
      });
      galleryGrid.appendChild(item);
    });
  }
  function loadDrawing(d) {
    strokes.length = 0;
    (d.strokes || []).forEach((s) => strokes.push(s));
    gallery.hidden = true;
    fitToContent();
    if (!strokes.length) render();
  }

  // Import an image as a faint reference to trace over.
  const importBtn = el("importBtn");
  const importInput = el("importInput");
  if (importBtn && importInput) {
    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", () => {
      const file = importInput.files && importInput.files[0];
      if (!file) return;
      const img = new Image();
      img.onload = () => {
        refImg = img;
        refRender = null; // a bitmap reference; nothing to re-render on theme change
        if (img.width >= img.height) { refW = REF; refH = REF * img.height / img.width; }
        else { refH = REF; refW = REF * img.width / img.height; }
        els.refName.textContent = file.name;
        els.refControl.hidden = false;
        URL.revokeObjectURL(img.src);
        resetView();
      };
      img.src = URL.createObjectURL(file);
      importInput.value = ""; // allow re-importing the same file
    });
  }

  buildDialog();
  if (saveBtn) saveBtn.addEventListener("click", saveDrawing);
  if (exportBtn) exportBtn.addEventListener("click", exportPNG);
  if (folderBtn) folderBtn.addEventListener("click", () => { renderGallery(); gallery.hidden = false; });
  if (galleryClose) galleryClose.addEventListener("click", () => { gallery.hidden = true; });
  if (gallery) gallery.addEventListener("click", (e) => { if (e.target === gallery) gallery.hidden = true; });

  refreshLabels();
  // Re-measure whenever the board's box changes — including when the Grid
  // section is first shown (it starts hidden, so has zero size at load).
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  resize();
})();
