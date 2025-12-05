import GKS from "./GKS.js";
import MT2D from "./MT2D.js";

window.onload = function () {
  var platno = this.document.getElementById("canvas1");
  if (!platno)
    this.alert("Greška - nema platna!");

  var width = platno.width;
  var height = platno.height;
  var context = platno.getContext("2d");

  var gks = new GKS(context, -10, 10, -5, 5);
  var mat = new MT2D();

  gks.nacrtajKoordinatniSustav(1, 1, 0.1, 0.2, '10px Arial');

  const a = 4;
  const b = 2;
  const centerX = 4;
  const centerY = 2;
  const korak = 0.05;

  mat
    .identitet()
    .pomakni(centerX, centerY)
    .skaliraj(a, b);

  gks.trans(mat);

  const startPointFirst = {
     x: Math.cos(0), 
     y: Math.sin(0) 
  };

  gks.koristiBoju("red");
  gks.postaviNa(startPointFirst.x, startPointFirst.y);

  for (let t = korak; t <= Math.PI * 2; t += korak) 
  {
    const x = Math.cos(t);
    const y = Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointFirst.x, startPointFirst.y);
  gks.povuciLiniju();
  gks.trans();

  mat
    .identitet()
    .pomakni(0, 0)
    .rotiraj(30)
    .skaliraj(a, b);
  
  gks.trans(mat);

  const startPointSecond = {
     x: Math.cos(0), 
     y: Math.sin(0) 
  };

  gks.koristiBoju("blue");
  gks.postaviNa(startPointSecond.x, startPointSecond.y);

  for (let t = korak; t <= Math.PI * 2; t += korak)
  {
    const x = Math.cos(t);
    const y = Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointSecond.x, startPointSecond.y);
  gks.povuciLiniju();
  gks.trans();


}