// kolokvij_vjezba_3.js
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

  const BLUE = [0.6, 0.8, 1.0];
  const INNER = [1.0, 0.2, 1.0];
  const YELLOW_LIGHT = [0.4, 0.4, 0.0];

  const eye = [0.0, 4.0, 10];
  const center = [0.0, 2.0, 0.0];

  const viewMT = new MT3D().postaviKameru(
    eye[0], eye[1], eye[2],
    center[0], center[1], center[2],
    0, 1, 0
  );

  const aspect = canvas.width / canvas.height;
  const fovDeg = 45;
  const near = 1.0;
  const far = 40.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;

  const projMT = new MT3D().identitet().persp(-right, right, -top, top, near, far);
  const P = projMT.m;

  const L = new LightingRig2(gl, program).setViewProjection(viewMT, P);

  const meshCyl = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(1.0, 1.0, 80, false, gl.TRIANGLE_STRIP)
  );

  const capUp = Primitives3D.createMesh(
    gl,
    Primitives3D.buildDisk(1.0, 1.0, 80, true, gl.TRIANGLES)   // TOP na z=1
  );

const capDown = Primitives3D.createMesh(
  gl,
  Primitives3D.buildDisk(1.0, 0.0, 80, false, gl.TRIANGLES)  // BOTTOM na z=0
);



  const hemi = Primitives3D.createMesh(
    gl,
    Primitives3D.buildHemisphereZ(1.0, 14, 28, gl.TRIANGLES)
  );

  const sphere = Primitives3D.createMesh(
    gl,
    Primitives3D.buildSphere(1.0, 18, 28, gl.TRIANGLES)
  );

  function setMat(colorRGB, emissiveRGB = [0, 0, 0], shininess = 80) {
    L.setMaterial({
      ambient: [0.20, 0.20, 0.20],
      diffuse: colorRGB,
      specular: [0.9, 0.9, 0.9],
      emissive: emissiveRGB,
      shininess,
    });
  }

  const mainLight = {
    posWorld: [12.0, 11.0, 18.0],
    ambient: [0.10, 0.10, 0.10],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    enabled: 1,
  };

  const bulbLight = {
    posWorld: [0, 0, 0],
    ambient: [0.0, 0.0, 0.0],
    diffuse: YELLOW_LIGHT,
    specular: [0.2, 0.2, 0.05],
    enabled: 0,
  };

  const offLight = {
    posWorld: [0, 0, 0],
    ambient: [0, 0, 0],
    diffuse: [0, 0, 0],
    specular: [0, 0, 0],
    enabled: 0,
  };

  const M = new MT3D();

  function draw(mesh) {
    L.setModelAndNormal(M);
    Primitives3D.drawMesh(gl, mesh);
  }

  function drawCylY(scaleR, scaleH, materialFn) {
    M.spremi();
    M.rotirajX(-90);
    M.skaliraj(scaleR, scaleR, scaleH);

    materialFn();
    draw(meshCyl);

    draw(capUp);
    draw(capDown);

    M.vrati();
  }

  // dimenzije
  const baseR=1.5, baseH=0.25;
  const baseTopR=0.65, baseTopH=0.2;
  const poleR=0.18, poleH=3.5;
  const jointR=0.45, jointLen=1.20;
  const armR=0.14, armLen=3;
  const headR=0.35, headLen=1.0;
  const shadeR=0.8, bulbR=0.5;

  const baseY = baseH * 0.5;
  const baseTopY = baseH + baseTopH * 0.5;
  const poleY = baseH + baseTopH;
  const pivotY = baseH + baseTopH + poleH - 1.0;

  const armTilt = 20;
  const headTilt = -90;

  let last = performance.now();
  let angle = 0;
  let tBlink = 0;
  let bulbOn = false;

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;

    angle = (angle + dt * 60) % 360;
    tBlink += dt;
    if (tBlink >= 1.0) {
      tBlink -= 1.0;
      bulbOn = !bulbOn;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    L.setLight(0, mainLight);
    L.setLight(2, offLight);

    const baseRot = new MT3D().rotirajY(angle);

    const armBase = new MT3D().mult(baseRot);
    armBase.pomakni(0, pivotY, 0.5);
    armBase.rotirajZ(armTilt);

    const headBase = new MT3D().mult(armBase);
    headBase.pomakni(armLen, headLen, 0);
    headBase.rotirajZ(headTilt);
    headBase.pomakni(0, 0.08, 0);

    const shadeBase = new MT3D().mult(headBase);
    shadeBase.pomakni(headLen + shadeR * 0.15, 0, 0);
    shadeBase.rotirajZ(90);

    // žarulja
    const bulbLightM = new MT3D().mult(shadeBase);
    bulbLightM.pomakni(-0.6, -shadeR, 0);

    const bulbBase = new MT3D().mult(bulbLightM);
    bulbBase.skaliraj(bulbR * 0.9, bulbR * 1.1, bulbR * 0.9);

    const bulbPosW = [bulbLightM.m[0][3], bulbLightM.m[1][3], bulbLightM.m[2][3]];
    bulbLight.posWorld = bulbPosW;
    bulbLight.enabled = bulbOn ? 1 : 0;
    L.setLight(1, bulbLight);

    // baza donja
    M.identitet();
    M.m = baseRot.m.map(r => r.slice());
    M.pomakni(0, baseY, 0);
    drawCylY(baseR, baseH, () => setMat(BLUE));

    // baza gornja
    M.identitet();
    M.m = baseRot.m.map(r => r.slice());
    M.pomakni(0, baseTopY, 0);
    drawCylY(baseTopR, baseTopH, () => setMat(BLUE));

    // pole
    M.identitet();
    M.m = baseRot.m.map(r => r.slice());
    M.pomakni(0, poleY, 0);
    drawCylY(poleR, poleH, () => setMat(BLUE));

    // baza tijelo
    M.identitet();
    M.m = baseRot.m.map(r => r.slice());
    M.pomakni(0, pivotY, -0.25);
    M.rotirajZ(90);
    M.rotirajX(90);
    drawCylY(jointR, jointLen, () => setMat(BLUE));

    //ruka
    M.identitet();
    M.m = armBase.m.map(r => r.slice());
    M.pomakni(armLen * 0.765, 0, 0);
    M.rotirajZ(90);
    drawCylY(armR, armLen, () => setMat(BLUE));

    // Valjak na glavi
    M.identitet();
    M.m = headBase.m.map(r => r.slice());
    M.pomakni(headLen + 0.5, -0.6, 0);
    M.rotirajZ(90);
    drawCylY(headR, headLen, () => setMat(BLUE));

    //glava
    M.identitet();
    M.m = shadeBase.m.map(r => r.slice());
    M.rotirajX(-90);
    M.pomakni(-0.6, 0, -headLen);
    M.skaliraj(shadeR, shadeR, shadeR);

    gl.cullFace(gl.BACK);
    setMat(BLUE);
    draw(hemi);

    gl.cullFace(gl.FRONT);
    setMat(INNER);
    draw(hemi);

    gl.cullFace(gl.BACK);

    M.identitet();
    M.m = bulbBase.m.map(r => r.slice());
    if (bulbOn) setMat(BLUE, [0.2, 0.2, 0.0], 96);
    else setMat(BLUE, [0, 0, 0], 96);
    draw(sphere);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
};
