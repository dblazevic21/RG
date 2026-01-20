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

function makeDisk(r = 1, y = 0, n = 64, up = true) {
  const out = [];
  const d = (2 * Math.PI) / n;
  const N = up ? [0, 1, 0] : [0, -1, 0];
  const c = [0, y, 0];

  for (let i = 0; i < n; i++) {
    const a0 = i * d;
    const a1 = (i + 1) * d;
    const p0 = [r * Math.cos(a0), y, r * Math.sin(a0)];
    const p1 = [r * Math.cos(a1), y, r * Math.sin(a1)];

    if (up) pushTri(out, c, N, p0, N, p1, N);
    else    pushTri(out, c, N, p1, N, p0, N);
  }
  return new Float32Array(out);
}

function makeHemisphere(r = 1, slices = 32, stacks = 8, inward = false, reverseWinding = false) {
  const out = [];
  const tMax = Math.PI / 2;
  for (let i = 0; i < stacks; i++) {
    const t0 = (i / stacks) * tMax;
    const t1 = ((i + 1) / stacks) * tMax;
    for (let j = 0; j < slices; j++) {
      const p0 = (j / slices) * 2 * Math.PI;
      const p1 = ((j + 1) / slices) * 2 * Math.PI;

      const a = sph(r, t0, p0);
      const b = sph(r, t1, p0);
      const c = sph(r, t1, p1);
      const d = sph(r, t0, p1);

      let na = norm(a), nb = norm(b), nc = norm(c), nd = norm(d);
      if (inward) {
        na = [-na[0], -na[1], -na[2]];
        nb = [-nb[0], -nb[1], -nb[2]];
        nc = [-nc[0], -nc[1], -nc[2]];
        nd = [-nd[0], -nd[1], -nd[2]];
      }

      if (!reverseWinding) {
        pushTri(out, a, na, b, nb, c, nc);
        pushTri(out, a, na, c, nc, d, nd);
      } else {
        pushTri(out, a, na, c, nc, b, nb);
        pushTri(out, a, na, d, nd, c, nc);
      }
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

function makeBladeTriangle() {
  const out = [];
  const n = [1, 0, 0];
  const p0 = [0, 0.0, 0.0];
  const p1 = [0, 0.9, 0.35];
  const p2 = [0, 0.9, -0.35];
  pushTri(out, p0, n, p1, n, p2, n);
  return new Float32Array(out);
}

function makeCrossLines(len = 0.55, y = -0.5) {
  const out = [];
  const n = [0, -1, 0];
  out.push(-len, y, 0, ...n);
  out.push( len, y, 0, ...n);
  out.push(0, y, -len, ...n);
  out.push(0, y,  len, ...n);
  return new Float32Array(out);
}

function mul4_colMajor(A, B) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        A[0 * 4 + r] * B[c * 4 + 0] +
        A[1 * 4 + r] * B[c * 4 + 1] +
        A[2 * 4 + r] * B[c * 4 + 2] +
        A[3 * 4 + r] * B[c * 4 + 3];
    }
  }
  return out;
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
    return new Float32Array([1,0,0, 0,1,0, 0,0,1]);
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

  return new Float32Array([
    b00, b10, b20,
    b01, b11, b21,
    b02, b12, b22
  ]);
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
  if (!gl) return console.error("WebGL2 not available.");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const aPos = gl.getAttribLocation(program, "a_pos");
  const aNrm = gl.getAttribLocation(program, "a_nrm");

  const uModel = gl.getUniformLocation(program, "u_model");
  const uView  = gl.getUniformLocation(program, "u_view");
  const uProj  = gl.getUniformLocation(program, "u_proj");
  const uNrm   = gl.getUniformLocation(program, "u_normalMat");

  const uColor = gl.getUniformLocation(program, "u_color");
  const uColorBack = gl.getUniformLocation(program, "u_colorBack");
  const uUseBack = gl.getUniformLocation(program, "u_useBackColor");
  const uUnlit = gl.getUniformLocation(program, "u_unlit");

  const uViewPos = gl.getUniformLocation(program, "u_viewPos");
  const uLightPos0 = gl.getUniformLocation(program, "u_lightPos0");
  const uLightCol0 = gl.getUniformLocation(program, "u_lightCol0");

  const uKd = gl.getUniformLocation(program, "u_kd");
  const uKs = gl.getUniformLocation(program, "u_ks");
  const uKa = gl.getUniformLocation(program, "u_ka");
  const uSh = gl.getUniformLocation(program, "u_sh");

  gl.uniform1f(uKd, 0.9);
  gl.uniform1f(uKs, 0.6);
  gl.uniform1f(uKa, 0.12);
  gl.uniform1f(uSh, 70.0);

  function createVAO(data, mode = gl.TRIANGLES) {
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
    return { vao, count: data.length / 6, mode };
  }

  function draw(vaoObj, m, viewMat, color, backColor, useBack, unlit) {
    const modelMat = m.lista();
    const mv = mul4_colMajor(viewMat, modelMat);
    const nrmMat = normalMatrixFromMat4_colMajor(mv);

    gl.uniformMatrix4fv(uModel, false, modelMat);
    gl.uniformMatrix3fv(uNrm, false, nrmMat);

    gl.uniform3fv(uColor, color);
    gl.uniform3fv(uColorBack, backColor ?? color);
    gl.uniform1i(uUseBack, useBack ? 1 : 0);
    gl.uniform1i(uUnlit, unlit ? 1 : 0);

    gl.bindVertexArray(vaoObj.vao);
    gl.drawArrays(vaoObj.mode, 0, vaoObj.count);
  }

  const GEO = {
    cyl: createVAO(makeCylinderSide(1, 1, 96, false)),
    diskUp: createVAO(makeDisk(1, 0.5, 96, true)),
    diskDown: createVAO(makeDisk(1, -0.5, 96, false)),
    hemi: createVAO(makeHemisphere(1, 64, 20, false, true)),
    blade: createVAO(makeBladeTriangle()),
    lines: createVAO(makeCrossLines(0.55, -0.5), gl.LINES),
  };

  const baseCol = [0.75, 0.75, 0.0];
  const innerRingCol = [1.0, 0.0, 0.0];
  const bladeBackCol = [0.0, 1.0, 0.0];
  const blackCol = [0.0, 0.0, 0.0];

  const hullR = 1.2;
  const hullLen = 4.2;

  const towerH = 0.7;
  const towerRx = 0.55;
  const towerRz = 0.35;

  const axisR = 0.12;
  const axisLen = 1.0;
  const axisX = -hullLen / 2 - axisLen / 2 + 0.1;

  const propX = axisX - axisLen / 2 - 0.05;
  const bladePitch = 30;
  const ringH = 0.5;
  const ringOuterR = 1.05;
  const ringX = propX - 0.1;

  const eye = [5.6, 2.8, 6.0];
  const center = [0, -0.5, 0];
  const aspect = canvas.width / canvas.height;
  const fovDeg = 45;
  const near = 1.0;
  const far = 30.0;
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

  const lightPosW = [6.0, 5.0, 8.0];
  const lightPosV = transformPoint_colMajor(viewMat, lightPosW);
  gl.uniform3fv(uLightPos0, new Float32Array(lightPosV));
  gl.uniform3fv(uLightCol0, new Float32Array([1.0, 1.0, 1.0]));

  function drawCappedCylinder(m, viewMat, color) {
    draw(GEO.cyl, m, viewMat, color);
    draw(GEO.diskUp, new MT3D().mult(m), viewMat, color);
    draw(GEO.diskDown, new MT3D().mult(m), viewMat, color);
  }

  function render(t) {
    const baseAngle = (t * 20) % 360;
    const propAngle = (t * 60) % 360;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const subRot = new MT3D().rotirajY(baseAngle);

    // Hull cylinder
    {
      const m = new MT3D().mult(subRot);
      m.rotirajZ(90);
      m.skaliraj(hullR, hullLen, hullR);
      draw(GEO.cyl, m, viewMat, baseCol);
    }

    // Front hemisphere
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(hullLen / 2, 0, 0);
      m.rotirajZ(270);
      m.skaliraj(hullR, hullR, hullR);
      draw(GEO.hemi, m, viewMat, baseCol);
    }

    // Rear hemisphere
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(-hullLen / 2, 0, 0);
      m.rotirajZ(90);
      m.skaliraj(hullR, hullR, hullR);
      draw(GEO.hemi, m, viewMat, baseCol);
    }

    // Conning tower (elliptic cylinder)
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(0.2, hullR + towerH * 0.5 - 0.08, 0);
      m.skaliraj(towerRx, towerH, towerRz);
      drawCappedCylinder(m, viewMat, baseCol);
    }

    // Propulsion axis
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(axisX - 1, 0, 0);
      m.rotirajX(propAngle);
      m.rotirajZ(90);
      m.skaliraj(axisR, axisLen - 0.3, axisR);
      draw(GEO.cyl, m, viewMat, baseCol);
    }

    // Axis base disk
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(axisX - 1.85, 0, 0);
      m.rotirajX(propAngle);
      m.rotirajZ(90);
      m.skaliraj(axisR, axisLen, axisR);
      draw(GEO.diskDown, new MT3D().mult(m), viewMat, baseCol);
    }

    // Black cross lines on axis base
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(axisX - 1.85, 0, 0);
      m.rotirajX(propAngle);
      m.rotirajZ(90);
      m.skaliraj(axisR * 2, axisLen, axisR * 2);
      draw(GEO.lines, new MT3D().mult(m), viewMat, blackCol, blackCol, false, true);
    }

    // Propeller blades
    for (let i = 0; i < 3; i++) {
      const bladeAngle = i * 120;
      const m = new MT3D().mult(subRot);
      m.pomakni(axisX - 1.2, 0, 0);
      m.rotirajX(propAngle + bladeAngle);
      m.skaliraj(1.0, 1.0, 1.0);
      m.rotirajY(30);
      draw(GEO.blade, m, viewMat, baseCol, bladeBackCol, true, false);
    }

    // Protective ring: one surface, different colors per side
    {
      const m = new MT3D().mult(subRot);
      m.pomakni(ringX - 0.5, 0, 0);
      m.rotirajZ(90);
      m.skaliraj(ringOuterR, ringH, ringOuterR);
      draw(GEO.cyl, m, viewMat, baseCol, innerRingCol, true, false);
    }

    gl.bindVertexArray(null);
    requestAnimationFrame((ms) => render(ms * 0.001));
  }

  requestAnimationFrame((ms) => render(ms * 0.001));
};
