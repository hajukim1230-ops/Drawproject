// Procedural per-step diagrams for the tutorials. Each tutorial is an array
// of 8 layer-functions; step N draws layers 0..N, with layer N highlighted.
(function () {
  const TWO_PI = Math.PI * 2;

  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  // ---- Layer definitions (use the drawing helper `g`) ----
  const TUT = {
    face: [
      (g) => g.ell(0.5, 0.5, 0.26, 0.34),                 // head oval
      (g) => g.line(0.5, 0.17, 0.5, 0.83),                // center line
      (g) => g.line(0.27, 0.5, 0.73, 0.5),                // eye line
      (g) => {                                            // eyes
        g.ell(0.38, 0.5, 0.07, 0.035);
        g.ell(0.62, 0.5, 0.07, 0.035);
        g.disc(0.38, 0.5, 0.018);
        g.disc(0.62, 0.5, 0.018);
      },
      (g) => {                                            // nose
        g.line(0.5, 0.55, 0.46, 0.67);
        g.line(0.46, 0.67, 0.53, 0.67);
      },
      (g) => g.curve(0.43, 0.73, 0.5, 0.77, 0.57, 0.73),  // mouth
      (g) => {                                            // ears
        g.curve(0.24, 0.5, 0.17, 0.58, 0.25, 0.66);
        g.curve(0.76, 0.5, 0.83, 0.58, 0.75, 0.66);
      },
      (g) => g.curve(0.26, 0.33, 0.5, 0.16, 0.74, 0.33),  // hairline
    ],

    eye: [
      (g) => {                                            // almond
        g.curve(0.16, 0.5, 0.5, 0.33, 0.84, 0.5);
        g.curve(0.16, 0.5, 0.5, 0.6, 0.84, 0.5);
      },
      (g) => {                                            // corners
        g.line(0.16, 0.5, 0.1, 0.49);
        g.line(0.84, 0.5, 0.9, 0.54);
      },
      (g) => g.circle(0.5, 0.53, 0.17),                   // iris
      (g) => g.disc(0.5, 0.53, 0.075),                    // pupil
      (g) => g.circle(0.44, 0.48, 0.03),                  // highlight
      (g) => g.curve(0.2, 0.43, 0.5, 0.35, 0.82, 0.41),   // crease
      (g) => {                                            // lashes
        g.line(0.16, 0.5, 0.08, 0.43);
        g.line(0.21, 0.45, 0.15, 0.37);
        g.line(0.34, 0.4, 0.32, 0.33);
        g.line(0.5, 0.37, 0.5, 0.3);
      },
      (g) => g.curve(0.2, 0.28, 0.5, 0.2, 0.84, 0.28),    // eyebrow
    ],

    hand: [
      (g) => g.poly([[0.34, 0.5], [0.66, 0.5], [0.69, 0.82], [0.31, 0.82]]), // palm
      (g) => g.curve(0.34, 0.5, 0.5, 0.44, 0.66, 0.5),    // knuckle arch
      (g) => g.line(0.5, 0.48, 0.5, 0.13),                // middle finger
      (g) => {                                            // index + ring
        g.line(0.41, 0.5, 0.39, 0.2);
        g.line(0.59, 0.5, 0.61, 0.22);
      },
      (g) => g.line(0.66, 0.52, 0.71, 0.33),              // pinky
      (g) => {                                            // thumb
        g.line(0.34, 0.66, 0.19, 0.52);
        g.line(0.19, 0.52, 0.14, 0.41);
      },
      (g) => {                                            // knuckle joints
        [[0.5, 0.48], [0.5, 0.36], [0.5, 0.24],
         [0.41, 0.5], [0.4, 0.4], [0.39, 0.3],
         [0.59, 0.5], [0.6, 0.4], [0.61, 0.31],
         [0.66, 0.52], [0.68, 0.45], [0.71, 0.38],
         [0.34, 0.66], [0.19, 0.52]].forEach((p) => g.dot(p[0], p[1]));
      },
      (g) => {                                            // fingertips/nails
        [[0.5, 0.13], [0.39, 0.2], [0.61, 0.22], [0.71, 0.33], [0.14, 0.41]]
          .forEach((p) => g.fillEll(p[0], p[1], 0.025, 0.018, 0));
      },
    ],

    body: [
      (g) => {                                            // measuring line + units
        g.line(0.5, 0.1, 0.5, 0.95);
        for (let i = 0; i <= 7; i++) g.tick(0.5, 0.1 + (0.85 * i) / 7, 0.05);
      },
      (g) => g.ell(0.5, 0.16, 0.06, 0.075),               // head
      (g) => g.ell(0.5, 0.34, 0.1, 0.13),                 // ribcage
      (g) => g.poly([[0.42, 0.5], [0.58, 0.5], [0.55, 0.62], [0.45, 0.62]]), // pelvis
      (g) => g.curve(0.5, 0.22, 0.53, 0.38, 0.5, 0.5),    // spine / line of action
      (g) => {                                            // stick limbs
        g.line(0.42, 0.26, 0.58, 0.26);
        g.line(0.42, 0.26, 0.37, 0.42); g.line(0.37, 0.42, 0.39, 0.56);
        g.line(0.58, 0.26, 0.63, 0.42); g.line(0.63, 0.42, 0.61, 0.56);
        g.line(0.45, 0.62, 0.45, 0.79); g.line(0.45, 0.79, 0.45, 0.93);
        g.line(0.55, 0.62, 0.55, 0.79); g.line(0.55, 0.79, 0.55, 0.93);
      },
      (g) => {                                            // joints
        [[0.42, 0.26], [0.58, 0.26], [0.37, 0.42], [0.63, 0.42],
         [0.39, 0.56], [0.61, 0.56], [0.45, 0.62], [0.55, 0.62],
         [0.45, 0.79], [0.55, 0.79]].forEach((p) => g.dot(p[0], p[1]));
      },
      (g) => {                                            // flesh out limbs
        g.tube(0.42, 0.26, 0.37, 0.42, 0.04, 0.03);
        g.tube(0.37, 0.42, 0.39, 0.56, 0.03, 0.022);
        g.tube(0.58, 0.26, 0.63, 0.42, 0.04, 0.03);
        g.tube(0.63, 0.42, 0.61, 0.56, 0.03, 0.022);
        g.tube(0.45, 0.62, 0.45, 0.79, 0.05, 0.035);
        g.tube(0.45, 0.79, 0.45, 0.93, 0.035, 0.025);
        g.tube(0.55, 0.62, 0.55, 0.79, 0.05, 0.035);
        g.tube(0.55, 0.79, 0.55, 0.93, 0.035, 0.025);
      },
    ],

    animal: [
      (g) => {                                            // head + body
        g.circle(0.3, 0.42, 0.14);
        g.ell(0.62, 0.56, 0.22, 0.16);
      },
      (g) => {                                            // neck/chest
        g.line(0.4, 0.35, 0.46, 0.45);
        g.line(0.41, 0.5, 0.46, 0.62);
      },
      (g) => {                                            // ears
        g.poly([[0.22, 0.33], [0.25, 0.18], [0.33, 0.31]]);
        g.poly([[0.33, 0.31], [0.4, 0.2], [0.43, 0.34]]);
      },
      (g) => {                                            // front legs
        g.line(0.5, 0.68, 0.5, 0.9);
        g.line(0.57, 0.68, 0.57, 0.9);
      },
      (g) => {                                            // back legs + haunch
        g.circle(0.74, 0.55, 0.1);
        g.line(0.73, 0.64, 0.71, 0.79); g.line(0.71, 0.79, 0.74, 0.9);
        g.line(0.8, 0.64, 0.8, 0.9);
      },
      (g) => g.curve(0.82, 0.52, 0.97, 0.46, 0.9, 0.27),  // tail
      (g) => {                                            // face details
        g.disc(0.26, 0.4, 0.018);
        g.disc(0.34, 0.4, 0.018);
        g.poly([[0.17, 0.46], [0.22, 0.46], [0.2, 0.49]]);
        g.line(0.2, 0.48, 0.05, 0.45);
        g.line(0.2, 0.49, 0.06, 0.53);
      },
      (g) => {                                            // fur ticks / refine
        g.line(0.45, 0.41, 0.48, 0.38);
        g.line(0.6, 0.4, 0.63, 0.37);
        g.line(0.75, 0.43, 0.78, 0.4);
        g.line(0.26, 0.2, 0.27, 0.24);
        g.line(0.37, 0.22, 0.38, 0.26);
      },
    ],
  };

  // ---- Renderer ----
  window.drawTutorialStep = function (canvas, key, step) {
    const layers = TUT[key];
    if (!layers) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const sz = Math.min(w, h);
    const pad = 0.1 * sz;
    const SPAN = sz - 2 * pad;
    const ox = (w - SPAN) / 2;
    const oy = (h - SPAN) / 2;

    const bg = cssVar("--canvas-bg") || "#fff";
    const muted = cssVar("--text-dim") || "#999";
    const accent = cssVar("--accent") || "#4f7cff";

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const X = (nx) => ox + nx * SPAN;
    const Y = (ny) => oy + ny * SPAN;
    const SC = (v) => v * SPAN;

    const g = {
      line(a, b, c, d) {
        ctx.beginPath(); ctx.moveTo(X(a), Y(b)); ctx.lineTo(X(c), Y(d)); ctx.stroke();
      },
      curve(a, b, cx, cy, c, d) {
        ctx.beginPath(); ctx.moveTo(X(a), Y(b));
        ctx.quadraticCurveTo(X(cx), Y(cy), X(c), Y(d)); ctx.stroke();
      },
      circle(cx, cy, r) {
        ctx.beginPath(); ctx.arc(X(cx), Y(cy), SC(r), 0, TWO_PI); ctx.stroke();
      },
      disc(cx, cy, r) {
        ctx.beginPath(); ctx.arc(X(cx), Y(cy), SC(r), 0, TWO_PI); ctx.fill();
      },
      ell(cx, cy, rx, ry, rot) {
        ctx.beginPath(); ctx.ellipse(X(cx), Y(cy), SC(rx), SC(ry), rot || 0, 0, TWO_PI);
        ctx.stroke();
      },
      fillEll(cx, cy, rx, ry, rot) {
        ctx.beginPath(); ctx.ellipse(X(cx), Y(cy), SC(rx), SC(ry), rot || 0, 0, TWO_PI);
        ctx.fill();
      },
      poly(pts, close) {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))));
        if (close !== false) ctx.closePath();
        ctx.stroke();
      },
      dot(x, y) {
        ctx.beginPath(); ctx.arc(X(x), Y(y), SC(0.016), 0, TWO_PI); ctx.fill();
      },
      tick(x, y, len) {
        const l = SC(len) / 2;
        ctx.beginPath(); ctx.moveTo(X(x) - l, Y(y)); ctx.lineTo(X(x) + l, Y(y)); ctx.stroke();
      },
      tube(a, b, c, d, r0, r1) {
        const ax = X(a), ay = Y(b), bx = X(c), by = Y(d), ra = SC(r0), rb = SC(r1);
        const th = Math.atan2(by - ay, bx - ax);
        const a1 = th + Math.PI / 2, a2 = th - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(ax + Math.cos(a1) * ra, ay + Math.sin(a1) * ra);
        ctx.lineTo(bx + Math.cos(a1) * rb, by + Math.sin(a1) * rb);
        ctx.arc(bx, by, rb, a1, a1 - Math.PI, true);
        ctx.lineTo(ax + Math.cos(a2) * ra, ay + Math.sin(a2) * ra);
        ctx.arc(ax, ay, ra, a2, a2 - Math.PI, true);
        ctx.closePath();
        const fs = ctx.fillStyle;
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.fillStyle = fs;
        ctx.stroke();
      },
    };

    for (let j = 0; j <= step && j < layers.length; j++) {
      const cur = j === step;
      ctx.strokeStyle = cur ? accent : muted;
      ctx.fillStyle = cur ? accent : muted;
      ctx.lineWidth = Math.max(1.4, cur ? SC(0.022) : SC(0.012));
      layers[j](g);
    }
  };
})();
