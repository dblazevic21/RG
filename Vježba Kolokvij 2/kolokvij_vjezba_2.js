// kolokvij_vjezba_1.js
import MT3D from "./MT3D.js";
import { pripremiGPUprogram } from "./WebGL.js";
import Primitives3D from "./Primitives3D.js";
import LightingRig2 from "./LightingRig2.js";

window.onload = () => {
  const canvas = document.getElementById("canvas");
  /** @type {WebGL2RenderingContext} */
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL2 nije dostupan.");
    return;
  }

  // ---------- Compile program ----------
  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // ---------- Scene constants ----------
  const R_OUT = 9.5;
  const R_IN = 8.5;
  const RING_H = 1.25;

  const COR_R = 0.65;
  const COR_L = 9.5;

  const AXIS_R = 0.95;
  const AXIS_H = 6;

  const BALL_R = 1.5;

  // ---------- Build meshes ----------
  const SEG_RING = 64;
  const SEG_TUBE = 32;

  const ringOuterWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(R_OUT, RING_H, SEG_RING, false, gl.TRIANGLE_STRIP)
  );
  const ringInnerWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(R_IN, RING_H, SEG_RING, true, gl.TRIANGLE_STRIP)
  );
  const ringTop = Primitives3D.createMesh(
    gl,
    Primitives3D.buildAnnulus(R_IN, R_OUT, RING_H, SEG_RING, gl.TRIANGLE_STRIP)
  );

  const corridorWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(COR_R, COR_L, SEG_TUBE, false, gl.TRIANGLE_STRIP)
  );
  const axisWall = Primitives3D.createMesh(
    gl,
    Primitives3D.buildCylinderWall(AXIS_R, AXIS_H, SEG_TUBE, false, gl.TRIANGLE_STRIP)
  );

  const sphereMesh = Primitives3D.createMesh(
    gl,
    Primitives3D.buildSphere(BALL_R, 18, 28, gl.TRIANGLES)
  );

  // ---------- GL state ----------
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 1);

  // ---------- Camera + Projection ----------
  const viewMT = new MT3D();
  viewMT.postaviKameru(
    4, 14, 12,  // eye
    0, 0, 0,    // center
    0, 0, 1     // up
  );

  const projMT = new MT3D();
  projMT.identitet().persp(-6, 6, -6, 6, 6, 80);
  const P = projMT.m;

  // ---------- Lighting rig ----------
  const L = new LightingRig2(gl, program).setViewProjection(viewMT, P);

  const light0 = {
    posWorld: [40, 20, 25],
    ambient: [0.12, 0.12, 0.12],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    enabled: 1,
  };

  const lightGreen = {
    posWorld: [0, 0, 3 + AXIS_H + BALL_R * 0.2],
    ambient: [0.0, 0.0, 0.0],
    diffuse: [0.0, 0.4, 0.0],
    specular: [0.05, 0.2, 0.05],
    enabled: 0,
  };

  const lightRed = {
    posWorld: [0, 0, 3 - BALL_R * 0.2],
    ambient: [0.0, 0.0, 0.0],
    diffuse: [0.4, 0.0, 0.0],
    specular: [0.2, 0.05, 0.05],
    enabled: 0,
  };

  // ---------- Materials ----------
  function setStationMaterial() {
    L.setMaterial({
      ambient:  [0.20, 0.20, 0.20],
      diffuse:  [0.75, 0.75, 0.75],
      specular: [0.35, 0.35, 0.35],
      emissive: [0.0, 0.0, 0.0],
      shininess: 64.0,
    });
  }

  function setLampMaterial(kind, isOn) {
    const emissive =
      kind === "green"
        ? (isOn ? [0.0, 0.85, 0.0] : [0.05, 0.05, 0.05])
        : (isOn ? [0.85, 0.0, 0.0] : [0.05, 0.05, 0.05]);

    L.setMaterial({
      ambient:  [0.15, 0.15, 0.15],
      diffuse:  [0.85, 0.85, 0.90],
      specular: [0.9,  0.9,  0.9],
      emissive,
      shininess: 96.0,
    });
  }

  // ---------- Blinking logic ----------
  function updateBlinkingLights(angleDeg) {
    const a = ((angleDeg % 360) + 360) % 360;
    const greenOn = (a >= 0 && a < 45) || (a >= 180 && a < 225);
    const redOn   = (a >= 90 && a < 135) || (a >= 270 && a < 315);

    lightGreen.enabled = greenOn ? 1 : 0;
    lightRed.enabled   = redOn ? 1 : 0;

    return { greenOn, redOn };
  }

  // ---------- Draw mesh with current MT3D model matrix ----------
  const modelMT = new MT3D();

  function drawMesh(mesh) {
    L.setModelAndNormal(modelMT);
    Primitives3D.drawMesh(gl, mesh);
  }

  // ---------- Scene draw ----------
  function drawStation(angleDeg) {
    modelMT.identitet();
    modelMT.clearStack();
    modelMT.pomakni(0, 0, 3.0);
    modelMT.rotirajZ(angleDeg);

    const blink = updateBlinkingLights(angleDeg);

    // upload lights (u view-space) + enabled
    L.setLight(0, light0);
    L.setLight(1, lightGreen);
    L.setLight(2, lightRed);

    // 1) RING (bez culla jer ima unutarnju/vanjsku stijenku + top)
    setStationMaterial();
    gl.disable(gl.CULL_FACE);
    drawMesh(ringOuterWall);
    drawMesh(ringInnerWall);
    drawMesh(ringTop);
    gl.enable(gl.CULL_FACE);

    // 2) 3 CORRIDORS pod 120°
    for (let k = 0; k < 3; k++) {
      modelMT.spremi();
      modelMT.rotirajZ(k * 120);
      modelMT.pomakni(AXIS_R + 0.2, 0, RING_H * 0.40);
      modelMT.rotirajY(90);
      modelMT.pomakni(0, 0, -COR_L * 0.2);

      setStationMaterial();
      drawMesh(corridorWall);
      modelMT.vrati();
    }

    // 3) CENTRAL AXIS
    modelMT.spremi();
    modelMT.pomakni(0, 0, -AXIS_H * 0.25);
    setStationMaterial();
    drawMesh(axisWall);

    // 4) LAMPS
    // gornja - zelena
    modelMT.spremi();
    modelMT.pomakni(0, 0, AXIS_H + BALL_R * 0.15);
    setLampMaterial("green", blink.greenOn);
    gl.disable(gl.CULL_FACE);
    drawMesh(sphereMesh);
    gl.enable(gl.CULL_FACE);
    modelMT.vrati();

    // donja - crvena
    modelMT.spremi();
    modelMT.pomakni(0, 0, -BALL_R * 0.15);
    setLampMaterial("red", blink.redOn);
    gl.disable(gl.CULL_FACE);
    drawMesh(sphereMesh);
    gl.enable(gl.CULL_FACE);
    modelMT.vrati();

    modelMT.vrati();
  }

  // ---------- Animation loop ----------
  let last = performance.now();
  let angle = 0;

  function frame(now) {
    const dt = now - last;
    last = now;

    angle += (dt * 0.04);
    if (angle >= 360) angle -= 360;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawStation(angle);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
};
