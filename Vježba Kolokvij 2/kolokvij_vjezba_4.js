// kolokvij_vjezba_4.js
import MT3D from "./MT3D.js";
import { pripremiGPUprogram } from "./WebGL.js";
import Primitives3D from "./Primitives3D.js";
import LightingRig2 from "./LightingRig2.js";

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) { alert("WebGL2 nije dostupan."); return; }

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

  // --- kamera: nek zauzme canvas ---
  const eye = [10, 7, 14];
  const center = [0, -1, 0];

  const viewMT = new MT3D().postaviKameru(
    eye[0], eye[1], eye[2],
    center[0], center[1], center[2],
    0, 1, 0
  );

  // perspektiva (točno po omjeru 800/600)
  const aspect = canvas.width / canvas.height;
  const fovDeg = 45;
  const near = 1.0;
  const far = 60.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;
  const P = new MT3D().identitet().persp(-right, right, -top, top, near, far).m;

  const L = new LightingRig2(gl, program).setViewProjection(viewMT, P);

  // --- mesh-evi (unit) ---
  const cylWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(1.0, 1.0, 80, false, gl.TRIANGLE_STRIP)
  );

  const hemi = Primitives3D.createMesh(
    gl,
    Primitives3D.buildHemisphereZ(1.0, 16, 32, gl.TRIANGLES)
  );

  const disk = Primitives3D.createMesh(
    gl,
    Primitives3D.buildDisk(1.0, 0.0, 80, true, gl.TRIANGLES)
  );

  const towerCapUp = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCapDisk(1.0, 1.0, 80, true, gl.TRIANGLES)
  );

  const ringOuterWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(1.0, 1.0, 80, false, gl.TRIANGLE_STRIP) // normale van
  );

  const ringInnerWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(1.0, 1.0, 80, true, gl.TRIANGLE_STRIP)  // normale unutra!
  );

  const cylCapped = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderCapped(1.0, 1.0, 80, true, true, gl.TRIANGLES)
  );


  // triangle blade (u XY, normal +Z) -> kasnije rotiramo Y 90 da bude u YZ ravnini (normal +X)
  const bladeTri = Primitives3D.createMesh(
    gl,
    Primitives3D.buildTriangle(
      [0.0, 0.0, 0.0],
      [1.6, 0.35, 0.0],
      [1.2, -0.75, 0.0],
      [0, 0, -1],
      gl.TRIANGLES
    )
  );

  // triangle blade (u XY, normal +Z) -> kasnije rotiramo Y 90 da bude u YZ ravnini (normal +X)
  const bladeTriBack = Primitives3D.createMesh(
    gl,
    Primitives3D.buildTriangle(
      [0.0, 0.0, 0.0],
      [1.6, 0.35, 0.0],
      [1.2, -0.75, 0.0],
      [0, 0, 1],
      gl.TRIANGLES
    )
  );

  // linija kao tanki quad (u XY) -> rotacija kasnije
  const lineQuad = Primitives3D.createMesh(
    gl,
    Primitives3D.buildQuadXY(1.6, 0.08, 0.0, gl.TRIANGLES)
  );

  // --- materijal helper ---
  function setMat(diffuseRGB, shininess = 90, spec = [1, 1, 1], ambient = [0.2, 0.2, 0.2]) {
    gl.uniform1i(u_unlit, 0);
    L.setMaterial({
      ambient,
      diffuse: diffuseRGB,
      specular: spec,
      emissive: [0, 0, 0],
      shininess,
    });
  }

  function setUnlitColor(rgb) {
    gl.uniform1i(u_unlit, 1);
    L.setMaterial({
      ambient: [0, 0, 0],
      diffuse: rgb,
      specular: [0, 0, 0],
      emissive: [0, 0, 0],
      shininess: 1,
    });
  }

  // --- 1 bijelo svjetlo, ostala ugašena ---
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

  // --- model matrica ---
  const M = new MT3D();

  function draw(mesh) {
    L.setModelAndNormal(M);
    Primitives3D.drawMesh(gl, mesh);
  }

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

  let last = performance.now();
  let aSub = 0;
  let aProp = 0;

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;

    // podmornica rotira oko okomite osi kroz sredinu
    aSub = (aSub + dt * 35) % 360;

    // elisa + os malo brže
    aProp = (aProp + dt * 70) % 360;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    L.setLight(0, mainLight);
    L.setLight(1, off);
    L.setLight(2, off);

    // globalna rotacija cijele scene
    const base = new MT3D().identitet().rotirajY(aSub);

    // ===== TRUP: cylinder + 2 hemisfere =====
    // cylinder: unit (r=1,h=1) uz Z, mi ga poravnamo po X:
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.rotirajY(90);           // Z -> X
    M.pomakni(0, 0, xBack);   // start na -L/2 (jer unit cylinder je 0..1)
    M.skaliraj(hullR, hullR, hullL);
    setMat(YELLOW, 110, [1,1,1]); // specular da se vidi refleksija
    draw(cylWall);

    // prednja polukugla (nose) na xFront
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(xFront - 0.05, 0, 0);
    M.rotirajY(90);     // dome +Z -> +X
    M.skaliraj(hullR, hullR, hullR);
    setMat(YELLOW, 110, [1,1,1]);
    draw(hemi);

    // stražnja polukugla na xBack (okrenuta prema -X)
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(xBack + 0.05, 0, 0);
    M.rotirajY(-90);    // dome +Z -> -X
    M.skaliraj(hullR, hullR, hullR);
    setMat(YELLOW, 110, [1,1,1]);
    draw(hemi);

    // ===== KOMANDNI TORANJ (elipsasti valjak) =====
    // valjak stavimo na vrh trupa
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(1.2, hullR * 0.85, 0.0);  // malo prema naprijed
    // cylinder wall je po Z, ovdje neka bude “uspravno” po Y:
    M.rotirajX(-90);
    M.skaliraj(towerR * towerScaleX, towerR * towerScaleZ, towerH);
    setMat(YELLOW, 90, [1,1,1]);
    draw(cylWall);
    draw(towerCapUp);

    // ===== OS POGONA (valjak s capUp + capDown) =====
    const shaftBaseX = xBack - shaftL;

    M.identitet();
    M.m = base.m.map(r => r.slice());

    // gdje hoćeš da os bude (ti si htio -1.5)
    M.pomakni(shaftBaseX - 1.5, 0, 0);

    // poravnaj cilindar (koji je po Z) na X
    M.rotirajY(90);

    // skala: radius, radius, duljina
    M.skaliraj(shaftR, shaftR, shaftL);

    setMat(YELLOW, 80, [1,1,1]);

    // za svaki slučaj isključi culling samo za os (da cap sigurno vidiš)
    gl.disable(gl.CULL_FACE);
    draw(cylCapped);
    gl.enable(gl.CULL_FACE);

    // os start i end u world X (jer nakon rotY(90) cilindar ide po +X)
    const shaftStartX = shaftBaseX - 1.5;

    // 1) vertikalna linija
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(shaftStartX - 0.02, 0, 0);
    M.rotirajY(90);
    M.skaliraj(shaftR, shaftR * 1.5, 1.0);
    gl.disable(gl.CULL_FACE);
    setUnlitColor(BLACK);
    draw(lineQuad);
    gl.enable(gl.CULL_FACE);

    // 2) horizontalna linija
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(shaftStartX - 0.02, 0, 0);
    M.rotirajY(90);
    M.rotirajZ(90);
    M.skaliraj(shaftR, shaftR * 1.5, 1.0);
    gl.disable(gl.CULL_FACE);
    setUnlitColor(BLACK);
    draw(lineQuad);
    gl.enable(gl.CULL_FACE);

    // ===== PRSTEN KOJI ŠTITI ELISU =====
    const ringX = shaftBaseX + 0.55;

    // outer (žuti)
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(ringX - 2, 0, 0);
    M.rotirajY(90);
    M.skaliraj(ringR, ringR, ringLen);
    setMat(YELLOW, 90, [1,1,1]);
    gl.disable(gl.CULL_FACE);
    draw(ringOuterWall);

    // inner (crveni) - malo manji radius
    M.identitet();
    M.m = base.m.map(r => r.slice());
    M.pomakni(ringX - 2, 0, 0);
    M.rotirajY(90);
    M.skaliraj(ringRinner, ringRinner, ringLen);
    setMat(RED_INNER, 90, [1,1,1]);
    draw(ringInnerWall);
    gl.enable(gl.CULL_FACE);


    // ===== ELISA: 3 trokuta (front žut, back zelen) =====
    // Blades su u ravnini diska (YZ), vrte se oko X
    const propX = shaftBaseX + 0.35;

    for (let k = 0; k < 3; k++) 
    {
      const phi = k * 120;

      // PREDNJA STRANA (žuta)
      M.identitet();
      M.m = base.m.map(r => r.slice());
      M.pomakni(propX - 1, 0, 0);
      M.rotirajX(aProp);
      M.rotirajX(phi);
      M.rotirajY(90);
      M.rotirajX(30);
      M.skaliraj(1.5, 1.5, 1.5);

      setMat(YELLOW, 70, [1,1,1]);
      
      gl.cullFace(gl.BACK);
      draw(bladeTri);

      // STRAŽNJA STRANA (zelena) – nacrtaj drugu stranu s FRONT cull
      setMat(GREEN_BACK, 70, [1,1,1]);
      gl.cullFace(gl.FRONT);
      draw(bladeTriBack);

      gl.cullFace(gl.BACK);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
};
