// kolokvij_vjezba_1.js
import MT3D from "./MT3D.js";
import { pripremiGPUprogram } from "./WebGL.js";

window.onload = () => {
  const canvas = document.getElementById("canvas");
  /** @type {WebGL2RenderingContext} */
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL2 nije dostupan.");
    return;
  }

  // ---------- Helpers: mat stack (jer MT3D nema spremi/vrati) ----------
  const matStack = [];
  const pushMat = (mt) => {
    // deep copy 4x4
    matStack.push(mt.m.map((row) => row.slice()));
  };
  const popMat = (mt) => {
    const top = matStack.pop();
    if (!top) throw new Error("Mat stack underflow");
    mt.m = top;
  };

  // ---------- Helpers: matrix ops for uniforms ----------
  function mat4Multiply(A, B) {
    const R = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += A[i][k] * B[k][j];
        R[i][j] = s;
      }
    }
    return R;
  }

  function mat3FromMat4(M) {
    return [
      [M[0][0], M[0][1], M[0][2]],
      [M[1][0], M[1][1], M[1][2]],
      [M[2][0], M[2][1], M[2][2]],
    ];
  }

  function mat3InverseTranspose3x3(m) {
    // inverse-transpose za 3x3
    const a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
    const a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
    const a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;
    if (Math.abs(det) < 1e-12) det = 1e-12;
    const invDet = 1.0 / det;

    const inv = [
      [b01 * invDet, (-a22 * a01 + a02 * a21) * invDet, (a12 * a01 - a02 * a11) * invDet],
      [b11 * invDet, (a22 * a00 - a02 * a20) * invDet, (-a12 * a00 + a02 * a10) * invDet],
      [b21 * invDet, (-a21 * a00 + a01 * a20) * invDet, (a11 * a00 - a01 * a10) * invDet],
    ];

    // transpose(inv)
    return [
      [inv[0][0], inv[1][0], inv[2][0]],
      [inv[0][1], inv[1][1], inv[2][1]],
      [inv[0][2], inv[1][2], inv[2][2]],
    ];
  }

  function mat4ToFloat32ColumnMajor(M) {
    const out = [];
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) out.push(M[row][col]);
    }
    return new Float32Array(out);
  }

  function mat3ToFloat32ColumnMajor(M) {
    const out = [];
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) out.push(M[row][col]);
    }
    return new Float32Array(out);
  }

  // ---------- Geometry builders ----------
  function buildCylinderWall(r, h, n, inward = false) {
    const pos = [];
    const nrm = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;

      // top then bottom -> TRIANGLE_STRIP
      pos.push(x, y, h);
      pos.push(x, y, 0);

      let nx = Math.cos(t), ny = Math.sin(t), nz = 0;
      if (inward) { nx = -nx; ny = -ny; }
      nrm.push(nx, ny, nz);
      nrm.push(nx, ny, nz);
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), mode: gl.TRIANGLE_STRIP, count: (n + 1) * 2 };
  }

  function buildAnnulus(rIn, rOut, z, n) {
    const pos = [];
    const nrm = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const cx = Math.cos(t), cy = Math.sin(t);

      // outer
      pos.push(cx * rOut, cy * rOut, z);
      nrm.push(0, 0, 1);

      // inner
      pos.push(cx * rIn, cy * rIn, z);
      nrm.push(0, 0, 1);
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), mode: gl.TRIANGLE_STRIP, count: (n + 1) * 2 };
  }

  function buildSphere(r, stacks, slices) {
    const pos = [];
    const nrm = [];
    const idx = [];

    for (let i = 0; i <= stacks; i++) {
      const v = i / stacks;
      const theta = v * Math.PI;
      const st = Math.sin(theta), ct = Math.cos(theta);

      for (let j = 0; j <= slices; j++) {
        const u = j / slices;
        const phi = u * Math.PI * 2;
        const sp = Math.sin(phi), cp = Math.cos(phi);

        const x = cp * st;
        const y = sp * st;
        const z = ct;

        pos.push(r * x, r * y, r * z);
        nrm.push(x, y, z);
      }
    }

    const row = slices + 1;
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const a = i * row + j;
        const b = a + row;
        idx.push(a, b, a + 1);
        idx.push(b, b + 1, a + 1);
      }
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      idx: new Uint16Array(idx),
      indexed: true,
      mode: gl.TRIANGLES,
      count: idx.length,
    };
  }

  // ---------- GPU mesh helper ----------
  function createMesh(geo) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // positions
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, geo.pos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // normals
    const vboNrm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNrm);
    gl.bufferData(gl.ARRAY_BUFFER, geo.nrm, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    let ebo = null;
    if (geo.indexed) {
      ebo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
      vao,
      mode: geo.mode,
      count: geo.count,
      indexed: !!geo.indexed,
      indexType: geo.indexed ? gl.UNSIGNED_SHORT : null,
    };
  }

  // ---------- Compile program ----------
  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // ---------- Uniform locations ----------
  const u_M = gl.getUniformLocation(program, "u_M");
  const u_V = gl.getUniformLocation(program, "u_V");
  const u_P = gl.getUniformLocation(program, "u_P");
  const u_N = gl.getUniformLocation(program, "u_N");

  // Lights
  const u_L0 = {
    posVS: gl.getUniformLocation(program, "u_L0.posVS"),
    ambient: gl.getUniformLocation(program, "u_L0.ambient"),
    diffuse: gl.getUniformLocation(program, "u_L0.diffuse"),
    specular: gl.getUniformLocation(program, "u_L0.specular"),
    enabled: gl.getUniformLocation(program, "u_L0.enabled"),
  };
  const u_L1 = {
    posVS: gl.getUniformLocation(program, "u_L1.posVS"),
    ambient: gl.getUniformLocation(program, "u_L1.ambient"),
    diffuse: gl.getUniformLocation(program, "u_L1.diffuse"),
    specular: gl.getUniformLocation(program, "u_L1.specular"),
    enabled: gl.getUniformLocation(program, "u_L1.enabled"),
  };
  const u_L2 = {
    posVS: gl.getUniformLocation(program, "u_L2.posVS"),
    ambient: gl.getUniformLocation(program, "u_L2.ambient"),
    diffuse: gl.getUniformLocation(program, "u_L2.diffuse"),
    specular: gl.getUniformLocation(program, "u_L2.specular"),
    enabled: gl.getUniformLocation(program, "u_L2.enabled"),
  };

  // Material
  const u_matAmbient = gl.getUniformLocation(program, "u_matAmbient");
  const u_matDiffuse = gl.getUniformLocation(program, "u_matDiffuse");
  const u_matSpecular = gl.getUniformLocation(program, "u_matSpecular");
  const u_matEmissive = gl.getUniformLocation(program, "u_matEmissive");
  const u_shininess = gl.getUniformLocation(program, "u_shininess");

  // ---------- Scene constants (različito od profa) ----------
  const R_OUT = 9.5;
  const R_IN = 8.5;
  const RING_H = 1.25;

  const COR_R = 0.65;
  const COR_L = 9.5; // hodnik

  const AXIS_R = 0.95;
  const AXIS_H = 6;

  const BALL_R = 1.5;

  // ---------- Build meshes ----------
  const SEG_RING = 64;
  const SEG_TUBE = 32;

  // Ring = two walls + top annulus
  const ringOuterWall = createMesh(buildCylinderWall(R_OUT, RING_H, SEG_RING, false));
  const ringInnerWall = createMesh(buildCylinderWall(R_IN, RING_H, SEG_RING, true));
  const ringTop = createMesh(buildAnnulus(R_IN, R_OUT, RING_H, SEG_RING));

  // Corridor and axis = walls (no caps)
  const corridorWall = createMesh(buildCylinderWall(COR_R, COR_L, SEG_TUBE, false));
  const axisWall = createMesh(buildCylinderWall(AXIS_R, AXIS_H, SEG_TUBE, false));

  // Sphere lamps
  const sphereMesh = createMesh(buildSphere(BALL_R, 18, 28));

  // ---------- GL state ----------
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);          // cull radi performansi
  gl.cullFace(gl.BACK);
  gl.clearColor(0, 0, 0, 1);

  // ---------- Camera + Projection ----------
  // kamera: malo "iznad" i ukoso da zauzme canvas
  const viewMT = new MT3D();
  viewMT.postaviKameru(
    4, 14, 12,  // eye
    0, 0, 0,      // center
    0, 0, 1       // up
  );

  // projection: perspektiva (koristimo tvoju persp)
  // Napomena: tvoja persp() mijenja mt.m; mi želimo samo P, pa koristimo poseban MT3D
  const projMT = new MT3D();
  projMT.identitet().persp(-6, 6, -6, 6, 6, 80);
  const P = projMT.m;

  // Set static uniforms V i P
  gl.uniformMatrix4fv(u_V, false, viewMT.kameraLista());
  gl.uniformMatrix4fv(u_P, false, mat4ToFloat32ColumnMajor(P));

  // ---------- Lights setup (u view-space!) ----------
  // World positions -> transform to view-space (viewMT.kamera)
  function transformPointView(px, py, pz) {
    const K = viewMT.kamera; // 4x4
    const x = K[0][0] * px + K[0][1] * py + K[0][2] * pz + K[0][3];
    const y = K[1][0] * px + K[1][1] * py + K[1][2] * pz + K[1][3];
    const z = K[2][0] * px + K[2][1] * py + K[2][2] * pz + K[2][3];
    return [x, y, z];
  }

  const light0 = {
    posWorld: [40, 20, 25],          // bijelo
    ambient: [0.12, 0.12, 0.12],
    diffuse: [1.0, 1.0, 1.0],
    specular: [1.0, 1.0, 1.0],
    enabled: 1,
  };

  const lightGreen = {
    // pozicija će se u animaciji vezati uz gornju kuglu (world)
    posWorld: [0, 0, 3 + AXIS_H + BALL_R * 0.2],
    ambient: [0.0, 0.0, 0.0],
    diffuse: [0.0, 0.4, 0.0],        // zahtjev: (0,0.4,0)
    specular: [0.05, 0.2, 0.05],
    enabled: 0,
  };

  const lightRed = {
    posWorld: [0, 0, 3 - BALL_R * 0.2],
    ambient: [0.0, 0.0, 0.0],
    diffuse: [0.4, 0.0, 0.0],        // zahtjev: (0.4,0,0)
    specular: [0.2, 0.05, 0.05],
    enabled: 0,
  };

  function uploadLight(uL, L) {
    const posVS = transformPointView(L.posWorld[0], L.posWorld[1], L.posWorld[2]);
    gl.uniform3fv(uL.posVS, posVS);
    gl.uniform3fv(uL.ambient, L.ambient);
    gl.uniform3fv(uL.diffuse, L.diffuse);
    gl.uniform3fv(uL.specular, L.specular);
    gl.uniform1i(uL.enabled, L.enabled);
  }

  // ---------- Materials ----------
  function setStationMaterial() {
    gl.uniform3fv(u_matAmbient, [0.20, 0.20, 0.20]);
    gl.uniform3fv(u_matDiffuse, [0.75, 0.75, 0.75]); // zahtjev: osnovna boja
    gl.uniform3fv(u_matSpecular, [0.35, 0.35, 0.35]);
    gl.uniform3fv(u_matEmissive, [0.0, 0.0, 0.0]);
    gl.uniform1f(u_shininess, 64.0);
  }

  function setLampMaterial(kind, isOn) {
    gl.uniform3fv(u_matAmbient, [0.15, 0.15, 0.15]);
    gl.uniform3fv(u_matDiffuse, [0.85, 0.85, 0.90]);
    gl.uniform3fv(u_matSpecular, [0.9, 0.9, 0.9]);
    gl.uniform1f(u_shininess, 96.0);

    if (kind === "green") {
      gl.uniform3fv(u_matEmissive, isOn ? [0.0, 0.85, 0.0] : [0.05, 0.05, 0.05]);
    } else {
      gl.uniform3fv(u_matEmissive, isOn ? [0.85, 0.0, 0.0] : [0.05, 0.05, 0.05]);
    }
  }

  // ---------- Draw mesh with current MT3D model matrix ----------
  const modelMT = new MT3D();

  function setMatricesAndNormal() {
    // u_M = model matrix (world)
    gl.uniformMatrix4fv(u_M, false, modelMT.lista());

    // normal matrix: inverse-transpose of (V * M) 3x3
    const MV = mat4Multiply(viewMT.kamera, modelMT.m);
    const mv3 = mat3FromMat4(MV);
    const N = mat3InverseTranspose3x3(mv3);
    gl.uniformMatrix3fv(u_N, false, mat3ToFloat32ColumnMajor(N));
  }

  function drawMesh(mesh) {
    setMatricesAndNormal();
    gl.bindVertexArray(mesh.vao);
    if (mesh.indexed) {
      gl.drawElements(mesh.mode, mesh.count, mesh.indexType, 0);
    } else {
      gl.drawArrays(mesh.mode, 0, mesh.count);
    }
    gl.bindVertexArray(null);
  }

  // ---------- Blinking logic ----------
  function updateBlinkingLights(angleDeg) {
    const a = ((angleDeg % 360) + 360) % 360;

    const greenOn = (a >= 0 && a < 45) || (a >= 180 && a < 225);
    const redOn = (a >= 90 && a < 135) || (a >= 270 && a < 315);

    lightGreen.enabled = greenOn ? 1 : 0;
    lightRed.enabled = redOn ? 1 : 0;

    return { greenOn, redOn };
  }

  // ---------- Scene draw ----------
  function drawStation(angleDeg) {
    // stanica (model) u centru, malo podignuta da bude ljepše u kadru
    modelMT.identitet();
    modelMT.pomakni(0, 0, 3.0);
    modelMT.rotirajZ(angleDeg);

    const blink = updateBlinkingLights(angleDeg);

    // upload svjetla (bijelo stalno + blink)
    uploadLight(u_L0, light0);
    uploadLight(u_L1, lightGreen);
    uploadLight(u_L2, lightRed);

    // 1) RING
    setStationMaterial();
    
    // annulus - bez culla
    gl.disable(gl.CULL_FACE);

    drawMesh(ringOuterWall);
    drawMesh(ringInnerWall);

    drawMesh(ringTop);
    gl.enable(gl.CULL_FACE);

    // 2) 3 CORRIDORS pod 120°
    for (let k = 0; k < 3; k++) {
      pushMat(modelMT);
      modelMT.rotirajZ(k * 120);
      // pomak na sredinu "prstena"
      modelMT.pomakni(AXIS_R + 0.2, 0, RING_H * 0.40);
      // valjak je po Z, pa ga okrenemo da ide radijalno
      modelMT.rotirajY(90);
      // centriraj hodnik (da ide s obje strane od točke)
      modelMT.pomakni(0, 0, -COR_L * 0.2);
      setStationMaterial();
      drawMesh(corridorWall);
      popMat(modelMT);
    }

    // 3) CENTRAL AXIS
    pushMat(modelMT);
    modelMT.pomakni(0, 0, -AXIS_H * 0.25);
    setStationMaterial();
    drawMesh(axisWall);

    // 4) LAMPS (SPHERES)
    // gornja - zelena
    pushMat(modelMT);
    modelMT.pomakni(0, 0, AXIS_H + BALL_R * 0.15);
    setLampMaterial("green", blink.greenOn);
    gl.disable(gl.CULL_FACE); // kugla je zatvorena, ali možeš i ostaviti enabled
    drawMesh(sphereMesh);
    gl.enable(gl.CULL_FACE);
    popMat(modelMT);

    // donja - crvena
    pushMat(modelMT);
    modelMT.pomakni(0, 0, -BALL_R * 0.15);
    setLampMaterial("red", blink.redOn);
    gl.disable(gl.CULL_FACE);
    drawMesh(sphereMesh);
    gl.enable(gl.CULL_FACE);
    popMat(modelMT);

    popMat(modelMT);
  }

  // ---------- Animation loop ----------
  let last = performance.now();
  let angle = 0;

  function frame(now) {
    const dt = now - last;
    last = now;

    // brzina rotacije (stupnjevi u sekundi)
    angle += (dt * 0.04); // ~40 deg/s
    if (angle >= 360) angle -= 360;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawStation(angle);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
};
