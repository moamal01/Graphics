/**
 * @param {Element} canvas. The canvas element to create a context from.
 * @return {WebGLRenderingContext} The created context.
 */
function setupWebGL(canvas) {
  return WebGLUtils.setupWebGL(canvas);
}

window.onload = function init() {
  // Canvas
  var canvas = document.getElementById("c");
  var gl = setupWebGL(canvas);
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  // Program
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var max_verts = 50;
  var index = 0;
  var numPoints = 0;

  // Buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts * sizeof["vec2"], gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Click listener
  canvas.addEventListener("click", function (ev) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var bbox = ev.target.getBoundingClientRect();
    var mousepos = vec2(
      (2 * (ev.clientX - bbox.left)) / canvas.width - 1,
      (2 * (canvas.height - ev.clientY + bbox.top - 1)) / canvas.height - 1
    );
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      index * sizeof["vec2"],
      flatten(mousepos)
    );
    numPoints = Math.max(numPoints, ++index);
    index %= max_verts;
    window.requestAnimationFrame(render, canvas);
  });

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, numPoints);
  }

  render();
};
