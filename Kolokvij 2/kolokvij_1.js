import { pripremiGPUprogram } from "./WebGL.js";
import MT3D from "./MT3D.js";

function pushTri(out, p0, n0, p1, n1, p2, n2) {
  out.push(...p0, ...n0, ...p1, ...n1, ...p2, ...n2);
}

function norm(v) {
  const L = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / L, v[1] / L, v[2] / L];
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

function makeCylinderSide(r = 1, h = 2, n = 48) {
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

    const n0 = norm([c0, 0, s0]);
    const n1 = norm([c1, 0, s1]);

    pushTri(out, p00, n0, p01, n0, p11, n1);
    pushTri(out, p00, n0, p11, n1, p10, n1);
  }

  return new Float32Array(out);
}

function makeFaces(s) {
  const out = [];

  function quad(p0, p1, p2, p3, n) {
    pushTri(out, p0, n, p1, n, p2, n);
    pushTri(out, p0, n, p2, n, p3, n);
  }

  const d = s;

  // bottom (y = -s)
  quad(
    [-d, -d, -d],
    [ d, -d, -d],
    [ d, -d,  d],
    [-d, -d,  d],
    [0, -1, 0]
  );

  // left (x = -s)
  quad(
    [-d, -d, -d],
    [-d, -d,  d],
    [-d,  d,  d],
    [-d,  d, -d],
    [-1, 0, 0]
  );

  // back (z = -s)
  quad(
    [-d, -d, -d],
    [-d,  d, -d],
    [ d,  d, -d],
    [ d, -d, -d],
    [0, 0, -1]
  );

  return new Float32Array(out);
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

function basisMatrix(center, x, y, z) {
  return new Float32Array([
    x[0], x[1], x[2], 0,
    y[0], y[1], y[2], 0,
    z[0], z[1], z[2], 0,
    center[0], center[1], center[2], 1,
  ]);
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
  const uNrmMat = gl.getUniformLocation(program, "u_normalMat");

  const uColor = gl.getUniformLocation(program, "u_color");
  const uInnerColor = gl.getUniformLocation(program, "u_innerColor");
  const uAlpha = gl.getUniformLocation(program, "u_alpha");
  const uAmbient = gl.getUniformLocation(program, "u_ambient");
  const uTwoSided = gl.getUniformLocation(program, "u_twoSided");
  const uLightPos = gl.getUniformLocation(program, "u_lightPos");
  const uLightCol = gl.getUniformLocation(program, "u_lightColor");
  const uViewPos = gl.getUniformLocation(program, "u_viewPos");

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

  function drawMat(vaoObj, m4, color, innerColor, alpha = 1.0, ambient = 0.25, twoSided = false) {
    gl.uniformMatrix4fv(uModel, false, m4);
    gl.uniformMatrix3fv(uNrmMat, false, normalMatrixFromMat4_colMajor(m4));
    gl.uniform3fv(uColor, color);
    gl.uniform3fv(uInnerColor, innerColor ?? color);
    gl.uniform1f(uAlpha, alpha);
    gl.uniform1f(uAmbient, ambient);
    gl.uniform1f(uTwoSided, twoSided ? 1.0 : 0.0);
    gl.bindVertexArray(vaoObj.vao);
    gl.drawArrays(gl.TRIANGLES, 0, vaoObj.count);
  }

  function drawMT(vaoObj, m, color, innerColor, alpha, ambient, twoSided) {
    drawMat(vaoObj, m.lista(), color, innerColor, alpha, ambient, twoSided);
  }

  const cubeHalf = 1.2;
  const sphereR = 0.14;
  const edgeR = 0.06;

  const colors = {
    sphere: [0.93, 0.6, 0.29],
    edge: [0.4, 1.0, 1.0],
    faceOut: [0.6, 0.6, 1.0],
    faceIn: [1.0, 0.3, 1.0],
  };

  const VAO = {
    sphere: createVAO(makeSphere(1, 36, 18)),
    cyl: createVAO(makeCylinderSide(1, 2, 48)),
    faces: createVAO(makeFaces(cubeHalf)),
  };

  const center = [0, 0.2, 0];

  const aspect = canvas.width / canvas.height;
  const fovDeg = 55;
  const near = 1.2;
  const far = 50.0;
  const top = near * Math.tan((fovDeg * Math.PI) / 360);
  const right = top * aspect;

  const projM = new MT3D().identitet().persp(-right, right, -top, top, near, far);
  gl.uniformMatrix4fv(uProj, false, projM.lista());
  gl.uniform3fv(uLightCol, new Float32Array([1.0, 1.0, 1.0]));

  const corners = [
    [-cubeHalf, -cubeHalf, -cubeHalf],
    [ cubeHalf, -cubeHalf, -cubeHalf],
    [ cubeHalf, -cubeHalf,  cubeHalf],
    [-cubeHalf, -cubeHalf,  cubeHalf],
    [-cubeHalf,  cubeHalf, -cubeHalf],
    [ cubeHalf,  cubeHalf, -cubeHalf],
    [ cubeHalf,  cubeHalf,  cubeHalf],
    [-cubeHalf,  cubeHalf,  cubeHalf],
  ];

  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  function drawEdge(p0, p1) {
    const mid = [
      (p0[0] + p1[0]) * 0.5,
      (p0[1] + p1[1]) * 0.5,
      (p0[2] + p1[2]) * 0.5,
    ];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const dz = p1[2] - p0[2];
    const len = Math.hypot(dx, dy, dz);

    const m = new MT3D();
    m.pomakni(mid[0], mid[1], mid[2]);

    if (Math.abs(dx) > 0.001 && Math.abs(dy) < 0.001 && Math.abs(dz) < 0.001) {
      m.rotirajZ(-90);
    } else if (Math.abs(dz) > 0.001 && Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
      m.rotirajX(90);
    }

    m.skaliraj(edgeR, len / 2, edgeR);
    drawMT(VAO.cyl, m, colors.edge, colors.edge);
  }

  function drawDiagonal(p0, p1) {
    const mid = [
      (p0[0] + p1[0]) * 0.5,
      (p0[1] + p1[1]) * 0.5,
      (p0[2] + p1[2]) * 0.5,
    ];
    const v = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    const y = [v[0] / len, v[1] / len, v[2] / len];

    const up = Math.abs(y[0]) < 0.9 ? [1, 0, 0] : [0, 0, 1];
    const x = norm([
      up[1] * y[2] - up[2] * y[1],
      up[2] * y[0] - up[0] * y[2],
      up[0] * y[1] - up[1] * y[0],
    ]);
    const z = [
      y[1] * x[2] - y[2] * x[1],
      y[2] * x[0] - y[0] * x[2],
      y[0] * x[1] - y[1] * x[0],
    ];

    const mx = [x[0] * edgeR, x[1] * edgeR, x[2] * edgeR];
    const my = [y[0] * (len / 2), y[1] * (len / 2), y[2] * (len / 2)];
    const mz = [z[0] * edgeR, z[1] * edgeR, z[2] * edgeR];

    const m4 = basisMatrix(mid, mx, my, mz);
    drawMat(VAO.cyl, m4, colors.edge, colors.edge);
  }

  const camRadius = 5.6;
  const camHeight = 2.9;
  function render(t) {
    const angle = t * 0.25;
    const eye = [
      Math.cos(angle) * camRadius,
      camHeight,
      Math.sin(angle) * camRadius,
    ];

    const viewM = new MT3D().postaviKameru(
      eye[0], eye[1], eye[2],
      center[0], center[1], center[2],
      0, 1, 0
    );
    
    gl.uniformMatrix4fv(uView, false, viewM.kameraLista());
    gl.uniform3fv(uViewPos, new Float32Array(eye));
    gl.uniform3fv(uLightPos, new Float32Array([eye[0] + 0.5, eye[1] + 7, eye[2]]));

    gl.clearColor(0.34, 0.34, 0.34, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // faces
    drawMat(VAO.faces, new MT3D().lista(), colors.faceOut, colors.faceIn, 1.0, 0.22, true);

    // edges
    for (const [i, j] of edges) {
      drawEdge(corners[i], corners[j]);
    }

    // diagonal
    drawDiagonal(corners[0], corners[6]);

    // vertices
    for (const p of corners) {
      const m = new MT3D();
      m.pomakni(p[0], p[1], p[2]);
      m.skaliraj(sphereR, sphereR, sphereR);
      
      drawMT(VAO.sphere, m, colors.sphere, colors.sphere, 0.9, 0.3, false);
    }

    gl.bindVertexArray(null);
    requestAnimationFrame((ms) => render(ms * 0.001));
  }

  requestAnimationFrame((ms) => render(ms * 0.001));
};
