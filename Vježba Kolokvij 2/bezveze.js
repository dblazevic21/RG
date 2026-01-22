// kolokvij_vjezba_4.js
import MT3D from "./MT3D.js";
import { pripremiGPUprogram } from "./WebGL.js";
import Primitives3D from "./Primitives3D.js";
import LightingRig2 from "./LightingRig2.js";
import DrawContext from "./DrawContext.js";
import { makeAnimator } from "./Animator.js";

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL2 nije dostupan.");
    return;
  }

  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 1);

  // --- uniform za unlit linije ---
  const u_unlit = gl.getUniformLocation(program, "u_unlit");

  // --- boje iz zadatka ---
  const YELLOW = [0.75, 0.75, 0.0];
  const RED_INNER = [1.0, 0.0, 0.0];
  const GREEN_BACK = [0.0, 1.0, 0.0];
  const BLACK = [0.0, 0.0, 0.0];

  // --- kamera ---
  const eye = [10, 7, 14];
  const center = [0, -1, 0];

  const viewMT = new MT3D().postaviKameru(
    eye[0], eye[1], eye[2],
    center[0], center[1], center[2],
    0, 1, 0
  );

  // perspektiva
  const aspect = canvas.width / canvas.height;
  const fovDeg = 45;
  const near = 1.0;
  const far = 60.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;
  const P = new MT3D().identitet().persp(-right, right, -top, top, near, far).m;

  const L = new LightingRig2(gl, program).setViewProjection(viewMT, P);
  const DC = new DrawContext(gl, L, u_unlit);

  // --- mesh-evi (unit) ---
  const meshes = {
    cylWall: Primitives3D.createMesh(
      gl,
      Primitives3D.buildCylinderWall(1.0, 1.0, 80, false, gl.TRIANGLE_STRIP)
    ),
    hemi: Primitives3D.createMesh(
      gl,
      Primitives3D.buildHemisphereZ(1.0, 16, 32, gl.TRIANGLES)
    ),
    // ostavljeno (ako ti zatreba kasnije)
    disk: Primitives3D.createMesh(
      gl,
      Primitives3D.buildDisk(1.0, 0.0, 80, true, gl.TRIANGLES)
    ),
    towerCapUp: Primitives3D.createMesh(
      gl,
      Primitives3D.buildCapDisk(1.0, 1.0, 80, true, gl.TRIANGLES)
    ),
    ringOuterWall: Primitives3D.createMesh(
      gl,
      Primitives3D.buildCylinderWall(1.0, 1.0, 80, false, gl.TRIANGLE_STRIP) // normale van
    ),
    ringInnerWall: Primitives3D.createMesh(
      gl,
      Primitives3D.buildCylinderWall(1.0, 1.0, 80, true, gl.TRIANGLE_STRIP) // normale unutra
    ),
    cylCapped: Primitives3D.createMesh(
      gl,
      Primitives3D.buildCylinderCapped(1.0, 1.0, 80, true, true, gl.TRIANGLES)
    ),
    bladeTri: Primitives3D.createMesh(
      gl,
      Primitives3D.buildTriangle(
        [0.0, 0.0, 0.0],
        [1.6, 0.35, 0.0],
        [1.2, -0.75, 0.0],
        [0, 0, -1],
        gl.TRIANGLES
      )
    ),
    bladeTriBack: Primitives3D.createMesh(
      gl,
      Primitives3D.buildTriangle(
        [0.0, 0.0, 0.0],
        [1.6, 0.35, 0.0],
        [1.2, -0.75, 0.0],
        [0, 0, 1],
        gl.TRIANGLES
      )
    ),
    lineQuad: Primitives3D.createMesh(
      gl,
      Primitives3D.buildQuadXY(1.6, 0.08, 0.0, gl.TRIANGLES)
    ),
  };

  // --- svjetla ---
  const mainLight = {
    posWorld: [12.0, 11.0, 18.0],
    ambient: [0.10, 0.10, 0.10],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    enabled: 1,
  };
  const off = {
    posWorld: [0, 0, 0],
    ambient: [0, 0, 0],
    diffuse: [0, 0, 0],
    specular: [0, 0, 0],
    enabled: 0,
  };

  // ===== DIMENZIJE PODMORNICE =====
  const hullR = 2.2;
  const hullL = 6.5;

  const towerR = 0.9;        // “bazni” radius (poslije elipsa)
  const towerH = 1.5;
  const towerScaleX = 1.35;  // elipsa
  const towerScaleZ = 0.85;

  const shaftR = 0.28;
  const shaftL = 2.2;

  const ringR = 2.5;
  const ringRinner = 2.49;
  const ringLen = 1.25; // “debljina” po osi

  // položaji
  const xFront = +hullL * 0.5;
  const xBack = -hullL * 0.5;

  // anim stanja
  let aSub = 0;
  let aProp = 0;

  function renderScene(base) {
    // ===== TRUP: cylinder + 2 hemisfere =====
    DC.setMat(YELLOW, 110, [1, 1, 1]);
    DC.from(base)
      .rotirajY(90)         // Z -> X
      .pomakni(0, 0, xBack) // start na -L/2 (jer unit cylinder je 0..1)
      .skaliraj(hullR, hullR, hullL);
    DC.draw(meshes.cylWall);

    // prednja polukugla (nose)
    DC.setMat(YELLOW, 110, [1, 1, 1]);
    DC.from(base)
      .pomakni(xFront - 0.05, 0, 0)
      .rotirajY(90)
      .skaliraj(hullR, hullR, hullR);
    DC.draw(meshes.hemi);

    // stražnja polukugla
    DC.setMat(YELLOW, 110, [1, 1, 1]);
    DC.from(base)
      .pomakni(xBack + 0.05, 0, 0)
      .rotirajY(-90)
      .skaliraj(hullR, hullR, hullR);
    DC.draw(meshes.hemi);

    // ===== KOMANDNI TORANJ =====
    DC.setMat(YELLOW, 90, [1, 1, 1]);
    DC.from(base)
      .pomakni(1.2, hullR * 0.85, 0.0)
      .rotirajX(-90) // cylinder wall je po Z, ovdje uspravno po Y
      .skaliraj(towerR * towerScaleX, towerR * towerScaleZ, towerH);
    DC.draw(meshes.cylWall);
    DC.draw(meshes.towerCapUp);

    // ===== OS POGONA =====
    const shaftBaseX = xBack - shaftL;

    DC.setMat(YELLOW, 80, [1, 1, 1]);
    DC.from(base)
      .pomakni(shaftBaseX - 1.5, 0, 0)
      .rotirajY(90)
      .skaliraj(shaftR, shaftR, shaftL);

    // capovi znaju bit problem s cullom -> nacrtaj bez cull
    DC.withCull(false, () => DC.draw(meshes.cylCapped));

    // os start u world X (nakon rotY(90) cilindar ide po +X)
    const shaftStartX = shaftBaseX - 1.5;

    // 1) vertikalna linija
    DC.setUnlit(BLACK);
    DC.from(base)
      .pomakni(shaftStartX - 0.02, 0, 0)
      .rotirajY(90)
      .skaliraj(shaftR, shaftR * 1.5, 1.0);
    DC.withCull(false, () => DC.draw(meshes.lineQuad));

    // 2) horizontalna linija
    DC.setUnlit(BLACK);
    DC.from(base)
      .pomakni(shaftStartX - 0.02, 0, 0)
      .rotirajY(90)
      .rotirajZ(90)
      .skaliraj(shaftR, shaftR * 1.5, 1.0);
    DC.withCull(false, () => DC.draw(meshes.lineQuad));

    // ===== PRSTEN KOJI ŠTITI ELISU =====
    const ringX = shaftBaseX + 0.55;

    // outer (žuti)
    DC.setMat(YELLOW, 90, [1, 1, 1]);
    DC.from(base)
      .pomakni(ringX - 2, 0, 0)
      .rotirajY(90)
      .skaliraj(ringR, ringR, ringLen);

    DC.withCull(false, () => DC.draw(meshes.ringOuterWall));

    // inner (crveni) – isto bez culla!
    DC.setMat(RED_INNER, 90, [1, 1, 1]);
    DC.from(base)
      .pomakni(ringX - 2, 0, 0)
      .rotirajY(90)
      .skaliraj(ringRinner, ringRinner, ringLen);

    DC.withCull(false, () => DC.draw(meshes.ringInnerWall));


    // ===== ELISA: 3 trokuta (front žut, back zelen) =====
    const propX = shaftBaseX + 0.35;

    for (let k = 0; k < 3; k++) {
      const phi = k * 120;

      // zajednička transformacija
      DC.from(base)
        .pomakni(propX - 1, 0, 0)
        .rotirajX(aProp)
        .rotirajX(phi)
        .rotirajY(90)
        .rotirajX(30)
        .skaliraj(1.5, 1.5, 1.5);

      // front
      DC.setMat(YELLOW, 70, [1, 1, 1]);
      DC.withCullFace(gl.BACK, () => DC.draw(meshes.bladeTri));

      // back
      DC.setMat(GREEN_BACK, 70, [1, 1, 1]);
      DC.withCullFace(gl.FRONT, () => DC.draw(meshes.bladeTriBack));

      // vrati default
      gl.cullFace(gl.BACK);
    }
  }

  const anim = makeAnimator((dt) => {
    // animacije
    aSub = (aSub + dt * 35) % 360;
    aProp = (aProp + dt * 70) % 360;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    L.setLight(0, mainLight);
    L.setLight(1, off);
    L.setLight(2, off);

    const base = new MT3D().identitet().rotirajY(aSub);
    renderScene(base);
  });

  anim.start();
};
