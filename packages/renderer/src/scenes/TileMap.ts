import Phaser from 'phaser';
import { Pan, Pinch } from 'phaser3-rex-plugins/plugins/gestures.js';
import TowerConfig from '../config/TowerConfig.js';
import TroopConfig from '../config/TroopConfig.js';
import { DebugLog } from '../DebugLog.js';
import { events, RendererEvents } from '../events/EventEmitter.js';
import { HealthBar } from '../objects/HealthBar.js';
import { Tower } from '../objects/Tower.js';
import { Direction, Troop } from '../objects/Troop.js';
import { Parameters } from '../Parameters.js';
import * as Instructions from '../parser/Instructions.js';
import { Parse } from '../parser/Parser.js';

export class TileMap extends Phaser.Scene {
  controls!: Phaser.Cameras.Controls.SmoothedKeyControl;

  troops: Troop[] = [];

  towers: Tower[] = [];

  spriteGroup!: Phaser.GameObjects.Group;

  groundLayer!: Phaser.Tilemaps.TilemapLayer;

  nextTurnTimeout?: number;

  constructor() {
    super({
      key: 'TileMap',
    });
  }

  preload(): void {
    this.load.image('building_1', './assets/building_1.png');
    this.load.image('building_2', './assets/building_2.png');
    this.load.image('tile_metallic', './assets/tile_metallic.png');
    this.load.image('tile_f', './assets/tile_f.png');
    this.load.image('tile_e', './assets/tile_e.png');
    this.load.image('tile_satellite', './assets/tile_satellite.png');
    TowerConfig.towers.forEach(tower => {
      this.load.image(`${tower.name}-sprite`, `./assets/${tower.asset}`);
    });
    this.load.tilemapTiledJSON('map', './assets/map-2.json');
    this.load.spritesheet('punk', './assets/punk.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('cyborg', './assets/cyborg.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('drone', './assets/drone.png', {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet('bomb', './assets/bomb.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image('laser', './assets/laser.png');
    this.load.image('shadow', './assets/shadow.png');
  }

  create(): void {
    const map = this.add.tilemap('map');
    const landscapeTile = [
      map.addTilesetImage('tile_f.png', 'tile_f'),
      map.addTilesetImage('tile_metallic.png', 'tile_metallic'),
      map.addTilesetImage('tile_satellite.png', 'tile_satellite'),
      map.addTilesetImage('building_1.png', 'building_1'),
      map.addTilesetImage('building_2.png', 'building_2'),
      map.addTilesetImage('tile_e.png', 'tile_e'),
    ];
    this.groundLayer = map.createLayer('Ground', landscapeTile, 0, 0);
    this.groundLayer.setDepth(0);

    this.groundLayer.setCullPadding(6, 6);

    const pinch = new Pinch(this);
    const pan = new Pan(this);
    const camera = this.cameras.main;
    camera.zoom = 0.1;
    camera.setScroll(-200, 2000);
    pinch.on(
      'pinch',
      () => {
        const {
          scaleFactor,
          centerX,
          centerY,
          movementCenterX,
          movementCenterY,
        } = pinch;
        const oldZoom = camera.zoom;
        const newZoom = oldZoom * scaleFactor;

        const { width, height } = this.game.canvas;
        const xFromCenter = centerX - width / 2;
        const yFromCenter = centerY - height / 2;

        camera.scrollX +=
          xFromCenter / oldZoom -
          xFromCenter / newZoom -
          movementCenterX * newZoom;
        camera.scrollY +=
          yFromCenter / oldZoom -
          yFromCenter / newZoom -
          movementCenterY * newZoom;
        camera.setZoom(newZoom);
      },
      this,
    );

    pan.on(
      'pan',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newPan: any) => {
        const { dx, dy } = newPan;
        camera.scrollX -= dx / camera.zoom;
        camera.scrollY -= dy / camera.zoom;
      },
      this,
    );

    this.input.on(
      Phaser.Input.Events.POINTER_WHEEL,
      (pointer: Phaser.Input.Pointer) => {
        const oldZoom = camera.zoom;
        const newZoom = oldZoom * (pointer.deltaY > 0 ? 0.9 : 1.1);

        const { width, height } = this.game.canvas;
        const xFromCenter = pointer.x - width / 2;
        const yFromCenter = pointer.y - height / 2;

        camera.setZoom(newZoom);
        camera.scrollX += xFromCenter / oldZoom - xFromCenter / newZoom;
        camera.scrollY += yFromCenter / oldZoom - yFromCenter / newZoom;
      },
    );

    events.on(
      RendererEvents.PLACE_TOWER,
      (towerTypeId: number, x: number, y: number) => {
        const towerType = TowerConfig.towers[towerTypeId - 1];
        const tile = this.groundLayer.getTileAt(x, y);
        const healthBar = new HealthBar(
          this,
          tile.pixelX + Parameters.mapTileHalfWidth - 30,
          tile.pixelY + Parameters.mapTileHalfHeight - 120,
        );
        const tower = new Tower(
          this,
          towerType,
          tile.pixelX + Parameters.mapTileHalfWidth,
          tile.pixelY + Parameters.mapTileHalfHeight,
          healthBar,
        );
        tower.setDepth(tower.y);
        healthBar.setDepth(tower.depth);
        this.towers.push(this.add.existing(tower));
      },
    );

    events.on(
      RendererEvents.SPAWN_TROOP,
      (typeId: number, x: number, y: number) => {
        const tile = this.groundLayer.getTileAt(x, y);
        let direction: Direction = 'northEast';
        if (y === 0) {
          if (x === 0) {
            direction = 'south';
          } else if (x === Parameters.mapWidth - 1) {
            direction = 'west';
          } else {
            direction = 'southWest';
          }
        } else if (y === Parameters.mapHeight - 1) {
          if (x === 0) {
            direction = 'east';
          } else if (x === Parameters.mapWidth - 1) {
            direction = 'north';
          } else {
            direction = 'northEast';
          }
        } else if (x === 0) {
          direction = 'southEast';
        } else if (x === Parameters.mapWidth - 1) {
          direction = 'northWest';
        }
        const troop = new Troop(
          this,
          TroopConfig.troops[typeId - 1],
          tile.pixelX + Parameters.mapTileHalfWidth,
          tile.pixelY + Parameters.mapTileHalfHeight,
          'idle',
          direction,
        );
        troop.setDepth(troop.y);
        this.troops.push(this.add.existing(troop));
      },
    );

    events.on(RendererEvents.MOVE_TROOP, (id: number, x: number, y: number) => {
      const troop = this.troops[id];
      const tile = this.groundLayer.getTileAt(x, y);
      troop.moveTo(
        tile.pixelX + Parameters.mapTileHalfWidth,
        tile.pixelY + Parameters.mapTileHalfHeight,
      );
    });

    events.on(
      RendererEvents.SHOOT_TROOP,
      (towerId: number, troopId: number, newTroopHp: number) => {
        const troop = this.troops[troopId];
        const tower = this.towers[towerId];
        troop.setHp(newTroopHp);

        const dx = troop.x - tower.x;
        const dy = troop.y - tower.y;
        const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx / 2));

        const attackArc = this.add.arc(
          tower.x,
          tower.y,
          Parameters.gridCellHeight / 2,
          angle - 20,
          angle + 20,
        );
        attackArc.closePath = false;
        attackArc.setStrokeStyle(3, 0xff0000);

        this.tweens.add({
          targets: [attackArc],
          scaleX: tower.towerType.range * 2,
          scaleY: tower.towerType.range,
          alpha: 0,
          duration: Parameters.timePerTurn,
          ease: 'Power2',
          onComplete: () => attackArc.destroy(),
        });
      },
    );

    events.on(
      RendererEvents.SHOOT_TOWER,
      (troopId: number, towerId: number, newTowerHp: number) => {
        const troop = this.troops[troopId];
        const tower = this.towers[towerId];
        const dx = tower.x - troop.x;
        const dy = tower.y - troop.y;
        const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx / 2));
        if (troop.troopType.spritesheet !== 'drone') {
          const laserSprite = this.add.image(troop.x, troop.y, 'laser');
          laserSprite.setRotation(angle);
          this.tweens.add({
            targets: [laserSprite],
            x: tower.x,
            y: tower.y,
            duration: Parameters.timePerTurn,
            ease: 'Power2',
            onComplete: () => laserSprite.destroy(),
          });
        } else {
          const bombSprite = this.add.sprite(troop.x, troop.y, 'bomb', 0);
          bombSprite.setRotation(angle);
          this.anims.create({
            key: 'bomb',
            frames: this.anims.generateFrameNumbers('bomb', {
              start: 0,
              end: 2,
            }),
            frameRate: 10,
            repeat: 0,
          });
          bombSprite.play('bomb');
          this.tweens.add({
            targets: [bombSprite],
            x: tower.x,
            y: tower.y,
            duration: Parameters.timePerTurn,
            ease: 'Power2',
            onComplete: () => bombSprite.destroy(),
          });
        }
        tower.healthBar.setHp(newTowerHp);
        troop.attack(tower.x, tower.y);
      },
    );

