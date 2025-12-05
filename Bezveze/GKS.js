export default class GKS {
  constructor(platno, xmin, xmax, ymin, ymax) {
    this.platno = platno;
    this.xmin = xmin;
    this.xmax = xmax;
    this.ymin = ymin;
    this.ymax = ymax;

    this.Sx = this.platno.canvas.width / (this.xmax - this.xmin);
    this.Sy = -this.platno.canvas.height / (this.ymax - this.ymin);

    this.px = -this.Sx * this.xmin;
    this.py = -this.Sy * this.ymax;
  }

  postaviNa(x, y) 
  {
    x = this.Sx * x + this.px;
    y = this.Sy * y + this.py;

    this.platno.beginPath();
    this.platno.moveTo(x, y);
  }

  linijaDo(x, y)
  {
    x = this.Sx * x + this.px;
    y = this.Sy * y + this.py;

    this.platno.lineTo(x, y);
  }

  koristiBoju(c)
  {
    this.platno.strokeStyle = c;
  }

  povuciLiniju()
  {
    this.platno.stroke();
  }
}