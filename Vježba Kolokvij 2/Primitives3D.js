// Primitives3D.js
// Refaktor: radi s layout(location=0) a_pos i layout(location=1) a_nrm,
// te vraća "geo" objekte (pos/nrm[/idx], mode, count, indexed) i "mesh" (VAO+draw info).
export default class Primitives3D {
  // ---------- geometry builders (kao u tvom rješenju) ----------

  // Cilindar po Z osi: z in [0..h], plašt kao TRIANGLE_STRIP
  static buildCylinderWall(r, h, segments, inward = false, glMode = null) {
    const pos = [];
    const nrm = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;

      // top then bottom -> strip
      pos.push(x, y, h);
      pos.push(x, y, 0);

      let nx = Math.cos(t), ny = Math.sin(t), nz = 0;
      if (inward) { nx = -nx; ny = -ny; }
      nrm.push(nx, ny, nz);
      nrm.push(nx, ny, nz);
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      indexed: false,
      idx: null,
      mode: glMode, // ako proslijediš gl.TRIANGLE_STRIP, uzme to; inače će createMesh uzeti default
      count: (segments + 1) * 2,
    };
  }

  // Prsten/annulus u ravnini z=zConst, TRIANGLE_STRIP
  static buildAnnulus(rIn, rOut, zConst, segments, glMode = null) {
    const pos = [];
    const nrm = [];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const cx = Math.cos(t), cy = Math.sin(t);

      // outer
      pos.push(cx * rOut, cy * rOut, zConst);
      nrm.push(0, 0, 1);

      // inner
      pos.push(cx * rIn, cy * rIn, zConst);
      nrm.push(0, 0, 1);
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      indexed: false,
      idx: null,
      mode: glMode,
      count: (segments + 1) * 2,
    };
  }

  // UV sphere: indexed TRIANGLES
  static buildSphere(r, stacks, slices, glMode = null) {
    const pos = [];
    const nrm = [];
    const idx = [];

    for (let i = 0; i <= stacks; i++) {
      const v = i / stacks;
      const theta = v * Math.PI;
      const st = Math.sin(theta), ct = Math.cos(theta);

      for (let j = 0; j <= slices; j++) {
        const u = j / slices;
        const phi = u * Math.PI * 2;
        const sp = Math.sin(phi), cp = Math.cos(phi);

        const x = cp * st;
        const y = sp * st;
        const z = ct;

        pos.push(r * x, r * y, r * z);
        nrm.push(x, y, z);
      }
    }

    const row = slices + 1;
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const a = i * row + j;
        const b = a + row;
        idx.push(a, b, a + 1);
        idx.push(b, b + 1, a + 1);
      }
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      indexed: true,
      idx: new Uint16Array(idx),
      mode: glMode,
      count: idx.length,
    };
  }

  // ---------- GPU mesh helper ----------

  // Pravi VAO s attrib lokacijama 0 i 1 (kako ti shader ima layout(location=0/1))
  static createMesh(gl, geo) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // positions @ location 0
    const vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, geo.pos, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    // normals @ location 1
    const vboNrm = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vboNrm);
    gl.bufferData(gl.ARRAY_BUFFER, geo.nrm, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    let ebo = null;
    const indexed = !!geo.indexed;
    if (indexed) {
      ebo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return {
      vao,
      mode: geo.mode ?? (indexed ? gl.TRIANGLES : gl.TRIANGLE_STRIP),
      count: geo.count,
      indexed,
      indexType: indexed ? gl.UNSIGNED_SHORT : null,
    };
  }

  static drawMesh(gl, mesh) {
    gl.bindVertexArray(mesh.vao);
    if (mesh.indexed) gl.drawElements(mesh.mode, mesh.count, mesh.indexType, 0);
    else gl.drawArrays(mesh.mode, 0, mesh.count);
    gl.bindVertexArray(null);
  }

  // Polukugla po Z osi: z >= 0 (od 0 do r), centar u (0,0,0)
  // Outer normals su “van”
  static buildHemisphereZ(r, stacks, slices, glMode = null) {
    const pos = [];
    const nrm = [];
    const idx = [];

    // theta: 0..pi/2 (samo pola sfere)
    for (let i = 0; i <= stacks; i++) {
      const v = i / stacks;
      const theta = v * (Math.PI / 2);
      const st = Math.sin(theta), ct = Math.cos(theta);

      for (let j = 0; j <= slices; j++) {
        const u = j / slices;
        const phi = u * Math.PI * 2;
        const sp = Math.sin(phi), cp = Math.cos(phi);

        const x = cp * st;
        const y = sp * st;
        const z = ct;          // z>=0

        pos.push(r * x, r * y, r * z);
        nrm.push(x, y, z);
      }
    }

    const row = slices + 1;
    for (let i = 0; i < stacks; i++) {
      for (let j = 0; j < slices; j++) {
        const a = i * row + j;
        const b = a + row;
        idx.push(a, b, a + 1);
        idx.push(b, b + 1, a + 1);
      }
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      idx: new Uint16Array(idx),
      indexed: true,
      mode: glMode,
      count: idx.length,
    };
  }

  static buildDisk(r, z, n, up = true, glMode) {
    const pos = [];
    const nrm = [];
    const idx = [];

    pos.push(0, 0, z);
    nrm.push(0, 0, up ? 1 : -1);

    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = Math.cos(t) * r;
      const y = Math.sin(t) * r;
      pos.push(x, y, z);
      nrm.push(0, 0, up ? 1 : -1);
    }

    for (let i = 1; i <= n; i++) {
      if (up) idx.push(0, i, i + 1);
      else    idx.push(0, i + 1, i);
    }

    return {
      pos: new Float32Array(pos),
      nrm: new Float32Array(nrm),
      idx: new Uint16Array(idx),
      indexed: true,
      mode: glMode,
      count: idx.length,
    };
  }

  static buildCylinderCapped(
  r = 1,
  h = 1,
  segments = 48,
  capTop = true,
  capBottom = true,
  glMode
) {
  const pos = [];
  const nrm = [];
  const idx = [];

  let vCount = 0;

  const pushV = (p, n) => {
    pos.push(...p);
    nrm.push(...n);
    return vCount++;
  };

  // ---------- SIDE ----------
  const sideStart = vCount;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);

    pushV([r * c, r * s, 0], [c, s, 0]);
    pushV([r * c, r * s, h], [c, s, 0]);
  }

  for (let i = 0; i < segments; i++) {
    const a = sideStart + i * 2;
    idx.push(a, a + 1, a + 3);
    idx.push(a, a + 3, a + 2);
  }

  // ---------- BOTTOM CAP ----------
  if (capBottom) {
    const center = pushV([0, 0, 0], [0, 0, -1]);
    const start = vCount;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pushV([r * Math.cos(t), r * Math.sin(t), 0], [0, 0, -1]);
    }

    for (let i = 0; i < segments; i++) {
      idx.push(center, start + i + 1, start + i);
    }
  }

  // ---------- TOP CAP ----------
  if (capTop) {
    const center = pushV([0, 0, h], [0, 0, 1]);
    const start = vCount;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pushV([r * Math.cos(t), r * Math.sin(t), h], [0, 0, 1]);
    }

    for (let i = 0; i < segments; i++) {
      idx.push(center, start + i, start + i + 1);
    }
  }

  return {
    pos: new Float32Array(pos),
    nrm: new Float32Array(nrm),
    idx: new Uint16Array(idx),
    indexed: true,
    mode: glMode,
    count: idx.length,
  };
}

  // Jedan trokut (TRIANGLES), normal isti za sva 3 vrha
  static buildTriangle(p0, p1, p2, normal = [0, 0, 1], glMode = null) {
    const pos = new Float32Array([
      p0[0], p0[1], p0[2],
      p1[0], p1[1], p1[2],
      p2[0], p2[1], p2[2],
    ]);
    const nrm = new Float32Array([
      normal[0], normal[1], normal[2],
      normal[0], normal[1], normal[2],
      normal[0], normal[1], normal[2],
    ]);
    return {
      pos, nrm,
      indexed: false,
      idx: null,
      mode: glMode,
      count: 3,
    };
  }

  // Pravokutnik u XY ravnini na z = zConst (2 trokuta), normal (0,0,1)
  static buildQuadXY(w, h, zConst = 0, glMode = null) {
    const hw = w * 0.5, hh = h * 0.5;

    const pos = new Float32Array([
      -hw, -hh, zConst,
       hw, -hh, zConst,
       hw,  hh, zConst,

      -hw, -hh, zConst,
       hw,  hh, zConst,
      -hw,  hh, zConst,
    ]);

    const nrm = new Float32Array([
      0,0,1,  0,0,1,  0,0,1,
      0,0,1,  0,0,1,  0,0,1,
    ]);

    return {
      pos, nrm,
      indexed: false,
      idx: null,
      mode: glMode,
      count: 6,
    };
  }
  // Cap za cilindar: disk u XY ravnini na z=0 ili z=h (za unit cilindar h=1)
  // up=true => normal (0,0,1), up=false => normal (0,0,-1)
  static buildCapDisk(r, zConst, segments = 64, up = true, glMode = null) {
    return Primitives3D.buildDisk(r, zConst, segments, up, glMode);
  }


}
