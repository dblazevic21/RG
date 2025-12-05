export default class GKS {
  constructor(platno, xmin, xmax) {
    this.platno = platno;
    this.xmin = xmin;
    this.xmax = xmax;

    this.Sx = this.platno.canvas.width / (this.xmax - this.xmin);
    this.Sy = -this.Sx;

    this.px = -this.Sx * this.xmin;
    this.py = this.platno.canvas.height / 2;

    this.matrica = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]
  }

  postaviNa(x, y) 
  {
    const tx = this.matrica[0][0] * x + this.matrica[0][1] * y + this.matrica[0][2];
    const ty = this.matrica[1][0] * x + this.matrica[1][1] * y + this.matrica[1][2];

    const px = this.Sx * tx + this.px;
    const py = this.Sy * ty + this.py;

    this.platno.beginPath();
    this.platno.moveTo(px, py);
  }

  linijaDo(x, y)
  {
    const tx = this.matrica[0][0] * x + this.matrica[0][1] * y + this.matrica[0][2];
    const ty = this.matrica[1][0] * x + this.matrica[1][1] * y + this.matrica[1][2];

    const px = this.Sx * tx + this.px;
    const py = this.Sy * ty + this.py;

    this.platno.lineTo(px, py);
  }

  koristiBoju(c)
  {
    this.platno.strokeStyle = c;
  }

  povuciLiniju()
  {
    this.platno.stroke();
  }

  trans(m)
  {
    if (!m) {
      this.matrica = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      return this;
    }

    const matrix = Array.isArray(m) ? m : (m.m ? m.m : null);
    if (matrix) 
    {
      this.matrica = matrix.map(red => red.slice());
    }
    return this;
  }

  nacrtajKoordinatniSustav(tickLen = 0.1, labelOffset = 0.2, font = '10px Arial') {
    const ctx = this.platno;

    this.koristiBoju('black');
    this.postaviNa(this.xmin, 0);
    this.linijaDo(this.xmax, 0);
    this.povuciLiniju();

    this.koristiBoju('black');
    this.postaviNa(0, this.xmin);
    this.linijaDo(0, this.xmax);
    this.povuciLiniju();

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let xcord = this.xmin;
    for (let i = this.xmin; i <= this.xmax; i++) {
      if (xcord != 0) {
        ctx.font = font;
        const lx = this.Sx * xcord + this.px;
        const ly = this.Sy * (-labelOffset) + this.py;
        ctx.fillText(String(xcord), lx, ly);
        xcord++;

        this.postaviNa(i, -tickLen);
        this.linijaDo(i, tickLen);
        this.povuciLiniju();
      } else {
        xcord++;
      }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let ycord = this.xmin;
    for (let i = this.xmin; i <= this.xmax; i++) {
      if (ycord != 0) {
        ctx.font = font;
        const lx = this.Sx * (labelOffset) + this.px;
        const ly = this.Sy * ycord + this.py;
        ctx.fillText(String(ycord), lx, ly);
        ycord++;

        this.postaviNa(-tickLen, i);
        this.linijaDo(tickLen, i);
        this.povuciLiniju();
      } else {
        ycord++;
      }
    }

    ctx.restore();
  }
}