    events.on(RendererEvents.DEAD, (actorType: string, id: number) => {
      if (actorType === 'A') {
        const troop = this.troops[id];
        troop.dead();
        this.tweens.add({
          targets: [troop, troop.healthBar.bar, troop.shadow?.shadow],
          alpha: 0,
          delay: Parameters.timePerTurn,
          duration: Parameters.timePerTurn,
          onComplete: () => {
            troop.healthBar.destroy();
            troop.shadow?.destroy();
          },
        });
      } else if (actorType === 'D') {
        const tower = this.towers[id];
        this.tweens.add({
          targets: [tower, tower.healthBar],
          alpha: 0,
          delay: Parameters.timePerTurn,
          duration: Parameters.timePerTurn,
          onComplete: () => {
            tower.healthBar.destroy();
          },
        });
      }
    });

    events.on(RendererEvents.LOAD_LOG, (log: string) => {
      this._loadLog(log);
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this._reset();
      this.input.off(Phaser.Input.Events.POINTER_UP);
      this.input.off(Phaser.Input.Events.POINTER_MOVE);
      this.input.off(Phaser.Input.Events.POINTER_DOWN);
      this.input.off(Phaser.Input.Events.POINTER_WHEEL);
    });

    this.scene.pause();
  }

  private _loadLog(log: string): void {
    this._reset();
    if (this.scene.isPaused()) {
      this.scene.resume();
    }

    let currentTurn = 0;
    DebugLog.log = '';
    DebugLog.updateLogCallback(DebugLog.log);

    const logLines = log.split('\n');
    const readTurn = (startI: number) => {
      for (
        currentTurn = startI;
        currentTurn < logLines.length;
        currentTurn += 1
      ) {
        const instruction = Parse(logLines[currentTurn]);
        if (instruction instanceof Instructions.Towers) {
          instruction.towers.forEach(tower => {
            events.emit(
              RendererEvents.PLACE_TOWER,
              tower.typeId,
              tower.posX,
              tower.posY,
            );
          });
        } else if (instruction instanceof Instructions.Spawn) {
          events.emit(
            RendererEvents.SPAWN_TROOP,
            instruction.typeId,
            instruction.posX,
            instruction.posY,
          );
        } else if (instruction instanceof Instructions.Move) {
          events.emit(
            RendererEvents.MOVE_TROOP,
            instruction.id,
            instruction.posX,
            instruction.posY,
          );
        } else if (instruction instanceof Instructions.Shoot) {
          if (instruction.target === 'A') {
            events.emit(
              RendererEvents.SHOOT_TROOP,
              instruction.id1,
              instruction.id2,
              instruction.targetNewHp,
            );
          } else if (instruction.target === 'D') {
            events.emit(
              RendererEvents.SHOOT_TOWER,
              instruction.id1,
              instruction.id2,
              instruction.targetNewHp,
            );
          }
        } else if (instruction instanceof Instructions.Dead) {
          events.emit(
            RendererEvents.DEAD,
            instruction.actorType,
            instruction.id,
          );
        } else if (instruction instanceof Instructions.Coins) {
          events.emit(RendererEvents.CHANGE_COINS, instruction.coin);
        } else if (instruction instanceof Instructions.Destruction) {
          events.emit(RendererEvents.CHANGE_DESTRUCTION, instruction.percent);
        } else if (instruction instanceof Instructions.Turn) {
          events.emit(RendererEvents.NEXT_TURN, instruction.turnNo);
          this.nextTurnTimeout = setTimeout(() => {
            readTurn(currentTurn + 1);
          }, Parameters.timePerTurn) as unknown as number;
          break;
        } else if (instruction instanceof Instructions.Print) {
          DebugLog.log += `${instruction.message}\n`;
          DebugLog.updateLogCallback(DebugLog.log);
        } else if (instruction instanceof Instructions.Errors) {
          DebugLog.log += `${instruction.errorInfo}\n`;
          DebugLog.updateLogCallback(DebugLog.log);
        } else if (instruction instanceof Instructions.End) {
          DebugLog.log += 'Match ended!\n';
          DebugLog.updateLogCallback(DebugLog.log);
          return;
        }
      }
    };

    events.on(RendererEvents.PAUSE, () => {
      clearTimeout(this.nextTurnTimeout);
      this.scene.pause();
    });

    events.on(RendererEvents.RESUME, () => {
      this.scene.resume();
      readTurn(currentTurn + 1);
    });

    events.on(RendererEvents.RESET, () => {
      this._reset();
      if (this.scene.isPaused()) {
        this.scene.resume();
      }
      currentTurn = 0;
      readTurn(currentTurn);
    });

    events.on(RendererEvents.SHUTDOWN, () => {
      this._reset();
    });

    readTurn(0);
  }

  private _reset() {
    clearTimeout(this.nextTurnTimeout);
    this.troops.forEach(troop => {
      troop.removeAllListeners();
      troop.healthBar.destroy();
      troop.destroy();
    });
    this.towers.forEach(tower => {
      tower.removeAllListeners();
      tower.healthBar.destroy();
      tower.destroy();
    });
    this.troops = [];
    this.towers = [];

    const tweens = this.tweens.getAllTweens();
    tweens.forEach(tween => {
      tween.complete();
    });
  }

  update(): void {
    this.troops.forEach(skeleton => {
      skeleton.update();
    });
  }
}
