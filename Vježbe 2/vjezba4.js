import GKS from "./GKS.js";
import MT2D from "./MT2D.js";

window.onload = function () {
  var platno = this.document.getElementById("canvas1");
  if (!platno)
    this.alert("Greška - nema platna!");

  var context = platno.getContext("2d");

  var gks = new GKS(context, -10, 10, -5, 5);
  var mat = new MT2D();

  gks.nacrtajKoordinatniSustav(1, 1, 0.1, 0.2, '10px Arial');

  const a = 6;
  const b = 3;
  const centerX = 4;
  const centerY = 0;
  const korak = 0.05;

  mat
    .identitet()
    .rotiraj(-30)
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
    .pomakni(centerX, centerY)
    .rotiraj(-30)
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

  const a2 = 4;
  const b2 = 1;

  
  mat
    .identitet()
    .rotiraj(75)
    .pomakni(3, 0)
    .zrcaliNaY()
    .skaliraj(a2, b2);
  
  gks.trans(mat);

  const startPointThird = {
     x: Math.cos(0), 
     y: Math.sin(0) 
  };

  gks.koristiBoju("green");
  gks.postaviNa(startPointThird.x, startPointThird.y);

  for (let t = korak; t <= Math.PI * 2; t += korak)
  {
    const x = Math.cos(t);
    const y = Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointThird.x, startPointThird.y);
  gks.povuciLiniju();
  gks.trans();



}