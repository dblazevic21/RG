import GKS from "./GKS.js";
import MT2D from "./MT2D.js";

window.onload = function () {
  var platno = this.document.getElementById("canvas1");
  if (!platno)
    this.alert("Greška - nema platna!");

  var context = platno.getContext("2d");

  var gks = new GKS(context, -10, 10);
  var mat = new MT2D();

  gks.nacrtajKoordinatniSustav(0.1, 0.2, '10px Arial');

  var korak = 0.05;

  gks.koristiBoju("red");
  gks.postaviNa(-5, -9);
  
  for (let t = -5; t <= 1; t += korak)
  {
    var x = t;
    var y = 3 * x + 6;

    gks.linijaDo(x, y);
  }
  gks.povuciLiniju();

  gks.koristiBoju("black");
  gks.postaviNa(1, 2);
  gks.linijaDo(5, 2);
  gks.povuciLiniju();

  gks.postaviNa(5, 4);
  gks.linijaDo(1, 4);
  gks.povuciLiniju();

  gks.postaviNa(1, 4);
  gks.linijaDo(1, 2);
  gks.povuciLiniju();

  gks.postaviNa(5, 2);
  gks.linijaDo(7, 2);
  gks.povuciLiniju();

  gks.postaviNa(7, 2);
  gks.linijaDo(7, 5);
  gks.povuciLiniju();

  gks.postaviNa(7, 5);
  gks.linijaDo(5, 5);
  gks.povuciLiniju();

  gks.postaviNa(5, 5);
  gks.linijaDo(5, 2);
  gks.povuciLiniju();

  gks.postaviNa(5.3, 4);
  gks.linijaDo(6.7, 4);
  gks.povuciLiniju();

  gks.postaviNa(6.7, 4);
  gks.linijaDo(6.7, 4.8);
  gks.povuciLiniju();

  gks.postaviNa(6.7, 4.8);
  gks.linijaDo(5.3, 4.8);
  gks.povuciLiniju();

  gks.postaviNa(5.3, 4.8);
  gks.linijaDo(5.3, 4);
  gks.povuciLiniju();

  const a = 0.5;
  const b = 0.5;

  mat
    .identitet()
    .pomakni(2, 2)
    .skaliraj(1, 1)

  gks.trans(mat);

  const startPointFirst = {
    x: a * Math.cos(0),
    y: b * Math.sin(0)
  }

  gks.postaviNa(startPointFirst.x, startPointFirst.y);

  for (let t = 0; t <= Math.PI * 2; t += korak)
  {
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointFirst.x, startPointFirst.y);
  gks.povuciLiniju();
  gks.trans();

  mat
    .identitet()
    .pomakni(6, 2)
    .skaliraj(1, 1)

  gks.trans(mat);

  const startPointSecond = {
    x: a * Math.cos(0),
    y: b * Math.sin(0)
  }

  gks.postaviNa(startPointSecond.x, startPointSecond.y);

  for (let t = 0; t <= Math.PI * 2; t += korak)
  {
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointSecond.x, startPointSecond.y);
  gks.povuciLiniju();
  gks.trans();




  
  const thetaDeg = Math.atan(3) * 180 / Math.PI;
  const refleksija = new MT2D();
  refleksija
    .identitet()
    .pomakni(0, 6)
    .rotiraj(thetaDeg)
    .zrcaliNaX()
    .rotiraj(-thetaDeg)
    .pomakni(0, -6);

  gks.trans(refleksija);
  gks.koristiBoju("blue");

  gks.postaviNa(1, 2);
  gks.linijaDo(5, 2);
  gks.povuciLiniju();

  gks.postaviNa(5, 4);
  gks.linijaDo(1, 4);
  gks.povuciLiniju();

  gks.postaviNa(1, 4);
  gks.linijaDo(1, 2);
  gks.povuciLiniju();

  gks.postaviNa(5, 2);
  gks.linijaDo(7, 2);
  gks.povuciLiniju();

  gks.postaviNa(7, 2);
  gks.linijaDo(7, 5);
  gks.povuciLiniju();

  gks.postaviNa(7, 5);
  gks.linijaDo(5, 5);
  gks.povuciLiniju();

  gks.postaviNa(5, 5);
  gks.linijaDo(5, 2);
  gks.povuciLiniju();

  gks.postaviNa(5.3, 4);
  gks.linijaDo(6.7, 4);
  gks.povuciLiniju();

  gks.postaviNa(6.7, 4);
  gks.linijaDo(6.7, 4.8);
  gks.povuciLiniju();

  gks.postaviNa(6.7, 4.8);
  gks.linijaDo(5.3, 4.8);
  gks.povuciLiniju();

  gks.postaviNa(5.3, 4.8);
  gks.linijaDo(5.3, 4);
  gks.povuciLiniju();

  const reflektiraniPrvi = new MT2D();
  reflektiraniPrvi
    .identitet()
    .pomakni(0, 6)
    .rotiraj(thetaDeg)
    .zrcaliNaX()
    .rotiraj(-thetaDeg)
    .pomakni(0, -6)
    .pomakni(2, 2);

  gks.trans(reflektiraniPrvi);

  const startPointMirrorFirst = {
    x: a * Math.cos(0),
    y: b * Math.sin(0)
  };

  gks.postaviNa(startPointMirrorFirst.x, startPointMirrorFirst.y);

  for (let t = 0; t <= Math.PI * 2; t += korak)
  {
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointMirrorFirst.x, startPointMirrorFirst.y);
  gks.povuciLiniju();

  const reflektiraniDrugi = new MT2D();
  reflektiraniDrugi
    .identitet()
    .pomakni(0, 6)
    .rotiraj(thetaDeg)
    .zrcaliNaX()
    .rotiraj(-thetaDeg)
    .pomakni(0, -6)
    .pomakni(6, 2);

  gks.trans(reflektiraniDrugi);

  const startPointMirrorSecond = {
    x: a * Math.cos(0),
    y: b * Math.sin(0)
  };

  gks.postaviNa(startPointMirrorSecond.x, startPointMirrorSecond.y);

  for (let t = 0; t <= Math.PI * 2; t += korak)
  {
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);

    gks.linijaDo(x, y);
  }

  gks.linijaDo(startPointMirrorSecond.x, startPointMirrorSecond.y);
  gks.povuciLiniju();
  gks.trans();
}
