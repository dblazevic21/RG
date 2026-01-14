import { pripremiGPUprogram } from "./WebGL.js";
import MT3D from "./MT3D.js";

// ---------- geometry helpers ----------
function pushTri(out, p0, n0, p1, n1, p2, n2) {
  out.push(...p0, ...n0, ...p1, ...n1, ...p2, ...n2);
}

function norm(v) {
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / L, v[1] / L, v[2] / L];
}

function makeCylinder(r = 0.12, h = 0.25, n = 48) {
  const out = [];
  const y0 = -h / 2,
    y1 = +h / 2;
  const d = (2 * Math.PI) / n;

  // plašt
  for (let i = 0; i < n; i++) {
    const a0 = i * d,
      a1 = (i + 1) * d;
    const c0 = Math.cos(a0),
      s0 = Math.sin(a0);
    const c1 = Math.cos(a1),
      s1 = Math.sin(a1);

    const p00 = [r * c0, y0, r * s0],
      n00 = norm([c0, 0, s0]);
    const p01 = [r * c0, y1, r * s0],
      n01 = n00;
    const p10 = [r * c1, y0, r * s1],
      n10 = norm([c1, 0, s1]);
    const p11 = [r * c1, y1, r * s1],
      n11 = n10;

    pushTri(out, p00, n00, p01, n01, p11, n11);
    pushTri(out, p00, n00, p11, n11, p10, n10);
  }

  // donja baza
  const nd = [0, -1, 0];
  for (let i = 0; i < n; i++) {
    const a0 = i * d,
      a1 = (i + 1) * d;
    const pc = [0, y0, 0];
    const p0 = [r * Math.cos(a0), y0, r * Math.sin(a0)];
    const p1 = [r * Math.cos(a1), y0, r * Math.sin(a1)];
    pushTri(out, pc, nd, p1, nd, p0, nd);
  }

  // gornja baza
  const nu = [0, 1, 0];
  for (let i = 0; i < n; i++) {
    const a0 = i * d,
      a1 = (i + 1) * d;
    const pc = [0, y1, 0];
    const p0 = [r * Math.cos(a0), y1, r * Math.sin(a0)];
    const p1 = [r * Math.cos(a1), y1, r * Math.sin(a1)];
    pushTri(out, pc, nu, p0, nu, p1, nu);
  }

  return new Float32Array(out);
}

function makeCone(r = 0.9, h = 1.3, n = 72) {
  // baza y=0, vrh y=h
  const out = [];
  const d = (2 * Math.PI) / n;
  const tip = [0, h, 0];

  // plašt
  for (let i = 0; i < n; i++) {
    const a0 = i * d,
      a1 = (i + 1) * d;
    const p0 = [r * Math.cos(a0), 0, r * Math.sin(a0)];
    const p1 = [r * Math.cos(a1), 0, r * Math.sin(a1)];

    const n0 = norm([p0[0], r / h, p0[2]]);
    const n1 = norm([p1[0], r / h, p1[2]]);
    const nt = norm([(n0[0] + n1[0]) * 0.5, r / h, (n0[2] + n1[2]) * 0.5]);

    pushTri(out, p0, n0, tip, nt, p1, n1);
  }

  // baza
  const nd = [0, -1, 0];
  for (let i = 0; i < n; i++) {
    const a0 = i * d,
      a1 = (i + 1) * d;
    const pc = [0, 0, 0];
    const p0 = [r * Math.cos(a0), 0, r * Math.sin(a0)];
    const p1 = [r * Math.cos(a1), 0, r * Math.sin(a1)];
    pushTri(out, pc, nd, p1, nd, p0, nd);
  }

  return new Float32Array(out);
}

