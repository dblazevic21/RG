import { pripremiGPUprogram } from "./WebGL.js";
import MT3D from "./MT3D.js";

window.onload = WebGLaplikacija;

function WebGLaplikacija() 
{
  var platno1 = document.getElementById("canvas1");
  var gl = platno1.getContext("webgl2");
  if (!gl) alert("WebGL2 nije dostupan!");

  var GPUprogram1 = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(GPUprogram1);

  let a = 0.5;
  var vrhovi = [ 
    [0, 0, 1, 0, 0],
    [-a, -a, 1, 0, 0],
    [a, -a, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [a, a, 1, 1, 0],
    [-a, a, 0.5, 0, 1]
  ];

  function napuniSpremnike() 
  {
    GPUprogram1.a_vrhXY = gl.getAttribLocation(GPUprogram1, "a_vrhXY");
    GPUprogram1.a_boja = gl.getAttribLocation(GPUprogram1, "a_boja");
          
    var spremnikVrhova = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spremnikVrhova);
    gl.enableVertexAttribArray(GPUprogram1.a_vrhXY);
    gl.enableVertexAttribArray(GPUprogram1.a_boja);
    gl.vertexAttribPointer(GPUprogram1.a_vrhXY, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(GPUprogram1.a_boja, 3, gl.FLOAT, false, 20, 8);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vrhovi.flat()), gl.STATIC_DRAW);
  }

  function iscrtaj() 
  {
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    gl.drawArrays(gl.TRIANGLES, 0, vrhovi.length);
  }

  napuniSpremnike();
  iscrtaj();
}