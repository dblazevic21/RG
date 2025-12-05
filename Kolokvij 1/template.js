import Persp from "./Persp.js";
import MT3D from "./MT3D.js";

window.onload = () =>
{
    const platno = document.getElementById("canvas1");
    if (!platno) return;
    const ctx = platno.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 1;

    const persp = new Persp(ctx, -11, 11, -11, 11, 11);
    const camera = new MT3D();

    const gridSize = 12;
    const gridStep = 1;

    let angleDeg = 0;
    const angleStepDeg = 0.2;
    
    const orbitRadius = 10;
    const cameraHeight = 11;
    const lookAtY = 0;

    function getViewMatrix()
    {
        camera.orbitCamera(angleDeg, orbitRadius, cameraHeight, 0, lookAtY, 0, 0, 3, 0);
        return camera.kamera;
    }

    function render()
    {
        const viewMatrix = getViewMatrix();

        ctx.clearRect(0, 0, platno.width, platno.height);

        persp.ravninaXY(gridSize, gridStep, viewMatrix, "#3a803a");

        persp.trans();

        angleDeg = (angleDeg + angleStepDeg) % 360;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
};