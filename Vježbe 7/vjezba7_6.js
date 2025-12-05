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

  gl.enable(gl.CULL_FACE);

  let a = 0.5;
  var vrhovi = [ 
    // Prednja stranica (z = a) - crvena
    [-a, -a, a, 1, 0, 0],
    [a, -a, a, 1, 0, 0],
    [a, a, a, 1, 0, 0],
    [-a, -a, a, 1, 0, 0],
    [a, a, a, 1, 0, 0],
    [-a, a, a, 1, 0, 0],
    
    // Stražnja stranica (z = -a) - zelena
    [a, -a, -a, 0, 1, 0],
    [-a, -a, -a, 0, 1, 0],
    [-a, a, -a, 0, 1, 0],
    [a, -a, -a, 0, 1, 0],
    [-a, a, -a, 0, 1, 0],
    [a, a, -a, 0, 1, 0],
    
    // Desna stranica (x = a) - plava
    [a, -a, a, 0, 0, 1],
    [a, -a, -a, 0, 0, 1],
    [a, a, -a, 0, 0, 1],
    [a, -a, a, 0, 0, 1],
    [a, a, -a, 0, 0, 1],
    [a, a, a, 0, 0, 1],
    
    // Lijeva stranica (x = -a) - žuta
    [-a, -a, -a, 1, 1, 0],
    [-a, -a, a, 1, 1, 0],
    [-a, a, a, 1, 1, 0],
    [-a, -a, -a, 1, 1, 0],
    [-a, a, a, 1, 1, 0],
    [-a, a, -a, 1, 1, 0],
    
    // Gornja stranica (y = a) - cijan
    [-a, a, a, 0, 1, 1],
    [a, a, a, 0, 1, 1],
    [a, a, -a, 0, 1, 1],
    [-a, a, a, 0, 1, 1],
    [a, a, -a, 0, 1, 1],
    [-a, a, -a, 0, 1, 1],
    
    // Donja stranica (y = -a) - magenta
    [-a, -a, -a, 1, 0, 1],
    [a, -a, -a, 1, 0, 1],
    [a, -a, a, 1, 0, 1],
    [-a, -a, -a, 1, 0, 1],
    [a, -a, a, 1, 0, 1],
    [-a, -a, a, 1, 0, 1]
  ];

  var spremnikVrhova;

  function napuniSpremnike() 
  {
    GPUprogram1.a_vrhXYZ = gl.getAttribLocation(GPUprogram1, "a_vrhXYZ");
    GPUprogram1.a_boja = gl.getAttribLocation(GPUprogram1, "a_boja");
    GPUprogram1.u_mTrans = gl.getUniformLocation(GPUprogram1, "u_mTrans");
          
    spremnikVrhova = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spremnikVrhova);
    gl.enableVertexAttribArray(GPUprogram1.a_vrhXYZ);
    gl.enableVertexAttribArray(GPUprogram1.a_boja);
    gl.vertexAttribPointer(GPUprogram1.a_vrhXYZ, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(GPUprogram1.a_boja, 3, gl.FLOAT, false, 24, 12);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vrhovi.flat()), gl.STATIC_DRAW);
  }

  var kutY = 0;
  var kutX = 0;
  var kutZ = 0;

  function iscrtaj() 
  {
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    kutY += 0.10;
    kutX += 0.15;
    kutZ += 0.25;

    const mTrans = new MT3D();

    mTrans.pomakni(0, 0, -0.3);
    mTrans.rotirajY(kutY);
    mTrans.rotirajX(kutX);
    mTrans.rotirajZ(kutZ);

    gl.uniformMatrix4fv(GPUprogram1.u_mTrans, false, mTrans.lista());

    gl.cullFace(gl.BACK);
    gl.drawArrays(gl.TRIANGLES, 0, vrhovi.length);

    gl.cullFace(gl.FRONT);
    gl.drawArrays(gl.TRIANGLES, 0, vrhovi.length);

    requestAnimationFrame(iscrtaj);
  }
  napuniSpremnike();
  iscrtaj();
}