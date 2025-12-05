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

    // const coneTransform = new MT3D().rotirajX(-90);
    // const coneRadius = 5;
    // const coneHeight = 8;

    const topCylinderBase = new MT3D()
        .rotirajX(-90);
    const cylinderHeight = 2;
    const cylinderRadius = 7;

    const smallTopCylinderBase = new MT3D()
        .pomakni(0, cylinderHeight, 0)
        .rotirajX(-90);
    const smallTopCylinderHeight = 1;
    const smallTopCylinderRadius = 3;

    const lightNeck = new MT3D()
        .pomakni(0, cylinderHeight + smallTopCylinderHeight, 0)
        .rotirajX(-90);
    const lightNeckHeight = 10;
    const lightNeckRadius = 0.5;

    const lightBaseRadius = 2;
    const lightBaseHeight = 6;

    const lightBase = new MT3D()
        .pomakni(0, cylinderHeight + smallTopCylinderHeight + lightNeckHeight + lightBaseRadius, -lightBaseHeight + 1.5);

    const lightNeck2 = new MT3D()
        .pomakni(0, (cylinderHeight + smallTopCylinderHeight + 2 * lightBaseRadius + lightNeckHeight), 0)
        .rotirajX(-90);
    const lightNeckHeight2 = 2;
    const lightNeckRadius2 = 0.5;

    const lightHolderNeckRadius = 0.5;
    const lightHolderNeckHeight = 8;
    const lightHolderNeck = new MT3D()
        .pomakni(-1.65 - lightHolderNeckHeight, 
                cylinderHeight + smallTopCylinderHeight + lightNeckHeight + 4.5, 
                -lightBaseHeight + lightHolderNeckRadius * 4)
        .rotirajZ(-15)
        .rotirajY(90);

    const lightBulbHolderRadius = 1.5;
    const lightBulbHolderHeight = 4.5;
    const lightBulbHolder = new MT3D()
        .pomakni(-1.5 - lightHolderNeckHeight - lightBulbHolderRadius, 
                cylinderHeight + smallTopCylinderHeight + lightNeckHeight + 4.5 + lightHolderNeckRadius*2, 
                -lightBaseHeight + lightHolderNeckRadius * 4)
        .rotirajY(90)
        .rotirajX(105)
        .rotirajZ(-15);


    const lightBulbHelmetRadius = 3.5;
    const lightBulbHelmet = new MT3D()
        .pomakni( - lightHolderNeckHeight - lightBulbHolderRadius - lightBulbHelmetRadius, 
                cylinderHeight + smallTopCylinderHeight + lightNeckHeight + 5 + lightHolderNeckRadius*2 - lightBulbHolderHeight - lightBulbHelmetRadius, 
                -lightBaseHeight + lightHolderNeckRadius * 4)
        .rotirajY(90)
        .rotirajX(15);

    const lightBulbRadius = 3.5;
    const lightBulb = new MT3D()
        .pomakni( - lightHolderNeckHeight - lightBulbHolderRadius - lightBulbHelmetRadius, 
                cylinderHeight + smallTopCylinderHeight + lightNeckHeight + 5 + lightHolderNeckRadius*2 - lightBulbHolderHeight - lightBulbHelmetRadius, 
                -lightBaseHeight + lightHolderNeckRadius * 4)
        .rotirajY(90)
        .rotirajX(105);


    // const sideCylinderHeight = 5;
    // const sideCylinderRadius = 0.5;

    // const halfCircleRadius = 2;
    // const halfCircleMeridiansVertical = 7;
    // const halfCircleMeridiansHorizontal = 20;

    // const shapeAngles = [0, 120, 240];

    // const halfCircleLocalOffset = [
    //     [1, 0, 0, sideCylinderRadius],
    //     [0, 1, 0, 0],
    //     [0, 0, 1, sideCylinderHeight + halfCircleRadius - 0.1],
    //     [0, 0, 0, 1]
    // ];

    // const sideCylinderBases = shapeAngles.map(deg =>
    //     new MT3D().pomakni(0, coneHeight - 1, 0).rotirajY(deg)
    // );

    // const halfCircleBases = sideCylinderBases.map(side =>
    // {
    //     const m = new MT3D();
    //     m.m = side.m.map(r => r.slice());
    //     m.mult(halfCircleLocalOffset);
    //     m.rotirajX(90);
    //     m.rotirajZ(90);
    //     return m;
    // });

    const gridSize = 12;
    const gridStep = 1;

    // let angle = 0;
    // const angleStepDeg = 1;

    // camera.identitet();
    // camera.postaviKameru(0, 7, 7, 0, 0, 0, 0, 3, 0);
    // const viewMatrix = camera.kamera;

    let angleDeg = 0;
    const angleStepDeg = 0.2;
    
    const orbitRadius = 16;
    const cameraHeight = 10;
    const lookAtY = 5;

    function getViewMatrix()
    {
        camera.orbitCamera(angleDeg, orbitRadius, cameraHeight, 0, lookAtY, 0, 0, 3, 0);
        return camera.kamera;
    }

    function render()
    {
        const viewMatrix = getViewMatrix();

        ctx.clearRect(0, 0, platno.width, platno.height);

        // MT3D.rotateObject(topCylinderBase, angleStepDeg, 'y');
        // for (const base of sideCylinderBases)
        //     MT3D.rotateObject(base, angleStepDeg, 'y');
        // for (const base of halfCircleBases)
        //     MT3D.rotateObject(base, angleStepDeg, 'y');

        persp.ravninaXY(gridSize, gridStep, viewMatrix, "#3a803a");

        // persp.trans({ m: coneTransform.m, kamera: viewMatrix })
        //     .postaviBoju("#000")
        //     .stozac(coneRadius, coneHeight, 15);

        persp.trans({ m: topCylinderBase.m, kamera: viewMatrix })
            .postaviBoju("#ff0000ff")
            .valjak(cylinderRadius, cylinderHeight, 20)
            .disk(cylinderRadius, cylinderHeight, 90, 20, 3);
        
        persp.trans({ m: smallTopCylinderBase.m, kamera: viewMatrix })
            .postaviBoju("#000dffff")
            .valjak(smallTopCylinderRadius, smallTopCylinderHeight, 20)
            .disk(smallTopCylinderRadius, smallTopCylinderHeight, 90, 20, 0.5);

        persp.trans({ m: lightNeck.m, kamera: viewMatrix })
            .postaviBoju("#1e410cff")
            .valjak(lightNeckRadius, lightNeckHeight, 20);  

        persp.trans({ m: lightBase.m, kamera: viewMatrix })
            .postaviBoju("#ff00ffff")
            .valjak(lightBaseRadius, lightBaseHeight, 50);

        persp.trans({ m: lightNeck2.m, kamera: viewMatrix })
            .postaviBoju("#1e410cff")
            .valjak(lightNeckRadius2, lightNeckHeight2, 20);

        persp.trans({ m: lightHolderNeck.m, kamera: viewMatrix })
            .postaviBoju("#1e410cff")
            .valjak(lightHolderNeckRadius, lightHolderNeckHeight, 20);

        persp.trans({ m: lightBulbHolder.m, kamera: viewMatrix })
            .postaviBoju("#000dffff")
            .valjak(lightBulbHolderRadius, lightBulbHolderHeight, 20);

        persp.trans({ m: lightBulbHelmet.m, kamera: viewMatrix })
            .postaviBoju("#000")
            .polukugla(lightBulbHelmetRadius, 20, 20);

        persp.trans({ m: lightBulb.m, kamera: viewMatrix })
            .postaviBoju("#ff0000ff")
            .elipsa(lightBulbRadius - 1, lightBulbRadius - 1, lightBulbRadius, 20, 20);


        // for (const base of sideCylinderBases)
        // {
        //     persp.trans({ m: base.m, kamera: viewMatrix })
        //         .postaviBoju("#000")
        //         .valjak(sideCylinderRadius, sideCylinderHeight, 20);
        // }

        // for (const base of halfCircleBases)
        // {
        //     persp.trans({ m: base.m, kamera: viewMatrix })
        //         .postaviBoju("#000")
        //         .polukugla(halfCircleRadius, halfCircleMeridiansHorizontal, halfCircleMeridiansVertical);
        // }



        persp.trans();

        angleDeg = (angleDeg + angleStepDeg) % 360;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
};