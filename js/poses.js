// Pose landmark data. Coordinates are normalized 0..1 (x right, y down).
// Each pose: { points:{name:[x,y]}, bones:[[a,b]], circles:[{at,r}], tip }
(function () {
  const HUMAN_BONES = [
    ["neck", "head"],
    ["neck", "shoulderL"], ["neck", "shoulderR"],
    ["shoulderL", "elbowL"], ["elbowL", "handL"],
    ["shoulderR", "elbowR"], ["elbowR", "handR"],
    ["neck", "pelvis"],
    ["pelvis", "hipL"], ["pelvis", "hipR"],
    ["hipL", "kneeL"], ["kneeL", "footL"],
    ["hipR", "kneeR"], ["kneeR", "footR"],
  ];
  const HEAD = [{ at: "head", r: 0.075 }];

  // Helper: build a human pose from its points.
  function H(points, tip) {
    return { points, bones: HUMAN_BONES, circles: HEAD, tip };
  }

  const human = {
    standing: H(
      {
        head: [0.5, 0.12], neck: [0.5, 0.23],
        shoulderL: [0.41, 0.25], shoulderR: [0.59, 0.25],
        elbowL: [0.37, 0.42], elbowR: [0.63, 0.42],
        handL: [0.35, 0.58], handR: [0.65, 0.58],
        pelvis: [0.5, 0.55], hipL: [0.44, 0.57], hipR: [0.56, 0.57],
        kneeL: [0.44, 0.76], kneeR: [0.56, 0.76],
        footL: [0.43, 0.94], footR: [0.57, 0.94],
      },
      "Start with a vertical center line. The whole body is about 7–8 head-heights tall."
    ),
    sitting: H(
      {
        head: [0.5, 0.16], neck: [0.5, 0.27],
        shoulderL: [0.42, 0.29], shoulderR: [0.58, 0.29],
        elbowL: [0.38, 0.43], elbowR: [0.62, 0.43],
        handL: [0.42, 0.55], handR: [0.58, 0.55],
        pelvis: [0.5, 0.58], hipL: [0.44, 0.59], hipR: [0.56, 0.59],
        kneeL: [0.33, 0.62], kneeR: [0.67, 0.62],
        footL: [0.33, 0.86], footR: [0.67, 0.86],
      },
      "When seated, the thigh shortens in view. Watch where the hips fold."
    ),
    walking: H(
      {
        head: [0.5, 0.12], neck: [0.5, 0.23],
        shoulderL: [0.42, 0.25], shoulderR: [0.58, 0.25],
        elbowL: [0.36, 0.38], elbowR: [0.64, 0.4],
        handL: [0.4, 0.5], handR: [0.6, 0.52],
        pelvis: [0.5, 0.55], hipL: [0.45, 0.57], hipR: [0.55, 0.57],
        kneeL: [0.38, 0.73], kneeR: [0.6, 0.74],
        footL: [0.33, 0.9], footR: [0.66, 0.92],
      },
      "Arms and legs move in opposite pairs — left arm forward with right leg."
    ),
    reaching: H(
      {
        head: [0.5, 0.14], neck: [0.5, 0.25],
        shoulderL: [0.41, 0.27], shoulderR: [0.59, 0.27],
        elbowL: [0.36, 0.42], elbowR: [0.62, 0.15],
        handL: [0.34, 0.57], handR: [0.66, 0.04],
        pelvis: [0.5, 0.56], hipL: [0.44, 0.58], hipR: [0.56, 0.58],
        kneeL: [0.44, 0.76], kneeR: [0.56, 0.76],
        footL: [0.43, 0.94], footR: [0.57, 0.94],
      },
      "A raised arm lifts the same-side shoulder. Let the torso stretch with it."
    ),
    crouching: H(
      {
        head: [0.5, 0.28], neck: [0.5, 0.38],
        shoulderL: [0.42, 0.4], shoulderR: [0.58, 0.4],
        elbowL: [0.37, 0.52], elbowR: [0.63, 0.52],
        handL: [0.4, 0.62], handR: [0.6, 0.62],
        pelvis: [0.5, 0.62], hipL: [0.44, 0.63], hipR: [0.56, 0.63],
        kneeL: [0.36, 0.74], kneeR: [0.64, 0.74],
        footL: [0.42, 0.9], footR: [0.58, 0.9],
      },
      "Folding the body stacks the masses. Knees push out past the feet."
    ),
    running: H(
      {
        head: [0.52, 0.14], neck: [0.5, 0.25],
        shoulderL: [0.43, 0.27], shoulderR: [0.57, 0.26],
        elbowL: [0.33, 0.3], elbowR: [0.66, 0.36],
        handL: [0.3, 0.42], handR: [0.7, 0.26],
        pelvis: [0.48, 0.54], hipL: [0.43, 0.56], hipR: [0.53, 0.56],
        kneeL: [0.34, 0.66], kneeR: [0.62, 0.66],
        footL: [0.3, 0.82], footR: [0.72, 0.78],
      },
      "Lean the torso forward. Exaggerate the split between front and back legs."
    ),
    jumping: H(
      {
        head: [0.5, 0.16], neck: [0.5, 0.27],
        shoulderL: [0.42, 0.29], shoulderR: [0.58, 0.29],
        elbowL: [0.36, 0.17], elbowR: [0.64, 0.17],
        handL: [0.34, 0.06], handR: [0.66, 0.06],
        pelvis: [0.5, 0.56], hipL: [0.45, 0.57], hipR: [0.55, 0.57],
        kneeL: [0.4, 0.68], kneeR: [0.6, 0.68],
        footL: [0.43, 0.78], footR: [0.57, 0.78],
      },
      "Mid-air, limbs reach away from the core. Tuck the legs for energy."
    ),
    "lying down": H(
      {
        head: [0.12, 0.5], neck: [0.24, 0.5],
        shoulderL: [0.26, 0.43], shoulderR: [0.26, 0.57],
        elbowL: [0.4, 0.4], elbowR: [0.4, 0.6],
        handL: [0.52, 0.38], handR: [0.52, 0.62],
        pelvis: [0.6, 0.5], hipL: [0.6, 0.44], hipR: [0.6, 0.56],
        kneeL: [0.78, 0.44], kneeR: [0.78, 0.56],
        footL: [0.94, 0.43], footR: [0.94, 0.57],
      },
      "Rotate your whole proportion guide sideways. Foreshortening flattens limbs."
    ),
  };

  // Animals — custom skeletons (mostly side views).
  const animal = {
    cat: {
      points: {
        head: [0.22, 0.42], shoulder: [0.36, 0.46], hip: [0.68, 0.44],
        fFoot1: [0.34, 0.82], fFoot2: [0.4, 0.82],
        bFoot1: [0.66, 0.82], bFoot2: [0.72, 0.82],
        tail1: [0.74, 0.34], tail2: [0.86, 0.26],
        earL: [0.17, 0.3], earR: [0.27, 0.3],
      },
      bones: [
        ["head", "shoulder"], ["shoulder", "hip"],
        ["shoulder", "fFoot1"], ["shoulder", "fFoot2"],
        ["hip", "bFoot1"], ["hip", "bFoot2"],
        ["hip", "tail1"], ["tail1", "tail2"],
        ["head", "earL"], ["head", "earR"],
      ],
      circles: [{ at: "head", r: 0.08 }],
      tip: "Animals read as a few simple boxes: ribcage, hips, and a rounded head.",
    },
    dog: {
      points: {
        head: [0.2, 0.4], snout: [0.1, 0.46], shoulder: [0.36, 0.46],
        hip: [0.72, 0.44],
        fFoot1: [0.34, 0.84], fFoot2: [0.42, 0.84],
        bFoot1: [0.68, 0.84], bFoot2: [0.76, 0.84],
        tail: [0.86, 0.34], earL: [0.18, 0.3],
      },
      bones: [
        ["head", "snout"], ["head", "shoulder"], ["shoulder", "hip"],
        ["shoulder", "fFoot1"], ["shoulder", "fFoot2"],
        ["hip", "bFoot1"], ["hip", "bFoot2"],
        ["hip", "tail"], ["head", "earL"],
      ],
      circles: [{ at: "head", r: 0.08 }],
      tip: "Note the dip of the back between shoulders and hips, then add the muzzle.",
    },
    bird: {
      points: {
        head: [0.32, 0.3], body: [0.55, 0.5], tail: [0.82, 0.62],
        beak: [0.22, 0.3], wing: [0.58, 0.32],
        foot1: [0.5, 0.78], foot2: [0.58, 0.78],
      },
      bones: [
        ["head", "beak"], ["head", "body"], ["body", "tail"],
        ["body", "wing"], ["body", "foot1"], ["body", "foot2"],
      ],
      circles: [{ at: "head", r: 0.07 }, { at: "body", r: 0.12 }],
      tip: "A bird is two ovals — a small head and a teardrop body — joined by a neck.",
    },
    rabbit: {
      points: {
        head: [0.32, 0.5], body: [0.58, 0.56],
        earL: [0.28, 0.28], earR: [0.36, 0.27],
        fFoot: [0.4, 0.82], bFoot: [0.66, 0.82], tail: [0.78, 0.5],
      },
      bones: [
        ["head", "body"], ["head", "earL"], ["head", "earR"],
        ["body", "fFoot"], ["body", "bFoot"], ["body", "tail"],
      ],
      circles: [{ at: "head", r: 0.09 }, { at: "body", r: 0.14 }],
      tip: "The tall ears and round haunches are the rabbit's signature shapes.",
    },
    horse: {
      points: {
        head: [0.16, 0.34], neck: [0.28, 0.46], shoulder: [0.38, 0.5],
        hip: [0.74, 0.46],
        fFoot1: [0.36, 0.86], fFoot2: [0.44, 0.86],
        bFoot1: [0.72, 0.86], bFoot2: [0.8, 0.86],
        tail: [0.86, 0.6],
      },
      bones: [
        ["head", "neck"], ["neck", "shoulder"], ["shoulder", "hip"],
        ["shoulder", "fFoot1"], ["shoulder", "fFoot2"],
        ["hip", "bFoot1"], ["hip", "bFoot2"], ["hip", "tail"],
      ],
      circles: [{ at: "head", r: 0.065 }],
      tip: "Long legs and a powerful arched neck. Keep the body a long horizontal box.",
    },
    fish: {
      points: {
        head: [0.22, 0.5], body: [0.5, 0.5],
        tailTop: [0.86, 0.36], tailBot: [0.86, 0.64], tailMid: [0.74, 0.5],
        finTop: [0.5, 0.32], finBot: [0.5, 0.68],
      },
      bones: [
        ["head", "body"], ["body", "tailMid"],
        ["tailMid", "tailTop"], ["tailMid", "tailBot"], ["tailTop", "tailBot"],
        ["body", "finTop"], ["body", "finBot"],
      ],
      circles: [{ at: "body", r: 0.16 }],
      tip: "A fish is a lens shape with a triangular tail. Eye sits near the mouth.",
    },
    bear: {
      points: {
        head: [0.22, 0.4], shoulder: [0.38, 0.46], hip: [0.7, 0.46],
        fFoot1: [0.36, 0.84], fFoot2: [0.44, 0.84],
        bFoot1: [0.66, 0.84], bFoot2: [0.74, 0.84],
        earL: [0.17, 0.29], earR: [0.27, 0.29],
      },
      bones: [
        ["head", "shoulder"], ["shoulder", "hip"],
        ["shoulder", "fFoot1"], ["shoulder", "fFoot2"],
        ["hip", "bFoot1"], ["hip", "bFoot2"],
        ["head", "earL"], ["head", "earR"],
      ],
      circles: [{ at: "head", r: 0.1 }],
      tip: "Bears are bulky — thick limbs and a big round head with small ears.",
    },
    butterfly: {
      points: {
        head: [0.5, 0.22], body: [0.5, 0.55], tail: [0.5, 0.72],
        wTL: [0.22, 0.3], wTR: [0.78, 0.3],
        wBL: [0.28, 0.72], wBR: [0.72, 0.72],
        antL: [0.45, 0.12], antR: [0.55, 0.12],
      },
      bones: [
        ["head", "body"], ["body", "tail"],
        ["body", "wTL"], ["body", "wTR"],
        ["body", "wBL"], ["body", "wBR"],
        ["head", "antL"], ["head", "antR"],
      ],
      circles: [{ at: "head", r: 0.05 }],
      tip: "Butterflies are symmetrical — fold your paper in half to mirror the wings.",
    },
  };

  // Action poses (human skeleton, dynamic).
  const action = {
    punching: H(
      {
        head: [0.46, 0.16], neck: [0.46, 0.27],
        shoulderL: [0.38, 0.29], shoulderR: [0.54, 0.28],
        elbowL: [0.32, 0.34], elbowR: [0.68, 0.28],
        handL: [0.3, 0.42], handR: [0.84, 0.27],
        pelvis: [0.46, 0.56], hipL: [0.41, 0.57], hipR: [0.51, 0.57],
        kneeL: [0.34, 0.72], kneeR: [0.58, 0.74],
        footL: [0.3, 0.9], footR: [0.66, 0.9],
      },
      "Power comes from the hips. Twist the torso so the punching shoulder leads."
    ),
    kicking: H(
      {
        head: [0.34, 0.2], neck: [0.36, 0.31],
        shoulderL: [0.3, 0.33], shoulderR: [0.42, 0.32],
        elbowL: [0.22, 0.38], elbowR: [0.5, 0.38],
        handL: [0.16, 0.44], handR: [0.56, 0.42],
        pelvis: [0.42, 0.56], hipL: [0.38, 0.57], hipR: [0.46, 0.57],
        kneeL: [0.4, 0.74], kneeR: [0.62, 0.5],
        footL: [0.4, 0.92], footR: [0.84, 0.46],
      },
      "Balance on the standing leg. The kicking leg whips out from a bent knee."
    ),
    throwing: H(
      {
        head: [0.5, 0.18], neck: [0.5, 0.29],
        shoulderL: [0.42, 0.31], shoulderR: [0.58, 0.3],
        elbowL: [0.34, 0.36], elbowR: [0.66, 0.2],
        handL: [0.28, 0.42], handR: [0.74, 0.1],
        pelvis: [0.5, 0.57], hipL: [0.45, 0.58], hipR: [0.55, 0.58],
        kneeL: [0.4, 0.74], kneeR: [0.6, 0.74],
        footL: [0.36, 0.91], footR: [0.64, 0.91],
      },
      "The non-throwing arm points at the target to lead the body's rotation."
    ),
    diving: H(
      {
        head: [0.78, 0.3], neck: [0.68, 0.34],
        shoulderL: [0.64, 0.3], shoulderR: [0.64, 0.4],
        elbowL: [0.78, 0.22], elbowR: [0.78, 0.46],
        handL: [0.9, 0.16], handR: [0.9, 0.5],
        pelvis: [0.4, 0.42], hipL: [0.42, 0.38], hipR: [0.42, 0.46],
        kneeL: [0.24, 0.36], kneeR: [0.24, 0.5],
        footL: [0.1, 0.34], footR: [0.1, 0.52],
      },
      "A dive is one long diagonal line from fingertips to toes."
    ),
    falling: H(
      {
        head: [0.5, 0.2], neck: [0.5, 0.3],
        shoulderL: [0.4, 0.31], shoulderR: [0.6, 0.31],
        elbowL: [0.28, 0.24], elbowR: [0.72, 0.24],
        handL: [0.2, 0.14], handR: [0.8, 0.14],
        pelvis: [0.5, 0.56], hipL: [0.44, 0.57], hipR: [0.56, 0.57],
        kneeL: [0.36, 0.68], kneeR: [0.66, 0.7],
        footL: [0.28, 0.82], footR: [0.74, 0.86],
      },
      "Splay the limbs outward — falling figures lose their tidy silhouette."
    ),
    spinning: H(
      {
        head: [0.5, 0.16], neck: [0.5, 0.27],
        shoulderL: [0.4, 0.28], shoulderR: [0.6, 0.28],
        elbowL: [0.26, 0.3], elbowR: [0.74, 0.3],
        handL: [0.14, 0.34], handR: [0.86, 0.34],
        pelvis: [0.5, 0.56], hipL: [0.45, 0.57], hipR: [0.55, 0.57],
        kneeL: [0.38, 0.72], kneeR: [0.6, 0.7],
        footL: [0.34, 0.88], footR: [0.68, 0.82],
      },
      "Arms fling outward with the spin. Let the trailing leg lift off balance."
    ),
    climbing: H(
      {
        head: [0.5, 0.16], neck: [0.5, 0.26],
        shoulderL: [0.42, 0.28], shoulderR: [0.58, 0.28],
        elbowL: [0.4, 0.16], elbowR: [0.62, 0.36],
        handL: [0.42, 0.04], handR: [0.7, 0.42],
        pelvis: [0.5, 0.55], hipL: [0.45, 0.56], hipR: [0.55, 0.56],
        kneeL: [0.36, 0.62], kneeR: [0.58, 0.74],
        footL: [0.4, 0.74], footR: [0.6, 0.92],
      },
      "Climbers reach in an X — opposite arm and leg extend while the others pull in."
    ),
    blocking: H(
      {
        head: [0.5, 0.18], neck: [0.5, 0.29],
        shoulderL: [0.4, 0.31], shoulderR: [0.6, 0.31],
        elbowL: [0.36, 0.24], elbowR: [0.64, 0.24],
        handL: [0.42, 0.16], handR: [0.58, 0.16],
        pelvis: [0.5, 0.57], hipL: [0.44, 0.58], hipR: [0.56, 0.58],
        kneeL: [0.38, 0.73], kneeR: [0.62, 0.73],
        footL: [0.34, 0.9], footR: [0.66, 0.9],
      },
      "A braced stance is wide and low. Raise the forearms to guard the head."
    ),
  };

  window.POSES = { human, animal, action };
})();
