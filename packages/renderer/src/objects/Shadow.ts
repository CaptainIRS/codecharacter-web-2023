import Phaser from 'phaser';

export class Shadow {
  shadow: Phaser.GameObjects.Image;

  x: number;

  y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.shadow = new Phaser.GameObjects.Image(scene, 0, 0, 'shadow');

    this.x = x;
    this.y = y;
    this.shadow.setAlpha(0.8);

    scene.add.existing(this.shadow);
    this.draw();
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.draw();
  }

  setDepth(depth: number): void {
    this.shadow.setDepth(depth);
  }

  destroy(): void {
    this.shadow.destroy();
  }

  draw(): void {
    this.shadow.setPosition(this.x, this.y);
  }
}
