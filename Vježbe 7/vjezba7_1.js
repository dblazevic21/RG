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

  var vrhovi = [ 
    1, -1, 
    1, 1,
    -1, 1
  ];
  
  function napuniSpremnike() 
  {
    var spremnikVrhova = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spremnikVrhova);
    
    GPUprogram1.a_vrhXY = gl.getAttribLocation(GPUprogram1, "a_vrhXY");
    gl.enableVertexAttribArray(GPUprogram1.a_vrhXY);
    gl.vertexAttribPointer(GPUprogram1.a_vrhXY, 2, gl.FLOAT, false, 0, 0);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vrhovi), gl.STATIC_DRAW);
  }

  function iscrtaj() 
  {
    gl.clearColor(0.4, 0.4, 0.4, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    gl.drawArrays(gl.TRIANGLES, 0, vrhovi.length / 2);
  }

  napuniSpremnike();
  iscrtaj();
}