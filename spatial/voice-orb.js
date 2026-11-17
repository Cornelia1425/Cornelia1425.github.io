const VERT = `#version 300 es
precision highp float;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform float uTime;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uPerlinTexture;
in vec2 vUv;
out vec4 outColor;
const float PI = 3.14159265358979323846;
bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b, bool reverseGradient, float softness, out vec4 color) {
  vec2 p = polarUv - polarCenter;
  float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
  float edge = smoothstep(1.0, 1.0 - softness, oval);
  if (edge > 0.0) {
    float gradient = reverseGradient ? (1.0 - (p.x / a + 1.0) / 2.0) : ((p.x / a + 1.0) / 2.0);
    color = vec4(vec3(gradient), 0.8 * edge);
    return true;
  }
  return false;
}
vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
  if (grayscale < 0.33) return mix(color1, color2, grayscale * 3.0);
  if (grayscale < 0.66) return mix(color2, color3, (grayscale - 0.33) * 3.0);
  return mix(color3, color4, (grayscale - 0.66) * 3.0);
}
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
    u.y
  );
  return 0.5 + 0.5 * n;
}
float sharpRing(vec2 uv, float theta, float time) {
  vec2 noiseCoord = vec2(theta / (2.0 * PI), time * 0.1) * 5.0;
  float noise = (noise2D(noiseCoord) - 0.5) * 4.0;
  return 1.0 + noise * 0.5 * 1.5;
}
float smoothRing(vec2 uv, float time) {
  float angle = atan(uv.y, uv.x);
  if (angle < 0.0) angle += 2.0 * PI;
  float noise = (noise2D(vec2(angle / (2.0 * PI), time * 0.1) * 6.0) - 0.5) * 8.0;
  return 0.9 + noise * 0.3;
}
void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float radius = length(uv);
  float theta = atan(uv.y, uv.x);
  if (theta < 0.0) theta += 2.0 * PI;
  vec4 color = vec4(1.0);
  float originalCenters[7] = float[7](0.0, 0.5 * PI, 1.0 * PI, 1.5 * PI, 2.0 * PI, 2.5 * PI, 3.0 * PI);
  float centers[7];
  for (int i = 0; i < 7; i++) centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
  vec4 ovalColor;
  for (int i = 0; i < 7; i++) {
    float noise = texture(uPerlinTexture, vec2(mod(centers[i] + uTime * 0.05, 1.0), 0.5)).r;
    float a = noise * 1.5;
    float b = noise * 4.5;
    float distTheta = abs(theta - centers[i]);
    if (distTheta > PI) distTheta = 2.0 * PI - distTheta;
    if (drawOval(vec2(distTheta, radius), vec2(0.0), a, b, i % 2 == 1, 0.4, ovalColor)) {
      color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
      color.a = max(color.a, ovalColor.a);
    }
  }
  float ringAlpha = max(radius >= sharpRing(uv, theta, uTime) ? 0.3 : 0.0, smoothstep(smoothRing(uv, uTime) - 0.05, smoothRing(uv, uTime) + 0.05, radius) * 0.25);
  color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - vec3(1.0) * ringAlpha);
  float tone = mix(color.r, 0.33, 0.2);
  color.rgb = colorRamp(tone, vec3(0.0), uColor1, uColor2, vec3(1.0));
  if (radius > 1.0) color.a = 0.0;
  outColor = color;
}
`;

const linear = hex => {
  const value = hex.replace('#', '');
  return [0, 2, 4].map(index => (parseInt(value.slice(index, index + 2), 16) / 255) ** 2.2);
};

export function mountVoiceOrb(canvas) {
  canvas.dataset.orb = 'start';
  const gl = canvas.getContext('webgl2', { alpha: true, depth: false, stencil: false, premultipliedAlpha: false });
  if (!gl) { canvas.dataset.orb = 'no-gl'; return; }
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) canvas.dataset.orb = gl.getShaderInfoLog(shader);
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) canvas.dataset.orb = gl.getProgramInfoLog(program);
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const offsets = new Float32Array(7).map(() => Math.random() * Math.PI * 2);
  gl.uniform1fv(gl.getUniformLocation(program, 'uOffsets'), offsets);
  gl.uniform3fv(gl.getUniformLocation(program, 'uColor1'), linear('#e21b1b'));
  gl.uniform3fv(gl.getUniformLocation(program, 'uColor2'), linear('#e4e4e4'));
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));
  gl.uniform1i(gl.getUniformLocation(program, 'uPerlinTexture'), 0);
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    canvas.dataset.orb = 'ready';
  };
  image.onerror = () => { canvas.dataset.orb = 'noise-missing'; };
  image.src = './vendor/perlin-noise.png';
  const resize = () => {
    const size = Math.min(256, Math.round((canvas.clientWidth || 48) * devicePixelRatio));
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
      gl.viewport(0, 0, size, size);
    }
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const started = performance.now();
  const draw = now => {
    resize();
    gl.uniform1f(gl.getUniformLocation(program, 'uTime'), (now - started) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!reduced) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
