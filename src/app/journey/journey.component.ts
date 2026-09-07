import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { MAP_ROUTE, ROUTE_END, ROUTE_START } from './map-route';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (start: number, end: number, value: number) => { const t = clamp((value - start) / (end - start)); return t * t * (3 - 2 * t); };

@Component({
  selector: 'app-journey',
  templateUrl: './journey.html',
  styleUrls: ['./journey.css', './journey-map.css', './journey-responsive.css']
})
export class JourneyComponent {
  readonly paused = input(false);
  readonly play = output<void>();
  readonly skyEntered = output<boolean>();
  readonly altitude = output<number>();
  readonly phase = signal(0);
  readonly percentage = signal(0);
  readonly route = MAP_ROUTE;
  readonly origin = ROUTE_START;
  readonly destination = ROUTE_END;
  readonly initialWorld = `translate(${1440 * .68 - ROUTE_START.x * 310} ${900 * .54 - ROUTE_START.y * 310}) scale(310)`;
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly chapter = viewChild<ElementRef<HTMLElement>>('chapter');
  readonly map = viewChild<ElementRef<SVGSVGElement>>('map');
  readonly world = viewChild<ElementRef<SVGGElement>>('world');
  readonly trail = viewChild<ElementRef<SVGPathElement>>('trail');
  readonly traveler = viewChild<ElementRef<SVGGElement>>('traveler');
  readonly originPin = viewChild<ElementRef<SVGGElement>>('originPin');
  readonly destinationPin = viewChild<ElementRef<SVGGElement>>('destinationPin');
  private destroyRef = inject(DestroyRef);
  private frame = 0;
  private sky = false;

  constructor() {
    afterNextRender(() => {
      if (!this.trail()?.nativeElement.getTotalLength) return;
      const update = () => { cancelAnimationFrame(this.frame); this.frame = requestAnimationFrame(() => this.render()); };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      this.render();
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(this.frame);
        window.removeEventListener('scroll', update); window.removeEventListener('resize', update);
      });
    });
  }

  begin() { this.scrollTo(.17); }
  travelTo(chapter: number) { this.scrollTo([0, .50, .76][chapter]); }

  private scrollTo(progress: number) {
    const element = this.chapter()?.nativeElement;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * progress, behavior: this.paused() ? 'instant' : 'smooth' });
  }

  private render() {
    const section = this.chapter()!.nativeElement;
    const w = window.innerWidth, h = window.innerHeight;
    const progress = clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - h));
    const routeProgress = ease(.145, .455, progress);
    const rise = ease(.565, .86, progress);
    const phase = progress < .18 ? 0 : progress < .455 ? 1 : progress < .62 ? 2 : progress < .815 ? 3 : 4;
    this.phase.set(phase); this.percentage.set(Math.round(progress * 100));
    this.altitude.emit(progress);
    const sky = progress > .635;
    if (sky !== this.sky) { this.sky = sky; this.skyEntered.emit(sky); }
    const style = this.host.nativeElement.style;
    style.setProperty('--intro', `${1 - ease(.10, .18, progress)}`);
    style.setProperty('--intercity', `${ease(.17, .23, progress) * (1 - ease(.40, .46, progress))}`);
    style.setProperty('--address', `${ease(.445, .50, progress) * (1 - ease(.585, .63, progress))}`);
    style.setProperty('--ascent-copy', `${ease(.61, .675, progress) * (1 - ease(.76, .83, progress))}`);
    style.setProperty('--arrival', `${ease(.815, .91, progress)}`);
    style.setProperty('--ground', `${1 - ease(.665, .855, progress)}`);
    style.setProperty('--mist', `${ease(.59, .69, progress) * (1 - ease(.79, .9, progress))}`);
    style.setProperty('--origin-map', `${1 - ease(.12, .23, progress)}`);
    style.setProperty('--destination-map', `${ease(.43, .53, progress)}`);
    style.setProperty('--overview', `${ease(.07, .17, progress) * (1 - ease(.51, .56, progress))}`);
    style.setProperty('--cloud-y', `${(-.75 + rise * 1.6) * h}px`);
    style.setProperty('--ground-transform', this.paused() ? 'none' : `translateY(${rise * h * .69}px) scale(${1 - rise * .48}) rotateX(${rise * 55}deg)`);
    style.setProperty('--route-progress', `${routeProgress}`);
    style.setProperty('--progress', `${progress}`);
    const trail = this.trail()!.nativeElement;
    const length = trail.getTotalLength();
    const point = trail.getPointAtLength(length * routeProgress);
    trail.style.strokeDasharray = `${length}`;
    trail.style.strokeDashoffset = `${length * (1 - routeProgress)}`;
    this.map()!.nativeElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const neighborhoodZoom = Math.max(w / 4.7, h / 3.8);
    const countryZoom = Math.max(.52, Math.min(w / 1550, h / 1100));
    const zoomOut = ease(.055, .225, progress);
    const zoomIn = ease(.405, .565, progress);
    const logZoom = Math.log(neighborhoodZoom) * (1 - zoomOut) + Math.log(countryZoom) * zoomOut;
    const zoom = this.paused() ? (phase === 1 ? countryZoom : neighborhoodZoom) : Math.exp(logZoom * (1 - zoomIn) + Math.log(neighborhoodZoom * 1.18) * zoomIn);
    const camera = this.paused() ? (phase === 0 ? ROUTE_START : phase === 1 ? trail.getPointAtLength(length * .5) : ROUTE_END) : point;
    const anchorX = w < 700 ? .52 : .68;
    const anchorY = w < 700 ? .70 : .54;
    this.world()!.nativeElement.setAttribute('transform', `translate(${w * anchorX - camera.x * zoom} ${h * anchorY - camera.y * zoom}) scale(${zoom})`);
    this.traveler()!.nativeElement.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${1 / zoom})`);
    this.originPin()!.nativeElement.setAttribute('transform', `translate(${ROUTE_START.x} ${ROUTE_START.y}) scale(${1 / zoom})`);
    this.destinationPin()!.nativeElement.setAttribute('transform', `translate(${ROUTE_END.x} ${ROUTE_END.y}) scale(${1 / zoom})`);

  }
}
