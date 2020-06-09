import * as Phaser from 'phaser';
import { GameInstanceService } from '../services/game-instance.service';
import { VibrationService } from '../services/vibration.service';
import { skip, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { AchievementsPlugin } from './achievement.plugin';

export class MainScene extends Phaser.Scene {
  static KEY = 'main-scene';
  private achievements: AchievementsPlugin;

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
  assetScale: number;

  tiles: Phaser.GameObjects.Group;
  random: Phaser.Math.RandomDataGenerator;

  gameInstanceService: GameInstanceService;
  matchParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  feedbox: Phaser.GameObjects.Image;
  scoreText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload() {
    this.load.atlas('animals', 'assets/animals.png', 'assets/animals_atlas.json');
    this.load.svg('back-fence', 'assets/back_fence.svg', { scale: 1 });
    this.load.svg('feed', 'assets/feed.svg', { scale: 1 });
    this.load.svg('feedbox', 'assets/feedbox.svg', { scale: 1 });
    this.load.svg('front-fence', 'assets/front_fence.svg', { scale: 1 });
    this.load.svg('refresh-sign', 'assets/refresh_sign.svg', { scale: 1 });
    this.load.svg('title', 'assets/title_level_score.svg', { scale: 1 });
    this.load.image('match-particle', 'assets/white_particle.png');
  }

  create() {
    this.gameInstanceService = (this.scene.scene.game as any).gameInstanceService;
    this.cameras.main.setBackgroundColor('#49a139');

    this.tileWidth = this.game.scale.gameSize.width / 6;
    this.tileHeight = this.game.scale.gameSize.width / 6;
    this.yOffset = this.game.scale.gameSize.height / 4;
    this.assetScale = (this.tileWidth - 10) / this.assetTileSize;

    this.matchParticles = this.add.particles('match-particle');
    this.matchParticles.createEmitter({
      angle: { min: 240, max: 300 },
      speed: { min: 400, max: 600 },
      quantity: { min: 20, max: 50 },
      lifespan: 1000,
      alpha: { start: 1, end: 0 },
      scale: this.assetScale,
      gravityY: 800,
      on: false
    });

    this.add.rectangle(0, 0, this.game.scale.gameSize.width, this.yOffset - this.tileHeight, 0x9ef1ff).setOrigin(0);
    const title = this.add.image(this.game.scale.gameSize.width / 2, 0, 'title').setOrigin(0.5, 0)
    .setScale(this.game.scale.gameSize.width / 515)
    .setDepth(1);

    this.scoreText = this.add
    .text(111 * (this.game.scale.gameSize.width / 515), 168 * (this.game.scale.gameSize.width / 515), 'Score: 0',
      {
        align: 'center',
        fontSize: '26px',
        stroke: '#000000',
        strokeThickness: 1
      })
    .setOrigin(0.5)
    .setScale(this.game.scale.gameSize.width / 515)
    .setDepth(2);

    this.levelText = this.add
    .text(407 * (this.game.scale.gameSize.width / 515), 168 * (this.game.scale.gameSize.width / 515), 'Level: 1',
      {
        align: 'center',
        fontSize: '26px',
        stroke: '#000000',
        strokeThickness: 1
      })
    .setOrigin(0.5)
    .setScale(this.game.scale.gameSize.width / 515)
    .setDepth(2);


    this.add.image(0, this.yOffset - this.tileHeight / 2, 'back-fence').setOrigin(0).setScale(this.game.scale.gameSize.width / 1021);
    this.add.image(0, this.yOffset + this.tileHeight * 6, 'front-fence')
    .setOrigin(0).setScale(this.game.scale.gameSize.width / 1021);

    this.feedbox = this.add.image(0, this.game.scale.gameSize.height - 5, 'feedbox')
    .setOrigin(0, 1).setScale((this.game.scale.gameSize.width / 6) / 199 * 1.7);

    const restartSign = this.add.image(this.game.scale.gameSize.width - 5, this.game.scale.gameSize.height, 'refresh-sign')
    .setOrigin(1).setScale((this.game.scale.gameSize.width / 6) / 224 * 2).setInteractive();
    restartSign.on('pointerdown', () => this.gameInstanceService.restart());

    this.getPowerups();

    this.tiles = this.add.group();

    const seed = Date.now().toString();
    this.random = new Phaser.Math.RandomDataGenerator([seed]);
    this.shuffleTileTypes();
    this.initTiles();

    const powerUpEmitter$ = (this.gameInstanceService as any).powerUpEmitter$ as Observable<void>;
    powerUpEmitter$.pipe(skip(1), debounceTime(500)).subscribe(() => {
      this.triggerBomb();
    });
  }

  update() {
    if (this.activeTile1 && !this.activeTile2) {
      const hoverX = this.game.input.activePointer.x;
      const hoverY = this.game.input.activePointer.y;

      const startPosX = Math.floor(this.activeTile1.x / this.tileWidth);
      const startPosY = Math.floor((this.activeTile1.y - this.yOffset) / this.tileHeight);

      const hoverPosX = Math.floor(hoverX / this.tileWidth);
      const hoverPosY = Math.floor((hoverY - this.yOffset) / this.tileHeight);

      let difX = (hoverPosX - this.startPosX);
      let difY = (hoverPosY - this.startPosY);

      if (difX > 0 && difX !== 0) {
        difX = 1;
      }
      if (difX < 0 && difX !== 0) {
        difX = -1;
      }
      if (difY > 0 && difY !== 0) {
        difY = 1;
      }
      if (difY < 0 && difY !== 0) {
        difY = -1;
      }

      if (!(hoverPosY > this.tileGrid[0].length - 1 || hoverPosY < 0) && !(hoverPosX > this.tileGrid.length - 1 || hoverPosX < 0)) {
        if ((Math.abs(difY) >= 1 && difX === 0) || (Math.abs(difX) >= 1 && difY === 0)) {
          this.canMove = false;
          this.activeTile2 = this.tileGrid[startPosX + difX][startPosY + difY];
          this.swapTiles();
          this.time.addEvent({ delay: 500, callback: () => this.checkMatch() });
        }

      }
    }
  }

  private getPowerups() {
    this.bombs.forEach(bomb => bomb.destroy());
    this.bombs = [];
    const bombs = (this.gameInstanceService as any).bombPowerUps;
    for (let i = 0; i < bombs; i++) {
      const bomb = this.add.image(i * this.tileWidth * 1.5 / 2 + this.tileWidth * 1.5 / 3,
        this.game.scale.height - 5 - this.feedbox.height * this.feedbox.scale / 2, 'feed')
        .setScale(this.assetScale * 1.5).setOrigin(0.5).setInteractive();
      (bomb as Phaser.GameObjects.Sprite).on('pointerdown', () => this.triggerBomb());
      this.bombs.push(bomb);
    }
  }

  triggerBomb() {
    if (this.canMove && this.gameInstanceService.bombPowerUps > 0) {
      this.canMove = false;
      this.gameInstanceService.decreasePowerup();
      this.bombs[this.gameInstanceService.bombPowerUps].destroy(true);
      this.clearTiles();
      this.time.addEvent({ delay: 500, callback: () => this.checkMatch() });
    }
  }

  private shuffleTileTypes() {
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
    tile.scale = this.assetScale;

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
    if (Capacitor.platform !== 'web') {
      vibrationSvc.giveHapticFeedback();
    }
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

  private checkMatch() {
    const vibrationSvc = (this.gameInstanceService as any).vibrationSvc as VibrationService;
    const matches = this.getMatches(this.tileGrid);
    if (matches.length > 0) {
      if (Capacitor.platform !== 'web') {
        vibrationSvc.vibrate();
      }
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
          this.canMove = !this.checkGameOver();
        }
      });
    }
  }

  private checkGameOver(): boolean {
    const outOfBombs: boolean = this.gameInstanceService.bombPowerUps === 0;
    const outOfMoves: boolean = !this.checkSwapPossible();

    if (outOfBombs && outOfMoves) {
      this.gameInstanceService.submitScore();

      const levelText = this.add
        .text(this.game.scale.gameSize.width / 2, this.game.scale.gameSize.height / 2, 'Game Over \nNo more moves',
          {
            align: 'center',
            fontSize: '32px',
            stroke: '#000000',
            strokeThickness: 5
          })
        .setOrigin(0.5)
        .setDepth(1);

      this.tweens.add({
        targets: levelText,
        scaleX: 1,
        scaleY: 1,
        angle: 360,
        _ease: 'Sine.easeInOut',
        ease: 'Power2',
        duration: 1000,
        delay: 50
      });
      return true;
    }
    return false;
  }

  private clearTiles() {
    const vibrationSvc = (this.gameInstanceService as any).vibrationSvc as VibrationService;
    if (Capacitor.platform !== 'web') {
      vibrationSvc.vibrate();
    }
    this.removeTileGroup(this.tileGrid);
    this.fillTile();
  }

  private tileUp() {
    this.activeTile1 = null;
    this.activeTile2 = null;
  }

  private getMatches(grid) {
    const matches = [];
    let groups = [];
    // Check for horizontal matches
    let i = 0;
    let j = 0;

    for (const tempArr of grid) {
      groups = [];
      for (j = 0; j < tempArr.length; j++) {
        if (j < tempArr.length - 2) {
          if (grid[i][j] && grid[i][j + 1] && grid[i][j + 2]) {
            if (grid[i][j].tileType === grid[i][j + 1].tileType &&
              grid[i][j + 1].tileType === grid[i][j + 2].tileType) {
              if (groups.length > 0) {
                if (groups.indexOf(grid[i][j]) === -1) {
                  matches.push(groups);
                  groups = [];
                }
              }

              if (groups.indexOf(grid[i][j]) === -1) {
                groups.push(grid[i][j]);
              }
              if (groups.indexOf(grid[i][j + 1]) === -1) {
                groups.push(grid[i][j + 1]);
              }
              if (groups.indexOf(grid[i][j + 2]) === -1) {
                groups.push(grid[i][j + 2]);
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

    i = 0;
    j = 0;

    // Check for vertical matches
    for (const tempArr of grid) {
      groups = [];
      for (i = 0; i < tempArr.length; i++) {
        if (i < tempArr.length - 2) {
          if (grid[i][j] && grid[i + 1][j] && grid[i + 2][j]) {
            if (grid[i][j].tileType === grid[i + 1][j].tileType &&
              grid[i + 1][j].tileType === grid[i + 2][j].tileType) {
              if (groups.length > 0) {
                if (groups.indexOf(grid[i][j]) === -1) {
                  matches.push(groups);
                  groups = [];
                }
              }

              if (groups.indexOf(grid[i][j]) === -1) {
                groups.push(grid[i][j]);
              }
              if (groups.indexOf(grid[i + 1][j]) === -1) {
                groups.push(grid[i + 1][j]);
              }
              if (groups.indexOf(grid[i + 2][j]) === -1) {
                groups.push(grid[i + 2][j]);
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

  private checkSwapPossible() {
    const testGrid = [];
    for (const tempArr of this.tileGrid) {
      const testArr = [];
      for (const tempTile of tempArr) {
        testArr.push({ tileType: tempTile.tileType });
      }
      testGrid.push(testArr);
    }

    for (let i = 0; i < testGrid.length; i++) {
      for (let j = 0; j < testGrid[i].length; j++) {
        if (j > 0) {
          const tile1 = testGrid[i][j];
          const tile2 = testGrid[i][j - 1];

          testGrid[i][j] = tile2;
          testGrid[i][j - 1] = tile1;

          if (this.getMatches(testGrid).length > 0) {
            return true;
          }

          testGrid[i][j] = tile1;
          testGrid[i][j - 1] = tile2;
        }

        if (j < testGrid[i].length - 1) {
          const tile1 = testGrid[i][j];
          const tile2 = testGrid[i][j + 1];

          testGrid[i][j] = tile2;
          testGrid[i][j + 1] = tile1;

          if (this.getMatches(testGrid).length > 0) {
            return true;
          }

          testGrid[i][j] = tile1;
          testGrid[i][j + 1] = tile2;
        }

        if (i > 0) {
          const tile1 = testGrid[i][j];
          const tile2 = testGrid[i - 1][j];

          testGrid[i][j] = tile2;
          testGrid[i - 1][j] = tile1;

          if (this.getMatches(testGrid).length > 0) {
            return true;
          }

          testGrid[i][j] = tile1;
          testGrid[i - 1][j] = tile2;
        }

        if (i < testGrid.length - 1) {
          const tile1 = testGrid[i][j];
          const tile2 = testGrid[i + 1][j];

          testGrid[i][j] = tile2;
          testGrid[i + 1][j] = tile1;

          if (this.getMatches(testGrid).length > 0) {
            return true;
          }

          testGrid[i][j] = tile1;
          testGrid[i + 1][j] = tile2;
        }
      }
    }

    return false;
  }

  private removeTileGroup(matches) {
    for (const tempArr of matches) {
      for (const tile of tempArr) {
        const tilePos = this.getTilePos(this.tileGrid, tile);
        this.matchParticles.emitParticleAt(tile.x, tile.y);
        this.tiles.remove(tile, true);
        this.incrementScore();
        if (tilePos.x !== -1 && tilePos.y !== -1) {
          this.tileGrid[tilePos.x][tilePos.y] = null;
        }
      }
    }
  }

  private incrementScore() {
    this.gameInstanceService.score += 10;
    this.scoreText.setText(`Score: ${this.gameInstanceService.score}`);
    this.achievements.checkScoreAchievementsState(this.gameInstanceService.score);
    this.checkLevelChange();
  }

  private checkLevelChange() {
    if (this.gameInstanceService.score > 0 && this.gameInstanceService.score % this.gameInstanceService.levelChangeScore === 0) {
      this.gameInstanceService.level++;
      if (this.gameInstanceService.currentActiveTileTypes < this.tileTypes.length) {
        this.gameInstanceService.currentActiveTileTypes++;
      }

      const levelText = this.add.text(this.game.scale.gameSize.width / 2, this.game.scale.gameSize.height / 2, `Level ${this.gameInstanceService.level}`,
        {
          fontSize: '32px',
          stroke: '#000000',
          strokeThickness: 5
        }).setOrigin(0.5).setDepth(1);

      this.tweens.add({
        targets: levelText,
        scaleX: 1,
        scaleY: 1,
        angle: 360,
        _ease: 'Sine.easeInOut',
        ease: 'Power2',
        duration: 1000,
        delay: 50
      });

      this.time.addEvent({
        delay: 2000, callback: () => {
          levelText.destroy(true);
        }
      });

      this.levelText.setText(`Level ${this.gameInstanceService.level}`);
    }
  }

  private getTilePos(tileGrid, tile) {
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

  private resetTile() {
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

  private fillTile() {
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
