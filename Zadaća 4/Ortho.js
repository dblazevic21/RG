function ident4() 
{
	return [
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];
}

export default class Ortho 
{
	constructor(context, xmin, xmax, ymin, ymax) 
  {
		this.platno = context;
		this.xmin = xmin;
		this.xmax = xmax;
		this.ymin = ymin;
		this.ymax = ymax;

		const width = this.platno.canvas.width;
		const height = this.platno.canvas.height;

		this.Sx = width / (this.xmax - this.xmin);
		this.Sy = -height / (this.ymax - this.ymin);
		this.px = -this.Sx * this.xmin;
		this.py = -this.Sy * this.ymax;

		this.matrica = ident4();
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
				this.matrica = ident4();
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
		const px = this.Sx * p.x + this.px;
		const py = this.Sy * p.y + this.py;
		this.platno.beginPath();
		this.platno.moveTo(px, py);
		return this;
	}

	linijaDo(x, y, z) 
  {
		const p = this._transformPoint(x, y, z);
		const px = this.Sx * p.x + this.px;
		const py = this.Sy * p.y + this.py;
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
}
