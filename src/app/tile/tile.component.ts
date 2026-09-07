import { Component, Input, HostBinding, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tile-inner">
      <div class="front">{{ letter }}</div>
      <div class="back">{{ letter }}</div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 47px;
      height: 50px;
      margin: 4px;
      perspective: 900px;
    }

    .tile-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.6s ease; /* Flip mais lento */
    }

    .front, .back {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border-radius: 5px;
      border: 1.5px solid #213635;
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:24px;text-transform:uppercase;
      backface-visibility: hidden;
    }

    .front {
      background: #111;
      color: white;
    }

    .back {
      transform: rotateX(180deg);
      background: #111;
      color: white;
    }

    /* ---- ESTADOS ---- */
    :host(.correct) .back { background:#6aaa64; border-color:#6aaa64; color:white; }
    :host(.present) .back { background:#c9b458; border-color:#c9b458; color:white; }
    :host(.absent)  .back { background:#787c7e; border-color:#787c7e; color:white; }

    /* Também aplica cor na face frontal para evitar "sumir" a letra */
    :host(.correct) .front { background:#6aaa64; border-color:#6aaa64; color:white; }
    :host(.present) .front { background:#c9b458; border-color:#c9b458; color:white; }
    :host(.absent)  .front { background:#787c7e; border-color:#787c7e; color:white; }

    /* ---- FLIP ---- */
    :host(.flip) .tile-inner { transform: rotateX(180deg); }

    /* ---- SHAKE ---- */
    :host(.shake) .tile-inner { animation: shake 0.4s ease; }
    @keyframes shake {
      0% { transform: translateX(0); }
      25% { transform: translateX(-6px); }
      50% { transform: translateX(6px); }
      75% { transform: translateX(-6px); }
      100% { transform: translateX(0); }
    }

    /* ---- SELECTED (destaque da tile ativa) ---- */
    :host(.selected) .tile-inner {
      border-color: #00e5ff !important;
      box-shadow: 0 0 10px #00e5ff;
      transform: scale(1.05);
      transition: 0.12s ease;
    }
  `]
})
export class TileComponent {
  @Input() letter = '';
  @Input() state: 'unknown' | 'correct' | 'present' | 'absent' = 'unknown';

  @Output() flipDone = new EventEmitter<void>();
  @Input() selected: boolean = false;


  @HostBinding('class')
  get hostClasses() {
    return `${this.state} ${this.selected ? 'selected' : ''}`;
  }


  onFlipEnd(event: TransitionEvent) {
    if (event.propertyName === "transform") {
      this.flipDone.emit();
    }
  }
}
