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

  // Button
  var clearButton = document.getElementById("clear");

  // Shader program
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Elements
  var clearMenu = document.getElementById("clearMenu");
  var clearButton = document.getElementById("clearButton");
  var colorMenu = document.getElementById("colorMenu");

  var max_verts = 50;
  var index = 0;
  var numPoints = 0;
  var colors = [
    vec4(0.0, 0.0, 0.0, 0.0),
    vec4(1.0, 1.0, 0.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0),
    vec4(0.3921, 0.5843, 0.9294, 1.0),
    vec4(0.3232, 0.5654, 0.9123, 1.0),
    vec4(0.3232, 0.5654, 0.9123, 1.0),
  ];

  // Buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts * sizeof["vec2"], gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Color Buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts * sizeof["vec4"], gl.STATIC_DRAW);

  var color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color);

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
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      index * sizeof["vec4"],
      flatten(colors[colorMenu.selectedIndex])
    );
    numPoints = Math.max(numPoints, ++index);
    index %= max_verts;
    window.requestAnimationFrame(render, canvas);
  });

  clearButton.addEventListener("click", function () {
    clear_index = clearMenu.selectedIndex;
    var bgcolor = colors[clearMenu.selectedIndex];
    gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    numPoints = 0;
    index = 0;
    window.requestAnimationFrame(render, canvas);
  });

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, numPoints);
  }

  render();
};
