/**
 * @param {Element} canvas. The canvas element to create a context from.
 * @return {WebGLRenderingContext} The created context.
 */
function setupWebGL(canvas) {
  return WebGLUtils.setupWebGL(canvas);
}

// Bounce properties
var displ = 0.0;
var direction = 1.0;

// Shape properties
var points = [vec3(0, 0, 0)];
var colors = [vec3(1, 1, 1)];
var radius = 0.2;
var numberOfSides = 2500;

for (var i = 0; i <= numberOfSides; i++) {
  var point = vec2(
    radius * Math.cos((2 * Math.PI * i) / numberOfSides),
    radius * Math.sin((2 * Math.PI * i) / numberOfSides)
  );
  var color = vec3(1, 1, 1);
  points.push(point);
  colors.push(color);
}

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

  // Location
  var displLoc = gl.getUniformLocation(program, "displ");
  gl.uniform1f(displLoc, displ);

  function render() {
    setTimeout(function () {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);

      if (displ > 0.6 || displ < -0.6) {
        direction *= -1.0;
      }

      displ += direction * 0.05;
      gl.uniform1f(displLoc, displ);
      requestAnimFrame(render);
    }, 100);
  }

  render();
};
