/**
 * @param {Element} canvas. The canvas element to create a context from.
 * @return {WebGLRenderingContext} The created context.
 */
function setupWebGL(canvas) {
  return WebGLUtils.setupWebGL(canvas);
}

var pointsArray = [];
var colors = [];
var numTimesToSubdivide = 1;
var index = 0;

// Original tetrahedron
var va = vec4(0.0, 0.0, 1.0, 1);
var vb = vec4(0.0, 0.942809, -0.333333, 1);
var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
var vd = vec4(0.816497, -0.471405, -0.333333, 1);

window.onload = function init() {
  // Canvas
  var canvas = document.getElementById("c");
  var gl = setupWebGL(canvas);
  var ext = gl.getExtension('OES_element_index_uint');
  if (!ext) { console.log('Warning: Unable to use an extension'); }

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  // Buttons
  var increaseSubDivs = document.getElementById("+");
  var decreaseSubDivs = document.getElementById("-");

  // Initial "Sphere"
  tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

  // Program
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  // Buffer
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Color Buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color);

  function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
  }

  function divideTriangle(a, b, c, count) {
    if (count > 0) {
      var ab = normalize(mix(a, b, 0.5), true);
      var ac = normalize(mix(a, c, 0.5), true);
      var bc = normalize(mix(b, c, 0.5), true);

      divideTriangle(a, ab, ac, count - 1);
      divideTriangle(ab, b, bc, count - 1);
      divideTriangle(bc, c, ac, count - 1);
      divideTriangle(ab, bc, ac, count - 1);
  }
  else {
      triangle(a, b, c);
    }
  }

  function triangle(a, b, c){
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
    let color1 = vec4(0.5 * a[0] + 0.5, 0.5 * a[1] + 0.5, 0.5 * a[2] + 0.5, 0.5 * a[3] + 0.5);
    let color2 = vec4(0.5 * b[0] + 0.5, 0.5 * b[1] + 0.5, 0.5 * b[2] + 0.5, 0.5 * b[3] + 0.5);
    let color3 = vec4(0.5 * c[0] + 0.5, 0.5 * c[1] + 0.5, 0.5 * c[2] + 0.5, 0.5 * c[3] + 0.5);
    colors.push(color1);
    colors.push(color2);
    colors.push(color3);
  }

  // Button actions
  increaseSubDivs.addEventListener("click", function () {
    pointsArray = [];
    colors = [];

    if (numTimesToSubdivide > 8) {
      console.log("Too many subdivisions");
    } else {
      numTimesToSubdivide++;
      tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
  
      // Rebind the buffers and upload the updated data
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  
      render();
    }
  });

  decreaseSubDivs.addEventListener("click", function () {
    pointsArray = [];
    colors = [];

    if (numTimesToSubdivide < 2) {
      console.log("Too few subdivisions");
    } else {
      numTimesToSubdivide--;
      tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
  
      // Rebind the buffers and upload the updated data
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  
      render();
    }
  });

  // Camera extrinsics
  var eye = vec3(0.0, 0.0, 7);
  var at = vec3(0.0, 0.0, 0);
  var up = vec3(1, 0, 0);

  var V = lookAt(eye, at, up);
  var VLoc = gl.getUniformLocation(program, "view");
  gl.uniformMatrix4fv(VLoc, false, flatten(V));

  // Projection matrix
  var P = perspective(45, canvas.width / canvas.height, 0.1, 100);
  var PLoc = gl.getUniformLocation(program, "p_matrix");
  gl.uniformMatrix4fv(PLoc, false, flatten(P));

  var MLoc = gl.getUniformLocation(program, "m_matrix");

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Identity model
    var M = mat4();
    gl.uniformMatrix4fv(MLoc, false, flatten(M));
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
  };

  render()
};
