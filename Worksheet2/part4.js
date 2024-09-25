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
  var circleMode = document.getElementById("circleMode");

  // Variables
  var drawingMode = "points";
  var trianglePoints = [];
  var triangleColors = [];
  var triangleCounter = 0;

  var circlePoints = [];
  var circleColors = [];
  var circleCounter = 0;
  var numberOfSides = 100;

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
    } else if (drawingMode == "triangles") {
      if (triangleCounter < 2) {
        let points_array = [];
        add_point(points_array, mousepos, 0.03);

        trianglePoints.push(mousepos);
        triangleColors.push(colors[colorMenu.selectedIndex]);
        triangleCounter++;

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
        let points_array = [];
        add_point(points_array, mousepos, 0.03);

        trianglePoints.push(mousepos);
        triangleColors.push(colors[colorMenu.selectedIndex]);
        index -= 12;
        numPoints -= 12;

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec2"],
          flatten(trianglePoints)
        );

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec4"],
          flatten(triangleColors)
        );

        numPoints += 3;
        index += 3;
        trianglePoints = [];
        triangleColors = [];
        triangleCounter = 0;
        window.requestAnimationFrame(render, canvas);
      }
    } else {
      // Circle
      if (circleCounter < 1) {
        let points_array = [];
        add_point(points_array, mousepos, 0.04);
        circlePoints.push(mousepos);
        circleColors.push(colors[colorMenu.selectedIndex]);
        circleCounter++;

        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec2"],
          flatten(points_array)
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        let sameColors = [];
        for (let i = 0; i < 6; i++) {
          sameColors.push(colors[colorMenu.selectedIndex]);
        }
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec4"],
          flatten(sameColors)
        );
        index += 6;
        numPoints += 6;
        window.requestAnimationFrame(render, canvas);
      } else {
        let points_array = [];
        add_point(points_array, mousepos, 0.03);

        circlePoints.push(mousepos);
        circleColors.push(colors[colorMenu.selectedIndex]);
        index -= 6;
        numPoints -= 6;

        var center = circlePoints[0];
        var vecBetweenPoints = vec2(
          mousepos[0] - center[0],
          mousepos[1] - center[1]
        );
        var radius = length(vecBetweenPoints);
        for (var i = 0; i <= numberOfSides; i++) {
          var point = vec2(
            radius * Math.cos((2 * Math.PI * i) / numberOfSides),
            radius * Math.sin((2 * Math.PI * i) / numberOfSides)
          );
          circlePoints.push(point);
          circlePoints.push(circlePoints[0]);
          circlePoints.push(point);
          circleColors.push(colors[colorMenu.selectedIndex]);
          circleColors.push(circleColors[0]);
          circleColors.push(colors[colorMenu.selectedIndex]);
        }
        circlePoints.pop();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec2"],
          flatten(circlePoints)
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          index * sizeof["vec4"],
          flatten(circleColors)
        );
        index += 3 * (i - 1);
        numPoints += 3 * (i - 1);
        circlePoints = [];
        circleColors = [];
        circleCounter = 0;
      }
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
  circleMode.addEventListener("click", function () {
    drawingMode = "circles";
  });

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
  }

  render();
};
