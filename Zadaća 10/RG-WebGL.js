// RG-WebGL.js - skup potprograma koji automatizira prevođenje programa za sjenčanje
// za potrebe kolegija Računalna grafika pripremio Damir Horvat / preradio Ivan Hip

//kreiranje shadera iz <script id="..."> taga
function prevediShader(gl, id, tipShadera) {
  //potrazi skriptu u dokumentu
  var shaderSkripta = document.getElementById(id);
  if (!shaderSkripta) {
    throw "Nepoznata skripta: " + id;
  }
  //uzmi sadrzaj skripte
  var izvorniKodShadera = shaderSkripta.text.trim();
  //napravi shader objekt
  var shader = gl.createShader(tipShadera);
  //pridruzi mu izvorni kod
  gl.shaderSource(shader, izvorniKodShadera);
  //kompajliraj shader
  gl.compileShader(shader);
  //provjeri da li je sve ok
  var uspjeh = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!uspjeh) {
    throw "Shader nije kompajliran: " + gl.getShaderInfoLog(shader);
  }
  return shader;
} // prevediShader

//poveži sve zajedno u program
function pripremiGPUprogram(gl, vsID, fsID) {
  var vshader = prevediShader(gl, vsID, gl.VERTEX_SHADER);
  var fshader = prevediShader(gl, fsID, gl.FRAGMENT_SHADER);
  var program = gl.createProgram();
  //pridruzi shadere
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  //povezi shadere u program
  gl.linkProgram(program);
  //provjeri je li dobro povezano
  var uspjeh = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!uspjeh) {
    throw "Program nije kreiran kako treba: " + gl.getProgramInfoLog(program);
  }
  return program;
} // pripremiGPUprogram
