import * as Phaser from 'phaser';
import { GameInstanceService } from '../services/game-instance.service';
import { VibrationService } from '../services/vibration.service';
import { skip, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';

export class MainScene extends Phaser.Scene {
  static KEY = 'main-scene';

  tileGrid = [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ];

  tileTypes = [
    'bear',
    'buffalo',
    'chick',
    'chicken',
    'cow',
    'crocodile',
    'dog',
    'duck',
    'elephant',
    'frog',
    'giraffe',
    'goat',
    'gorilla',
    'hippo',
    'horse',
    'monkey',
    'moose',
    'narwhal',
    'owl',
    'panda',
    'parrot',
    'penguin',
    'pig',
    'rabbit',
    'rhino',
    'sloth',
    'snake',
    'walrus',
    'whale',
    'zebra'
  ];

  activeTile1: Phaser.GameObjects.Sprite = null;
  activeTile2: Phaser.GameObjects.Sprite = null;

  startPosX: number;
  startPosY: number;

  canMove = false;

  bombs: Phaser.GameObjects.Image[] = [];

  assetTileSize = 136;
  tileWidth: number;
  tileHeight: number;
  yOffset: number;

  tiles: Phaser.GameObjects.Group;
  random: Phaser.Math.RandomDataGenerator;

  gameInstanceService: GameInstanceService;

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload() {
    this.load.atlas('animals', 'assets/animals.png', 'assets/animals_atlas.json');
    this.load.image('bomb', 'assets/bomb.png');
  }

  create() {
    this.gameInstanceService = (this.scene.scene.game as any).gameInstanceService;
    this.cameras.main.setBackgroundColor('#34495f');

    this.tileWidth = this.game.scale.gameSize.width / 6;
    this.tileHeight = this.game.scale.gameSize.width / 6;

    this.yOffset = this.game.scale.gameSize.height / 4;

    this.tiles = this.add.group();

    const seed = Date.now().toString();
    this.random = new Phaser.Math.RandomDataGenerator([seed]);
    this.shuffleTileTypes();
    this.initTiles();

    const powerUpEmitter$ = (this.gameInstanceService as any).powerUpEmitter$ as Observable<void>;
    powerUpEmitter$.pipe(skip(1), debounceTime(500)).subscribe(() => {
      (this.gameInstanceService as any).decreasePowerup();
      this.clearTiles();
    });
  }

  update() {
    if (this.activeTile1 && !this.activeTile2) {
      const hoverX = this.game.input.activePointer.x;
      const hoverY = this.game.input.activePointer.y;

      const hoverPosX = Math.floor(hoverX / this.tileWidth);
      const hoverPosY = Math.floor((hoverY - this.yOffset) / this.tileHeight);

      const difX = (hoverPosX - this.startPosX);
      const difY = (hoverPosY - this.startPosY);

      if (!(hoverPosY > this.tileGrid[0].length - 1 || hoverPosY < 0) && !(hoverPosX > this.tileGrid.length - 1 || hoverPosX < 0)) {

        if ((Math.abs(difY) === 1 && difX === 0) || (Math.abs(difX) === 1 && difY === 0)) {
          this.canMove = false;
          this.activeTile2 = this.tileGrid[hoverPosX][hoverPosY];
          this.swapTiles();
          this.time.addEvent({ delay: 500, callback: () => this.checkMatch() });
        }

      }

    }
    this.getPowerups();
  }

  getPowerups() {
    this.bombs.forEach(bomb => bomb.destroy());
    const bombs = (this.gameInstanceService as any).bombPowerUps;
    const x = 50;
    const y = 100;
    for (let i = 0; i < bombs; i++) {
      const bomb = this.add.image(x * (i + 1), y, 'bomb').setScale(.1);
      this.bombs.push(bomb);
    }
  }

  shuffleTileTypes() {
    let j;
    let x;
    for (let i = this.tileTypes.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = this.tileTypes[i];
      this.tileTypes[i] = this.tileTypes[j];
      this.tileTypes[j] = x;
    }
  }

  private initTiles() {
    for (let i = 0; i < this.tileGrid.length; i++) {
      for (let j = 0; j < this.tileGrid.length; j++) {
        const tile = this.addTile(i, j);
        this.tileGrid[i][j] = tile;
      }
    }
    this.time.addEvent({ delay: 500, callback: () => this.checkMatch() });
  }

  private addTile(x: number, y: number) {

    const tileToAdd = this.tileTypes[this.random.integerInRange(0, this.gameInstanceService.currentActiveTileTypes - 1)];
    const tile = this.tiles.create((x * this.tileWidth) + this.tileWidth / 2, 0, 'animals', tileToAdd);
    tile.scale = (this.tileWidth - 10) / this.assetTileSize;

    this.add.tween({
      targets: tile,
      duration: 500,
      y: {
        from: tile.y,
        to: y * this.tileHeight + (this.tileHeight / 2) + (this.yOffset),
      }
    });

    tile.setInteractive();
    tile.tileType = tileToAdd;

    (tile as Phaser.GameObjects.Sprite).on('pointerdown', () => this.tileDown(tile));

    return tile;

  }

  private tileDown(tile: Phaser.GameObjects.Sprite) {
    const vibrationSvc = (this.gameInstanceService as any).vibrationSvc as VibrationService;
    vibrationSvc.giveHapticFeedback();
    if (this.canMove) {
      this.activeTile1 = tile;
      this.startPosX = (tile.x - this.tileWidth / 2) / this.tileWidth;
      this.startPosY = (tile.y - this.tileHeight / 2 - (this.yOffset)) / this.tileHeight;
    }
  }

  private swapTiles() {
    if (this.activeTile1 && this.activeTile2) {
      const tile1Pos = {
        x: (this.activeTile1.x - this.tileWidth / 2) / this.tileWidth,
        y: (this.activeTile1.y - this.tileHeight / 2 - (this.yOffset)) / this.tileHeight
      };

      const tile2Pos = {
        x: (this.activeTile2.x - this.tileWidth / 2) / this.tileWidth,
        y: (this.activeTile2.y - this.tileHeight / 2 - (this.yOffset)) / this.tileHeight
      };

      this.tileGrid[tile1Pos.x][tile1Pos.y] = this.activeTile2;
      this.tileGrid[tile2Pos.x][tile2Pos.y] = this.activeTile1;

      this.add.tween({
        targets: this.activeTile1,
        duration: 200,
        x: {
          from: this.activeTile1.x,
          to: tile2Pos.x * this.tileWidth + (this.tileWidth / 2),
        },
        y: {
          from: this.activeTile1.y,
          to: tile2Pos.y * this.tileHeight + (this.tileHeight / 2) + (this.yOffset),
        }
      });

      this.add.tween({
        targets: this.activeTile2,
        duration: 200,
        x: {
          from: this.activeTile2.x,
          to: tile1Pos.x * this.tileWidth + (this.tileWidth / 2),
        },
        y: {
          from: this.activeTile2.y,
          to: tile1Pos.y * this.tileHeight + (this.tileHeight / 2) + (this.yOffset),
        }
      });
      this.activeTile1 = this.tileGrid[tile1Pos.x][tile1Pos.y];
      this.activeTile2 = this.tileGrid[tile2Pos.x][tile2Pos.y];
    }
  }

  checkMatch() {
    const vibrationSvc = (this.gameInstanceService as any).vibrationSvc as VibrationService;
    const matches = this.getMatches();
    if (matches.length > 0) {
      vibrationSvc.vibrate();
      this.removeTileGroup(matches);
      this.resetTile();
      this.fillTile();
      this.time.addEvent({ delay: 500, callback: () => this.tileUp() });
      this.time.addEvent({ delay: 600, callback: () => this.checkMatch() });
    }
    else {
      this.swapTiles();
      this.time.addEvent({
        delay: 500, callback: () => {
          this.tileUp();
          this.canMove = true;
        }
      });
    }
  }

  clearTiles() {
    const vibrationSvc = (this.gameInstanceService as any).vibrationSvc as VibrationService;
    vibrationSvc.vibrate();
    this.removeTileGroup(this.tileGrid);
    this.fillTile();
  }

  tileUp() {
    this.activeTile1 = null;
    this.activeTile2 = null;
  }

  getMatches() {

    const matches = [];
    let groups = [];

    // Check for horizontal matches
    let i = 0;
    for (const tempArr of this.tileGrid) {
      groups = [];
      for (let j = 0; j < tempArr.length; j++) {
        if (j < tempArr.length - 2) {
          if (this.tileGrid[i][j] && this.tileGrid[i][j + 1] && this.tileGrid[i][j + 2]) {
            if (this.tileGrid[i][j].tileType === this.tileGrid[i][j + 1].tileType &&
              this.tileGrid[i][j + 1].tileType === this.tileGrid[i][j + 2].tileType) {
              if (groups.length > 0) {
                if (groups.indexOf(this.tileGrid[i][j]) === -1) {
                  matches.push(groups);
                  groups = [];
                }
              }

              if (groups.indexOf(this.tileGrid[i][j]) === -1) {
                groups.push(this.tileGrid[i][j]);
              }
              if (groups.indexOf(this.tileGrid[i][j + 1]) === -1) {
                groups.push(this.tileGrid[i][j + 1]);
              }
              if (groups.indexOf(this.tileGrid[i][j + 2]) === -1) {
                groups.push(this.tileGrid[i][j + 2]);
              }
            }
          }
        }
      }
      if (groups.length > 0) {
        matches.push(groups);
      }
      i++;
    }

    // Check for vertical matches
    let j = 0;
    for (const tempArr of this.tileGrid) {
      groups = [];
      for (i = 0; i < tempArr.length; i++) {
        if (i < tempArr.length - 2) {
          if (this.tileGrid[i][j] && this.tileGrid[i + 1][j] && this.tileGrid[i + 2][j]) {
            if (this.tileGrid[i][j].tileType === this.tileGrid[i + 1][j].tileType &&
              this.tileGrid[i + 1][j].tileType === this.tileGrid[i + 2][j].tileType) {
              if (groups.length > 0) {
                if (groups.indexOf(this.tileGrid[i][j]) === -1) {
                  matches.push(groups);
                  groups = [];
                }
              }

              if (groups.indexOf(this.tileGrid[i][j]) === -1) {
                groups.push(this.tileGrid[i][j]);
              }
              if (groups.indexOf(this.tileGrid[i + 1][j]) === -1) {
                groups.push(this.tileGrid[i + 1][j]);
              }
              if (groups.indexOf(this.tileGrid[i + 2][j]) === -1) {
                groups.push(this.tileGrid[i + 2][j]);
              }
            }
          }
        }
      }
      if (groups.length > 0) {
        matches.push(groups);
      }
      j++;
    }
    return matches;
  }

  removeTileGroup(matches) {
    console.log('matches: ', matches);
    for (const tempArr of matches) {
      for (const tile of tempArr) {
        const tilePos = this.getTilePos(this.tileGrid, tile);
        this.tiles.remove(tile, true);
        this.incrementScore();
        if (tilePos.x !== -1 && tilePos.y !== -1) {
          this.tileGrid[tilePos.x][tilePos.y] = null;
        }
      }
    }
  }

  incrementScore() {
    this.gameInstanceService.score += 10;
    if (this.gameInstanceService.score > 0 && this.gameInstanceService.score % this.gameInstanceService.levelChangeScore === 0) {
      this.gameInstanceService.level++;
      if (this.gameInstanceService.currentActiveTileTypes < this.tileTypes.length) {
        this.gameInstanceService.currentActiveTileTypes++;
      }
    }
  }

  getTilePos(tileGrid, tile) {
    const pos = { x: -1, y: -1 };

    for (let i = 0; i < tileGrid.length; i++) {
      for (let j = 0; j < tileGrid[i].length; j++) {
        if (tile === tileGrid[i][j]) {
          pos.x = i;
          pos.y = j;
          break;
        }
      }
    }

    return pos;
  }

  resetTile() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.tileGrid.length; i++) {
      for (let j = this.tileGrid[i].length - 1; j > 0; j--) {
        if (this.tileGrid[i][j] == null && this.tileGrid[i][j - 1] != null) {
          const tempTile = this.tileGrid[i][j - 1];
          this.tileGrid[i][j] = tempTile;
          this.tileGrid[i][j - 1] = null;

          this.add.tween({
            targets: tempTile,
            duration: 200,
            y: {
              from: tempTile.y,
              to: (this.tileHeight * j) + (this.tileHeight / 2) + (this.yOffset),
            }
          });

          j = this.tileGrid[i].length;
        }
      }
    }
  }

  fillTile() {
    for (let i = 0; i < this.tileGrid.length; i++) {
      for (let j = 0; j < this.tileGrid.length; j++) {
        if (this.tileGrid[i][j] == null) {
          const tile = this.addTile(i, j);
          this.tileGrid[i][j] = tile;
        }
      }
    }
  }

}
