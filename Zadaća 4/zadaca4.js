import Persp from "./Persp.js";
import MT3D from "./MT3D.js";

const cubeEdges = [
  [0, 1], 
  [1, 2], 
  [2, 3], 
  [3, 0],
  [4, 5], 
  [5, 6], 
  [6, 7], 
  [7, 4],
  [0, 4], 
  [1, 5], 
  [2, 6], 
  [3, 7]
];

const cubeVerts = [
  [0, 0, 0],
  [1, 0, 0], 
  [1, 1, 0], 
  [0, 1, 0],
  [0, 0, 1], 
  [1, 0, 1], 
  [1, 1, 1], 
  [0, 1, 1]
];

const cubes = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 2, 0],
  [0, 3, 0],
  [1, 2, 0],
  [0, 4, 0],
  [1, 4, 0],
  [2, 4, 0],

];

const spacing = 1;

const cubeCenters = cubes.map(([x, y, z]) => ({
  x: x * spacing + 0.5,
  y: y * spacing + 0.5,
  z: z * spacing + 0.5
}));

const target = cubeCenters.reduce(
  (acc, c) => ({ x: acc.x + c.x, y: acc.y + c.y, z: acc.z + c.z }),
  { x: 0, y: 0, z: 0 }
);

target.x /= cubeCenters.length;
target.y /= cubeCenters.length;
target.z /= cubeCenters.length;

function drawCube(persp, modelMatrix, viewMatrix, color = "#222") 
{
  persp.trans({ m: modelMatrix, kamera: viewMatrix });
  persp.postaviBoju(color);
  for (const [a, b] of cubeEdges) 
  {
    const A = cubeVerts[a];
    const B = cubeVerts[b];
    persp.postaviNa(A[0], A[1], A[2]);
    persp.linijaDo(B[0], B[1], B[2]);
    persp.povuciLiniju();
  }
  persp.trans();
}

function drawGrid(persp, size, step, viewMatrix) 
{
  const identity = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  persp.trans({ m: identity, kamera: viewMatrix });
  persp.postaviBoju("#3a803a");
  for (let i = -size; i <= size; i += step) 
  {
    persp.postaviNa(-size, 0, i);
    persp.linijaDo(size, 0, i);
    persp.povuciLiniju();

    persp.postaviNa(i, 0, -size);
    persp.linijaDo(i, 0, size);
    persp.povuciLiniju();
  }
  persp.trans();
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("canvas1");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.lineWidth = 1;

  const viewExtent = 15;
  const cameraDistance = 15;
  const persp = new Persp(ctx, -viewExtent, viewExtent, -viewExtent, viewExtent, cameraDistance);

  const gridSize = 12;
  const gridStep = 1;

  let angle = 0;
  let height = 2;
  let heightDirection = 1;

  const angleSpeed = 0.001;
  const heightSpeed = 0.002;
  const minHeight = 4;
  const maxHeight = 6;
  const orbitRadius = 10;

  function animate() 
  {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    angle += angleSpeed;
    height += heightDirection * heightSpeed;
    if (height > maxHeight || height < minHeight) 
    {
      heightDirection *= -1;
      height = Math.max(Math.min(height, maxHeight), minHeight);
    }

    const eyeX = target.x + Math.cos(angle) * orbitRadius;
    const eyeZ = target.z + Math.sin(angle) * orbitRadius;
    const eyeY = height;

    const camera = new MT3D().postaviKameru(eyeX, eyeY, eyeZ, target.x, target.y, target.z, 0, 1, 0);
    const viewMatrix = camera.kamera;

    drawGrid(persp, gridSize, gridStep, viewMatrix);

    for (const [x, y, z] of cubes.map(([cx, cy, cz]) => [cx * spacing, cy * spacing, cz * spacing])) 
    {
      const model = new MT3D().pomakni(x, y, z).m.map(row => row.slice());
      drawCube(persp, model, viewMatrix);
    }

    requestAnimationFrame(animate);
  }

  animate();
});
