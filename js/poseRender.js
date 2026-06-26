// Draws a pose as an artist-mannequin: separate construction volumes
// (ribcage, pelvis, ball joints, cylindrical limbs, head with guide cross)
// drawn as outlines, built procedurally from landmark points.
(function () {
  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  const TWO_PI = Math.PI * 2;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const add = (p, vx, vy) => [p[0] + vx, p[1] + vy];

  // --- shape primitives: fill (occlude) + stroke (outline) ---

  function tubePath(ctx, ax, ay, bx, by, ra, rb) {
    const th = Math.atan2(by - ay, bx - ax);
    const a1 = th + Math.PI / 2;
    const a2 = th - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(ax + Math.cos(a1) * ra, ay + Math.sin(a1) * ra);
    ctx.lineTo(bx + Math.cos(a1) * rb, by + Math.sin(a1) * rb);
    ctx.arc(bx, by, rb, a1, a1 - Math.PI, true); // round cap at B
    ctx.lineTo(ax + Math.cos(a2) * ra, ay + Math.sin(a2) * ra);
    ctx.arc(ax, ay, ra, a2, a2 - Math.PI, true); // round cap at A
    ctx.closePath();
  }

  function tube(ctx, A, B, ra, rb) {
    tubePath(ctx, A[0], A[1], B[0], B[1], ra, rb);
    ctx.fill();
    ctx.stroke();
  }

  function ball(ctx, c, r) {
    ctx.beginPath();
    ctx.arc(c[0], c[1], r, 0, TWO_PI);
    ctx.fill();
    ctx.stroke();
  }

  function oval(ctx, c, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(c[0], c[1], rx, ry, rot || 0, 0, TWO_PI);
    ctx.fill();
    ctx.stroke();
  }

  function poly(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Guide line (stroke only) — for the facial cross.
  function guide(ctx, p0, ctrl, p1) {
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(ctrl[0], ctrl[1], p1[0], p1[1]);
    ctx.stroke();
  }

  function renderHuman(ctx, pose, X, Y, S) {
    const P = pose.points;
    const at = (n) => [X(P[n][0]), Y(P[n][1])];

    const head = at("head"), neck = at("neck"), pelvis = at("pelvis");
    const shL = at("shoulderL"), shR = at("shoulderR");
    const hipL = at("hipL"), hipR = at("hipR");
    const midSh = mid(shL, shR);

    // Spine frame: u = down the spine, s = sideways.
    const ang = Math.atan2(pelvis[1] - neck[1], pelvis[0] - neck[0]);
    const u = [Math.cos(ang), Math.sin(ang)];
    const s = [-u[1], u[0]];
    const spineLen = dist(neck, pelvis);

    const r = (f) => f * S;

    // 1. Neck (drawn first, sits behind head & torso)
    const chin = add(head, -u[0] * r(0.06), -u[1] * r(0.06));
    tube(ctx, midSh, chin, r(0.036), r(0.03));

    // 2. Waist connector (belly), behind ribcage/pelvis
    tube(ctx, lerp(neck, pelvis, 0.5), pelvis, r(0.05), r(0.05));

    // 3. Ribcage egg
    const ribC = lerp(neck, pelvis, 0.3);
    oval(ctx, ribC, dist(shL, shR) * 0.31, spineLen * 0.31, ang - Math.PI / 2);

    // 4. Pelvis bucket (trapezoid narrowing downward)
    const pelH = spineLen * 0.26;
    const hipHalf = dist(hipL, hipR) / 2;
    const botC = add(pelvis, u[0] * pelH, u[1] * pelH);
    const botL = add(botC, -s[0] * hipHalf * 0.62, -s[1] * hipHalf * 0.62);
    const botR = add(botC, s[0] * hipHalf * 0.62, s[1] * hipHalf * 0.62);
    poly(ctx, [hipL, hipR, botR, botL]);

    // 5. Legs then arms (cylinders, in front of torso)
    tube(ctx, hipL, at("kneeL"), r(0.055), r(0.04));
    tube(ctx, hipR, at("kneeR"), r(0.055), r(0.04));
    tube(ctx, at("kneeL"), at("footL"), r(0.04), r(0.03));
    tube(ctx, at("kneeR"), at("footR"), r(0.04), r(0.03));
    tube(ctx, shL, at("elbowL"), r(0.045), r(0.032));
    tube(ctx, shR, at("elbowR"), r(0.045), r(0.032));
    tube(ctx, at("elbowL"), at("handL"), r(0.032), r(0.026));
    tube(ctx, at("elbowR"), at("handR"), r(0.032), r(0.026));

    // 6. Ball joints on top, for that segmented mannequin read
    ball(ctx, shL, r(0.05)); ball(ctx, shR, r(0.05));
    ball(ctx, at("elbowL"), r(0.036)); ball(ctx, at("elbowR"), r(0.036));
    ball(ctx, hipL, r(0.046)); ball(ctx, hipR, r(0.046));
    ball(ctx, at("kneeL"), r(0.042)); ball(ctx, at("kneeR"), r(0.042));
    ball(ctx, lerp(at("handL"), at("elbowL"), 0.2), r(0.03));
    ball(ctx, lerp(at("handR"), at("elbowR"), 0.2), r(0.03));
    ball(ctx, lerp(at("footL"), at("kneeL"), 0.2), r(0.032));
    ball(ctx, lerp(at("footR"), at("kneeR"), 0.2), r(0.032));

    // 7. Hands as mitts (extend past the wrist landmark for fingers)
    [["elbowL", "handL"], ["elbowR", "handR"]].forEach(([e, hd]) => {
      const E = at(e), H = at(hd);
      const d = dist(E, H) || 1;
      const dir = [(H[0] - E[0]) / d, (H[1] - E[1]) / d];
      const tip = add(H, dir[0] * r(0.07), dir[1] * r(0.07));
      tube(ctx, H, tip, r(0.03), r(0.026));
    });

    // 8. Feet across the lower leg
    [["kneeL", "footL"], ["kneeR", "footR"]].forEach(([k, f]) => {
      const K = at(k), F = at(f);
      const fa = Math.atan2(F[1] - K[1], F[0] - K[0]) + Math.PI / 2;
      oval(ctx, F, r(0.052), r(0.024), fa);
    });

    // 9. Head egg + facial guide cross
    const hAng = Math.atan2(head[1] - neck[1], head[0] - neck[0]); // crown dir
    const up = [Math.cos(hAng), Math.sin(hAng)];   // toward crown
    const acr = [-up[1], up[0]];                    // across the face
    const hRx = r(0.05), hRy = r(0.064);
    oval(ctx, head, hRx, hRy, hAng + Math.PI / 2);
    // vertical center line (crown -> chin)
    guide(
      ctx,
      add(head, up[0] * hRy * 0.92, up[1] * hRy * 0.92),
      head,
      add(head, -up[0] * hRy * 0.92, -up[1] * hRy * 0.92)
    );
    // brow line, bowed slightly toward the chin
    const browC = add(head, -up[0] * hRx * 0.18, -up[1] * hRx * 0.18);
    guide(
      ctx,
      add(head, acr[0] * hRx * 0.9, acr[1] * hRx * 0.9),
      browC,
      add(head, -acr[0] * hRx * 0.9, -acr[1] * hRx * 0.9)
    );
  }

  function rAnimal(name, S) {
    if (/tail|ant|beak|whisk/.test(name)) return 0.014 * S;
    if (/ear|fin/.test(name)) return 0.017 * S;
    if (/foot|Foot/.test(name)) return 0.02 * S;
    return 0.03 * S;
  }

  function renderAnimal(ctx, pose, X, Y, S) {
    const P = pose.points;
    const at = (n) => [X(P[n][0]), Y(P[n][1])];
    (pose.bones || []).forEach(([a, b]) => {
      if (!P[a] || !P[b]) return;
      tube(ctx, at(a), at(b), rAnimal(a, S), rAnimal(b, S));
    });
    (pose.circles || []).forEach((c) => {
      if (!P[c.at]) return;
      ball(ctx, at(c.at), c.r * S);
    });
  }

  function renderInto(ctx, pose, X, Y, S, color, bg) {
    ctx.fillStyle = bg;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.4, 0.011 * S);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (pose.points.shoulderL) renderHuman(ctx, pose, X, Y, S);
    else renderAnimal(ctx, pose, X, Y, S);
  }

  // Bounding box of the landmark points, padded for volumes that extend
  // past the points (head oval, limb radius, hands, feet).
  function bbox(pose) {
    const pts = Object.values(pose.points);
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    pts.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
    const m = 0.09;
    return {
      x: minX - m, y: minY - m,
      w: maxX - minX + 2 * m, h: maxY - minY + 2 * m,
    };
  }

  // Public API. opts: { color, pad, clear, bg, alpha }
  window.drawPose = function drawPose(canvas, pose, opts = {}) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = (opts.pad != null ? opts.pad : 0.08) * Math.min(w, h);

    const canvasBg = cssVar("--canvas-bg") || "#fff";
    if (opts.clear !== false) ctx.clearRect(0, 0, w, h);
    if (opts.bg !== false) {
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, w, h);
    }

    // Uniform (aspect-preserving) fit so figures keep their true proportions:
    // tall people fill the height instead of being stretched sideways.
    const bb = bbox(pose);
    const S = Math.min((w - 2 * pad) / bb.w, (h - 2 * pad) / bb.h);
    const offX = w / 2 - (bb.x + bb.w / 2) * S;
    const offY = h / 2 - (bb.y + bb.h / 2) * S;
    const X = (nx) => offX + nx * S;
    const Y = (ny) => offY + ny * S;
    const color = opts.color || cssVar("--text") || "#222";
    // Volume fill: solid canvas colour normally so parts occlude cleanly;
    // semi-transparent for the faint grid overlay so the grid shows through.
    const fill = opts.alpha != null && opts.alpha < 1
      ? "rgba(0,0,0,0)"
      : canvasBg;

    if (opts.alpha != null && opts.alpha < 1) {
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const octx = off.getContext("2d");
      // Opaque fills off-screen so overlaps occlude, then composite faintly.
      renderInto(octx, pose, X, Y, S, color, canvasBg);
      ctx.save();
      ctx.globalAlpha = opts.alpha;
      ctx.drawImage(off, 0, 0);
      ctx.restore();
    } else {
      renderInto(ctx, pose, X, Y, S, color, fill);
    }
  };
})();
