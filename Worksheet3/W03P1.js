/**
 * @param {Element} canvas. The canvas element to create a context from.
 * @return {WebGLRenderingContext} The created context.
 */
function setupWebGL(canvas) {
  return WebGLUtils.setupWebGL(canvas);
}

var vertices = [
  vec3(0.0, 0.0, 1.0),
  vec3(0.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 0.0, 1.0),
  vec3(0.0, 0.0, 0.0),
  vec3(0.0, 1.0, 0.0),
  vec3(1.0, 1.0, 0.0),
  vec3(1.0, 0.0, 0.0),
];

var wire_indices = new Uint32Array([
  0, 1, 1, 2, 2, 3, 3, 0, // front     
  2, 3, 3, 7, 7, 6, 6, 2, // right     
  0, 3, 3, 7, 7, 4, 4, 0, // down     
  1, 2, 2, 6, 6, 5, 5, 1, // up     
  4, 5, 5, 6, 6, 7, 7, 4, // back     
  0, 1, 1, 5, 5, 4, 4, 0  // left   
]);

var colors = [vec3(1.0, 0.0, 0.0),
              vec3(0.0, 1.0, 0.0),
              vec3(0.0, 0.0, 1.0),
              vec3(1.0, 0.0, 0.0),
              vec3(0.0, 1.0, 0.0),
              vec3(0.0, 0.0, 1.0),
              vec3(1.0, 0.0, 0.0),
              vec3(0.0, 1.0, 0.0)
            ];

window.onload = function init() {
  // Canvas
  var canvas = document.getElementById("c");
  var gl = setupWebGL(canvas);
  var ext = gl.getExtension('OES_element_index_uint');
  if (!ext) { console.log('Warning: Unable to use an extension'); }

  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

  // Program
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Buffer
  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(wire_indices), gl.STATIC_DRAW);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Color Buffer
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  var color = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0); // Size 3 due to vec3
  gl.enableVertexAttribArray(color);

  // Camera extrinsics
  var eye = vec3(0.5, 0.5, 0.5);
  var at = vec3(0, 0, 0);
  var up = vec3(1, 0, 0);

  var V = lookAt(eye, at, up);
  var VLoc = gl.getUniformLocation(program, "view");
  gl.uniformMatrix4fv(VLoc, false, flatten(V));

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.LINES, wire_indices.length, gl.UNSIGNED_INT, 0);
  };

  render()
};
