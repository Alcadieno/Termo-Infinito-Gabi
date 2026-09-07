/**
 * Painting advection based on the Gaussian tangential/radial pressure field in
 * Mediterranean Drift V3 (WebGL), Luis Lessrain, supplied by the user.
 * https://codepen.io/luis-lessrain/pen/emgBwPj
 * We advect the original painting instead of drawing wind particles. Two
 * staggered phases reset invisibly, avoiding cumulative texture blur/stretching.
 */
const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * .5 + .5, .5 - position.y * .5);
  gl_Position = vec4(position, 0., 1.);
}`;

const FRAGMENT = `
precision highp float;
uniform sampler2D painting;
uniform vec2 cropScale;
uniform vec2 cropOffset;
uniform float imageAspect;
uniform float time;
varying vec2 uv;

// Same tangential flow + radial inflow and Gaussian falloff as computeCell.
vec2 pressure(vec2 p, vec2 center, float radius, float spin, float strength) {
  vec2 delta = (p - center) * vec2(imageAspect, 1.);
  float d2 = dot(delta, delta) + .0001;
  float d = sqrt(d2);
  float mag = strength * (d / radius) * exp(-d2 / (2. * radius * radius)) * .20;
  vec2 tangent = vec2(-delta.y, delta.x) / d;
  vec2 radial = delta / d;
  return spin * mag * (tangent - radial * .08) / vec2(imageAspect, 1.);
}

void main() {
  vec2 p = uv * cropScale + cropOffset;
  // Centers are anchored to the painting, so mobile cropping cannot move them.
  vec2 wind = pressure(p, vec2(.515,.365), .135, 1., 1.);
  wind += pressure(p, vec2(.675,.455), .085, -1., .72);
  wind += pressure(p, vec2(.895,.155), .083, 1., .48);
  wind += pressure(p, vec2(.610,.085), .055, -1., .30);
  wind += pressure(p, vec2(.715,.230), .042, 1., .28);
  wind += pressure(p, vec2(.350,.505), .060, 1., .34);

  // Carry the central current into the left ribbons and the painted star halos.
  // Fade before the central vortex so the established right-hand flow is intact.
  if (p.x < .48) {
    vec2 leftWind = pressure(p, vec2(.125,.255), .125, 1., .52);
    leftWind += pressure(p, vec2(.090,.615), .085, 1., .34);
    leftWind += pressure(p, vec2(.108,.048), .050, 1., .32);
    leftWind += pressure(p, vec2(.052,.446), .033, 1., .27);
    leftWind += pressure(p, vec2(.130,.475), .046, 1., .36);
    leftWind += pressure(p, vec2(.245,.178), .046, 1., .25);
    wind += leftWind * (1. - smoothstep(.32, .48, p.x));
  }

  // Keep the village, hills, canvas edges and the cypress silhouette still.
  float horizon = .73 - .22 * p.x;
  float sky = 1. - smoothstep(horizon - .075, horizon, p.y);
  float trunkWidth = .018 + .19 * pow(max(p.y, 0.), 1.7);
  float cypress = smoothstep(trunkWidth, trunkWidth + .035, abs(p.x - .215));
  // The old symmetric feather also froze the sky and yellow halos to the left.
  // Follow that narrower side of the tree without altering its right-hand mask.
  if (p.x < .215) {
    float leftWidth = min(trunkWidth, .065);
    cypress = smoothstep(leftWidth, leftWidth + .014, .215 - p.x);
  }
  cypress = mix(1., cypress, smoothstep(.045, .09, p.y));
  float edge = smoothstep(0., .045, min(min(p.x, 1.-p.x), min(p.y, 1.-p.y)));
  wind *= sky * cypress * edge;

  float phaseA = fract(time / 9.);
  float phaseB = fract(time / 9. + .5);
  float weight = 1. - abs(2. * phaseA - 1.);
  vec2 a = p - wind * (phaseA - .5) * .65;
  vec2 b = p - wind * (phaseB - .5) * .65;
  vec3 color = mix(texture2D(painting, b).rgb, texture2D(painting, a).rgb, weight);
  gl_FragColor = vec4(color, 1.);
}`;

export interface PaintingFlow {
  draw(seconds: number, width: number, height: number): void;
  dispose(): void;
}

export function createPaintingFlow(gl: WebGLRenderingContext, image: HTMLImageElement): PaintingFlow {
  const shaders: WebGLShader[] = [];
  const program = gl.createProgram();
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  const dispose = () => {
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteProgram(program); gl.deleteBuffer(buffer); gl.deleteTexture(texture);
  };
  try {
    if (!program || !buffer || !texture) throw new Error('Painting resources unavailable');
    for (const [type, source] of [[gl.VERTEX_SHADER, VERTEX], [gl.FRAGMENT_SHADER, FRAGMENT]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Painting shader unavailable');
      shaders.push(shader);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Painting shader compilation failed');
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Painting shader linking failed');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (gl.getError() !== gl.NO_ERROR) throw new Error('Painting texture upload failed');
    const position = gl.getAttribLocation(program, 'position');
    const time = gl.getUniformLocation(program, 'time');
    const scale = gl.getUniformLocation(program, 'cropScale');
    const offset = gl.getUniformLocation(program, 'cropOffset');
    const sampler = gl.getUniformLocation(program, 'painting');
    const aspectUniform = gl.getUniformLocation(program, 'imageAspect');
    const imageAspect = image.naturalWidth / image.naturalHeight;
    return {
      draw(seconds, width, height) {
        const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
        const sx = width / (image.naturalWidth * cover);
        const sy = height / (image.naturalHeight * cover);
        const mobile = width <= 600;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(sampler, 0); gl.uniform1f(time, seconds);
        gl.uniform1f(aspectUniform, imageAspect);
        gl.uniform2f(scale, sx, sy);
        // Match the CSS fallback exactly: center 35%, or 67% top on mobile.
        gl.uniform2f(offset, (1 - sx) * (mobile ? .67 : .5), (1 - sy) * (mobile ? 0 : .35));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
      dispose
    };
  } catch (error) { dispose(); throw error; }
}
