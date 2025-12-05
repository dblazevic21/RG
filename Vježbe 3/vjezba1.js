import GKS from "./GKS.js";
import MT2D from "./MT2D.js";

window.onload = function () {
  const canvas = document.getElementById("canvas1");
  if (!canvas) {
    alert("Greška - nema platna!");
    return;
  }

  const context = canvas.getContext("2d");
  const gks = new GKS(context, -10, 10);
  const center = { x: 0, y: 0 };
  const bladeSpacing = 120;
  const rotationSpeed = 120;
  const bladeShift = 1.3;
  const bladeScaleX = 1.7;
  const bladeScaleY = 0.5;

  

  function drawEllipse(a, b, steps = 90) {
    const delta = (Math.PI * 2) / steps;
    const startX = a * Math.cos(0);
    const startY = b * Math.sin(0);
    gks.postaviNa(startX, startY);
    for (let i = 1; i <= steps; i++) {
      const t = i * delta;
      const x = a * Math.cos(t);
      const y = b * Math.sin(t);
      gks.linijaDo(x, y);
    }
    gks.povuciLiniju();
  }

  function ventilator(phiDeg) 
  {
    context.clearRect(0, 0, canvas.width, canvas.height);
    gks.trans();
    gks.koristiBoju("#222");

    const hubMatrix = new MT2D();
    hubMatrix
      .identitet()
      .pomakni(center.x, center.y)
      .skaliraj(0.3, 0.3);
    gks.trans(hubMatrix);
    drawEllipse(0.5, 0.5);
    gks.trans();

    for (let i = 0; i < 3; i++) 
    {
      const angle = phiDeg + i * bladeSpacing;
      const bladeMatrix = new MT2D();
      bladeMatrix
        .identitet()
        .pomakni(center.x, center.y)
        .rotiraj(angle)
        .pomakni(bladeShift, 0)
        .skaliraj(bladeScaleX, bladeScaleY);
      gks.trans(bladeMatrix);
      drawEllipse(1, 1);
      gks.trans();
    }
  }

  let lastTime = performance.now();
  let phi = 0;

  function animate(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    phi = (phi + rotationSpeed * dt) % 360;
    ventilator(phi);
    requestAnimationFrame(animate);
  }

  ventilator(0);
  requestAnimationFrame(animate);
};
