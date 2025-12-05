import Persp from "./Persp.js";
import MT3D from "./MT3D.js";

window.onload = () =>
{
    const platno = document.getElementById("canvas1");
    if (!platno) return;
    const ctx = platno.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 1;

    platno.style.backgroundColor = "#FFFFE0";

    const persp = new Persp(ctx, -11, 11, -11, 11, 11);
    const camera = new MT3D();

    const truncatedConeTransform = new MT3D()
        .pomakni(0, 0, -3)
        .rotirajX(-90);
    const coneBottomRadius = 4;
    const coneTopRadius = 1;
    const coneHeight = 8; 

    const torusR = 6;
    const torusr = 0.5;

    const gridSize = 12;
    const gridStep = 1;

    let angleDeg = 0;
    const angleStepDeg = 0.25;
    let localRotationAngle = 0;
    const localRotationSpeed = 2.0;

    camera.identitet();
    camera.postaviKameru(10, 10, 10, 0, 4, -3, 0, 1, 0);
    const viewMatrix = camera.kamera;

    function render()
    {
        ctx.clearRect(0, 0, platno.width, platno.height);

        const axisLength = 10;
        
        persp.trans({ kamera: viewMatrix });
        
        persp.postaviBoju("#FF0000")
            .postaviNa(0, 0, 0)
            .linijaDo(axisLength, 0, 0)
            .povuciLiniju();
        
        persp.postaviBoju("#00FF00")
            .postaviNa(0, 0, 0)
            .linijaDo(0, axisLength, 0)
            .povuciLiniju();
        
        persp.postaviBoju("#0000FF")
            .postaviNa(0, 0, 0)
            .linijaDo(0, 0, axisLength)
            .povuciLiniju();

        const torusTransform = new MT3D()
            .pomakni(0, coneHeight, -3)
            .rotirajX(90)
            .rotirajY(angleDeg);

        persp.trans({ m: truncatedConeTransform.m, kamera: viewMatrix })
            .postaviBoju("#00ADEF")
            .krnjiStozac(coneBottomRadius, coneTopRadius, coneHeight, 20);

        persp.trans({ m: torusTransform.m, kamera: viewMatrix })
            .postaviBoju("#000")
            .torus(torusR, torusr, 30, 20);

        ctx.strokeStyle = "#FA003F";
        const numLines = 20;
        for (let i = 0; i < numLines; i++)
        {
            const angle = (i / numLines) * 2 * Math.PI;
        
            const x1 = coneTopRadius * Math.cos(angle);
            const y1 = coneTopRadius * Math.sin(angle);
            const z1 = 0;
            
            const x2 = (torusR - torusr) * Math.cos(angle);
            const y2 = (torusR - torusr) * Math.sin(angle);
            const z2 = 0;
            
            persp.trans({ m: torusTransform.m, kamera: viewMatrix });
            persp.postaviNa(x1, y1, z1)
                .linijaDo(x2, y2, z2)
                .povuciLiniju();
        }

        for (let i = 0; i < 4; i++)
        {
            const angle = (i / 4) * 2 * Math.PI;
            
            const torusX = (torusR - torusr) * Math.cos(angle);
            const torusY = (torusR - torusr) * Math.sin(angle);
            const torusZ = 0;

            const normalX = Math.cos(angle);
            const normalY = Math.sin(angle);
            const normalZ = 0;

            const localAngleRad = (localRotationAngle + i * 90) * Math.PI / 180;
            const distance = 2.0;
            
            const tangentX = -Math.sin(angle);
            const tangentY = Math.cos(angle);
            const tangentZ = 0;
            
            const bitangentX = 0;
            const bitangentY = 0;
            const bitangentZ = 1;

            const angle30 = 30 * Math.PI / 180;
            
            const offsetX = distance * (
                Math.cos(localAngleRad) * Math.sin(angle30) * tangentX + 
                Math.sin(localAngleRad) * Math.sin(angle30) * bitangentX +
                Math.cos(angle30) * normalX
            );
            const offsetY = distance * (
                Math.cos(localAngleRad) * Math.sin(angle30) * tangentY + 
                Math.sin(localAngleRad) * Math.sin(angle30) * bitangentY +
                Math.cos(angle30) * normalY
            );
            const offsetZ = distance * (
                Math.cos(localAngleRad) * Math.sin(angle30) * tangentZ + 
                Math.sin(localAngleRad) * Math.sin(angle30) * bitangentZ +
                Math.cos(angle30) * normalZ
            );

            const sphereX = torusX + offsetX;
            const sphereY = torusY + offsetY;
            const sphereZ = torusZ + offsetZ;

            persp.trans({ m: torusTransform.m, kamera: viewMatrix });
            persp.postaviBoju("#000");
            persp.postaviNa(torusX, torusY, torusZ)
                .linijaDo(sphereX, sphereY, sphereZ)
                .povuciLiniju();

            const sphereTransform = new MT3D()
                .mult(torusTransform)
                .pomakni(sphereX, sphereY, sphereZ);
            
            const kugleR = 0.5;

            persp.trans({ m: sphereTransform.m, kamera: viewMatrix })
                .postaviBoju("#FF00FF")
                .kugla(kugleR, 10, 10);
        }

        angleDeg = (angleDeg + angleStepDeg) % 360;
        localRotationAngle = (localRotationAngle + localRotationSpeed) % 360;
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
};