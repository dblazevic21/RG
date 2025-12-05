function identitet() 
{
	return [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];
}

export default class Persp 
{
	constructor(platno, xmin, xmax, ymin, ymax, d) 
	{
		this.platno = platno;
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;
		this.d = d;

		const width = this.platno.canvas.width;
		const height = this.platno.canvas.height;

		this.Sx = width / (this.xmax - this.xmin);
		this.Sy = -height / (this.ymax - this.ymin);
		this.px = -this.Sx * this.xmin;
		this.py = -this.Sy * this.ymax;

		this.matrica = identitet();
		this.postaviBoju("#000");
	}

	postaviBoju(c) 
	{
		this.platno.strokeStyle = c;
		return this;
	}

	trans(m) 
	{
			if (!m) 
			{
					this.matrica = identitet();
					return this;
			}

			const matrix = m && m.m ? m.m : m;
			if (m && m.kamera && Array.isArray(matrix) && matrix.length === 4) 
			{
					this.matrica = this._mult(m.kamera, matrix);
			}
			else if (Array.isArray(matrix) && matrix.length === 4) 
			{
					this.matrica = matrix.map(red => red.slice());
			}
			return this;
	}

	postaviNa(x, y, z) 
	{
		const p = this._transformPoint(x, y, z);
		const proj = this._project(p.x, p.y, p.z);
		const px = this.Sx * proj.x + this.px;
		const py = this.Sy * proj.y + this.py;
		this.platno.beginPath();
		this.platno.moveTo(px, py);
		return this;
	}

	linijaDo(x, y, z) 
	{
		const p = this._transformPoint(x, y, z);
		const proj = this._project(p.x, p.y, p.z);
		const px = this.Sx * proj.x + this.px;
		const py = this.Sy * proj.y + this.py;
		this.platno.lineTo(px, py);
		return this;
	}

	povuciLiniju() 
	{
		this.platno.stroke();
		return this;
	}

