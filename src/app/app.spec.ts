import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GameService } from './game.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
  });
  it('renders the gift landing page and both game modes', async () => {
    const fixture = TestBed.createComponent(AppComponent); await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('Do lugar que você ama');
    expect(page.textContent).toContain('49010-160');
    expect(page.textContent).toContain('Brasília');
    expect(page.textContent).toMatch(/gabi/i); expect(page.querySelectorAll('.mode-card').length).toBe(2);
  });
  it('does not type in the game while on the landing page or with a modifier shortcut', () => {
    const fixture = TestBed.createComponent(AppComponent); const app = fixture.componentInstance;
    const game = TestBed.inject(GameService);
    app.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'a' })); expect(game.board()[0][0]).toBe('');
    app.active.set(true); app.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true })); expect(game.board()[0][0]).toBe('');
    app.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'a' })); expect(game.board()[0][0]).toBe('a');
  });
  it('renders thirty board tiles and a responsive keyboard when playing', async () => {
    const fixture = TestBed.createComponent(AppComponent); fixture.componentInstance.active.set(true); await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelectorAll('.tile').length).toBe(30); expect(page.querySelectorAll('.key').length).toBe(28);
  });
  it('renders all 28 unique notes and matching constellation stars', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.dialog.set('constellation');
    await fixture.whenStable();
    const app = fixture.componentInstance;
    const page = fixture.nativeElement as HTMLElement;
    expect(app.notes).toHaveLength(28);
    expect(new Set(app.notes.map(note => note.title)).size).toBe(28);
    expect(new Set(app.notes.map(note => note.text)).size).toBe(28);
    expect(page.querySelectorAll('.keepsake-stars button')).toHaveLength(28);
    expect(page.querySelectorAll('.notes-grid button:disabled')).toHaveLength(28);
    expect(page.querySelector('.notes-link small')?.textContent).toContain('0 / 28');
  });
  it('preserves existing wins and unlocks notes through the 28th victory', async () => {
    localStorage.setItem('gabi-word-garden-v1', JSON.stringify({
      solution: 'carta', mode: 'classic', guesses: [], draft: ['', '', '', '', ''], hintUsed: false,
      stats: { played: 6, wins: 6, streak: 6, best: 6 }
    }));
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.dialog.set('constellation');
    await fixture.whenStable();
    expect(app.unlocked).toBe(6);
    for (const wins of [6, 7, 27, 28, 29]) {
      app.game.stats.set({ played: wins, wins, streak: wins, best: wins });
      app.dialog.set('constellation');
      await fixture.whenStable();
      const page = fixture.nativeElement as HTMLElement;
      expect(page.querySelectorAll('.notes-grid button:enabled')).toHaveLength(Math.min(wins, 28));
      app.showNote(27);
      expect(app.dialog()).toBe(wins < 28 ? 'constellation' : 'letter');
      if (wins >= 28) {
        await fixture.whenStable();
        expect(page.querySelector('.letter-content .eyebrow')?.textContent).toContain('28 DE 28');
        expect(page.querySelector('.letter-content p')?.textContent).toBe(app.notes[27].text);
        app.showConstellation();
      }
      app.game.status.set('won');
      await fixture.whenStable();
      expect(page.querySelector('.result .text-button')?.textContent)
        .toContain(wins <= 28 ? 'novo bilhetinho' : 'Reler um carinho');
    }
  });

});
