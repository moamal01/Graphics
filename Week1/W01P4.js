/**
 * @param {Element} canvas. The canvas element to create a context from.
 * @return {WebGLRenderingContext} The created context.
 */
function setupWebGL(canvas) {
  return WebGLUtils.setupWebGL(canvas);
}

var points = [vec2(0, 0.5), vec2(0.5, 0), vec2(-0.5, 0), vec2(0, -0.5)];
var colors = [
  vec3(1.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(0.0, 0.0, 1.0),
  vec3(0.0, 0.0, 1.0),
];
var theta = 0.0;

window.onload = function init() {
  // Canvas
  var canvas = document.getElementById("c");
  var gl = setupWebGL(canvas);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // HTML Program
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0); // Size 2 due to vec2
  gl.enableVertexAttribArray(vPosition);

  // Color Buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0); // Size 3 due to vec3
  gl.enableVertexAttribArray(color);

  // Theta location
  var thetaLoc = gl.getUniformLocation(program, "theta");
  gl.uniform1f(thetaLoc, "theta");

  theta += 0.1;
  gl.uniform1f(thetaLoc, theta);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.1;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimFrame(render);
  }

  render();
};
