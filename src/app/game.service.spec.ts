import { TestBed } from '@angular/core/testing';
import { GameService, scoreGuess } from './game.service';
import { SOLUTIONS, WORDS } from './assets/words';

const KEY = 'gabi-word-garden-v1';
function saved(solution = 'carta', overrides: Record<string, unknown> = {}) {
  return JSON.stringify({ solution, mode: 'classic', guesses: [], draft: ['', '', '', '', ''], hintUsed: false,
    stats: { played: 0, wins: 0, streak: 0, best: 0 }, ...overrides });
}

describe('GameService', () => {
  let game: GameService;
  beforeEach(() => { TestBed.configureTestingModule({}); localStorage.clear(); game = TestBed.inject(GameService); });
  const type = (game: GameService, word: string) => { for (const letter of word) game.handleKey(letter); };
  function prepare(solution = 'carta', overrides: Record<string, unknown> = {}) {
    localStorage.setItem(KEY, saved(solution, overrides)); game.restore(localStorage);
  }
  it('counts repeated letters only as often as they occur, reserving exact matches first', () => {
    expect(scoreGuess('arara', 'carta')).toEqual(['present', 'present', 'absent', 'absent', 'correct']);
    expect(scoreGuess('massa', 'casas')).toEqual(['absent', 'correct', 'correct', 'present', 'present']);
  });
  it('has unique, normalized five-letter words and a valid solution pool', () => {
    expect(WORDS.every(word => /^[a-z]{5}$/.test(word))).toBe(true);
    expect(new Set(WORDS).size).toBe(WORDS.length);
    expect(SOLUTIONS.length).toBeGreaterThan(900);
    expect(SOLUTIONS.every(word => WORDS.includes(word) && /^[a-z]{5}$/.test(word))).toBe(true);
    expect(new Set(SOLUTIONS).size).toBe(SOLUTIONS.length);
  });
  it('rejects incomplete guesses but accepts any five letters', () => {
    prepare(); type(game, 'abc'); game.submit(); expect(game.row()).toBe(0); expect(game.message()).toContain('Faltam');
    type(game, 'de'); game.submit(); expect(game.row()).toBe(1); expect(game.message()).toBe('');
    expect(game.states()[0]).toEqual(scoreGuess('abcde', 'carta'));
  });
  it('restores guesses outside the dictionary with their scores and keyboard colors', () => {
    prepare(); type(game, 'zzzzz'); game.submit(); type(game, 'ca');
    const restored = new GameService(); restored.restore(localStorage);
    expect(restored.row()).toBe(1); expect(restored.board()[0].join('')).toBe('zzzzz');
    expect(restored.board()[1].join('')).toBe('ca');
    expect(restored.states()).toEqual(game.states()); expect(restored.keyStates()).toEqual(game.keyStates());
  });
  it('ignores digits, spaces and punctuation when typing', () => {
    prepare(); type(game, '12 !?'); expect(game.board()[0].join('')).toBe('');
    game.submit(); expect(game.row()).toBe(0);
  });
  it('rejects malformed saved guesses even with free word entry', () => {
    for (const guess of ['abcd', 'abcdef', 'ab1de', 'ab de', 'ab!de', 12345, null]) {
      prepare('carta', { guesses: [guess] });
      expect(game.row()).toBe(0); expect(game.board()[0].join('')).toBe('');
    }
  });
  it('accepts normalized accents and cedilla', () => {
    prepare('danca'); type(game, 'DANÇA'); game.submit(); expect(game.status()).toBe('won');
  });
  it('deletes the selected tile and validates all tiles, independent of cursor', () => {
    prepare(); type(game, 'carta'); game.setCursor(0, 2); game.handleKey('Backspace');
    expect(game.board()[0]).toEqual(['c', 'a', '', 't', 'a']);
    game.handleKey('r'); game.setCursor(0, 0); game.submit(); expect(game.status()).toBe('won');
  });
  it('does not submit twice or record a victory twice', () => {
    prepare(); type(game, 'carta'); game.submit(); game.submit(); game.handleKey('a');
    expect(game.stats()).toEqual({ played: 1, wins: 1, streak: 1, best: 1 }); expect(game.board()[0].join('')).toBe('carta');
  });
  it('advances a row once even with rapid repeated Enter', () => {
    prepare(); type(game, 'termo'); game.submit(); game.submit(); expect(game.row()).toBe(1);
    expect(game.states()[0]).toEqual(scoreGuess('termo', 'carta'));
  });
  it('keeps the strongest keyboard color for repeated letters', () => {
    prepare('carta'); type(game, 'arara'); game.submit(); expect(game.keyStates()['a']).toBe('correct'); expect(game.keyStates()['r']).toBe('present');
    type(game, 'arroz'); game.submit(); expect(game.keyStates()['a']).toBe('correct'); expect(game.keyStates()['r']).toBe('correct');
  });
  it('records a loss after six guesses and resets the streak', () => {
    prepare('carta', { stats: { played: 2, wins: 2, streak: 2, best: 2 } });
    for (let i = 0; i < 6; i++) { type(game, 'termo'); game.submit(); }
    expect(game.status()).toBe('lost'); expect(game.revealSolution()).toBe('carta');
    expect(game.stats()).toEqual({ played: 3, wins: 2, streak: 0, best: 2 });
  });
  it('restores an ongoing game, draft and keyboard states', () => {
    prepare(); type(game, 'termo'); game.submit(); type(game, 'ca');
    const restored = new GameService(); restored.restore(localStorage);
    expect(restored.row()).toBe(1); expect(restored.board()[1].join('')).toBe('ca');
    expect(restored.states()).toEqual(game.states()); expect(restored.keyStates()).toEqual(game.keyStates());
    expect(restored.revealSolution()).toBe('');
  });
  it('restores a finished game without counting another win', () => {
    prepare(); type(game, 'carta'); game.submit();
    const restored = new GameService(); restored.restore(localStorage);
    expect(restored.status()).toBe('won'); expect(restored.stats().wins).toBe(1);
    restored.submit(); expect(restored.stats().wins).toBe(1);
  });
  it('offers one persistent hint in cozy mode without spending a guess', () => {
    prepare('carta', { mode: 'cozy' }); game.useHint(); game.useHint();
    expect(game.hint()).toContain('C'); expect(game.row()).toBe(0);
    const restored = new GameService(); restored.restore(localStorage); expect(restored.hint()).toBe(game.hint());
    restored.restart('classic'); restored.useHint(); expect(restored.hint()).toBe('');
  });
  it('resets the board, colors and hints, preserving stats and avoiding immediate repeats', () => {
    prepare(); type(game, 'carta'); game.submit(); game.restart();
    expect(game.row()).toBe(0); expect(game.status()).toBe('playing'); expect(game.stats().wins).toBe(1);
    expect(game.keyStates()).toEqual({}); expect(game.board().flat().every(letter => letter === '')).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).solution).not.toBe('carta');
  });
  it('ignores corrupt saves and tolerates unavailable storage', () => {
    localStorage.setItem(KEY, '{bad json'); expect(() => game.restore(localStorage)).not.toThrow();
    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } } as unknown as Storage;
    expect(() => game.restore(blocked)).not.toThrow(); expect(() => game.restart()).not.toThrow();
    expect(game.status()).toBe('playing');
  });
  it('shares a spoiler-free result with hint attribution', () => {
    prepare('carta', { mode: 'cozy' }); game.useHint(); type(game, 'carta'); game.submit();
    expect(game.shareText()).toContain('🟩🟩🟩🟩🟩'); expect(game.shareText()).toContain('com dica'); expect(game.shareText()).not.toContain('carta');
  });
});
