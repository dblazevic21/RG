// ShapesUnified.js
export default class ShapesUnified {
  static clampSegments(n, max = 256) {
    n = Math.floor(n);
    if (!Number.isFinite(n) || n < 3) n = 3;
    return Math.min(n, max);
  }

  /**
   * Hollow cylinder walls ONLY (outer + inner), axis Z, z in [0..h]
   * Output matches Primitives3D.createMesh() expectations:
   * { pos, nrm, indexed:false, idx:null, mode, count }
   */
  static hollowCylinderWalls(gl, outerR, innerR, h, n = 80) {
    n = this.clampSegments(n);

    const dphi = (2 * Math.PI) / n;

    // ---------- OUTER ----------
    // strip: (x,y,h) then (x,y,0) like your Primitives3D.buildCylinderWall
    const posOut = [];
    const nrmOut = [];

    for (let i = 0; i <= n; i++) {
      const t = i * dphi;
      const c = Math.cos(t);
      const s = Math.sin(t);

      const x = outerR * c;
      const y = outerR * s;

      // top then bottom
      posOut.push(x, y, h);
      posOut.push(x, y, 0);

      // outward normals
      nrmOut.push(c, s, 0);
      nrmOut.push(c, s, 0);
    }

    // ---------- INNER ----------
    const posIn = [];
    const nrmIn = [];

    for (let i = 0; i <= n; i++) {
      const t = i * dphi;
      const c = Math.cos(t);
      const s = Math.sin(t);

      const x = innerR * c;
      const y = innerR * s;

      // top then bottom (same strip layout)
      posIn.push(x, y, h);
      posIn.push(x, y, 0);

      // inward normals
      nrmIn.push(-c, -s, 0);
      nrmIn.push(-c, -s, 0);
    }

    const outer = {
      pos: new Float32Array(posOut),
      nrm: new Float32Array(nrmOut),
      indexed: false,
      idx: null,
      mode: gl.TRIANGLE_STRIP,
      count: (n + 1) * 2,
    };

    const inner = {
      pos: new Float32Array(posIn),
      nrm: new Float32Array(nrmIn),
      indexed: false,
      idx: null,
      mode: gl.TRIANGLE_STRIP,
      count: (n + 1) * 2,
    };

    return { outer, inner, segments: n };
  }
}
