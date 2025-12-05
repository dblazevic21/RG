function prevediShader(gl, id, tipShadera) 
{
  var shaderSkripta = document.getElementById(id);
  if (!shaderSkripta) 
  {
    throw "Nepoznata skripta: " + id;
  }

  var izvorniKodShadera = shaderSkripta.text.trim();
  var shader = gl.createShader(tipShadera);
  gl.shaderSource(shader, izvorniKodShadera);
  gl.compileShader(shader);
  var uspjeh = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!uspjeh) 
  {
    throw "Shader nije kompajliran: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function pripremiGPUprogram(gl, vsID, fsID)
{
  var vshader = prevediShader(gl, vsID, gl.VERTEX_SHADER);
  var fshader = prevediShader(gl, fsID, gl.FRAGMENT_SHADER);
  var program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);
  var uspjeh = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!uspjeh) 
  {
    throw "Program nije kreiran kako treba: " + gl.getProgramInfoLog(program);
  }
  return program;
}

export { prevediShader, pripremiGPUprogram };