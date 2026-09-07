/** Dreamwave Galaxy by VoXelo / Techartist, adapted from the HTML supplied by
 * the user: https://codepen.io/VoXelo/pen/xbRwmqE.
 * Same spherical particles, color attributes, twinkle, cross rays and additive
 * blending, ported from Three.js to WebGL. Van Gogh palette, gentler pulsation,
 * fewer particles on mobile, and scroll camera replace rainbow + OrbitControls.
 */
const VERTEX = `
precision mediump float;
uniform float uTime, uPixelRatio, uAspect, uTravel;
uniform vec2 uPointer;
attribute vec3 position, customColor;
attribute float size, phase, twinkleSpeed;
varying vec3 vColor;
varying float vTwinkle;
void main(){
 vColor=customColor;
 float t=uTime*twinkleSpeed+phase;
 float wave=sin(t)*.5+.5;
 float flash=pow(wave,5.)*.65;
 float basePulse=.35+wave*.3;
 vTwinkle=basePulse+flash;
 float a=uTime*.007+uPointer.x*.045;
 float b=uPointer.y*.035;
 vec3 p=position;
 p.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.xz;
 p.yz=mat2(cos(b),-sin(b),sin(b),cos(b))*p.yz;
 vec3 mvPosition=p-vec3(0.,uTravel*26.,100.-uTravel*90.);
 float f=1.73205;
 gl_Position=vec4(mvPosition.x*f/uAspect,mvPosition.y*f,-1.0001*mvPosition.z-.20001,-mvPosition.z);
 float dist=length(mvPosition);
 gl_PointSize=clamp(size*uPixelRatio*(600./max(dist,1.))*vTwinkle,1.,65.);
}`;
const FRAGMENT = `
precision mediump float;
varying vec3 vColor;
varying float vTwinkle;
void main(){
 vec2 uv=gl_PointCoord.xy*2.-1.;
 float d=length(uv);
 float rayX=exp(-abs(uv.x)*30.)*exp(-abs(uv.y));
 float rayY=exp(-abs(uv.y)*30.)*exp(-abs(uv.x));
 float core=exp(-d*15.);
 float halo=exp(-d*4.)*.5;
 float alpha=(rayX+rayY)*.8+core+halo;
 alpha*=1.-smoothstep(.1,1.,d);
 if(alpha<.02) discard;
 vec3 finalColor=mix(vColor,vec3(1.,.97,.85),core*.9);
 gl_FragColor=vec4(finalColor,alpha*min(vTwinkle,1.3)*.8);
}`;

export function createDreamwaveStars(gl: WebGLRenderingContext, mobile: boolean) {
  const shaders: WebGLShader[] = [];
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source); gl.compileShader(shader); shaders.push(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  const buffer = gl.createBuffer();
  const count = mobile ? 1800 : 6000;
  const data = new Float32Array(count * 9);
  const palette = ['eac45d','f7e3a1','eee9cf','83b3ce','467eb8','c2caac'].map(hex => [0,2,4].map(n => parseInt(hex.slice(n,n+2),16)/255));
  let seed = 49010160;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  for (let i=0; i<count; i++) {
    const r=800*Math.cbrt(random()), theta=random()*Math.PI*2, phi=Math.acos(2*random()-1);
    const color=palette[Math.floor(random()*palette.length)];
    const offset=i*9;
    data.set([r*Math.sin(phi)*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta),r*Math.cos(phi),...color,
      Math.pow(random(),7)*17+.9,random()*Math.PI*2,random()*.7+.2],offset);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  const attributes = ['position','customColor','size','phase','twinkleSpeed'].map((name,i)=>({location:gl.getAttribLocation(program,name),size:i<2?3:1,offset:[0,3,6,7,8][i]*4}));
  const time=gl.getUniformLocation(program,'uTime'),ratio=gl.getUniformLocation(program,'uPixelRatio'),aspect=gl.getUniformLocation(program,'uAspect'),pointer=gl.getUniformLocation(program,'uPointer'),travel=gl.getUniformLocation(program,'uTravel');
  return {
    draw(elapsed: number, x: number, y: number, progress: number, pixelRatio: number) {
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) return;
      gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      for (const attribute of attributes) { gl.enableVertexAttribArray(attribute.location); gl.vertexAttribPointer(attribute.location,attribute.size,gl.FLOAT,false,36,attribute.offset); }
      gl.uniform1f(time,elapsed); gl.uniform1f(ratio,pixelRatio); gl.uniform1f(aspect,gl.canvas.width/gl.canvas.height);
      gl.uniform2f(pointer,x,y); gl.uniform1f(travel,progress);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA,gl.ONE); gl.depthMask(false);
      gl.drawArrays(gl.POINTS,0,count);
      gl.disable(gl.BLEND);
      for (const attribute of attributes) gl.disableVertexAttribArray(attribute.location);
    },
    dispose() { gl.deleteBuffer(buffer); gl.deleteProgram(program); shaders.forEach(shader=>gl.deleteShader(shader)); }
  };
}
