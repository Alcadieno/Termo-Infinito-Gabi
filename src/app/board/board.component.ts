import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-board',
  standalone: true,
  template: `
    <div class="board" role="group" aria-label="Tabuleiro: seis tentativas de cinco letras">
      @for (letters of game.board(); track $index; let r = $index) {
        <div class="row" [class.shake-a]="r === game.row() && game.message() && game.errorTick() % 2 === 1"
          [class.shake-b]="r === game.row() && game.message() && game.errorTick() % 2 === 0">
          @for (letter of letters; track $index; let c = $index) {
            <button type="button" class="tile" [class]="'tile ' + game.states()[r][c]"
              [class.filled]="!!letter" [class.selected]="game.status() === 'playing' && r === game.row() && c === game.col()"
              [class.future]="r > game.row()" [style.--i]="c"
              [disabled]="r !== game.row() || game.status() !== 'playing'"
              [attr.aria-label]="'Tentativa ' + (r + 1) + ', letra ' + (c + 1) + ': ' + (letter || 'vazia') + ', ' + labels[game.states()[r][c]]"
              (click)="game.setCursor(r, c)">{{ letter }}</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .board{display:grid;gap:7px;justify-content:center}.row{display:flex;gap:7px}
    .tile{width:var(--tile-size,52px);height:var(--tile-size,53px);border:1.5px solid #7384a34d;border-radius:5px;background:#17273d;color:#f1ecdd;font:700 25px var(--font);text-transform:uppercase;padding:0;transition:border-color .15s,background .15s;opacity:1}
    .tile:disabled{cursor:default}.tile.future{background:#142136;border-color:#8397b326}.tile.filled{border-color:#b5c3cf99}
    .tile.selected{border:2px solid #eac879;box-shadow:0 0 0 3px #eac87915}.tile.correct{background:var(--correct);border-color:var(--correct);color:white}
    .tile.present{background:var(--present);border-color:var(--present);color:white}.tile.absent{background:var(--absent);border-color:var(--absent);color:white}
    .tile.correct,.tile.present,.tile.absent{animation:reveal .4s both;animation-delay:calc(var(--i)*65ms)}
    .shake-a{animation:shake-a .35s}.shake-b{animation:shake-b .35s}
    @keyframes reveal{from{transform:rotateX(85deg);opacity:.4}to{transform:rotateX(0);opacity:1}}
    @keyframes shake-a{25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
    @keyframes shake-b{25%,75%{transform:translateX(-5px)}50%{transform:translateX(5px)}}
    @media(max-width:600px){.board,.row{gap:5px}.tile{font-size:clamp(21px,6vw,25px)}}
    @media(prefers-reduced-motion:reduce){.tile,.row{animation:none!important;transition:none}}
  `]
})
export class BoardComponent {
  readonly game = inject(GameService);
  readonly labels = { unknown: 'não avaliada', correct: 'posição certa', present: 'posição diferente', absent: 'não aparece na palavra' };
}
