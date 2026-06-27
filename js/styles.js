// Renders a polished, recognizable example of each art-style genre.
// Each style draws its own subject + background on a square canvas.
(function () {
  const TAU = Math.PI * 2;

  window.ART_STYLES = [
    { key: "anime", name: "Anime", desc: "Big glossy eyes, layered hair, clean cel shading." },
    { key: "realism", name: "Realism", desc: "Lifelike proportions with soft, gradual shading." },
    { key: "chibi", name: "Chibi", desc: "Super-deformed: huge head, tiny body, maximum cute." },
    { key: "cartoon", name: "Cartoon", desc: "Bouncy shapes, bold linework, expressive features." },
    { key: "popart", name: "Pop Art", desc: "Flat bright color and Ben-Day halftone dots." },
    { key: "pixel", name: "Pixel Art", desc: "Built from a grid of chunky colored pixels." },
    { key: "surreal", name: "Surreal", desc: "Dreamlike, impossible scenes that bend reality." },
    { key: "abstract", name: "Abstract", desc: "Pure shape, color, and line — no literal subject." },
  ];

  // Detailed explanations shown on each style's page.
  window.STYLE_INFO = {
    anime: {
      tagline: "The stylized look of Japanese animation & manga",
      about: "Anime is the distinctive illustration style associated with Japanese animation and comics (manga). Characters are drawn with large, expressive eyes, simplified noses and mouths, and clean linework filled with flat “cel” shading.",
      origin: "It took shape in mid-20th-century Japan, led by pioneers like Osamu Tezuka (Astro Boy), who borrowed the big-eyed look partly from early Western cartoons. It became a global phenomenon from the 1990s onward.",
      traits: ["Large, detailed eyes with bright highlights", "Tiny, simplified nose and mouth", "Bold, colorful, gravity-defying hair in chunky clumps", "Crisp outlines with flat, hard-edged cel shading", "Exaggerated emotions (blush, sweat drops, sparkles)"],
      tips: ["Place the eyes low and make them large", "Reduce the nose to a small mark", "Use just a few hard-edged shadow shapes", "Design hair as big clumps, not individual strands"],
    },
    realism: {
      tagline: "Depicting subjects as the eye actually sees them",
      about: "Realism aims to render subjects believably — with accurate proportions and perspective, and the gradual play of light and shadow that gives forms a sense of volume and weight.",
      origin: "As a movement, Realism began in mid-19th-century France (Courbet, Millet), rejecting idealized Romantic subjects for ordinary life. The pursuit of lifelike rendering itself reaches back to the Renaissance.",
      traits: ["Accurate proportions and anatomy", "Smooth, gradual value transitions", "A consistent, observed light source", "Subtle color shifts and fine detail"],
      tips: ["Always work from reference", "Squint to find the big light/shadow shapes first", "Blend transitions and protect your highlights", "Measure to check proportions as you go"],
    },
    chibi: {
      tagline: "Cute, “super-deformed” mini characters",
      about: "Chibi (Japanese for “short/small”) shrinks a character into an adorable caricature: a huge head on a tiny body, oversized eyes, and the absolute minimum of detail.",
      origin: "A playful sub-style of anime and manga, chibi spread through Japanese pop culture, games, and merchandise. The name literally means “small child / short person.”",
      traits: ["Only 2–3 heads tall overall", "Enormous head and eyes", "Tiny, simplified body, hands, and feet", "Rounded shapes everywhere", "Maximum cuteness, minimum detail"],
      tips: ["Make the head about half the total height", "Simplify limbs to little nubs", "Keep facial features low and large", "Round everything — and resist adding detail"],
    },
    cartoon: {
      tagline: "Bold, exaggerated shapes built for expression",
      about: "Cartooning simplifies and exaggerates forms for clarity, humor, and appeal. Shapes are bouncy, outlines are bold, and features are pushed for maximum expression.",
      origin: "It grew out of newspaper comic strips and early animation in the late 1800s and early 1900s (Winsor McCay, then the big animation studios).",
      traits: ["Strong, readable silhouettes", "Thick, confident outlines", "Simplified, rounded shapes", "Exaggerated features and poses", "Flat color and “squash and stretch”"],
      tips: ["Start from simple shapes", "Exaggerate the main action", "Keep the silhouette clear", "Vary your line weight and avoid over-detailing"],
    },
    popart: {
      tagline: "Mass-culture imagery, loud and graphic",
      about: "Pop Art borrows imagery from advertising, comics, and consumer culture, rendering it in flat, vivid color with graphic outlines and printing-style halftone dots.",
      origin: "It emerged in 1950s–60s Britain and the US. Andy Warhol and Roy Lichtenstein are its most famous figures (their actual works are still under copyright).",
      traits: ["Flat, saturated primary colors", "Bold black outlines", "Ben-Day / halftone dot patterns", "Repetition and everyday or commercial subjects"],
      tips: ["Limit yourself to a few bold colors", "Outline everything in solid black", "Use dot patterns instead of soft shading", "Keep it flat — no gradients"],
    },
    pixel: {
      tagline: "Images built one pixel at a time",
      about: "Pixel art is a digital style where images are crafted pixel by pixel on a small grid, embracing the chunky, blocky look of early video games.",
      origin: "It was born from the hardware limits of 1970s–80s arcades and consoles (like the NES). Today it’s a deliberate, beloved retro art form.",
      traits: ["Low resolution and a limited palette", "Visible square pixels", "Clean one-pixel outlines", "Dithering to fake gradients", "Readable even at tiny sizes"],
      tips: ["Start small (try a 16×16 grid)", "Keep your palette tight", "Avoid stray “orphan” pixels", "Use dithering rather than blurring"],
    },
    surreal: {
      tagline: "Dreamlike, reality-bending imagery",
      about: "Surrealism juxtaposes unrelated objects and bends reality to evoke the logic of dreams and the unconscious — melting clocks, floating forms, and impossible spaces.",
      origin: "A 1920s avant-garde movement launched by André Breton. Salvador Dalí and René Magritte are its iconic painters (their works remain under copyright).",
      traits: ["Impossible scenes rendered believably", "Unexpected juxtapositions", "Dream logic and symbolism", "Distorted scale and gravity"],
      tips: ["Combine two unrelated things", "Render the impossible with convincing light and shadow", "Play with scale", "Let mood and symbolism lead over literal accuracy"],
    },
    abstract: {
      tagline: "Shape, color, and line for their own sake",
      about: "Abstract art steps away from depicting real objects, using pure shape, color, line, and composition to convey feeling, rhythm, or simple visual interest.",
      origin: "It was pioneered in the early 20th century by artists like Wassily Kandinsky and Piet Mondrian, who pushed art toward non-representation.",
      traits: ["Non-representational — no literal subject", "Emphasis on composition and balance", "Expressive use of color", "Geometric or gestural shapes"],
      tips: ["Focus on balance and contrast", "Let color carry the mood", "Vary shape sizes and spacing", "Don’t try to depict anything — feel the composition"],
    },
  };

  // ---- helpers ----
  function disc(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  function ell(ctx, x, y, rx, ry, rot) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); }
  function rrPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function spark(ctx, x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 ? r * 0.32 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  /* ---------------- Anime ---------------- */
  function animeEye(ctx, x, y, s) {
    // white base (almond)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x - 0.075 * s, y);
    ctx.quadraticCurveTo(x, y - 0.07 * s, x + 0.08 * s, y - 0.02 * s);
    ctx.quadraticCurveTo(x + 0.05 * s, y + 0.1 * s, x - 0.02 * s, y + 0.1 * s);
    ctx.quadraticCurveTo(x - 0.07 * s, y + 0.07 * s, x - 0.075 * s, y);
    ctx.closePath(); ctx.fill();
    // iris gradient
    const g = ctx.createLinearGradient(x, y - 0.08 * s, x, y + 0.09 * s);
    g.addColorStop(0, "#36256a"); g.addColorStop(0.5, "#6a4ec0"); g.addColorStop(1, "#c3b2f0");
    ctx.fillStyle = g; ell(ctx, x, y + 0.012 * s, 0.05 * s, 0.075 * s); ctx.fill();
    ctx.fillStyle = "#180f30"; ell(ctx, x, y + 0.02 * s, 0.026 * s, 0.05 * s); ctx.fill();
    // highlights
    ctx.fillStyle = "#fff";
    ell(ctx, x - 0.018 * s, y - 0.03 * s, 0.02 * s, 0.03 * s); ctx.fill();
    disc(ctx, x + 0.022 * s, y + 0.045 * s, 0.012 * s);
    // upper lash line + flick
    ctx.strokeStyle = "#2a2030"; ctx.lineWidth = s * 0.013; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 0.075 * s, y);
    ctx.quadraticCurveTo(x, y - 0.07 * s, x + 0.082 * s, y - 0.02 * s);
    ctx.stroke();
    ctx.lineWidth = s * 0.008;
    ctx.beginPath(); ctx.moveTo(x + 0.082 * s, y - 0.02 * s); ctx.lineTo(x + 0.1 * s, y - 0.045 * s); ctx.stroke();
  }
  function anime(ctx, s) {
    const g = ctx.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, "#ffe3ef"); g.addColorStop(1, "#dfe7ff");
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    [[0.14, 0.2, 0.014], [0.86, 0.28, 0.018], [0.82, 0.74, 0.011], [0.18, 0.8, 0.013]]
      .forEach(([x, y, r]) => spark(ctx, x * s, y * s, r * s));
    const cx = 0.5 * s;
    ctx.fillStyle = "#f6cdb4"; ctx.fillRect(0.44 * s, 0.78 * s, 0.12 * s, 0.13 * s);
    // face
    ctx.fillStyle = "#ffe6d3";
    ctx.beginPath();
    ctx.moveTo(cx, 0.9 * s);
    ctx.quadraticCurveTo(0.29 * s, 0.78 * s, 0.29 * s, 0.5 * s);
    ctx.bezierCurveTo(0.29 * s, 0.24 * s, 0.71 * s, 0.24 * s, 0.71 * s, 0.5 * s);
    ctx.quadraticCurveTo(0.71 * s, 0.78 * s, cx, 0.9 * s);
    ctx.closePath(); ctx.fill();
    // back hair
    ctx.fillStyle = "#52407a";
    ctx.beginPath();
    ctx.moveTo(0.24 * s, 0.64 * s);
    ctx.quadraticCurveTo(0.1 * s, 0.2 * s, 0.5 * s, 0.12 * s);
    ctx.quadraticCurveTo(0.9 * s, 0.2 * s, 0.76 * s, 0.64 * s);
    ctx.lineTo(0.7 * s, 0.46 * s);
    ctx.quadraticCurveTo(0.74 * s, 0.3 * s, 0.5 * s, 0.27 * s);
    ctx.quadraticCurveTo(0.26 * s, 0.3 * s, 0.3 * s, 0.46 * s);
    ctx.closePath(); ctx.fill();
    // front bangs (jagged)
    ctx.fillStyle = "#6a55a0";
    ctx.beginPath();
    ctx.moveTo(0.29 * s, 0.52 * s);
    ctx.quadraticCurveTo(0.27 * s, 0.26 * s, 0.5 * s, 0.24 * s);
    ctx.quadraticCurveTo(0.73 * s, 0.26 * s, 0.71 * s, 0.52 * s);
    ctx.lineTo(0.63 * s, 0.37 * s); ctx.lineTo(0.57 * s, 0.5 * s);
    ctx.lineTo(0.51 * s, 0.35 * s); ctx.lineTo(0.45 * s, 0.5 * s);
    ctx.lineTo(0.39 * s, 0.35 * s); ctx.lineTo(0.33 * s, 0.5 * s);
    ctx.closePath(); ctx.fill();
    // hair shine band
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = s * 0.022;
    ctx.beginPath(); ctx.arc(cx, 0.36 * s, 0.2 * s, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke();
    // eyebrows
    ctx.strokeStyle = "#8a6a58"; ctx.lineWidth = s * 0.008; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0.33 * s, 0.51 * s); ctx.quadraticCurveTo(0.4 * s, 0.485 * s, 0.46 * s, 0.51 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.54 * s, 0.51 * s); ctx.quadraticCurveTo(0.6 * s, 0.485 * s, 0.67 * s, 0.51 * s); ctx.stroke();
    animeEye(ctx, 0.39 * s, 0.61 * s, s);
    animeEye(ctx, 0.61 * s, 0.61 * s, s);
    ctx.strokeStyle = "rgba(180,130,110,0.7)"; ctx.lineWidth = s * 0.005;
    ctx.beginPath(); ctx.moveTo(0.5 * s, 0.65 * s); ctx.lineTo(0.485 * s, 0.7 * s); ctx.stroke();
    ctx.strokeStyle = "#c2706a"; ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.moveTo(0.46 * s, 0.77 * s); ctx.quadraticCurveTo(0.5 * s, 0.8 * s, 0.54 * s, 0.77 * s); ctx.stroke();
    ctx.fillStyle = "rgba(255,140,150,0.4)";
    ell(ctx, 0.35 * s, 0.71 * s, 0.045 * s, 0.026 * s); ctx.fill();
    ell(ctx, 0.65 * s, 0.71 * s, 0.045 * s, 0.026 * s); ctx.fill();
  }

  /* ---------------- Realism ---------------- */
  function realEye(ctx, x, y, s) {
    ctx.fillStyle = "rgba(90,60,45,0.25)"; ell(ctx, x, y, 0.062 * s, 0.036 * s); ctx.fill();
    ctx.fillStyle = "#f3ece4"; ell(ctx, x, y, 0.05 * s, 0.026 * s); ctx.fill();
    const g = ctx.createRadialGradient(x, y, 0.003 * s, x, y, 0.024 * s);
    g.addColorStop(0, "#7a5230"); g.addColorStop(1, "#33200f");
    ctx.fillStyle = g; disc(ctx, x, y, 0.023 * s);
    ctx.fillStyle = "#120b05"; disc(ctx, x, y, 0.011 * s);
    ctx.fillStyle = "#fff"; disc(ctx, x - 0.008 * s, y - 0.009 * s, 0.005 * s);
    ctx.strokeStyle = "#2a1a10"; ctx.lineWidth = s * 0.006; ctx.lineCap = "round";
    ctx.beginPath(); ctx.ellipse(x, y, 0.05 * s, 0.027 * s, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
    ctx.strokeStyle = "rgba(60,40,25,0.4)"; ctx.lineWidth = s * 0.003;
    ctx.beginPath(); ctx.ellipse(x, y, 0.05 * s, 0.027 * s, 0, 0.12, Math.PI - 0.12); ctx.stroke();
  }
  function realism(ctx, s) {
    const bg = ctx.createLinearGradient(0, 0, 0, s);
    bg.addColorStop(0, "#cfc8c0"); bg.addColorStop(1, "#b1a79c");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, s, s);
    const cx = 0.5 * s;
    ctx.fillStyle = "#bd8a6c";
    ctx.beginPath(); ctx.moveTo(0.42 * s, 0.72 * s); ctx.lineTo(0.58 * s, 0.72 * s);
    ctx.lineTo(0.6 * s, 0.95 * s); ctx.lineTo(0.4 * s, 0.95 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(80,50,35,0.28)";
    ctx.beginPath(); ctx.moveTo(0.42 * s, 0.72 * s); ctx.quadraticCurveTo(0.5 * s, 0.81 * s, 0.58 * s, 0.72 * s);
    ctx.lineTo(0.57 * s, 0.77 * s); ctx.quadraticCurveTo(0.5 * s, 0.84 * s, 0.43 * s, 0.77 * s); ctx.closePath(); ctx.fill();
    const g = ctx.createRadialGradient(0.4 * s, 0.34 * s, 0.05 * s, 0.54 * s, 0.54 * s, 0.44 * s);
    g.addColorStop(0, "#f3d0b0"); g.addColorStop(0.6, "#d6a07e"); g.addColorStop(1, "#9c6b4f");
    ctx.fillStyle = g; ell(ctx, cx, 0.48 * s, 0.25 * s, 0.33 * s); ctx.fill();
    ctx.fillStyle = "rgba(90,55,40,0.22)"; ell(ctx, 0.66 * s, 0.56 * s, 0.08 * s, 0.16 * s, 0.12); ctx.fill();
    ctx.fillStyle = "rgba(255,240,225,0.3)"; ell(ctx, 0.44 * s, 0.33 * s, 0.1 * s, 0.07 * s); ctx.fill();
    // hair
    ctx.fillStyle = "#2e211b";
    ctx.beginPath();
    ctx.moveTo(0.25 * s, 0.52 * s);
    ctx.bezierCurveTo(0.18 * s, 0.08 * s, 0.82 * s, 0.08 * s, 0.75 * s, 0.52 * s);
    ctx.quadraticCurveTo(0.72 * s, 0.33 * s, 0.6 * s, 0.29 * s);
    ctx.quadraticCurveTo(0.5 * s, 0.26 * s, 0.4 * s, 0.29 * s);
    ctx.quadraticCurveTo(0.28 * s, 0.33 * s, 0.25 * s, 0.52 * s);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(120,90,70,0.45)"; ctx.lineWidth = s * 0.004;
    for (let i = 0; i < 5; i++) {
      const x = 0.34 * s + i * 0.08 * s;
      ctx.beginPath(); ctx.moveTo(x, 0.18 * s); ctx.quadraticCurveTo(x - 0.02 * s, 0.32 * s, x, 0.44 * s); ctx.stroke();
    }
    ctx.strokeStyle = "#3a2a20"; ctx.lineWidth = s * 0.012; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0.33 * s, 0.45 * s); ctx.quadraticCurveTo(0.41 * s, 0.42 * s, 0.48 * s, 0.46 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.52 * s, 0.46 * s); ctx.quadraticCurveTo(0.59 * s, 0.42 * s, 0.67 * s, 0.45 * s); ctx.stroke();
    realEye(ctx, 0.41 * s, 0.5 * s, s); realEye(ctx, 0.59 * s, 0.5 * s, s);
    ctx.strokeStyle = "rgba(110,70,50,0.5)"; ctx.lineWidth = s * 0.006; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0.5 * s, 0.5 * s); ctx.lineTo(0.475 * s, 0.61 * s); ctx.stroke();
    ctx.fillStyle = "rgba(80,45,30,0.5)"; disc(ctx, 0.473 * s, 0.625 * s, 0.008 * s); disc(ctx, 0.518 * s, 0.625 * s, 0.008 * s);
    ctx.fillStyle = "rgba(255,240,225,0.4)"; disc(ctx, 0.5 * s, 0.6 * s, 0.014 * s);
    ctx.fillStyle = "#b06b5e";
    ctx.beginPath(); ctx.moveTo(0.43 * s, 0.71 * s); ctx.quadraticCurveTo(0.5 * s, 0.68 * s, 0.57 * s, 0.71 * s);
    ctx.quadraticCurveTo(0.5 * s, 0.76 * s, 0.43 * s, 0.71 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(90,45,38,0.6)"; ctx.lineWidth = s * 0.005;
    ctx.beginPath(); ctx.moveTo(0.43 * s, 0.71 * s); ctx.quadraticCurveTo(0.5 * s, 0.725 * s, 0.57 * s, 0.71 * s); ctx.stroke();
    ctx.fillStyle = "rgba(255,220,210,0.4)"; ell(ctx, 0.5 * s, 0.735 * s, 0.03 * s, 0.008 * s); ctx.fill();
  }

  /* ---------------- Chibi ---------------- */
  function chibiEye(ctx, x, y, s) {
    ctx.fillStyle = "#3a2a4a"; ell(ctx, x, y, 0.07 * s, 0.095 * s); ctx.fill();
    const g = ctx.createLinearGradient(x, y - 0.09 * s, x, y + 0.09 * s);
    g.addColorStop(0, "#6a3aa0"); g.addColorStop(1, "#c08ae0");
    ctx.fillStyle = g; ell(ctx, x, y + 0.012 * s, 0.05 * s, 0.07 * s); ctx.fill();
    ctx.fillStyle = "#fff"; ell(ctx, x - 0.02 * s, y - 0.03 * s, 0.026 * s, 0.036 * s); ctx.fill();
    disc(ctx, x + 0.025 * s, y + 0.035 * s, 0.014 * s);
  }
  function chibi(ctx, s) {
    const g = ctx.createLinearGradient(0, 0, 0, s);
    g.addColorStop(0, "#eaf7ff"); g.addColorStop(1, "#ffeef6");
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    const cx = 0.5 * s, out = "#4a3a4a";
    ctx.lineJoin = "round"; ctx.strokeStyle = out;
    // dress
    ctx.fillStyle = "#ff8fb1"; ctx.lineWidth = s * 0.01;
    ctx.beginPath(); ctx.moveTo(0.42 * s, 0.72 * s); ctx.quadraticCurveTo(0.5 * s, 0.68 * s, 0.58 * s, 0.72 * s);
    ctx.lineTo(0.66 * s, 0.93 * s); ctx.quadraticCurveTo(0.5 * s, 0.97 * s, 0.34 * s, 0.93 * s); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // legs
    ctx.fillStyle = "#ffe0cf"; ctx.lineWidth = s * 0.008;
    rrPath(ctx, 0.43 * s, 0.91 * s, 0.05 * s, 0.06 * s, 0.02 * s); ctx.fill(); ctx.stroke();
    rrPath(ctx, 0.52 * s, 0.91 * s, 0.05 * s, 0.06 * s, 0.02 * s); ctx.fill(); ctx.stroke();
    // arms
    ctx.fillStyle = "#ff8fb1"; disc(ctx, 0.34 * s, 0.78 * s, 0.045 * s); ctx.stroke();
    disc(ctx, 0.66 * s, 0.78 * s, 0.045 * s); ctx.stroke();
    // twin tails behind head
    ctx.fillStyle = "#7c5cc0"; disc(ctx, 0.2 * s, 0.42 * s, 0.075 * s); ctx.stroke();
    disc(ctx, 0.8 * s, 0.42 * s, 0.075 * s); ctx.stroke();
    // head
    ctx.fillStyle = "#ffe6d3"; ctx.lineWidth = s * 0.01; disc(ctx, cx, 0.4 * s, 0.3 * s); ctx.stroke();
    // hair cap
    ctx.fillStyle = "#7c5cc0";
    ctx.beginPath(); ctx.arc(cx, 0.4 * s, 0.3 * s, Math.PI, TAU);
    ctx.bezierCurveTo(0.8 * s, 0.14 * s, 0.2 * s, 0.14 * s, 0.2 * s, 0.4 * s); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // bangs
    ctx.beginPath();
    ctx.moveTo(0.22 * s, 0.4 * s); ctx.quadraticCurveTo(0.3 * s, 0.2 * s, 0.5 * s, 0.2 * s);
    ctx.quadraticCurveTo(0.7 * s, 0.2 * s, 0.78 * s, 0.4 * s);
    ctx.quadraticCurveTo(0.66 * s, 0.31 * s, 0.58 * s, 0.4 * s);
    ctx.quadraticCurveTo(0.5 * s, 0.29 * s, 0.42 * s, 0.4 * s);
    ctx.quadraticCurveTo(0.34 * s, 0.31 * s, 0.22 * s, 0.4 * s);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    chibiEye(ctx, 0.38 * s, 0.46 * s, s); chibiEye(ctx, 0.62 * s, 0.46 * s, s);
    ctx.strokeStyle = "#c0606a"; ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.arc(cx, 0.53 * s, 0.025 * s, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = "rgba(255,150,170,0.55)";
    disc(ctx, 0.31 * s, 0.52 * s, 0.032 * s); disc(ctx, 0.69 * s, 0.52 * s, 0.032 * s);
  }

  /* ---------------- Cartoon ---------------- */
  function cartoon(ctx, s) {
    ctx.fillStyle = "#bfe7ff"; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ell(ctx, 0.3 * s, 0.22 * s, 0.12 * s, 0.05 * s); ctx.fill();
    ell(ctx, 0.74 * s, 0.32 * s, 0.1 * s, 0.045 * s); ctx.fill();
    const cx = 0.5 * s;
    ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.strokeStyle = "#1a1a1a";
    // body
    ctx.fillStyle = "#ff5a5f"; ctx.lineWidth = s * 0.02;
    ell(ctx, cx, 0.78 * s, 0.16 * s, 0.14 * s); ctx.fill(); ctx.stroke();
    // legs/arms (rubber hose)
    ctx.lineWidth = s * 0.03;
    ctx.beginPath(); ctx.moveTo(0.4 * s, 0.76 * s); ctx.quadraticCurveTo(0.27 * s, 0.8 * s, 0.25 * s, 0.9 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.6 * s, 0.76 * s); ctx.quadraticCurveTo(0.73 * s, 0.8 * s, 0.75 * s, 0.9 * s); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.lineWidth = s * 0.008;
    disc(ctx, 0.25 * s, 0.9 * s, 0.038 * s); ctx.stroke();
    disc(ctx, 0.75 * s, 0.9 * s, 0.038 * s); ctx.stroke();
    // head
    ctx.fillStyle = "#ffd9a0"; ctx.lineWidth = s * 0.02; disc(ctx, cx, 0.4 * s, 0.24 * s); ctx.stroke();
    // ears
    disc(ctx, 0.27 * s, 0.4 * s, 0.05 * s); ctx.stroke(); disc(ctx, 0.73 * s, 0.4 * s, 0.05 * s); ctx.stroke();
    // hair tuft
    ctx.fillStyle = "#5a3a1a";
    ctx.beginPath();
    ctx.moveTo(0.46 * s, 0.18 * s); ctx.quadraticCurveTo(0.5 * s, 0.08 * s, 0.56 * s, 0.16 * s);
    ctx.quadraticCurveTo(0.6 * s, 0.1 * s, 0.62 * s, 0.2 * s);
    ctx.quadraticCurveTo(0.55 * s, 0.2 * s, 0.46 * s, 0.18 * s); ctx.closePath(); ctx.fill();
    // eyes
    ctx.fillStyle = "#fff"; ctx.lineWidth = s * 0.012;
    ell(ctx, 0.42 * s, 0.38 * s, 0.06 * s, 0.085 * s); ctx.fill(); ctx.stroke();
    ell(ctx, 0.58 * s, 0.38 * s, 0.06 * s, 0.085 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1a1a1a"; disc(ctx, 0.44 * s, 0.41 * s, 0.026 * s); disc(ctx, 0.6 * s, 0.41 * s, 0.026 * s);
    ctx.fillStyle = "#fff"; disc(ctx, 0.452 * s, 0.4 * s, 0.009 * s); disc(ctx, 0.612 * s, 0.4 * s, 0.009 * s);
    ctx.fillStyle = "#e08a5a"; disc(ctx, cx, 0.47 * s, 0.022 * s);
    // smile
    ctx.lineWidth = s * 0.016;
    ctx.beginPath(); ctx.arc(cx, 0.48 * s, 0.1 * s, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
  }

  /* ---------------- Pop Art ---------------- */
  function popart(ctx, s) {
    ctx.fillStyle = "#ffd400"; ctx.fillRect(0, 0, s, s);
    const cx = 0.5 * s;
    // skin
    ctx.fillStyle = "#ffe0b0"; ctx.strokeStyle = "#111"; ctx.lineWidth = s * 0.014; ctx.lineJoin = "round";
    ell(ctx, cx, 0.5 * s, 0.28 * s, 0.34 * s); ctx.fill(); ctx.stroke();
    // halftone shading on cheek
    ctx.save(); ell(ctx, cx, 0.5 * s, 0.28 * s, 0.34 * s); ctx.clip();
    ctx.fillStyle = "rgba(230,90,60,0.45)";
    for (let y = 0.52 * s; y < 0.86 * s; y += 0.042 * s)
      for (let x = 0.2 * s; x < 0.55 * s; x += 0.042 * s) disc(ctx, x, y, 0.0085 * s);
    ctx.restore();
    // blonde hair
    ctx.fillStyle = "#f7c948"; ctx.strokeStyle = "#111"; ctx.lineWidth = s * 0.012;
    ctx.beginPath();
    ctx.moveTo(0.22 * s, 0.52 * s);
    ctx.quadraticCurveTo(0.14 * s, 0.12 * s, 0.5 * s, 0.14 * s);
    ctx.quadraticCurveTo(0.9 * s, 0.12 * s, 0.8 * s, 0.55 * s);
    ctx.quadraticCurveTo(0.74 * s, 0.4 * s, 0.66 * s, 0.36 * s);
    ctx.quadraticCurveTo(0.72 * s, 0.5 * s, 0.7 * s, 0.6 * s);
    ctx.quadraticCurveTo(0.6 * s, 0.34 * s, 0.5 * s, 0.33 * s);
    ctx.quadraticCurveTo(0.3 * s, 0.33 * s, 0.26 * s, 0.5 * s);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // hair strands
    ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.moveTo(0.34 * s, 0.2 * s); ctx.quadraticCurveTo(0.42 * s, 0.26 * s, 0.4 * s, 0.32 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.6 * s, 0.2 * s); ctx.quadraticCurveTo(0.54 * s, 0.26 * s, 0.56 * s, 0.32 * s); ctx.stroke();
    // eyes with blue shadow
    ctx.fillStyle = "#2a6bd0"; ctx.beginPath();
    ctx.ellipse(0.4 * s, 0.49 * s, 0.06 * s, 0.03 * s, -0.2, Math.PI, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.6 * s, 0.49 * s, 0.06 * s, 0.03 * s, 0.2, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.lineWidth = s * 0.01;
    ell(ctx, 0.4 * s, 0.53 * s, 0.05 * s, 0.032 * s); ctx.fill(); ctx.stroke();
    ell(ctx, 0.6 * s, 0.53 * s, 0.05 * s, 0.032 * s); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#3a2a1a"; disc(ctx, 0.41 * s, 0.53 * s, 0.016 * s); disc(ctx, 0.61 * s, 0.53 * s, 0.016 * s);
    // brows
    ctx.strokeStyle = "#111"; ctx.lineWidth = s * 0.01;
    ctx.beginPath(); ctx.moveTo(0.33 * s, 0.45 * s); ctx.quadraticCurveTo(0.4 * s, 0.43 * s, 0.47 * s, 0.46 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.53 * s, 0.46 * s); ctx.quadraticCurveTo(0.6 * s, 0.43 * s, 0.67 * s, 0.45 * s); ctx.stroke();
    // red lips
    ctx.fillStyle = "#e6004f"; ctx.lineWidth = s * 0.008;
    ctx.beginPath();
    ctx.moveTo(0.42 * s, 0.69 * s); ctx.quadraticCurveTo(0.5 * s, 0.65 * s, 0.58 * s, 0.69 * s);
    ctx.quadraticCurveTo(0.5 * s, 0.77 * s, 0.42 * s, 0.69 * s); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#111"; ctx.beginPath(); ctx.moveTo(0.42 * s, 0.69 * s); ctx.lineTo(0.58 * s, 0.69 * s); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ell(ctx, 0.47 * s, 0.71 * s, 0.02 * s, 0.008 * s); ctx.fill();
  }

  /* ---------------- Pixel Art ---------------- */
  function pixel(ctx, s) {
    ctx.fillStyle = "#15101f"; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    [[2, 2], [13, 3], [11, 13], [3, 12], [14, 8]].forEach(([i, j]) =>
      ctx.fillRect((i + 0.4) * (s / 16), (j + 0.4) * (s / 16), s / 16 * 0.4, s / 16 * 0.4));
    const map = [
      "................",
      "....oooooooo....",
      "...oHHHHHHHHo...",
      "..oHHHHHHHHHHo..",
      "..oHSSSSSSSSHo..",
      "..oHSSSSSSSSHo..",
      "..oHSeeSSeeSHo..",
      "..oHSeeSSeeSHo..",
      "..oHSSSSSSSSHo..",
      "..oHSSMMMMSSHo..",
      "..oHSSSSSSSSHo..",
      "...oHSSSSSSHo...",
      "....oSSSSSSo....",
      "...oBBBBBBBBo...",
      "..oBBBBBBBBBBo..",
      "..oBBBBBBBBBBo..",
    ];
    const colors = { o: "#231a33", H: "#6a4fb0", S: "#ffcda1", e: "#241a30", M: "#b5483f", B: "#d2553a" };
    const N = 16, c = s / N;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const ch = map[j][i];
        if (ch === ".") continue;
        ctx.fillStyle = colors[ch];
        ctx.fillRect(i * c, j * c, c + 1, c + 1);
      }
    }
    // skin shading column (right side darker)
    ctx.fillStyle = "rgba(120,70,40,0.18)";
    ctx.fillRect(9 * c, 4 * c, 3 * c, 9 * c);
  }

  /* ---------------- Surreal ---------------- */
  function surreal(ctx, s) {
    const sky = ctx.createLinearGradient(0, 0, 0, 0.62 * s);
    sky.addColorStop(0, "#f7b27a"); sky.addColorStop(1, "#ecdca0");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, s, 0.62 * s);
    const gr = ctx.createLinearGradient(0, 0.62 * s, 0, s);
    gr.addColorStop(0, "#caa66a"); gr.addColorStop(1, "#8c6b3e");
    ctx.fillStyle = gr; ctx.fillRect(0, 0.62 * s, s, 0.4 * s);
    ctx.fillStyle = "rgba(255,250,230,0.85)"; disc(ctx, 0.78 * s, 0.2 * s, 0.08 * s);
    // pedestal + long shadow
    ctx.fillStyle = "rgba(60,40,25,0.28)";
    ctx.beginPath(); ctx.moveTo(0.52 * s, 0.66 * s); ctx.lineTo(0.95 * s, 0.72 * s);
    ctx.lineTo(0.95 * s, 0.76 * s); ctx.lineTo(0.5 * s, 0.69 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#7a5a3a"; ctx.fillRect(0.34 * s, 0.5 * s, 0.18 * s, 0.16 * s);
    ctx.fillStyle = "#8c6a44"; ctx.fillRect(0.34 * s, 0.5 * s, 0.18 * s, 0.025 * s);
    // melting clock
    ctx.fillStyle = "#e9c24a"; ctx.strokeStyle = "#8a6a1a"; ctx.lineWidth = s * 0.005;
    ctx.beginPath();
    ctx.moveTo(0.3 * s, 0.46 * s);
    ctx.quadraticCurveTo(0.46 * s, 0.4 * s, 0.52 * s, 0.5 * s);
    ctx.bezierCurveTo(0.6 * s, 0.58 * s, 0.56 * s, 0.8 * s, 0.49 * s, 0.84 * s);
    ctx.quadraticCurveTo(0.45 * s, 0.86 * s, 0.45 * s, 0.74 * s);
    ctx.quadraticCurveTo(0.43 * s, 0.64 * s, 0.39 * s, 0.62 * s);
    ctx.quadraticCurveTo(0.3 * s, 0.6 * s, 0.3 * s, 0.46 * s);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#5a4410"; ctx.lineWidth = s * 0.004; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0.4 * s, 0.53 * s); ctx.lineTo(0.4 * s, 0.47 * s);
    ctx.moveTo(0.4 * s, 0.53 * s); ctx.lineTo(0.46 * s, 0.55 * s); ctx.stroke();
    // floating sphere + shadow
    ctx.fillStyle = "rgba(60,40,25,0.25)"; ell(ctx, 0.24 * s, 0.66 * s, 0.08 * s, 0.02 * s); ctx.fill();
    const rg = ctx.createRadialGradient(0.2 * s, 0.32 * s, 0.005 * s, 0.24 * s, 0.38 * s, 0.1 * s);
    rg.addColorStop(0, "#fff"); rg.addColorStop(1, "#9a86c8");
    ctx.fillStyle = rg; disc(ctx, 0.24 * s, 0.38 * s, 0.08 * s);
    // lone tree
    ctx.strokeStyle = "#5a4028"; ctx.lineWidth = s * 0.006;
    ctx.beginPath(); ctx.moveTo(0.88 * s, 0.66 * s); ctx.lineTo(0.88 * s, 0.5 * s);
    ctx.moveTo(0.88 * s, 0.56 * s); ctx.lineTo(0.92 * s, 0.52 * s);
    ctx.moveTo(0.88 * s, 0.54 * s); ctx.lineTo(0.84 * s, 0.5 * s); ctx.stroke();
    // floating eye
    ctx.fillStyle = "#fff"; ell(ctx, 0.56 * s, 0.16 * s, 0.06 * s, 0.035 * s); ctx.fill();
    ctx.fillStyle = "#2a9d6f"; disc(ctx, 0.56 * s, 0.16 * s, 0.022 * s);
    ctx.fillStyle = "#111"; disc(ctx, 0.56 * s, 0.16 * s, 0.01 * s);
  }

  /* ---------------- Abstract ---------------- */
  function abstract(ctx, s) {
    ctx.fillStyle = "#f3efe6"; ctx.fillRect(0, 0, s, s);
    // big two-tone circle
    ctx.save(); ctx.beginPath(); ctx.arc(0.34 * s, 0.36 * s, 0.2 * s, 0, TAU); ctx.clip();
    ctx.fillStyle = "#e94f37"; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = "#1f6fb2"; ctx.fillRect(0, 0.36 * s, s, s); ctx.restore();
    // yellow triangle
    ctx.fillStyle = "#f4c430";
    ctx.beginPath(); ctx.moveTo(0.6 * s, 0.1 * s); ctx.lineTo(0.9 * s, 0.5 * s); ctx.lineTo(0.52 * s, 0.5 * s); ctx.closePath(); ctx.fill();
    // bold diagonal
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = s * 0.025; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0.08 * s, 0.86 * s); ctx.lineTo(0.78 * s, 0.58 * s); ctx.stroke();
    // thin fan lines
    ctx.lineWidth = s * 0.006;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(0.15 * s, 0.2 * s); ctx.lineTo((0.42 + i * 0.12) * s, 0.95 * s); ctx.stroke();
    }
    // rotated green square
    ctx.save(); ctx.translate(0.74 * s, 0.78 * s); ctx.rotate(0.3);
    ctx.fillStyle = "#2a9d6f"; ctx.fillRect(-0.07 * s, -0.07 * s, 0.14 * s, 0.14 * s); ctx.restore();
    // concentric (Kandinsky)
    const cc = ["#1a1a1a", "#f4c430", "#e94f37"];
    for (let i = 0; i < 3; i++) { ctx.fillStyle = cc[i]; disc(ctx, 0.82 * s, 0.2 * s, (0.09 - i * 0.03) * s); }
    // dot row
    ctx.fillStyle = "#1a1a1a";
    for (let i = 0; i < 6; i++) disc(ctx, (0.16 + i * 0.07) * s, 0.5 * s, 0.01 * s);
  }

  const RENDERERS = { anime, realism, chibi, cartoon, popart, pixel, surreal, abstract };

  window.drawArtStyle = function (canvas, key) {
    const ctx = canvas.getContext("2d");
    const s = Math.min(canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    (RENDERERS[key] || abstract)(ctx, s);
    ctx.restore();
  };
})();