	_transformPoint(x, y, z) 
	{
		const m = this.matrica;
		const tx = m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3];
		const ty = m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3];
		const tz = m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3];
		return { x: tx, y: ty, z: tz };
	}

	_project(x, y, z)
	{
			const denom = this.d + z;
			const safeDenom = Math.abs(denom) < 1e-6 ? (denom < 0 ? -1e-6 : 1e-6) : denom;
			const f = this.d / safeDenom;
			return { x: f * x, y: f * y, z };
	}

	_mult(a, b)
	{
			const res = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
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

	stozac(r, h, n)
	{
		const seg = Math.max(3, Math.floor(n));
		const step = (2 * Math.PI) / seg;
		const points = [];

		for (let i = 0; i < seg; i++)
		{
				const angle = i * step;
				points.push({
						x: r * Math.cos(angle),
						y: r * Math.sin(angle)
				});
		}

		if (points.length)
		{
				this.postaviNa(points[0].x, points[0].y, 0);
				for (let i = 1; i <= seg; i++)
				{
						const p = points[i % seg];
						this.linijaDo(p.x, p.y, 0);
				}
				this.povuciLiniju();

				for (const p of points)
				{
						this.postaviNa(p.x, p.y, 0)
								.linijaDo(0, 0, h)
								.povuciLiniju();
				}
		}

		return this;
	}

	valjak(r, h, n)
	{
		const seg = Math.max(3, Math.floor(n));
		const step = (2 * Math.PI) / seg;
		const bottom = [];
		const top = [];

		for (let i = 0; i < seg; i++)
		{
				const angle = i * step;
				const x = r * Math.cos(angle);
				const y = r * Math.sin(angle);
				bottom.push({ x, y, z: 0 });
				top.push({ x, y, z: h });
		}

		if (!bottom.length) return this;

		this.postaviNa(bottom[0].x, bottom[0].y, bottom[0].z);
		for (let i = 1; i <= seg; i++)
		{
				const p = bottom[i % seg];
				this.linijaDo(p.x, p.y, p.z);
		}
		this.povuciLiniju();

		this.postaviNa(top[0].x, top[0].y, top[0].z);
		for (let i = 1; i <= seg; i++)
		{
				const p = top[i % seg];
				this.linijaDo(p.x, p.y, p.z);
		}
		this.povuciLiniju();

		for (let i = 0; i < seg; i++)
		{
				const b = bottom[i];
				const t = top[i];
				this.postaviNa(b.x, b.y, b.z)
						.linijaDo(t.x, t.y, t.z)
						.povuciLiniju();
		}

		return this;
	}

	kugla(r, m, n)
	{
		const meridians = Math.max(3, Math.floor(m));
		const parallels = Math.max(2, Math.floor(n));

		for (let i = 1; i <= parallels; i++)
		{
			const theta = (i * Math.PI) / (parallels + 1);
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);
			const z = r * cosTheta;

			const steps = Math.max(32, meridians * 2);
			for (let j = 0; j <= steps; j++)
			{
				const phi = (j * 2 * Math.PI) / steps;
				const x = r * Math.cos(phi) * sinTheta;
				const y = r * Math.sin(phi) * sinTheta;
				
				if (j === 0)
				{
					this.postaviNa(x, y, z);
				}
				else
				{
					this.linijaDo(x, y, z);
				}
			}
			this.povuciLiniju();
		}

		for (let i = 0; i < meridians; i++)
		{
			const phi = (i * 2 * Math.PI) / meridians;
			const cosPhi = Math.cos(phi);
			const sinPhi = Math.sin(phi);

			const steps = Math.max(32, parallels * 2);
			for (let j = 0; j <= steps; j++)
			{
				const theta = (j * Math.PI) / steps;
				const sinTheta = Math.sin(theta);
				const x = r * cosPhi * sinTheta;
				const y = r * sinPhi * sinTheta;
				const z = r * Math.cos(theta);

				if (j === 0)
				{
					this.postaviNa(x, y, z);
				}
				else
				{
					this.linijaDo(x, y, z);
				}
			}
			this.povuciLiniju();
		}

		return this;
	}

	polukugla(r, m, n)
	{
		const meridians = Math.max(3, Math.floor(m));
		const parallels = Math.max(2, Math.floor(n));

		for (let i = 1; i <= parallels; i++)
		{
			const theta = (i * Math.PI) / (parallels + 1);
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);
			const z = r * cosTheta;

			const steps = Math.max(32, meridians * 2);
			for (let j = 0; j <= steps; j++)
			{
				const phi = (j * Math.PI) / steps; 
				const x = r * Math.cos(phi) * sinTheta;
				const y = r * Math.sin(phi) * sinTheta;
				
				if (j === 0)
				{
					this.postaviNa(x, y, z);
				}
				else
				{
					this.linijaDo(x, y, z);
				}
			}
			this.povuciLiniju();
		}

		for (let i = 0; i <= meridians; i++)
		{
			const phi = (i * Math.PI) / meridians;
			const cosPhi = Math.cos(phi);
			const sinPhi = Math.sin(phi);

			const steps = Math.max(32, parallels * 2);
			for (let j = 0; j <= steps; j++)
			{
				const theta = (j * Math.PI) / steps;
				const sinTheta = Math.sin(theta);
				const x = r * cosPhi * sinTheta;
				const y = r * sinPhi * sinTheta;
				const z = r * Math.cos(theta);

				if (j === 0)
				{
					this.postaviNa(x, y, z);
				}
				else
				{
					this.linijaDo(x, y, z);
				}
			}
			this.povuciLiniju();
		}

		const edgeSteps = Math.max(32, parallels * 2);
		
		for (let j = 0; j <= edgeSteps; j++)
		{
			const theta = (j * Math.PI) / edgeSteps;
			const x = r * Math.sin(theta);
			const z = r * Math.cos(theta);
			
			if (j === 0)
			{
				this.postaviNa(x, 0, z);
			}
			else
			{
				this.linijaDo(x, 0, z);
			}
		}
		this.povuciLiniju();
		
		for (let j = 0; j <= edgeSteps; j++)
		{
			const theta = (j * Math.PI) / edgeSteps;
			const x = -r * Math.sin(theta);
			const z = r * Math.cos(theta);
			
			if (j === 0)
			{
				this.postaviNa(x, 0, z);
			}
			else
			{
				this.linijaDo(x, 0, z);
			}
		}
		this.povuciLiniju();

		return this;
	}

	ravninaXY(gridSize = 12, gridStep = 1, viewMatrix, color = "#3a803a")
	{
		if (!viewMatrix) return this;
		this.trans({ m: identitet(), kamera: viewMatrix })
						.postaviBoju(color);

		for (let i = -gridSize; i <= gridSize; i += gridStep)
		{
				this.postaviNa(-gridSize, 0, i)
								.linijaDo(gridSize, 0, i)
								.povuciLiniju();

				this.postaviNa(i, 0, -gridSize)
								.linijaDo(i, 0, gridSize)
								.povuciLiniju();
		}

		this.trans();
		return this;
	}
}
