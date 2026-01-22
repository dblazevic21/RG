// DrawContext.js
import MT3D from "./MT3D.js";
import Primitives3D from "./Primitives3D.js";

export default class DrawContext {
  constructor(gl, lightingRig, u_unlit) {
    this.gl = gl;
    this.L = lightingRig;
    this.u_unlit = u_unlit;
    this.M = new MT3D();
  }

  // copy base matrix into M and return M for chaining transforms
  from(baseMT3D) {
    this.M.identitet();
    // deep copy 4x4
    this.M.m = baseMT3D.m.map(r => r.slice());
    return this.M;
  }

  setMat(diffuseRGB, shininess = 90, spec = [1, 1, 1], ambient = [0.2, 0.2, 0.2]) {
    const gl = this.gl;
    gl.uniform1i(this.u_unlit, 0);
    this.L.setMaterial({
      ambient,
      diffuse: diffuseRGB,
      specular: spec,
      emissive: [0, 0, 0],
      shininess,
    });
  }

  setUnlit(rgb) {
    const gl = this.gl;
    gl.uniform1i(this.u_unlit, 1);
    this.L.setMaterial({
      ambient: [0, 0, 0],
      diffuse: rgb,
      specular: [0, 0, 0],
      emissive: [0, 0, 0],
      shininess: 1,
    });
  }

  draw(mesh) {
    this.L.setModelAndNormal(this.M);
    Primitives3D.drawMesh(this.gl, mesh);
  }

  withCull(enabled, fn) {
    const gl = this.gl;
    const wasEnabled = gl.isEnabled(gl.CULL_FACE);
    if (enabled && !wasEnabled) gl.enable(gl.CULL_FACE);
    if (!enabled && wasEnabled) gl.disable(gl.CULL_FACE);
    try { fn(); } finally {
      if (wasEnabled) gl.enable(gl.CULL_FACE);
      else gl.disable(gl.CULL_FACE);
    }
  }

  withCullFace(face, fn) {
    const gl = this.gl;
    const old = gl.getParameter(gl.CULL_FACE_MODE);
    gl.cullFace(face);
    try { fn(); } finally { gl.cullFace(old); }
  }
}
