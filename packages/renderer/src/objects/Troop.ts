import Phaser from 'phaser';
import TroopType from '../config/TroopType.js';
import { Parameters } from '../Parameters.js';
import { HealthBar } from './HealthBar.js';
import { Shadow } from './Shadow.js';

export type Direction =
  | 'east'
  | 'west'
  | 'north'
  | 'south'
  | 'northEast'
  | 'northWest'
  | 'southEast'
  | 'southWest';
type DirectionParameters = {
  offset: number;
  x: number;
  y: number;
};
type Directions = {
  [key: string]: DirectionParameters;
};

const directions: Directions = {
  east: { offset: 0, x: 2, y: 0 },
  northEast: { offset: 0, x: 2, y: -1 },
  north: { offset: 0, x: 0, y: -2 },
  northWest: { offset: 8, x: -2, y: -1 },
  west: { offset: 8, x: -2, y: 0 },
  southWest: { offset: 8, x: -2, y: 1 },
  south: { offset: 0, x: 0, y: 2 },
  southEast: { offset: 0, x: 2, y: 1 },
};

type Animation = {
  startFrame: number;
  endFrame: number;
};
type Animations = {
  [key: string]: Animation;
};

const anims: Animations = {
  idle: {
    startFrame: 0,
    endFrame: 7,
  },
  walk: {
    startFrame: 16,
    endFrame: 21,
  },
  attack: {
    startFrame: 32,
    endFrame: 39,
  },
  die: {
    startFrame: 48,
    endFrame: 53,
  },
  shoot: {
    startFrame: 32,
    endFrame: 39,
  },
};

const droneAnims: Animations = {
  idle: {
    startFrame: 0,
    endFrame: 3,
  },
  walk: {
    startFrame: 16,
    endFrame: 19,
  },
  attack: {
    startFrame: 32,
    endFrame: 39,
  },
  die: {
    startFrame: 48,
    endFrame: 55,
  },
  shoot: {
    startFrame: 32,
    endFrame: 39,
  },
};

export class Troop extends Phaser.GameObjects.Image {
  troopType: TroopType;

  destinationX: number;

  destinationY: number;

  motion: string;

  animation: Animation;

  animationFrames: Animations;

  direction: DirectionParameters;

  speed: number;

  f: number;

  healthBar: HealthBar;

  shadow?: Shadow;

  idleTimer: Phaser.Time.TimerEvent;

  frameTimer: Phaser.Time.TimerEvent;

  idleTimerConfig: Phaser.Types.Time.TimerEventConfig = {
    delay: Parameters.timePerTurn * 5,
    callback: this._switchToIdle,
    callbackScope: this,
  };

  constructor(
    scene: Phaser.Scene,
    troopType: TroopType,
    x: number,
    y: number,
    motion: string,
    direction?: Direction | undefined,
  ) {
    super(scene, x, y, troopType.spritesheet);

    this.troopType = troopType;

    this.destinationX = x;
    this.destinationY = y;

    this.motion = motion;
    this.animationFrames =
      this.troopType.spritesheet === 'drone' ? droneAnims : anims;
    this.animation = this.animationFrames[motion];
    this.direction = directions[direction ?? 'east'];
    this.speed = Parameters.timePerTurn / 10000;
    this.angle = 0;
    this.f = this.animation.startFrame;

    this.healthBar = new HealthBar(scene, x - 30, y - 30);
    this.healthBar.setDepth(this.y);

    this.shadow =
      this.troopType.spritesheet === 'drone'
        ? new Shadow(scene, x, y + 50)
        : undefined;
    this.shadow?.setDepth(this.y);

    this.depth = 50;

    this.frameTimer = scene.time.delayedCall(
      this.speed * 1000,
      this.changeFrame,
      [],
      this,
    );

    this.idleTimer = scene.time.addEvent(this.idleTimerConfig);
  }

  changeFrame(): void {
    this.f += 1;
    if (this.f === this.animation.endFrame) {
      if (this.motion === 'die') {
        return;
      }
      this.f = this.animation.startFrame;
    } else {
      this.frame = this.texture.get(this.direction.offset + this.f);
    }
    this.frameTimer = this.scene.time.delayedCall(
      this.speed * 1000,
      this.changeFrame,
      [],
      this,
    );
  }

  _setDirectionFromDelta(dx: number, dy: number): void {
    let angle = Math.atan2(dy, dx);
    angle = angle < 0 ? angle + Math.PI * 2 : angle;
    this.angle = angle;

    const fraction = angle / (Math.PI * 2);

    this.direction =
      directions[Object.keys(directions)[Math.floor(fraction * 8)] || 'north'];
  }

  _switchToIdle(): void {
    this.motion = 'idle';
    this.animation = this.animationFrames[this.motion];
    this.f = this.animation.startFrame;
  }

  moveTo(x: number, y: number): void {
    this.idleTimer.reset(this.idleTimerConfig);
    if (this.destinationX === x && this.destinationY === y) {
      this.motion = 'idle';
      this.animation = this.animationFrames[this.motion];
      this.f = this.animation.startFrame;
      return;
    }
    const prevMotion = this.motion;
    this.motion = 'walk';
    this.animation = this.animationFrames[this.motion];
    if (prevMotion !== 'walk') {
      this.f = this.animation.startFrame;
    }
    this.scene.tweens.add({
      targets: this,
      x: { value: x, duration: Parameters.timePerTurn },
      y: { value: y, duration: Parameters.timePerTurn },
      onUpdate: () => {
        this.healthBar.setPosition(this.x - 30, this.y - 30);
        this.shadow?.setPosition(this.x, this.y + 50);
        this.setDepth(this.y);
        this.healthBar.setDepth(this.y);
        this.shadow?.setDepth(this.y);
      },
    });
    this.x = this.destinationX;
    this.y = this.destinationY;
    this.destinationX = x;
    this.destinationY = y;
    const dx = x - this.x;
    const dy = y - this.y;
    this._setDirectionFromDelta(dx, -dy);
  }

  attack(x: number, y: number): void {
    this.idleTimer.reset(this.idleTimerConfig);
    this.motion = 'attack';
    this.animation = this.animationFrames[this.motion];
    this.f = this.animation.startFrame;
    this.x = this.destinationX;
    this.y = this.destinationY;
    this.healthBar.setPosition(this.x - 40, this.y - 50);
    this.shadow?.setPosition(this.x, this.y + 50);
    const dx = x - this.x;
    const dy = y - this.y;
    this._setDirectionFromDelta(dx, -dy);
  }

  dead(): void {
    this.idleTimer.reset(this.idleTimerConfig);
    this.motion = 'die';
    this.animation = this.animationFrames[this.motion];
    this.f = this.animation.startFrame;
  }

  setHp(hpValue: number): void {
    this.healthBar.setHp((hpValue / this.troopType.hp) * 100);
  }

  destroy(fromScene?: boolean): void {
    this.healthBar.destroy();
    this.shadow?.destroy();
    this.frameTimer.destroy();
    this.idleTimer.destroy();
    super.destroy(fromScene);
  }
}