function makeHemisphere(r = 0.22, slices = 40, stacks = 20) {
  const out = [];
  for (let i = 0; i < stacks; i++) {
    const t0 = (i / stacks) * (Math.PI / 2);
    const t1 = ((i + 1) / stacks) * (Math.PI / 2);
    for (let j = 0; j < slices; j++) {
      const p0 = (j / slices) * (2 * Math.PI);
      const p1 = ((j + 1) / slices) * (2 * Math.PI);

      const a = sph(r, t0, p0);
      const b = sph(r, t1, p0);
      const c = sph(r, t1, p1);
      const d = sph(r, t0, p1);

      const na = norm(a),
        nb = norm(b),
        nc = norm(c),
        nd = norm(d);

      pushTri(out, a, na, b, nb, c, nc);
      pushTri(out, a, na, c, nc, d, nd);
    }
  }
  return new Float32Array(out);

  function sph(rr, theta, phi) {
    const x = rr * Math.cos(phi) * Math.cos(theta);
    const y = rr * Math.sin(theta);
    const z = rr * Math.sin(phi) * Math.cos(theta);
    return [x, y, z];
  }
}

// ---------- matrix helpers ----------
function normalMatrixFromMat4_colMajor(m4) {
  const a00 = m4[0],
    a01 = m4[4],
    a02 = m4[8];
  const a10 = m4[1],
    a11 = m4[5],
    a12 = m4[9];
  const a20 = m4[2],
    a21 = m4[6],
    a22 = m4[10];

  const det =
    a00 * (a11 * a22 - a12 * a21) -
    a01 * (a10 * a22 - a12 * a20) +
    a02 * (a10 * a21 - a11 * a20);

  if (Math.abs(det) < 1e-10) {
    return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  const invDet = 1.0 / det;

  // inverse(3x3)
  const b00 = (a11 * a22 - a12 * a21) * invDet;
  const b01 = (a02 * a21 - a01 * a22) * invDet;
  const b02 = (a01 * a12 - a02 * a11) * invDet;

  const b10 = (a12 * a20 - a10 * a22) * invDet;
  const b11 = (a00 * a22 - a02 * a20) * invDet;
  const b12 = (a02 * a10 - a00 * a12) * invDet;

  const b20 = (a10 * a21 - a11 * a20) * invDet;
  const b21 = (a01 * a20 - a00 * a21) * invDet;
  const b22 = (a00 * a11 - a01 * a10) * invDet;

  // normal matrix = transpose(inverse(3x3))
  return new Float32Array([b00, b10, b20, b01, b11, b21, b02, b12, b22]);
}

// ---------- WebGL setup ----------
window.onload = () => {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 nije dostupan.");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // atributi
  const aXYZ = gl.getAttribLocation(program, "a_vrhXYZ");
  const aNrm = gl.getAttribLocation(program, "a_normala");

  // uniformi
  const uModel = gl.getUniformLocation(program, "u_model");
  const uView = gl.getUniformLocation(program, "u_view");
  const uProj = gl.getUniformLocation(program, "u_proj");
  const uNrmMat = gl.getUniformLocation(program, "u_normalMat");

  const uCam = gl.getUniformLocation(program, "u_kameraXYZ");
  const uL0 = gl.getUniformLocation(program, "u_izvorXYZ0");
  const uC0 = gl.getUniformLocation(program, "u_boja0");
  const uL1 = gl.getUniformLocation(program, "u_izvorXYZ1");
  const uC1 = gl.getUniformLocation(program, "u_boja1");

  const uColor = gl.getUniformLocation(program, "u_color");
  const uInnerColor = gl.getUniformLocation(program, "u_innerColor");

  const uKd = gl.getUniformLocation(program, "u_kd");
  const uKs = gl.getUniformLocation(program, "u_ks");
  const uKa = gl.getUniformLocation(program, "u_ka");
  const uSh = gl.getUniformLocation(program, "u_shininess");

  // materijal parametri
  gl.uniform1f(uKd, 0.95);
  gl.uniform1f(uKs, 0.85);
  gl.uniform1f(uKa, 0.18);
  gl.uniform1f(uSh, 48.0);

  // svjetla: toplo + hladno
  gl.uniform3fv(uC0, [1.0, 0.95, 0.85]);
  gl.uniform3fv(uC1, [0.3, 0.5, 1.0]);

  // geometrija
  const M = {
    cone: createVAO(makeCone(0.9, 2, 72)),
    hub: createVAO(makeCylinder(0.15, 2, 48)),
    arm: createVAO(makeCylinder(0.07, 1.1, 40)),
    cup: createVAO(makeHemisphere(0.22, 44, 22)),
  };

  function createVAO(data) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const stride = 6 * 4;
    gl.enableVertexAttribArray(aXYZ);
    gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(aNrm);
    gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, stride, 3 * 4);

    gl.bindVertexArray(null);
    return { vao, count: data.length / 6 };
  }

  function draw(vaoObj, modelMat, color, innerColor) {
    const m4 = modelMat.lista();
    gl.uniformMatrix4fv(uModel, false, m4);
    gl.uniformMatrix3fv(uNrmMat, false, normalMatrixFromMat4_colMajor(m4));
    gl.uniform3fv(uColor, color);
    gl.uniform3fv(uInnerColor, innerColor ?? color);

    gl.bindVertexArray(vaoObj.vao);
    gl.drawArrays(gl.TRIANGLES, 0, vaoObj.count);
  }

  // ---------- camera / projection ----------
  const eye = [0.0, 2.6, 6.0];
  const center = [0, 0.8, 0];

  const aspect = canvas.width / canvas.height;
  const fovDeg = 55;
  const near = 1.5;
  const far = 80.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;

  const viewM = new MT3D().postaviKameru(eye[0], eye[1], eye[2], center[0], center[1], center[2], 0, 1, 0);
  const projM = new MT3D().identitet().persp(-right, right, -top, top, near, far);

  gl.uniformMatrix4fv(uView, false, viewM.kameraLista());
  gl.uniformMatrix4fv(uProj, false, projM.lista());
  gl.uniform3fv(uCam, new Float32Array(eye));

  // ---------- colors ----------
  const purple = [0.62, 0.35, 0.85];
  const dark = [0.12, 0.12, 0.12];
  const cupOutside = [0.25, 0.25, 0.28];
  const cupInside = [0.05, 0.65, 1.0];

  // ---------- animation ----------
  function frame(t) {
    gl.clearColor(0.82, 0.82, 0.82, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // svjetla
    //const swing = Math.sin(t * 1.1) * 2.4;
    //gl.uniform3fv(uL0, [swing, 3.2, 3.2]);
    gl.uniform3fv(uL1, [5, 3.2, 3.2]);  // fill light

    // --------- stožac ---------
    {
      const m = new MT3D();
      draw(M.cone, m, purple, purple);
    }

    // --------- rotor ---------
    const hubY = 1.06;
    const hubR = 0.19;
    const hubH = 0.18;

    const rotorAngle = (t * 160) % 360;

    // hub (vertikalni valjak)
    {
      const m = new MT3D();
      m.pomakni(0, hubY, 0);
      m.rotirajY(rotorAngle);
      m.skaliraj(hubR / 0.12, hubH / 0.22, hubR / 0.12);
      draw(M.hub, m, dark, dark);
    }

    // tri kraka + čašice
    const armLen = 1.13;
    const armHalf = armLen * 0.5;
    const armStart = hubR;
    const armMidX = armStart + armHalf;
    const armEndX = armStart + armLen;

    for (let k = 0; k < 3; k++) {
      const ang = k * 120;

      // krak
      {
        const m = new MT3D();
        m.pomakni(0, hubY + 0.6, 0);
        m.rotirajY(rotorAngle + ang);
        m.pomakni(armMidX, 0, 0);
        m.rotirajZ(90);
        draw(M.arm, m, dark, dark);
      }

      // čašica (polukugla)
      {
        const m = new MT3D();
        m.pomakni(0, hubY, 0);
        m.rotirajY(rotorAngle + ang);

        // Pomiče polukugle
        m.pomakni(armEndX + 0.18, 0.6, 0.1);

        m.rotirajZ(-90);

        m.rotirajX(10);

        m.rotirajY(-90);
        m.rotirajX(180);
        m.rotirajZ(90);

        draw(M.cup, m, cupOutside, cupInside);
      }
    }

    gl.bindVertexArray(null);
    requestAnimationFrame((ms) => frame(ms * 0.001));
  }

  requestAnimationFrame((ms) => frame(ms * 0.001));
};
