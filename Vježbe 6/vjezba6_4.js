import { pripremiGPUprogram } from "./WebGL.js";
import MT2D from "./MT2D.js";

window.onload = WebGLaplikacija;

function WebGLaplikacija() 
{
  var platno1 = document.getElementById("canvas1");
  var gl = platno1.getContext("webgl2");
  if (!gl) alert("WebGL2 nije dostupan!");

  var GPUprogram1 = pripremiGPUprogram(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(GPUprogram1);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  GPUprogram1.u_mTrans = gl.getUniformLocation(GPUprogram1, "u_mTrans");
  GPUprogram1.u_boja = gl.getUniformLocation(GPUprogram1, "u_boja");

  var brojTocaka = 100;
  var vrhovi = [0.0, 0.0];
  for (let i = 0; i <= brojTocaka; i++) 
  {
    let kut = (i / brojTocaka) * 2 * Math.PI;
    vrhovi.push(Math.cos(kut));
    vrhovi.push(Math.sin(kut));
  }
    
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
    gl.clearColor(0x69/255, 0x91/255, 0xd7/255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    for (let i = 0; i < 8; i++) 
    {
      let kut = (i / 8) * 360;
      
      let elipsa = new MT2D();
      elipsa.projekcija2D(-10, 10, -10, 10);
      elipsa.rotiraj(kut);
      elipsa.pomakni(0, 4.5);
      elipsa.skaliraj(1, 3.5);
      
      gl.uniformMatrix3fv(GPUprogram1.u_mTrans, false, elipsa.lista());
      gl.uniform4fv(GPUprogram1.u_boja, [1.0, 1.0, 0.0, 1.0]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, vrhovi.length / 2);
    }

    let sredina = new MT2D();
    sredina.projekcija2D(-10, 10, -10, 10);
    sredina.skaliraj(1, 1);
    
    gl.uniformMatrix3fv(GPUprogram1.u_mTrans, false, sredina.lista());
    gl.uniform4fv(GPUprogram1.u_boja, [1.0, 0.0, 1.0, 1.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vrhovi.length / 2);
  }

  napuniSpremnike();
  iscrtaj();
}