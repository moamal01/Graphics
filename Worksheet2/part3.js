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
  var pointMode = document.getElementById("pointMode");
  var triangleMode = document.getElementById("triangleMode");

  var drawingMode = "points";
  var max_verts = 1000;
  var index = 0;
  var numPoints = 0;
  var colors = [
    vec4(0.0, 0.0, 0.0, 1.0), // Black
    vec4(1.0, 0.0, 0.0, 1.0), // Red
    vec4(0.0, 1.0, 0.0, 1.0), // Green
    vec4(0.0, 0.0, 1.0, 1.0), // Blue
    vec4(1.0, 1.0, 0.0, 1.0), // Yellow
    vec4(1.0, 0.5, 0.0, 1.0), // Orange
    vec4(0.5, 0.0, 0.5, 1.0), // Purple
    vec4(0.0, 1.0, 1.0, 1.0), // Cyan
    vec4(1.0, 1.0, 1.0, 1.0), // White
    vec4(0.39, 0.58, 0.93, 1.0), // Cornflower
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

  // Draw
  function add_point(array, point, size) {
    const offset = size / 2;
    var point_coords = [
      vec2(point[0] - offset, point[1] - offset),
      vec2(point[0] + offset, point[1] - offset),
      vec2(point[0] - offset, point[1] + offset),
      vec2(point[0] - offset, point[1] + offset),
      vec2(point[0] + offset, point[1] - offset),
      vec2(point[0] + offset, point[1] + offset),
    ];
    array.push.apply(array, point_coords);
  }

  canvas.addEventListener("click", function (ev) {
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var bbox = ev.target.getBoundingClientRect();
    var mousepos = vec2(
      (2 * (ev.clientX - bbox.left)) / canvas.width - 1,
      (2 * (canvas.height - ev.clientY + bbox.top - 1)) / canvas.height - 1
    );
    if (drawingMode == "points") {
      let points_array = [];
      add_point(points_array, mousepos, 0.03);
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        index * sizeof["vec2"],
        flatten(points_array)
      );

      let colorArray = [];
      for (let i = 0; i < 6; i++) {
        colorArray.push(colors[colorMenu.selectedIndex]);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        index * sizeof["vec4"],
        flatten(colorArray)
      );
      numPoints += 6;
      index += 6;
      window.requestAnimationFrame(render, canvas);
    } else {
    }
  });

  // Clear button
  clearButton.addEventListener("click", function () {
    clear_index = clearMenu.selectedIndex;
    var bgcolor = colors[clearMenu.selectedIndex];
    gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    numPoints = 0;
    index = 0;
    window.requestAnimationFrame(render, canvas);
  });

  // Mode buttons
  pointMode.addEventListener("click", function () {
    drawingMode = "points";
  });
  triangleMode.addEventListener("click", function () {
    drawingMode = "triangles";
  });

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  }

  render();
};
