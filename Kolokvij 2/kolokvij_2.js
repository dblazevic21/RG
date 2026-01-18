import { pripremiGPUprogram } from "./WebGL.js";
import MT3D from "./MT3D.js";

function pushTri(out, p0, n0, p1, n1, p2, n2) {
  out.push(...p0, ...n0, ...p1, ...n1, ...p2, ...n2);
}

function norm(v) {
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / L, v[1] / L, v[2] / L];
}

function makeCylinderSide(r = 1, h = 2, n = 64, inward = false) {
  const out = [];
  const y0 = -h / 2;
  const y1 = h / 2;
  const d = (2 * Math.PI) / n;

  for (let i = 0; i < n; i++) {
    const a0 = i * d;
    const a1 = (i + 1) * d;
    const c0 = Math.cos(a0), s0 = Math.sin(a0);
    const c1 = Math.cos(a1), s1 = Math.sin(a1);

    const p00 = [r * c0, y0, r * s0];
    const p01 = [r * c0, y1, r * s0];
    const p10 = [r * c1, y0, r * s1];
    const p11 = [r * c1, y1, r * s1];

    const n0 = inward ? norm([-c0, 0, -s0]) : norm([c0, 0, s0]);
    const n1 = inward ? norm([-c1, 0, -s1]) : norm([c1, 0, s1]);

    if (!inward) {
      pushTri(out, p00, n0, p01, n0, p11, n1);
      pushTri(out, p00, n0, p11, n1, p10, n1);
    } else {
      pushTri(out, p00, n0, p11, n1, p01, n0);
      pushTri(out, p00, n0, p10, n1, p11, n1);
    }
  }

  return new Float32Array(out);
}

function makeAnnulusTop(rIn = 1, rOut = 1.3, y = 0, n = 64) {
  const out = [];
  const d = (2 * Math.PI) / n;
  const N = [0, 1, 0];

  for (let i = 0; i < n; i++) {
    const a0 = i * d;
    const a1 = (i + 1) * d;

    const p0 = [rIn * Math.cos(a0), y, rIn * Math.sin(a0)];
    const p1 = [rOut * Math.cos(a0), y, rOut * Math.sin(a0)];
    const p2 = [rOut * Math.cos(a1), y, rOut * Math.sin(a1)];
    const p3 = [rIn * Math.cos(a1), y, rIn * Math.sin(a1)];

    pushTri(out, p0, N, p1, N, p2, N);
    pushTri(out, p0, N, p2, N, p3, N);
  }
  return new Float32Array(out);
}

function makeSphere(r = 1, slices = 32, stacks = 16) {
  const out = [];
  for (let i = 0; i < stacks; i++) {
    const t0 = (i / stacks) * Math.PI;
    const t1 = ((i + 1) / stacks) * Math.PI;
    for (let j = 0; j < slices; j++) {
      const p0 = (j / slices) * 2 * Math.PI;
      const p1 = ((j + 1) / slices) * 2 * Math.PI;

      const a = sph(r, t0, p0);
      const b = sph(r, t1, p0);
      const c = sph(r, t1, p1);
      const d = sph(r, t0, p1);

      const na = norm(a), nb = norm(b), nc = norm(c), nd = norm(d);
      pushTri(out, a, na, b, nb, c, nc);
      pushTri(out, a, na, c, nc, d, nd);
    }
  }
  return new Float32Array(out);

  function sph(rr, theta, phi) {
    const x = rr * Math.cos(phi) * Math.sin(theta);
    const y = rr * Math.cos(theta);
    const z = rr * Math.sin(phi) * Math.sin(theta);
    return [x, y, z];
  }
}

