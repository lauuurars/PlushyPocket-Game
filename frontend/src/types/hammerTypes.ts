export interface Position {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

export interface Character {
  name: string;
  image: string;
}

export type Side = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ActiveCharacter {
  id: number;
  character: Character;
  position: Position;
  side: Side;
}
