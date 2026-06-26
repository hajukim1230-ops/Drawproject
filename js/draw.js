// Free-hand drawing on a transparent canvas layered over the grid.
(function () {
  const canvas = document.getElementById("drawCanvas");
  const ctx = canvas.getContext("2d");

  const penColor = document.getElementById("penColor");
  const brushSize = document.getElementById("brushSize");
  const brushVal = document.getElementById("brushVal");
  const eraser = document.getElementById("eraser");
  const clearBtn = document.getElementById("clearDraw");

  let drawing = false;
  let last = null;

  // Map a pointer event to canvas pixel coordinates (canvas is scaled by CSS).
  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function applyStroke() {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = parseInt(brushSize.value, 10);
    if (eraser.checked) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = penColor.value;
    }
  }

  function start(e) {
    drawing = true;
    last = pos(e);
    applyStroke();
    // Draw a dot so a single tap leaves a mark.
    ctx.beginPath();
    ctx.arc(last.x, last.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = eraser.checked ? "rgba(0,0,0,1)" : penColor.value;
    ctx.fill();
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function move(e) {
    if (!drawing) return;
    const p = pos(e);
    applyStroke();
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    e.preventDefault();
  }

  function end(e) {
    drawing = false;
    last = null;
    if (e && e.pointerId != null && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  }

  canvas.addEventListener("pointerdown", start);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", end);

  brushSize.addEventListener("input", () => {
    brushVal.textContent = brushSize.value + "px";
  });

  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
})();
