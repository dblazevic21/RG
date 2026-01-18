function prevediShaderIzSkripte(gl, id, tip) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Ne postoji skripta s id="${id}"`);

  const src = el.textContent.trim();
  const sh = gl.createShader(tip);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);

  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh) || "Bez detalja.";
    gl.deleteShader(sh);
    throw new Error(`Greška u shaderu (${id}):\n${info}`);
  }
  return sh;
}

function pripremiGPUprogram(gl, vsID, fsID) {
  const vs = prevediShaderIzSkripte(gl, vsID, gl.VERTEX_SHADER);
  const fs = prevediShaderIzSkripte(gl, fsID, gl.FRAGMENT_SHADER);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog) || "Bez detalja.";
    gl.deleteProgram(prog);
    throw new Error(`Linkanje programa nije uspjelo:\n${info}`);
  }

  gl.deleteShader(vs);
  gl.deleteShader(fs);

  return prog;
}

export { pripremiGPUprogram };
