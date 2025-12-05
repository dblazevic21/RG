class GKS {
  constructor(ctx) {
    this.ctx = ctx;
  }

  postaviNa(x, y) 
  {
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  linijaDo(x, y)
  {
    

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }




}