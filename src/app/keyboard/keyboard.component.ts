import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  template: `
    <div class="keyboard" role="group" aria-label="Teclado virtual">
      @for (row of rows; track $index) {
        <div class="key-row">
          @for (key of row; track key) {
            <button type="button" [class]="'key ' + (game.keyStates()[key] || '')"
              [class.wide]="key.length > 1" [disabled]="game.status() !== 'playing'"
              [attr.aria-label]="key === 'Backspace' ? 'Apagar letra' : key === 'Enter' ? 'Enviar tentativa' : key.toUpperCase() + ', ' + labels[game.keyStates()[key] || 'unknown']"
              (click)="game.handleKey(key)">{{ key === 'Backspace' ? '⌫' : key === 'Enter' ? 'enter' : key }}</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .keyboard{display:grid;gap:6px;width:100%;max-width:450px;margin:0 auto}.key-row{display:flex;justify-content:center;gap:5px}
    .key{min-width:0;flex:1;max-width:40px;height:44px;border:0;border-radius:4px;background:#2b3d57;color:#ece8df;font:600 13px var(--font);text-transform:uppercase;padding:0;transition:transform .12s,background .12s}
    .key.wide{flex:1.65;max-width:64px;font-size:10px}.key:last-child.wide{font-size:19px}.key:hover:enabled{background:#405572;transform:translateY(-2px)}
    .key:active:enabled{transform:translateY(1px)}.key.correct{background:var(--correct);color:white}.key.present{background:var(--present);color:white}.key.absent{background:var(--absent);color:white}
    .key:disabled{cursor:default}.key:focus-visible{outline:2px solid #eac879;outline-offset:2px}
    @media(max-width:600px){.key-row{gap:4px}.key{height:46px;font-size:14px}.key.wide{font-size:11px}}
  `]
})
export class KeyboardComponent {
  readonly game = inject(GameService);
  readonly rows = ['qwertyuiop'.split(''), 'asdfghjkl'.split(''), ['Enter', ...'zxcvbnm', 'Backspace']];
  readonly labels = { unknown: 'não usada', correct: 'posição certa', present: 'presente', absent: 'ausente' };
}
