export default class MT3D 
{
	constructor() 
  {
		this.m = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];

		this.kamera = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
	}

	identitet() 
  {
		this.m = [
			[1, 0, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
		return this;
	}

	mult(matrix) 
  {
		const rhs = matrix instanceof MT3D ? matrix.m : matrix;
		if (!rhs) 
    {
			throw new Error("MT3D.mult expects a 4x4 matrix or MT3D instance");
		}

		const result = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];

		for (let i = 0; i < 4; i++) 
    {
			for (let j = 0; j < 4; j++) 
      {
				let sum = 0;
				for (let k = 0; k < 4; k++) 
        {
					sum += this.m[i][k] * rhs[k][j];
				}
				result[i][j] = sum;
			}
		}

		this.m = result;
		return this;
	}

	pomakni(px, py, pz) 
  {
		const T = [
			[1, 0, 0, px],
			[0, 1, 0, py],
			[0, 0, 1, pz],
			[0, 0, 0, 1]
		];
		return this.mult(T);
	}

	skaliraj(sx, sy, sz) 
  {
		const S = [
			[sx, 0, 0, 0],
			[0, sy, 0, 0],
			[0, 0, sz, 0],
			[0, 0, 0, 1]
		];
		return this.mult(S);
	}

	rotirajX(kut) 
  {
		const rad = (kut * Math.PI) / 180;
		const c = Math.cos(rad);
		const s = Math.sin(rad);
		const Rx = [
			[1, 0, 0, 0],
			[0, c, -s, 0],
			[0, s, c, 0],
			[0, 0, 0, 1]
		];
		return this.mult(Rx);
	}

	rotirajY(kut) 
  {
		const rad = (kut * Math.PI) / 180;
		const c = Math.cos(rad);
		const s = Math.sin(rad);
		const Ry = [
			[c, 0, s, 0],
			[0, 1, 0, 0],
			[-s, 0, c, 0],
			[0, 0, 0, 1]
		];
		return this.mult(Ry);
	}

	rotirajZ(kut) 
  {
		const rad = (kut * Math.PI) / 180;
		const c = Math.cos(rad);
		const s = Math.sin(rad);
		const Rz = [
			[c, -s, 0, 0],
			[s, c, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1]
		];
		return this.mult(Rz);
	}

  rotiraj(x1, y1, z1, x2, y2, z2, kut)
  {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dz = z2 - z1;
		const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
		if (len === 0) 
    {
			return this;
		}

		const ux = dx / len;
		const uy = dy / len;
		const uz = dz / len;
		const rad = (kut * Math.PI) / 180;
		const c = Math.cos(rad);
		const s = Math.sin(rad);
		const t = 1 - c;

		const R = [
			[t * ux * ux + c, t * ux * uy - s * uz, t * ux * uz + s * uy, 0],
			[t * ux * uy + s * uz, t * uy * uy + c, t * uy * uz - s * ux, 0],
			[t * ux * uz - s * uy, t * uy * uz + s * ux, t * uz * uz + c, 0],
			[0, 0, 0, 1]
		];

		const toOrigin = [
			[1, 0, 0, -x1],
			[0, 1, 0, -y1],
			[0, 0, 1, -z1],
			[0, 0, 0, 1]
		];

		const back = [
			[1, 0, 0, x1],
			[0, 1, 0, y1],
			[0, 0, 1, z1],
			[0, 0, 0, 1]
		];

		function mult4(a, b) 
    {
			const res = [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0]
			];
			for (let i = 0; i < 4; i++) 
      {
				for (let j = 0; j < 4; j++) 
        {
					let sum = 0;
					for (let k = 0; k < 4; k++) 
          {
						sum += a[i][k] * b[k][j];
					}
					res[i][j] = sum;
				}
			}
			return res;
		}

		const combined = mult4(mult4(back, R), toOrigin);
		return this.mult(combined);
  }

	rotiraj_oko_osi(x0, y0, z0, u1, u2, u3, kut)
	{
		const x1 = x0 + u1;
		const y1 = y0 + u2;
		const z1 = z0 + u3;
		return this.rotiraj(x0, y0, z0, x1, y1, z1, kut);
	}

	postaviKameru(x0, y0, z0, x1, y1, z1, Vx, Vy, Vz)
	{
		function VP(a, b)
		{
			return [
				a[1]*b[2] - a[2]*b[1],
				a[2]*b[0] - a[0]*b[2],
				a[0]*b[1] - a[1]*b[0]
			];
		}

		function norm(v)
		{
			const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
			return len === 0 ? [0,0,0] : [v[0]/len, v[1]/len, v[2]/len];
		}

		const eye = [x0, y0, z0];
		const center = [x1, y1, z1];
		const up = [Vx, Vy, Vz];

		let zC = norm([eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]]);
		let xC = norm(VP(up, zC));
		let yC = VP(zC, xC);

		const R = [
			[xC[0], xC[1], xC[2], 0],
			[yC[0], yC[1], yC[2], 0],
			[zC[0], zC[1], zC[2], 0],
			[0,0,0,1]
		];

		const T = [
			[1,0,0,-x0],
			[0,1,0,-y0],
			[0,0,1,-z0],
			[0,0,0,1]
		];

		function mult4(a, b)
		{
			const res = [
				[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0],
				[0,0,0,0]
			];

			for (let i=0;i<4;i++)
			{
				for (let j=0;j<4;j++)
				{
					for (let k=0;k<4;k++)
					{
						res[i][j]+=a[i][k]*b[k][j];
					}
				}
			}
			return res;
		}

		this.kamera = mult4(R, T);
		return this;
	}

	lista()
	{
		const rezultat = [];
		for (let j = 0; j < 4; j++)
		{
			for (let i = 0; i < 4; i++)
			{
				rezultat.push(this.m[i][j]);
			}
		}
		return rezultat;
	}
}
