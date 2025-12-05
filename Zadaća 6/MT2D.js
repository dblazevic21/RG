export default class MT2D {
  constructor() {
    this.m = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  identitet() {
    this.m = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    return this;
  }

  mult(m) {
    const R = [ [0,0,0], [0,0,0], [0,0,0] ];
    for (let i = 0; i < 3; i++) 
    {
      for (let j = 0; j < 3; j++) 
      {
        let s = 0;
        for (let k = 0; k < 3; k++) s += this.m[i][k] * m[k][j];
        R[i][j] = s;
      }
    }
    this.m = R;
    return this;
  }

  pomakni(px, py) 
  {
    const T = [
      [1, 0, px],
      [0, 1, py],
      [0, 0, 1]
    ];
    return this.mult(T);
  }

  skaliraj(sx, sy) 
  {
    const S = [
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1]
    ];
    return this.mult(S);
  }

  zrcaliNaX() 
  {
    const R = [
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, 1]
    ];
    return this.mult(R);
  }

  zrcaliNaY() 
  {
    const R = [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
    return this.mult(R);
  }

  rotiraj(kut) 
  {
    const rad = kut * Math.PI / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const R = [
      [c, -s, 0],
      [s,  c, 0],
      [0,  0, 1]
    ];
    return this.mult(R);
  }

  projekcija2D(xmin, xmax, ymin, ymax)
  {
    const sx = 2 / (xmax - xmin);
    const tx = (xmin + xmax) / (xmin - xmax);
    const sy = 2 / (ymax - ymin);
    const ty = (ymin + ymax) / (ymin - ymax);

    const P = [
      [sx, 0, tx],
      [0, sy, ty],
      [0, 0, 1]
    ];

    return this.mult(P);
  }

  lista() 
  {
    return [
      this.m[0][0], this.m[1][0], this.m[2][0], 
      this.m[0][1], this.m[1][1], this.m[2][1], 
      this.m[0][2], this.m[1][2], this.m[2][2]  
    ];
  }

}