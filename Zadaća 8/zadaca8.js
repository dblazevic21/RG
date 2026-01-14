import { pripremiGPUprogram } from "./WebGL.js";
import MT3D from "./MT3D.js";

function napraviMrezu(N = 14, boja = [0.75, 0.75, 0.75]) {
  const out = [];
  for (let i = -N; i <= N; i++) {
    out.push(-N, i, 0, ...boja, N, i, 0, ...boja); 
    out.push(i, -N, 0, ...boja, i, N, 0, ...boja); 
  }
  return new Float32Array(out);
}

function napraviKockuJediničnu() {
  const h = 0.5;

  const P = (x, y, z) => [x, y, z];
  const face = (a, b, c, d, col) => ([
    ...a, ...col, ...b, ...col, ...c, ...col,
    ...a, ...col, ...c, ...col, ...d, ...col,
  ]);

  const C = {
    front: [1.0, 0.2, 0.2],
    back: [0.2, 1.0, 0.2],
    right: [0.2, 0.6, 1.0],
    left: [1.0, 1.0, 0.2],
    top: [1.0, 0.2, 1.0],
    bottom: [0.2, 1.0, 1.0],
  };

  const v = [
    // +Z
    ...face(P(-h, -h, h), P(h, -h, h), P(h, h, h), P(-h, h, h), C.front),
    // -Z
    ...face(P(h, -h, -h), P(-h, -h, -h), P(-h, h, -h), P(h, h, -h), C.back),
    // +X
    ...face(P(h, -h, h), P(h, -h, -h), P(h, h, -h), P(h, h, h), C.right),
    // -X
    ...face(P(-h, -h, -h), P(-h, -h, h), P(-h, h, h), P(-h, h, -h), C.left),
    // +Y
    ...face(P(-h, h, h), P(h, h, h), P(h, h, -h), P(-h, h, -h), C.top),
    // -Y
    ...face(P(-h, -h, -h), P(h, -h, -h), P(h, -h, h), P(-h, -h, h), C.bottom),
  ];

  return new Float32Array(v);
}

window.onload = () => {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 nije dostupan.");
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  const program = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  const aXYZ = gl.getAttribLocation(program, "a_vrhXYZ");
  const aCol = gl.getAttribLocation(program, "a_boja");
  const uMat = gl.getUniformLocation(program, "u_mTrans");

  const mreza = napraviMrezu(14);
  const vaoMreza = gl.createVertexArray();
  gl.bindVertexArray(vaoMreza);

  const vboMreza = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboMreza);
  gl.bufferData(gl.ARRAY_BUFFER, mreza, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(aXYZ);
  gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(aCol);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 24, 12);

  gl.bindVertexArray(null);

  // kocka
  const kocka = napraviKockuJediničnu();
  const vaoKocka = gl.createVertexArray();
  gl.bindVertexArray(vaoKocka);

  const vboKocka = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboKocka);
  gl.bufferData(gl.ARRAY_BUFFER, kocka, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(aXYZ);
  gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(aCol);
  gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 24, 12);

  gl.bindVertexArray(null);

  //F

  const F = [
    [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3], [0, 0, 4], // okomita (5)
    [1, 0, 4], [2, 0, 4],                                 // gornja crta (2)
    [1, 0, 2],                                             // srednja crta (1)
  ];

  const centar = [0, 0, 2];

  const stranica = 1.6;   
  const korak = stranica; 
  const dizanje = stranica / 2; 

  function nacrtaj(t) 
  {
    gl.clearColor(0.07, 0.07, 0.07, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const R = 18;
    const eyeX = centar[0] * korak + R * Math.cos(t * 0.9);
    const eyeY = centar[1] * korak + R * Math.sin(t * 0.9);
    const eyeZ = 7 + 4 * Math.sin(t * 0.8);

    const baza = new MT3D();

    const aspect = canvas.width / canvas.height;
    const fovDeg = 60;
    const n = 2.0; 
    const f = 120.0;

    const top = n * Math.tan((fovDeg * Math.PI / 180) / 2);
    const right = top * aspect;

    baza.postaviKameru(
      eyeX, eyeY, eyeZ,
      centar[0] * korak,
      centar[1] * korak,
      2.0 * korak,    
      0, 0, 1
    )
    .persp(-right, right, -top, top, n, f)
    .primijeniKameru();

    gl.bindVertexArray(vaoMreza);
    gl.uniformMatrix4fv(uMat, false, baza.lista());
    gl.drawArrays(gl.LINES, 0, mreza.length / 6);

    // F
    gl.bindVertexArray(vaoKocka);
    for (const [bx, by, bz] of F) {
      const m = new MT3D();
      m.mult(baza);

      m.pomakni(
        bx * korak,
        by * korak,
        bz * korak + dizanje
      );

      m.skaliraj(stranica, stranica, stranica);

      gl.uniformMatrix4fv(uMat, false, m.lista());
      gl.drawArrays(gl.TRIANGLES, 0, kocka.length / 6);
    }

    gl.bindVertexArray(null);
    requestAnimationFrame((ms) => nacrtaj(ms * 0.001));
  }

  requestAnimationFrame((ms) => nacrtaj(ms * 0.001));
};
