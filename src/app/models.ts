// src/app/models.ts
export type LetterState = 'unknown' | 'correct' | 'present' | 'absent';

export interface Tile {
  letter: string;
  state: LetterState;
}
