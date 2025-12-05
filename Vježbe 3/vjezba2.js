import Ortho from "./Ortho.js";
import MT3D from "./MT3D.js";

const cubeVertices = [
	[-1, -1, -1],
	[1, -1, -1],
	[1, 1, -1],
	[-1, 1, -1],
	[-1, -1, 1],
	[1, -1, 1],
	[1, 1, 1],
	[-1, 1, 1]
];

const cubeEdges = [
	[0, 1], [1, 2], [2, 3], [3, 0],
	[4, 5], [5, 6], [6, 7], [7, 4],
	[0, 4], [1, 5], [2, 6], [3, 7]
];

function drawCube(ortho, transform, color) 
{
	ortho.trans(transform);
	ortho.postaviBoju(color);

	for (const [a, b] of cubeEdges) 
  {
		const pa = cubeVertices[a];
		const pb = cubeVertices[b];
		ortho.postaviNa(pa[0], pa[1], pa[2]);
		ortho.linijaDo(pb[0], pb[1], pb[2]);
		ortho.povuciLiniju();
	}

	ortho.trans();
}

window.addEventListener("load", () => {
	const staticCanvas = document.getElementById("canvasOrtho");
	if (staticCanvas)
	{
		const staticCtx = staticCanvas.getContext("2d");
		staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
		const staticOrtho = new Ortho(staticCtx, -2.5, 2.5, -2.5, 2.5);

		const rotX = new MT3D().rotirajX(30);
		const rotY = new MT3D().rotirajY(30);
		const rotZ = new MT3D().rotirajZ(30);
		const rotXYZ = new MT3D()
			.rotirajX(30)
			.rotirajY(30)
			.rotirajZ(30);

		drawCube(staticOrtho, rotX, "red");
		drawCube(staticOrtho, rotY, "green");
		drawCube(staticOrtho, rotZ, "blue");
		drawCube(staticOrtho, rotXYZ, "black");
	}

	let canvas = document.getElementById("canvasCube");
	if (!canvas)
	{
		canvas = document.getElementById("canvas1");
	}
	if (!canvas)
	{
		return;
	}

	const ctx = canvas.getContext("2d");
	const ortho = new Ortho(ctx, -2.5, 2.5, -2.5, 2.5);

	let angleX = 0;
	let angleY = 0;
	let angleZ = 0;
	const speedX = 45;
	const speedY = 35;
	const speedZ = 55;
	let lastTime = performance.now();

	function animate(now)
	{
		const dt = (now - lastTime) / 1000;
		lastTime = now;

		angleX = (angleX + speedX * dt) % 360;
		angleY = (angleY + speedY * dt) % 360;
		angleZ = (angleZ + speedZ * dt) % 360;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const transform = new MT3D()
			.rotirajX(angleX)
			.rotirajY(angleY)
			.rotirajZ(angleZ);

		drawCube(ortho, transform, "#1d1d1d");

		requestAnimationFrame(animate);
	}

	requestAnimationFrame(animate);
});
