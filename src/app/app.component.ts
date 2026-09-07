import { afterNextRender, Component, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { GameMode, GameService } from './game.service';
import { BoardComponent } from './board/board.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { JourneyComponent } from './journey/journey.component';
import { StarrySkyComponent } from './journey/starry-sky.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent, KeyboardComponent, JourneyComponent, StarrySkyComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.component.css', './game.css', './mobile.css', './keepsakes.css'],
  host: { '[class.sky-paused]': 'motionPaused()' }
})
export class AppComponent {
  readonly game = inject(GameService);
  readonly active = signal(false);
  readonly selectedMode = signal<GameMode>('classic');
  readonly dialog = signal<'help' | 'constellation' | 'letter' | null>(null);
  readonly motionPaused = signal(false);
  readonly inSky = signal(false);
  readonly journeyProgress = signal(0);
  readonly selectedNote = signal(0);
  readonly shareMessage = signal('');
  readonly shareFallback = signal('');
  readonly modal = viewChild<ElementRef<HTMLDialogElement>>('modal');
  readonly gamePanel = viewChild<ElementRef<HTMLElement>>('gamePanel');
  private readonly destroyRef = inject(DestroyRef);
  private previousFocus: HTMLElement | null = null;
  private startTimer?: ReturnType<typeof setTimeout>;
  private reducedMotion?: MediaQueryList;
  readonly notes = [
    { title: 'Meu lugar favorito', text: 'Gabi, entre tantas palavras, a minha favorita sempre vai ser o seu nome. Esse cantinho é seu. E o meu lugar favorito é ao seu lado.' },
    { title: 'Sem esperar amanhã', text: 'Algumas coisas são boas demais para acontecer só uma vez por dia. Jogar seu joguinho favorito. Ver você sorrir. Lembrar o quanto você é amada.' },
    { title: 'A melhor descoberta', text: 'Você pode até levar seis tentativas para encontrar uma palavra. Eu encontrei em você muito mais do que sabia procurar.' },
    { title: 'Nos dias difíceis', text: 'Nem todo dia a gente acerta de primeira. Tudo bem. Aqui sempre tem outra chance, um pouquinho de carinho e alguém torcendo por você.' },
    { title: 'Coisas pequenas', text: 'O seu sorriso, nossas conversas, estar junto sem fazer nada. A felicidade mora nessas coisinhas. E em todas elas tem você.' },
    { title: 'Um infinito nosso', text: 'Esse jogo não tem última partida. E eu espero que a gente nunca fique sem novos motivos para sorrir junto. Com amor, de mim para você - Fernando. ♡' },
    { title: 'A sorte de te conhecer', text: 'Entre tanta gente e tantos caminhos possíveis, eu tive a sorte de conhecer você. Ainda me surpreende pensar que alguém que um dia eu nem conhecia hoje faz tanta falta quando não está por perto.' },
    { title: 'O que ficou comigo', text: 'Quando lembro dos momentos que passamos juntos, não penso só no que a gente fez. Lembro de como eu me senti: feliz por estar ali, querendo que demorasse um pouco mais. É isso que fica comigo depois.' },
    { title: 'A parte difícil', text: 'A distância é difícil, Gabi. Tem dia em que eu queria largar o celular e simplesmente ir te abraçar, mas não dá. Não vou fingir que é fácil. Só quero que você saiba que eu também sinto a sua falta desse lado.' },
    { title: 'Sua risada', text: 'Gosto quando você ri de verdade, daquela maneira que acaba me fazendo rir também. Às vezes lembro disso sozinho e sorrio. Você consegue melhorar meu dia até quando é só uma lembrança boa passando pela minha cabeça.' },
    { title: 'Mais cinco minutos', text: 'Se eu pudesse pedir uma coisa aos nossos momentos juntos, seria mais cinco minutos. Para continuar a conversa, ficar perto, adiar a despedida. Com você, até depois de um dia inteiro eu ainda queria mais um pouquinho.' },
    { title: 'Depois do tchau', text: 'A despedida sempre demora um pouco mais dentro de mim. A gente diz tchau, segue o caminho, mas a vontade de ficar ainda está ali. Nessas horas, penso no alívio que vai ser poder te ver de novo.' },
    { title: 'Me conta do seu dia', text: 'Quero saber como foi seu dia, inclusive as partes que você acha pequenas demais para contar. O que te fez rir, o que te cansou, aquela coisa que deu errado. Gosto de conhecer a sua vida para além dos momentos em que eu estou nela.' },
    { title: 'Um abraço guardado', text: 'Tem um abraço seu fazendo falta aqui. Daqueles em que eu não preciso achar a frase certa nem explicar muita coisa. Quando a gente se encontrar, quero te abraçar com calma. A saudade merece esse tempo.' },
    { title: 'Seu jeito de ver', text: 'Gosto de ouvir o que você pensa, mesmo quando enxerga as coisas de um jeito diferente do meu. Você me faz reparar em detalhes que eu deixaria passar. Te conhecer também é descobrir outras maneiras de olhar para a vida.' },
    { title: 'Entre duas cidades', text: 'Aracaju e Brasília parecem especialmente longe quando tudo o que eu queria era estar com você. Esse caminho tem espera, planejamento e saudade. Eu sei o quanto custa não poder se ver na hora da vontade, e valorizo cada esforço nosso para estar perto.' },
    { title: 'Sem precisar de data especial', text: 'Não preciso de uma data especial para ter vontade de te fazer um carinho. Esse jogo nasceu um pouco disso: pensar em você e querer deixar alguma coisa boa no seu dia. Tomara que, entre uma palavra e outra, você sinta o cuidado que coloquei aqui.' },
    { title: 'Na mesma torcida', text: 'Quero comemorar suas conquistas com você, até aquelas que quase ninguém vê. Eu sei que existem esforços que não viram notícia, mas custam muito. Quando alguma coisa der certo, lembra que tem alguém aqui querendo ouvir e ficar feliz junto.' },
    { title: 'O silêncio também', text: 'Estar junto não precisa ser sempre uma conversa incrível ou um passeio diferente. Também gosto da ideia de cada um fazer sua coisa, sabendo que o outro está por perto. Sinto falta dessa companhia simples, que a distância às vezes não deixa a gente ter.' },
    { title: 'Planos pequenos', text: 'Quando penso na próxima vez que vou te ver, imagino coisas bem simples. Uma conversa sem olhar o relógio, comer alguma coisa juntos, caminhar sem tanta pressa. Nem todo plano precisa ser grande para dar uma vontade enorme de acontecer.' },
    { title: 'Quando pesa', text: 'Se a distância pesar mais em algum dia, pode me falar. Você não precisa esconder a saudade nem fingir que está tudo bem para me poupar. Quero que a gente consiga conversar também sobre o que é difícil, com paciência para ouvir um ao outro.' },
    { title: 'Você sendo você', text: 'Não gosto de você só nos dias animados, quando tudo flui e o sorriso vem fácil. Quero te conhecer também quando você está quieta, cansada ou sem assunto. Você não precisa transformar cada conversa nossa num dia perfeito.' },
    { title: 'Lembranças sem foto', text: 'Algumas das lembranças que mais gosto de nós não cabem numa foto. São um jeito de olhar, um pedaço de conversa, a sensação boa de estar junto. Talvez eu não consiga contar todos os detalhes, mas lembro bem da vontade de viver aquilo outra vez.' },
    { title: 'Obrigado pelo carinho', text: 'Obrigado pelo carinho que você me dá, Gabi. Pela atenção, pelo tempo e por me deixar fazer parte da sua vida. Eu não quero me acostumar tanto com essas coisas a ponto de esquecer de agradecer por elas.' },
    { title: 'Um lugar no cotidiano', text: 'Às vezes acontece alguma coisa e meu primeiro pensamento é que eu queria te contar. Pode ser uma bobagem, uma notícia ou algo que me lembrou você. Gosto de perceber esse lugar que você ganhou no meu cotidiano, mesmo estando longe.' },
    { title: 'Ainda quero descobrir', text: 'Ainda quero conhecer muitas versões suas: as novas vontades, as opiniões que mudam, os sonhos que você ainda vai inventar. Gosto do que já sei sobre você e tenho curiosidade pelo que ainda vou descobrir nas nossas conversas.' },
    { title: 'Quando a gente se vir', text: 'Fico pensando naquele instante em que a espera termina e você está ali, de verdade, na minha frente. Quero prestar atenção nesse momento, te olhar de perto e aproveitar a sua companhia. Depois de sentir tanta saudade, estar junto merece calma.' },
    { title: 'Escolher nós dois', text: 'Conhecer você foi uma sorte enorme. Cuidar do que a gente tem é uma escolha que eu quero continuar fazendo, com conversa, presença do jeito que for possível e vontade de te encontrar. Gosto muito de nós dois, Gabi. Com amor, Fernando. ♡' }
  ];
  readonly constellationRows = Math.ceil(this.notes.length / 3);
  readonly constellationPoints = this.notes.map((_, index) => {
    const row = Math.floor(index / 3);
    const column = row % 2 === 0 ? index % 3 : 2 - index % 3;
    const lastSingle = row * 3 === this.notes.length - 1;
    return { x: lastSingle ? 50 : 16 + column * 34, y: (row + .5) / this.constellationRows * 100 };
  });
  readonly constellationPath = this.constellationPoints.map(point => `${point.x},${point.y}`).join(' ');