function normalMatrixFromMat4_colMajor(m4) {
  const a00 = m4[0], a01 = m4[4], a02 = m4[8];
  const a10 = m4[1], a11 = m4[5], a12 = m4[9];
  const a20 = m4[2], a21 = m4[6], a22 = m4[10];

  const det =
    a00 * (a11 * a22 - a12 * a21) -
    a01 * (a10 * a22 - a12 * a20) +
    a02 * (a10 * a21 - a11 * a20);

  if (Math.abs(det) < 1e-10) {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  const invDet = 1.0 / det;

  const b00 = (a11 * a22 - a12 * a21) * invDet;
  const b01 = (a02 * a21 - a01 * a22) * invDet;
  const b02 = (a01 * a12 - a02 * a11) * invDet;

  const b10 = (a12 * a20 - a10 * a22) * invDet;
  const b11 = (a00 * a22 - a02 * a20) * invDet;
  const b12 = (a02 * a10 - a00 * a12) * invDet;

  const b20 = (a10 * a21 - a11 * a20) * invDet;
  const b21 = (a01 * a20 - a00 * a21) * invDet;
  const b22 = (a00 * a11 - a01 * a10) * invDet;

  return new Float32Array([b00, b10, b20, b01, b11, b21, b02, b12, b22]);
}

function rotateY(pos, angRad) {
  const c = Math.cos(angRad), s = Math.sin(angRad);
  return [pos[0] * c + pos[2] * s, pos[1], -pos[0] * s + pos[2] * c];
}

function transformPoint_colMajor(m4, v) {
  return [
    m4[0] * v[0] + m4[4] * v[1] + m4[8] * v[2] + m4[12],
    m4[1] * v[0] + m4[5] * v[1] + m4[9] * v[2] + m4[13],
    m4[2] * v[0] + m4[6] * v[1] + m4[10] * v[2] + m4[14],
  ];
}

window.onload = () => {
  const canvas = document.getElementById("platno");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 not available.");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const aPos = gl.getAttribLocation(program, "a_pos");
  const aNrm = gl.getAttribLocation(program, "a_nrm");

  const uModel = gl.getUniformLocation(program, "u_model");
  const uView = gl.getUniformLocation(program, "u_view");
  const uProj = gl.getUniformLocation(program, "u_proj");
  const uNrm = gl.getUniformLocation(program, "u_normalMat");

  const uColor = gl.getUniformLocation(program, "u_color");
  const uViewPos = gl.getUniformLocation(program, "u_viewPos");

  const uL0 = gl.getUniformLocation(program, "u_lightPos0");
  const uC0 = gl.getUniformLocation(program, "u_lightCol0");
  const uL1 = gl.getUniformLocation(program, "u_lightPos1");
  const uC1 = gl.getUniformLocation(program, "u_lightCol1");
  const uL2 = gl.getUniformLocation(program, "u_lightPos2");
  const uC2 = gl.getUniformLocation(program, "u_lightCol2");

  const uKd = gl.getUniformLocation(program, "u_kd");
  const uKs = gl.getUniformLocation(program, "u_ks");
  const uKa = gl.getUniformLocation(program, "u_ka");
  const uSh = gl.getUniformLocation(program, "u_sh");
  const uEm = gl.getUniformLocation(program, "u_emissive");

  gl.uniform1f(uKd, 0.9);
  gl.uniform1f(uKs, 0.6);
  gl.uniform1f(uKa, 0.15);
  gl.uniform1f(uSh, 50.0);

  const baseCol = [0.75, 0.75, 0.75];
  const greenLight = [0.0, 0.4, 0.0];
  const redLight = [0.4, 0.0, 0.0];

  function createVAO(data) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const stride = 6 * 4;
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(aNrm);
    gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, stride, 3 * 4);

    gl.bindVertexArray(null);
    return { vao, count: data.length / 6 };
  }

  function draw(vaoObj, m, color, emissive) {
    const m4 = m.lista();
    gl.uniformMatrix4fv(uModel, false, m4);
    gl.uniformMatrix3fv(uNrm, false, normalMatrixFromMat4_colMajor(m4));
    gl.uniform3fv(uColor, color);
    gl.uniform3fv(uEm, emissive ?? [0, 0, 0]);
    gl.bindVertexArray(vaoObj.vao);
    gl.drawArrays(gl.TRIANGLES, 0, vaoObj.count);
  }

  // geometry
  const ringRin = 2.2;
  const ringRout = 2.5;
  const ringH = 0.25;
  const corridorR = 0.1;
  const corridorLen = ringRin * 2;
  const axisR = 0.16;
  const axisLen = 2.4;
  const lampR = 0.38;
  const lampOffset = axisLen * 0.5 - lampR * 0.85;

  const GEO = {
    ringOuter: createVAO(makeCylinderSide(1, 1, 80, false)),
    ringInner: createVAO(makeCylinderSide(1, 1, 80, true)),
    ringTop: createVAO(makeAnnulusTop(1, ringRout / ringRin, 0.0, 80)),
    corridor: createVAO(makeCylinderSide(1, 1, 64, false)),
    axis: createVAO(makeCylinderSide(1, 1, 64, false)),
    sphere: createVAO(makeSphere(1, 36, 18)),
  };

  // camera / projection (fixed)
  const eye = [0.0, 3.6, 7.2];
  const center = [0, 0, 0];
  const aspect = canvas.width / canvas.height;
  const fovDeg = 45;
  const near = 1.0;
  const far = 40.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;

  const viewM = new MT3D().postaviKameru(
    eye[0], eye[1], eye[2],
    center[0], center[1], center[2],
    0, 1, 0
  );
  const projM = new MT3D().identitet().persp(-right, right, -top, top, near, far);

  const viewMat = viewM.kameraLista();
  gl.uniformMatrix4fv(uView, false, viewMat);
  gl.uniformMatrix4fv(uProj, false, projM.lista());
  gl.uniform3fv(uViewPos, new Float32Array([0, 0, 0]));

  // main white light stays fixed to the camera position (no object rotation)
  gl.uniform3fv(uC0, new Float32Array([1.0, 1.0, 1.0]));
  gl.uniform3fv(uL0, new Float32Array([0, 0, 0]));

  function lightState(angleDeg) {
    const a = ((angleDeg % 360) + 360) % 360;
    const greenOn = (a >= 0 && a < 45) || (a >= 180 && a < 225);
    const redOn = (a >= 90 && a < 135) || (a >= 270 && a < 315);
    return { greenOn, redOn };
  }

  function render(t) {
    const angleDeg = (t * 25) % 360;
    const angRad = (angleDeg * Math.PI) / 180;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const { greenOn, redOn } = lightState(angleDeg);
    const lampTopW = [0, lampOffset, 0];
    const lampBotW = [0, -lampOffset, 0];
    const lampTopV = transformPoint_colMajor(viewMat, lampTopW);
    const lampBotV = transformPoint_colMajor(viewMat, lampBotW);

    gl.uniform3fv(uL1, new Float32Array(lampTopV));
    gl.uniform3fv(uL2, new Float32Array(lampBotV));
    gl.uniform3fv(uC1, new Float32Array(greenOn ? greenLight : [0, 0, 0]));
    gl.uniform3fv(uC2, new Float32Array(redOn ? redLight : [0, 0, 0]));

    const base = new MT3D().rotirajY(angleDeg);

    // ring outer mantle
    {
      const m = new MT3D().mult(base).skaliraj(ringRout, ringH, ringRout);
      draw(GEO.ringOuter, m, baseCol);
    }

    // ring inner mantle
    {
      const m = new MT3D().mult(base).skaliraj(ringRin, ringH, ringRin);
      draw(GEO.ringInner, m, baseCol);
    }

    // ring top annulus
    {
      const m = new MT3D().mult(base);
      m.pomakni(0, ringH * 0.5, 0);
      m.skaliraj(ringRin, 1, ringRin);
      draw(GEO.ringTop, m, baseCol);
    }

    // corridors (3 cylinders at 120 degrees)
    for (let k = 0; k < 3; k++) {
      const ang = k * 120;
      const m = new MT3D().mult(base);
      m.rotirajY(ang);
      m.pomakni(corridorLen * 0.25, 0, 0);
      m.rotirajZ(90);
      m.skaliraj(corridorR, corridorLen * 0.5, corridorR);
      draw(GEO.corridor, m, baseCol);
    }

    // axis
    {
      const m = new MT3D().mult(base);
      m.skaliraj(axisR, axisLen * 0.5, axisR);
      draw(GEO.axis, m, baseCol);
    }

    // lamps (spheres)
    {
      const emissiveGreen = greenOn ? [0.0, 0.25, 0.0] : [0, 0, 0];
      const emissiveRed = redOn ? [0.25, 0.0, 0.0] : [0, 0, 0];

      const mTop = new MT3D().mult(base);
      mTop.pomakni(0, lampOffset, 0);
      mTop.skaliraj(lampR, lampR, lampR);
      draw(GEO.sphere, mTop, baseCol, emissiveGreen);

      const mBot = new MT3D().mult(base);
      mBot.pomakni(0, -lampOffset, 0);
      mBot.skaliraj(lampR, lampR, lampR);
      draw(GEO.sphere, mBot, baseCol, emissiveRed);
    }

    gl.bindVertexArray(null);
    requestAnimationFrame((ms) => render(ms * 0.001));
  }

  requestAnimationFrame((ms) => render(ms * 0.001));
};
