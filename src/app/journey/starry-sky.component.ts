import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, effect, viewChild } from '@angular/core';
import { createPaintingFlow, PaintingFlow } from './painting-flow';

@Component({
  selector: 'app-starry-sky',
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styles: [`
    :host{display:block;position:fixed;inset:0;z-index:-2;pointer-events:none;overflow:hidden;background:#07152b}
    :host::before{content:'';position:absolute;inset:0;background:url('/art/starry-night.jpg') center 35%/cover no-repeat;filter:saturate(1.45) contrast(1.08)}
    :host::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#07152b12,#07152b30 60%,#07152b70)}
    canvas{position:absolute;inset:0;display:block;width:100%;height:100%;opacity:0;filter:saturate(1.45) contrast(1.08)}
    @media(max-width:600px){:host::before{background-position:67% top}}
  `]
})
export class StarrySkyComponent {
  readonly paused = input(false);
  readonly progress = input(0);
  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private synchronize?: () => void;

  constructor() {
    effect(() => {
      // Track both inputs even before the image has finished loading.
      this.paused(); this.progress();
      this.synchronize?.();
    });
    afterNextRender(() => this.initialize());
  }

  private initialize() {
    if (typeof WebGLRenderingContext === 'undefined') return;
    const canvas = this.canvas()!.nativeElement;
    let gl: WebGLRenderingContext | null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false, antialias: false, depth: false, stencil: false,
        powerPreference: 'low-power', preserveDrawingBuffer: false
      });
    } catch { return; }
    if (!gl) return;

    const image = new Image();
    let painter: PaintingFlow | undefined;
    let frame = 0, elapsed = 0, previous = 0;
    let destroyed = false, contextLost = false, failed = false;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const fallback = () => { stop(); canvas.style.opacity = '0'; };
    const shouldRun = () => !destroyed && !contextLost && !failed && !!painter
      && !document.hidden && !this.paused() && this.progress() > .57;
    const draw = () => {
      painter?.draw(elapsed, canvas.clientWidth, canvas.clientHeight);
    };
    const tick = (now: number) => {
      frame = 0;
      if (!shouldRun()) { previous = 0; return; }
      const delta = now - previous;
      if (delta >= 1000 / 30) {
        elapsed += Math.min((delta - delta % (1000 / 30)) / 1000, .1);
        previous = now - delta % (1000 / 30);
        try { draw(); }
        catch { failed = true; fallback(); return; }
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (!shouldRun()) { stop(); return; }
      if (!frame) { previous = performance.now(); frame = requestAnimationFrame(tick); }
    };
    const resize = () => {
      if (destroyed || contextLost || failed || !painter) return;
      const width = Math.max(1, canvas.clientWidth), height = Math.max(1, canvas.clientHeight);
      // Mediterranean Drift's DPR=1/FPS=30 caps, plus a large-screen fill-rate cap.
      const ratio = Math.min(window.devicePixelRatio || 1, 1, 1440 / width, 1440 / height);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      try { draw(); canvas.style.opacity = '1'; }
      catch { failed = true; fallback(); }
      sync();
    };
    const prepare = () => {
      if (destroyed || contextLost || !image.naturalWidth) return;
      try {
        painter?.dispose();
        painter = createPaintingFlow(gl, image);
        failed = false;
        resize();
      } catch { failed = true; fallback(); }
    };
    const lost = (event: Event) => {
      event.preventDefault(); contextLost = true;
      // Lost-context objects are invalid; WebGL has already released them.
      // Never delete those handles after restoration, against the new context.
      painter = undefined;
      fallback();
    };
    const restored = () => { contextLost = false; elapsed = 0; prepare(); };
    const visibility = () => sync();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : undefined;
    observer?.observe(canvas);
    this.synchronize = sync;
    image.onload = prepare;
    image.onerror = () => { failed = true; fallback(); };
    image.src = '/art/starry-night.jpg';
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', sync);
    document.addEventListener('visibilitychange', visibility);
    this.destroyRef.onDestroy(() => {
      destroyed = true; stop(); observer?.disconnect();
      this.synchronize = undefined;
      image.onload = null; image.onerror = null;
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pagehide', stop); window.removeEventListener('pageshow', sync);
      document.removeEventListener('visibilitychange', visibility);
      painter?.dispose();
    });
  }
}
