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

  var spremnikVrhova;

  function napuniSpremnike() 
  {
    GPUprogram1.a_vrhXY = gl.getAttribLocation(GPUprogram1, "a_vrhXY");
    GPUprogram1.a_boja = gl.getAttribLocation(GPUprogram1, "a_boja");
    GPUprogram1.u_mTrans = gl.getUniformLocation(GPUprogram1, "u_mTrans");
          
    spremnikVrhova = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spremnikVrhova);
    gl.enableVertexAttribArray(GPUprogram1.a_vrhXY);
    gl.enableVertexAttribArray(GPUprogram1.a_boja);
    gl.vertexAttribPointer(GPUprogram1.a_vrhXY, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(GPUprogram1.a_boja, 3, gl.FLOAT, false, 20, 8);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vrhovi.flat()), gl.STATIC_DRAW);
  }

  var kutY = 0;
  var kutX = 0;
  var kutZ = 0;

  function iscrtaj() 
  {
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    var mTrans = new MT3D();
    mTrans.rotirajY(kutY);
    mTrans.rotirajX(kutX);
    mTrans.rotirajZ(kutZ);

    gl.uniformMatrix4fv(GPUprogram1.u_mTrans, false, mTrans.lista());

    gl.drawArrays(gl.TRIANGLES, 0, vrhovi.length);

    kutY += 0.5;
    kutX += 1.0;
    kutZ += 1.5;

    requestAnimationFrame(iscrtaj);
  }

  napuniSpremnike();
  iscrtaj();
}