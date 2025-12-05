import GKS from "./GKS.js";

window.onload = function () {
  var platno = this.document.getElementById("canvas1");
  if (!platno)
    this.alert("Greška - nema platna!");

  var width = platno.width;
  var height = platno.height;
  var context = platno.getContext("2d");

  const gks = new GKS(context, -5, 5, -5, 5);

  gks.nacrtajKoordinatniSustav(1, 1, 0.1, 0.2, '10px Arial');

  const a = 4;
  const b = 2;
  const r = 4;

  var x;
  var y;

  var xc = 0;
  var yc = 0;
  var c;


  gks.koristiBoju("red");
  gks.postaviNa(a, 0);
  for (var t = 0; t <= Math.PI * 2; t+=0.05)
  {
    x = a * Math.cos(t);
    y = b * Math.sin(t);
    
    gks.linijaDo(x, y);
  }
  gks.povuciLiniju();

  gks.koristiBoju("red");
  gks.postaviNa(r, 0);
  for (var t = 0; t <= Math.PI * 2; t+=0.05)
  {
    xc = a * Math.cos(t);
    yc = r * Math.sin(t);

    gks.linijaDo(xc, yc);
  }


  gks.povuciLiniju();
}