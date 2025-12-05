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

  var x;
  var y;


  gks.koristiBoju("red");
  gks.postaviNa(0, 0);
  for (var t = 0; t <= Math.PI * 12; t+=0.05)
  {
    x = (Math.pow(Math.E, Math.cos(t)) - 2 * Math.cos(4*t) + Math.pow(Math.sin((t/12)), 5)) * Math.sin(t);
    y = (Math.pow(Math.E, Math.cos(t)) - 2 * Math.cos(4*t) + Math.pow(Math.sin((t/12)), 5)) * Math.cos(t);
    
    gks.linijaDo(x, y);
  }
  gks.povuciLiniju();
}