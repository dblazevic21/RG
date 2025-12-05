import GKS from "./blazevic_duje_gks.js";

window.onload = function () {
  var platno = this.document.getElementById("canvas1");
  if (!platno)
    this.alert("Greška - nema platna!");

  var width = platno.width;
  var height = platno.height;
  var context = platno.getContext("2d");

  const gks = new GKS(context, -5, 5, -5, 5);

  function toCanvasX(x) {
    return (x - gks.xmin) / (gks.xmax - gks.xmin) * width;
  }

  function toCanvasY(y) {
    return height - (y - gks.ymin) / (gks.ymax - gks.ymin) * height;
  }

  gks.koristiBoju("black");
  gks.postaviNa(-5, 0);
  gks.linijaDo(5, 0);
  gks.povuciLiniju();

  gks.koristiBoju("black");
  gks.postaviNa(0, -5);
  gks.linijaDo(0, 5);
  gks.povuciLiniju();

  var xcord = -5;
  var ycord = -5;

  gks.koristiBoju("black");
  for(var i = -5; i <= 5; i++)
  {
    if (xcord != 0)
    {
      context.font = "10px Arial";
      context.fillText(xcord.toString(), toCanvasX(xcord), toCanvasY(0.2));
      xcord++;

      gks.postaviNa(i, -0.1);
      gks.linijaDo(i, 0.1);
      gks.povuciLiniju();
    }
    else
    {
      xcord++;
    }
  }

  gks.koristiBoju("black");
  for(var i = -5; i <= 5; i+= 1)
  {

    if (ycord != 0)
    {
      context.font = "10px Arial";
      context.fillText(ycord.toString(), toCanvasX(0.2), toCanvasY(ycord));
      ycord++;

      gks.postaviNa(-0.1, i);
      gks.linijaDo(0.1, i);
      gks.povuciLiniju();
    }
    else
    {
      ycord++;
    }
  }

  const a = 4;
  const b = 2;

  var x;
  var y;


  gks.koristiBoju("red");
  gks.postaviNa(a, 0);
  for (var t = 0; t <= Math.PI * 2; t+=0.05)
  {
    x = a * Math.cos(t);
    y = b * Math.sin(t);
    
    gks.linijaDo(x, y);
  }
  gks.povuciLiniju();
  
}