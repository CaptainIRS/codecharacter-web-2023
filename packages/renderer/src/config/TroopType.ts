export default class TroopType {
  hp: number;

  range: number;

  spritesheet: string;

  constructor(hp: number, range: number, spritesheet: string) {
    this.hp = hp;
    this.range = range;
    this.spritesheet = spritesheet;
  }
}