  constructor() {
    afterNextRender(() => {
      try { this.game.restore(window.localStorage); } catch { /* Storage is optional. */ }
      this.selectedMode.set(this.game.mode());
      if (typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver(([entry]) => {
          this.active.set(entry.isIntersecting);
          if (entry.isIntersecting) this.inSky.set(true);
        }, { threshold: .15 });
        const panel = this.gamePanel()?.nativeElement;
        if (panel) observer.observe(panel);
        this.destroyRef.onDestroy(() => observer.disconnect());
      }
      if (!window.matchMedia) return;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.motionPaused.set(this.reducedMotion.matches);
      const updateMotion = (event: MediaQueryListEvent) => this.motionPaused.set(event.matches);
      this.reducedMotion.addEventListener('change', updateMotion);
      this.destroyRef.onDestroy(() => this.reducedMotion?.removeEventListener('change', updateMotion));
    });
    this.destroyRef.onDestroy(() => clearTimeout(this.startTimer));
  }
  get unlocked() { return Math.min(this.game.stats().wins, this.notes.length); }
  get winRate() { return this.game.stats().played ? Math.round(this.game.stats().wins / this.game.stats().played * 100) : 0; }

  start() {
    if (this.selectedMode() !== this.game.mode()) this.game.restart(this.selectedMode());
    this.active.set(true);
    clearTimeout(this.startTimer);
    this.startTimer = setTimeout(() => {
      this.gamePanel()?.nativeElement.scrollIntoView({ behavior: this.motionPaused() ? 'instant' : 'smooth', block: 'start' });
      this.gamePanel()?.nativeElement.focus({ preventScroll: true });
    });
  }
  goHome() {
    this.active.set(false);
    window.scrollTo({ top: 0, behavior: this.motionPaused() ? 'instant' : 'smooth' });
  }
  toggleMotion() { this.motionPaused.update(paused => !paused); }
  chooseMode(mode: GameMode) {
    this.selectedMode.set(mode);
    if (mode !== this.game.mode()) this.nextGame();
  }
  nextGame() { this.game.restart(this.selectedMode()); this.shareMessage.set(''); this.shareFallback.set(''); }
  openDialog(kind: 'help' | 'constellation' | 'letter', note = 0) {
    if (kind === 'letter' && (note < 0 || note >= this.unlocked)) return;
    this.previousFocus = document.activeElement as HTMLElement;
    this.selectedNote.set(note); this.dialog.set(kind);
    this.modal()?.nativeElement.showModal();
  }
  showNote(note: number) {
    if (note < 0 || note >= this.unlocked) return;
    this.selectedNote.set(note); this.dialog.set('letter');
    this.modal()?.nativeElement.scrollTo?.({ top: 0, behavior: 'instant' });
  }
  showConstellation() {
    this.dialog.set('constellation');
    this.modal()?.nativeElement.scrollTo?.({ top: 0, behavior: 'instant' });
  }
  closeDialog() {
    this.modal()?.nativeElement.close(); this.dialog.set(null); this.previousFocus?.focus();
  }
  backdrop(event: MouseEvent) { if (event.target === this.modal()?.nativeElement) this.closeDialog(); }
  async share() {
    const text = this.game.shareText();
    try { await navigator.clipboard.writeText(text); this.shareMessage.set('Resultado copiado! É só colar onde quiser.'); }
    catch { this.shareFallback.set(text); this.shareMessage.set('Selecione e copie seu resultado abaixo.'); }
  }
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.active() || this.dialog() || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const target = event.target as HTMLElement;
    if (target?.closest('input, textarea, select, [contenteditable="true"]') || (target?.closest('button, a') && (event.key === 'Enter' || event.key === ' '))) return;
    if (/^[a-zA-ZÀ-ÿ]$/.test(event.key) || ['Enter', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); this.game.handleKey(event.key);
    }
  }
}
