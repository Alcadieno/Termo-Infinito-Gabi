import { Injectable, signal } from '@angular/core';
import { normalizeWord, SOLUTIONS } from './assets/words';
import { LetterState } from './models';

export type GameMode = 'classic' | 'cozy';
interface Stats { played: number; wins: number; streak: number; best: number; }
const STORAGE_KEY = 'gabi-word-garden-v1';
const isGuess = (word: unknown): word is string => typeof word === 'string' && /^[a-z]{5}$/.test(word);

export function scoreGuess(guess: string, solution: string): LetterState[] {
  const result: LetterState[] = Array(5).fill('absent');
  const remaining = solution.split('');
  [...guess].forEach((letter, i) => {
    if (letter === remaining[i]) { result[i] = 'correct'; remaining[i] = ''; }
  });
  [...guess].forEach((letter, i) => {
    if (result[i] === 'correct') return;
    const index = remaining.indexOf(letter);
    if (index !== -1) { result[i] = 'present'; remaining[index] = ''; }
  });
  return result;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly maxRows = 6;
  readonly wordLength = 5;
  readonly board = signal<string[][]>(this.emptyBoard());
  readonly states = signal<LetterState[][]>(this.emptyStates());
  readonly row = signal(0);
  readonly col = signal(0);
  readonly status = signal<'playing' | 'won' | 'lost'>('playing');
  readonly mode = signal<GameMode>('classic');
  readonly message = signal('');
  readonly hint = signal('');
  readonly errorTick = signal(0);
  readonly stats = signal<Stats>({ played: 0, wins: 0, streak: 0, best: 0 });
  readonly keyStates = signal<Record<string, LetterState>>({});
  private solution = this.randomSolution();
  private selected = false;
  private storage?: Storage;

  private emptyBoard() { return Array.from({ length: 6 }, () => Array<string>(5).fill('')); }
  private emptyStates() { return Array.from({ length: 6 }, () => Array<LetterState>(5).fill('unknown')); }
  private randomSolution(previous?: string) {
    const options = SOLUTIONS.filter(word => word !== previous);
    return options[Math.floor(Math.random() * options.length)];
  }

  /** Called after hydration; storage can be unavailable in private browsers. */
  restore(storage: Storage) {
    this.storage = storage;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      const stats = saved.stats;
      if (stats && ['played', 'wins', 'streak', 'best'].every(key => Number.isSafeInteger(stats[key]) && stats[key] >= 0)
          && stats.wins <= stats.played && stats.streak <= stats.best && stats.best <= stats.wins) this.stats.set(stats);
      if (!SOLUTIONS.includes(saved.solution) || !['classic', 'cozy'].includes(saved.mode)
          || !Array.isArray(saved.guesses) || saved.guesses.length > 6
          || !saved.guesses.every(isGuess)) return;
      const guesses: string[] = saved.guesses;
      if (guesses.slice(0, -1).includes(saved.solution)) return;
      this.solution = saved.solution;
      this.mode.set(saved.mode);
      const board = this.emptyBoard();
      const states = this.emptyStates();
      const keys: Record<string, LetterState> = {};
      guesses.forEach((guess, i) => {
        board[i] = guess.split('');
        states[i] = scoreGuess(guess, this.solution);
        this.mergeKeys(keys, guess, states[i]);
      });
      const won = guesses.at(-1) === this.solution;
      const finished = won || guesses.length === 6;
      const row = finished ? Math.max(0, guesses.length - 1) : guesses.length;
      if (!finished && Array.isArray(saved.draft) && saved.draft.length === 5
          && saved.draft.every((letter: unknown) => typeof letter === 'string' && /^[a-z]?$/.test(letter))) board[row] = saved.draft;
      this.board.set(board);
      this.states.set(states);
      this.keyStates.set(keys);
      this.row.set(row);
      this.col.set(!finished ? Math.max(0, board[row].findIndex(letter => !letter)) : 0);
      this.status.set(won ? 'won' : finished ? 'lost' : 'playing');
      if (saved.hintUsed && saved.mode === 'cozy') this.hint.set(`Um empurrãozinho: a primeira letra é ${this.solution[0].toUpperCase()}.`);
    } catch { /* A corrupted save never blocks a new game. */ }
  }

  private save() {
    try {
      const count = this.status() === 'playing' ? this.row() : this.row() + 1;
      this.storage?.setItem(STORAGE_KEY, JSON.stringify({ solution: this.solution, mode: this.mode(),
        guesses: this.board().slice(0, count).map(row => row.join('')),
        draft: this.status() === 'playing' ? this.board()[this.row()] : [],
        hintUsed: !!this.hint(), stats: this.stats() }));
    } catch { /* Play remains available when storage is full or blocked. */ }
  }

  setCursor(row: number, col: number) {
    if (this.status() !== 'playing' || row !== this.row() || col < 0 || col >= 5) return;
    this.col.set(col);
    this.selected = true;
  }

  handleKey(key: string) {
    if (this.status() !== 'playing') return;
    if (key === 'Enter') { this.submit(); return; }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      this.col.set(Math.max(0, Math.min(4, this.col() + (key === 'ArrowLeft' ? -1 : 1))));
      this.selected = true;
      return;
    }
    const board = this.board().map(row => [...row]);
    let col = this.col();
    if (key === 'Backspace' || key === 'Delete') {
      if (!this.selected && key === 'Backspace') col = Math.max(0, col - 1);
      col = Math.min(4, col);
      board[this.row()][col] = '';
      this.col.set(col);
      this.selected = false;
    } else {
      const letter = normalizeWord(key);
      if (!/^[a-z]$/.test(letter) || col >= 5) return;
      board[this.row()][col] = letter;
      this.col.set(col + 1);
      this.selected = false;
    }
    this.message.set('');
    this.board.set(board);
    this.save();
  }

  submit() {
    if (this.status() !== 'playing') return;
    const guess = this.board()[this.row()].join('');
    if (guess.length !== 5) { this.reject('Faltam letrinhas. Complete as 5 para tentar.'); return; }
    if (!isGuess(guess)) { this.reject('Use apenas letras para completar a tentativa.'); return; }
    const result = scoreGuess(guess, this.solution);
    const states = this.states().map(row => [...row]);
    states[this.row()] = result;
    this.states.set(states);
    const keys = { ...this.keyStates() };
    this.mergeKeys(keys, guess, result);
    this.keyStates.set(keys);
    this.message.set('');
    if (guess === this.solution || this.row() === 5) {
      const won = guess === this.solution;
      this.status.set(won ? 'won' : 'lost');
      const old = this.stats();
      const streak = won ? old.streak + 1 : 0;
      this.stats.set({ played: old.played + 1, wins: old.wins + Number(won), streak, best: Math.max(old.best, streak) });
    } else {
      this.row.update(row => row + 1);
      this.col.set(0);
      this.selected = false;
    }
    this.save();
  }

  private reject(message: string) { this.message.set(message); this.errorTick.update(value => value + 1); }
  private mergeKeys(keys: Record<string, LetterState>, guess: string, result: LetterState[]) {
    const priority = { unknown: 0, absent: 1, present: 2, correct: 3 };
    [...guess].forEach((letter, i) => {
      if (priority[result[i]] > priority[keys[letter] ?? 'unknown']) keys[letter] = result[i];
    });
  }
  useHint() {
    if (this.mode() !== 'cozy' || this.status() !== 'playing' || this.hint()) return;
    this.hint.set(`Um empurrãozinho: a primeira letra é ${this.solution[0].toUpperCase()}.`);
    this.save();
  }
  revealSolution() { return this.status() === 'playing' ? '' : this.solution; }
  restart(mode: GameMode = this.mode()) {
    this.solution = this.randomSolution(this.solution);
    this.mode.set(mode);
    this.board.set(this.emptyBoard());
    this.states.set(this.emptyStates());
    this.row.set(0); this.col.set(0); this.selected = false;
    this.status.set('playing'); this.message.set(''); this.hint.set(''); this.keyStates.set({});
    this.save();
  }
  shareText() {
    const count = this.row() + 1;
    const emoji: Record<LetterState, string> = { unknown: '⬜', absent: '⬜', present: '🟨', correct: '🟩' };
    return `Termo infinito · ${this.mode() === 'cozy' ? 'Modo carinho' : 'Clássico'}\n${this.status() === 'won' ? count : 'X'}/6${this.hint() ? ' · com dica' : ''}\n\n`
      + this.states().slice(0, count).map(row => row.map(state => emoji[state]).join('')).join('\n') + '\n\nUma palavra de cada vez. ♡';
  }
}
