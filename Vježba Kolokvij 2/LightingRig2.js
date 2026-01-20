// LightingRig2.js
// Refaktor: radi s uniformima u_M/u_V/u_P/u_N, u_L0/u_L1/u_L2 i materijalima u_mat*
// te radi transform posWorld -> posVS preko viewMT3D.kamera (iz MT3D) :contentReference[oaicite:3]{index=3}
export default class LightingRig2 {
  constructor(gl, program) {
    this.gl = gl;
    this.program = program;

    const U = (name) => gl.getUniformLocation(program, name);

    // Matrice
    this.u_M = U("u_M");
    this.u_V = U("u_V");
    this.u_P = U("u_P");
    this.u_N = U("u_N");

    // Materijal
    this.u_matAmbient  = U("u_matAmbient");
    this.u_matDiffuse  = U("u_matDiffuse");
    this.u_matSpecular = U("u_matSpecular");
    this.u_matEmissive = U("u_matEmissive");
    this.u_shininess   = U("u_shininess");

    // Svjetla: struct Light { posVS, ambient, diffuse, specular, enabled }
    const lightLoc = (base) => ({
      posVS: U(`${base}.posVS`),
      ambient: U(`${base}.ambient`),
      diffuse: U(`${base}.diffuse`),
      specular: U(`${base}.specular`),
      enabled: U(`${base}.enabled`),
    });

    this.u_L = [lightLoc("u_L0"), lightLoc("u_L1"), lightLoc("u_L2")];

    // Držimo viewMT da možemo raditi world->view
    this._viewMT = null; // MT3D instance
  }

  // ---------- helpers: matrice / normal ----------

  static mat4Multiply(A, B) {
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

  static mat3FromMat4(M) {
    return [
      [M[0][0], M[0][1], M[0][2]],
      [M[1][0], M[1][1], M[1][2]],
      [M[2][0], M[2][1], M[2][2]],
    ];
  }

  static mat3InverseTranspose3x3(m) {
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

    return [
      [inv[0][0], inv[1][0], inv[2][0]],
      [inv[0][1], inv[1][1], inv[2][1]],
      [inv[0][2], inv[1][2], inv[2][2]],
    ];
  }

  static mat4ToFloat32ColumnMajor(M) {
    const out = [];
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) out.push(M[r][c]);
    return new Float32Array(out);
  }

  static mat3ToFloat32ColumnMajor(M) {
    const out = [];
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) out.push(M[r][c]);
    return new Float32Array(out);
  }

  // ---------- public API ----------

  setViewProjection(viewMT3D, projMat4_4x4) {
    // viewMT3D: MT3D instance (da imamo viewMT3D.kamera za world->view)
    this._viewMT = viewMT3D;

    this.gl.uniformMatrix4fv(this.u_V, false, viewMT3D.kameraLista());
    this.gl.uniformMatrix4fv(this.u_P, false, LightingRig2.mat4ToFloat32ColumnMajor(projMat4_4x4));
    return this;
  }

  setMaterial({ ambient, diffuse, specular, emissive, shininess }) {
    const gl = this.gl;
    if (ambient)  gl.uniform3fv(this.u_matAmbient,  ambient);
    if (diffuse)  gl.uniform3fv(this.u_matDiffuse,  diffuse);
    if (specular) gl.uniform3fv(this.u_matSpecular, specular);
    if (emissive) gl.uniform3fv(this.u_matEmissive, emissive);
    if (typeof shininess === "number") gl.uniform1f(this.u_shininess, shininess);
    return this;
  }

  // Upload jednog svjetla; ako je posWorld, pretvara u view-space
  setLight(i, { posWorld, posVS, ambient, diffuse, specular, enabled }) {
    const gl = this.gl;
    const uL = this.u_L[i];

    let pVS = posVS;
    if (!pVS && posWorld) {
      if (!this._viewMT) throw new Error("LightingRig2: setViewProjection mora biti pozvan prije setLight(posWorld).");
      pVS = LightingRig2.transformPointView(this._viewMT.kamera, posWorld[0], posWorld[1], posWorld[2]);
    }

    if (pVS) gl.uniform3fv(uL.posVS, pVS);
    if (ambient) gl.uniform3fv(uL.ambient, ambient);
    if (diffuse) gl.uniform3fv(uL.diffuse, diffuse);
    if (specular) gl.uniform3fv(uL.specular, specular);
    if (typeof enabled === "number") gl.uniform1i(uL.enabled, enabled);

    return this;
  }

  // modelMT3D: MT3D instance; računa i normal matrix iz (V*M)
  setModelAndNormal(modelMT3D) {
    const gl = this.gl;

    gl.uniformMatrix4fv(this.u_M, false, modelMT3D.lista());

    if (!this._viewMT) throw new Error("LightingRig2: setViewProjection mora biti pozvan prije setModelAndNormal.");
    const MV = LightingRig2.mat4Multiply(this._viewMT.kamera, modelMT3D.m);
    const mv3 = LightingRig2.mat3FromMat4(MV);
    const N = LightingRig2.mat3InverseTranspose3x3(mv3);

    gl.uniformMatrix3fv(this.u_N, false, LightingRig2.mat3ToFloat32ColumnMajor(N));
    return this;
  }

  // ---------- static helper ----------
  static transformPointView(view4x4, px, py, pz) {
    const x = view4x4[0][0] * px + view4x4[0][1] * py + view4x4[0][2] * pz + view4x4[0][3];
    const y = view4x4[1][0] * px + view4x4[1][1] * py + view4x4[1][2] * pz + view4x4[1][3];
    const z = view4x4[2][0] * px + view4x4[2][1] * py + view4x4[2][2] * pz + view4x4[2][3];
    return new Float32Array([x, y, z]);
  }
}
