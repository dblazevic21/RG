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
		if (matrix && matrix.length === 4) 
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
}
