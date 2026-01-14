export default class MT3D {
  constructor() {
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    this.kamera = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }

  identitet() {
    this.m = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    return this;
  }

  mult(rhs) {
    const B = rhs instanceof MT3D ? rhs.m : rhs;
    const A = this.m;

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

    this.m = R;
    return this;
  }

  pomakni(px, py, pz) {
    const T = [
      [1, 0, 0, px],
      [0, 1, 0, py],
      [0, 0, 1, pz],
      [0, 0, 0, 1],
    ];
    return this.mult(T);
  }

  skaliraj(sx, sy, sz) {
    const S = [
      [sx, 0,  0,  0],
      [0,  sy, 0,  0],
      [0,  0,  sz, 0],
      [0,  0,  0,  1],
    ];
    return this.mult(S);
  }

  rotirajX(kut) {
    const r = (kut * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const Rx = [
      [1, 0,  0, 0],
      [0, c, -s, 0],
      [0, s,  c, 0],
      [0, 0,  0, 1],
    ];
    return this.mult(Rx);
  }

  rotirajY(kut) {
    const r = (kut * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const Ry = [
      [ c, 0, s, 0],
      [ 0, 1, 0, 0],
      [-s, 0, c, 0],
      [ 0, 0, 0, 1],
    ];
    return this.mult(Ry);
  }

  rotirajZ(kut) {
    const r = (kut * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const Rz = [
      [c, -s, 0, 0],
      [s,  c, 0, 0],
      [0,  0, 1, 0],
      [0,  0, 0, 1],
    ];
    return this.mult(Rz);
  }

  postaviKameru(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
    const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
    const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const cross = (a, b) => ([
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0],
    ]);
    const norm = (v) => {
      const L = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0]/L, v[1]/L, v[2]/L];
    };

    const eye = [ex, ey, ez];
    const center = [cx, cy, cz];
    const up = norm([ux, uy, uz]);

    const zAxis = norm(sub(eye, center));  
    const xAxis = norm(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    const R = [
      [xAxis[0], xAxis[1], xAxis[2], 0],
      [yAxis[0], yAxis[1], yAxis[2], 0],
      [zAxis[0], zAxis[1], zAxis[2], 0],
      [0, 0, 0, 1],
    ];

    const T = [
      [1, 0, 0, -ex],
      [0, 1, 0, -ey],
      [0, 0, 1, -ez],
      [0, 0, 0, 1],
    ];

    const mult4 = (A, B) => {
      const M = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ];
      for (let i=0;i<4;i++) for (let j=0;j<4;j++) {
        let s = 0;
        for (let k=0;k<4;k++) s += A[i][k]*B[k][j];
        M[i][j] = s;
      }
      return M;
    };

    this.kamera = mult4(R, T);
    return this;
  }

  orto(xmin, xmax, ymin, ymax, zpr, zst) {
    const sx = 2 / (xmax - xmin);
    const sy = 2 / (ymax - ymin);
    const sz = -2 / (zst - zpr);

    const tx = (xmax + xmin) / (xmin - xmax);
    const ty = (ymax + ymin) / (ymin - ymax);
    const tz = (zst + zpr) / (zpr - zst);

    const P = [
      [sx, 0,  0,  tx],
      [0,  sy, 0,  ty],
      [0,  0,  sz, tz],
      [0,  0,  0,  1],
    ];
    return this.mult(P);
  }

  persp(xmin, xmax, ymin, ymax, zpr, zst) {
    const A = (2 * zpr) / (xmax - xmin);
    const B = (2 * zpr) / (ymax - ymin);

    const C = (xmax + xmin) / (xmax - xmin);
    const D = (ymax + ymin) / (ymax - ymin);

    const E = -(zst + zpr) / (zst - zpr);
    const F = -(2 * zst * zpr) / (zst - zpr);

    const P = [
      [A, 0, C, 0],
      [0, B, D, 0],
      [0, 0, E, F],
      [0, 0, -1, 0],
    ];
    return this.mult(P);
  }

  primijeniKameru() 
  {
    return this.mult(this.kamera);
  }

  lista() 
  {
    const out = [];
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        out.push(this.m[row][col]);
      }
    }
    return new Float32Array(out);
  }
}
