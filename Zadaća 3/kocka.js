import Ortho from "./Ortho.js";
import MT3D from "./MT3D.js";

const axisP1 = { x: -3, y: 5, z: -3 };
const axisP2 = { x: 2, y: -5, z: 2 };
const axisDir = {
	x: axisP2.x - axisP1.x,
	y: axisP2.y - axisP1.y,
	z: axisP2.z - axisP1.z
};

const plohaKocke = 2;
const polaStranice = plohaKocke / 2;

const cubeVertices = [
	[-polaStranice, -polaStranice, -polaStranice],
	[polaStranice, -polaStranice, -polaStranice],
	[polaStranice, polaStranice, -polaStranice],
	[-polaStranice, polaStranice, -polaStranice],
	[-polaStranice, -polaStranice, polaStranice],
	[polaStranice, -polaStranice, polaStranice],
	[polaStranice, polaStranice, polaStranice],
	[-polaStranice, polaStranice, polaStranice]
];

const straniceKocke = [
	[0, 1], [1, 2], [2, 3], [3, 0],
	[4, 5], [5, 6], [6, 7], [7, 4],
	[0, 4], [1, 5], [2, 6], [3, 7]
];

const sceneTiltDeg = 30;
const rotationSpeed = 25;
const axisColor = "magenta";

function drawCube(ortho, transform, color) {
	ortho.trans(transform);
	ortho.postaviBoju(color);

	for (const [a, b] of straniceKocke) {
		const pa = cubeVertices[a];
		const pb = cubeVertices[b];
		ortho.postaviNa(pa[0], pa[1], pa[2]);
		ortho.linijaDo(pb[0], pb[1], pb[2]);
		ortho.povuciLiniju();
	}

	ortho.trans();
}

function drawAxes(ortho, baseMatrix, length) {
	ortho.trans(baseMatrix);

	ortho.postaviBoju("red");
	ortho.postaviNa(0, 0, 0);
	ortho.linijaDo(length, 0, 0);
	ortho.povuciLiniju();

	ortho.postaviBoju("green");
	ortho.postaviNa(0, 0, 0);
	ortho.linijaDo(0, length, 0);
	ortho.povuciLiniju();

	ortho.postaviBoju("blue");
	ortho.postaviNa(0, 0, 0);
	ortho.linijaDo(0, 0, length);
	ortho.povuciLiniju();

	ortho.trans();
}

function drawRotationAxis(ortho, baseMatrix, p1, p2) {
	ortho.trans(baseMatrix);
	ortho.postaviBoju(axisColor);
	ortho.postaviNa(p1.x, p1.y, p1.z);
	ortho.linijaDo(p2.x, p2.y, p2.z);
	ortho.povuciLiniju();
	ortho.trans();
}

window.addEventListener("load", () => {
	const canvas = document.getElementById("canvas1");
	if (!canvas) {
		return;
	}

	const ctx = canvas.getContext("2d");
	const viewExtent = 6;
	const ortho = new Ortho(ctx, -viewExtent, viewExtent, -viewExtent, viewExtent);

	const baseTiltMatrix = new MT3D()
		.rotiraj_oko_osi(
			axisP1.x,
			axisP1.y,
			axisP1.z,
			axisDir.x,
			axisDir.y,
			axisDir.z,
			sceneTiltDeg
		).m.map(red => red.slice());

	let angle = 0;
	let lastTime = performance.now();

	function render(now) {
		const dt = (now - lastTime) / 1000;
		lastTime = now;
		angle = (angle + rotationSpeed * dt) % 360;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const axisLength = plohaKocke * 2;
		drawAxes(ortho, baseTiltMatrix, axisLength);
		drawRotationAxis(ortho, baseTiltMatrix, axisP1, axisP2);

		const cubeTransform = new MT3D()
			.rotiraj_oko_osi(
				axisP1.x,
				axisP1.y,
				axisP1.z,
				axisDir.x,
				axisDir.y,
				axisDir.z,
				sceneTiltDeg + angle
			)
			.pomakni(polaStranice, polaStranice, polaStranice);

		drawCube(ortho, cubeTransform, "#333");

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
});
