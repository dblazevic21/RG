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
    gl.clearColor(0.9, 0.9, 0.9, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, platno1.width, platno1.height);

    let m1 = new MT2D();
    m1.projekcija2D(-10, 10, -10, 10); 
    m1.pomakni(4, 0);           
    m1.rotiraj(-30);              
    m1.skaliraj(6, 3);             
    
    gl.uniformMatrix3fv(GPUprogram1.u_mTrans, false, m1.lista());
    gl.uniform4fv(GPUprogram1.u_boja, [1.0, 0.0, 0.0, 1.0]);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vrhovi.length / 2);

    let m2 = new MT2D();
    m2.projekcija2D(-10, 10, -10, 10);
    m2.rotiraj(-30);                 
    m2.pomakni(4, 0);                
    m2.skaliraj(6, 3);               
    
    gl.uniformMatrix3fv(GPUprogram1.u_mTrans, false, m2.lista());
    gl.uniform4fv(GPUprogram1.u_boja, [0.0, 0.0, 1.0, 0.5]); 
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vrhovi.length / 2);

    let m3 = new MT2D();
    m3.projekcija2D(-10, 10, -10, 10);
    m3.zrcaliNaY();                    
    m3.pomakni(3, 0);                  
    m3.rotiraj(75);                   
    m3.skaliraj(4, 1);               
    
    gl.uniformMatrix3fv(GPUprogram1.u_mTrans, false, m3.lista());
    gl.uniform4fv(GPUprogram1.u_boja, [0.0, 1.0, 0.0, 0.7]); 
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vrhovi.length / 2);
  }

  napuniSpremnike();
  iscrtaj();
}