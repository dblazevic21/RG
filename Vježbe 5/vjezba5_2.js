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

    const coneTransform = new MT3D().rotirajX(-90);
    const coneRadius = 5;
    const coneHeight = 8;

    const topCylinderBase = new MT3D()
        .rotirajX(-90)
        .pomakni(0, 0, coneHeight - 2);
    const cylinderHeight = 2;
    const cylinderRadius = 1;

    const sideCylinderHeight = 5;
    const sideCylinderRadius = 0.5;

    const halfCircleRadius = 2;
    const halfCircleMeridiansVertical = 7;
    const halfCircleMeridiansHorizontal = 20;

    const shapeAngles = [0, 120, 240];

    const halfCircleLocalOffset = [
        [1, 0, 0, sideCylinderRadius],
        [0, 1, 0, 0],
        [0, 0, 1, sideCylinderHeight + halfCircleRadius - 0.1],
        [0, 0, 0, 1]
    ];

    const sideCylinderBases = shapeAngles.map(deg =>
        new MT3D().pomakni(0, coneHeight - 1, 0).rotirajY(deg)
    );

    const halfCircleBases = sideCylinderBases.map(side =>
    {
        const m = new MT3D();
        m.m = side.m.map(r => r.slice());
        m.mult(halfCircleLocalOffset);
        m.rotirajX(90);
        m.rotirajZ(90);
        return m;
    });

    const gridSize = 12;
    const gridStep = 1;

    let angleDeg = 0;
    const angleStepDeg = 1;
    
    const orbitRadius = 10;
    const cameraHeight = 11;
    const lookAtY = coneHeight / 2;

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

        persp.trans({ m: coneTransform.m, kamera: viewMatrix })
            .postaviBoju("#000")
            .stozac(coneRadius, coneHeight, 15);

        persp.trans({ m: topCylinderBase.m, kamera: viewMatrix })
            .postaviBoju("#000")
            .valjak(cylinderRadius, cylinderHeight, 20);

        for (const base of sideCylinderBases)
        {
            persp.trans({ m: base.m, kamera: viewMatrix })
                .postaviBoju("#000")
                .valjak(sideCylinderRadius, sideCylinderHeight, 20);
        }

        for (const base of halfCircleBases)
        {
            persp.trans({ m: base.m, kamera: viewMatrix })
                .postaviBoju("#000")
                .polukugla(halfCircleRadius, halfCircleMeridiansHorizontal, halfCircleMeridiansVertical);
        }

        persp.trans();

        angleDeg = (angleDeg + angleStepDeg) % 360;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
};