import * as Phaser from 'phaser';

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

  currentActiveTileTypes = 4;

  score = 0;

  activeTile1: Phaser.GameObjects.Sprite = null;
  activeTile2: Phaser.GameObjects.Sprite = null;

  startPosX: number;
  startPosY: number;

  canMove = false;

  tileWidth = 136 / 2 + 10;
  tileHeight = 136 / 2 + 10;

  tiles: Phaser.GameObjects.Group;
  random: Phaser.Math.RandomDataGenerator;

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload() {
    this.load.atlas('animals', 'assets/animals.png', 'assets/animals_atlas.json');
  }

  create() {
    this.cameras.main.setBackgroundColor('#34495f');
    // const dog = this.add.image(0, 0, 'animals', 'dog');
    // dog.scale = 0.5;

    this.tiles = this.add.group();

    const seed = Date.now().toString();
    this.random = new Phaser.Math.RandomDataGenerator([seed]);
    this.shuffleTileTypes();
    this.initTiles();
  }

  update() {
    if (this.activeTile1 && !this.activeTile2){
        const hoverX = this.game.input.activePointer.x;
        const hoverY = this.game.input.activePointer.y;

        const hoverPosX = Math.floor(hoverX / this.tileWidth);
        const hoverPosY = Math.floor(hoverY / this.tileHeight);

        const difX = (hoverPosX - this.startPosX);
        const difY = (hoverPosY - this.startPosY);

        if (!(hoverPosY > this.tileGrid[0].length - 1 || hoverPosY < 0) && !(hoverPosX > this.tileGrid.length - 1 || hoverPosX < 0)){

            if ((Math.abs(difY) === 1 && difX === 0) || (Math.abs(difX) === 1 && difY === 0)){
                this.canMove = false;
                this.activeTile2 = this.tileGrid[hoverPosX][hoverPosY];
                this.swapTiles();
                this.time.addEvent({ delay: 500, callback: () => this.checkMatch()});
            }

        }

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
      for (let i = 0; i < this.tileGrid.length; i++){
          for (let j = 0; j < this.tileGrid.length; j++){
              const tile = this.addTile(i, j);
              this.tileGrid[i][j] = tile;
          }
      }
      this.time.addEvent({ delay: 500, callback: () => this.checkMatch()});
  }

  private addTile(x, y) {

      const tileToAdd = this.tileTypes[this.random.integerInRange(0, this.currentActiveTileTypes - 1)];
      const tile = this.tiles.create((x * this.tileWidth) + this.tileWidth / 2, 0, 'animals', tileToAdd);
      tile.scale = 0.5;

      this.add.tween({
        targets: tile,
        duration: 500,
        y: {
          from: tile.y,
          to: y * this.tileHeight + (this.tileHeight / 2),
        }
      });

      tile.setInteractive();
      tile.tileType = tileToAdd;

      (tile as Phaser.GameObjects.Sprite).on('pointerdown', () => this.tileDown(tile));

      return tile;

  }

  private tileDown(tile) {
      if (this.canMove) {
          this.activeTile1 = tile;
          this.startPosX = (tile.x - this.tileWidth / 2) / this.tileWidth;
          this.startPosY = (tile.y - this.tileHeight / 2) / this.tileHeight;
      }
  }

  private swapTiles() {
    if (this.activeTile1 && this.activeTile2){
        const tile1Pos = {
          x: (this.activeTile1.x - this.tileWidth / 2) / this.tileWidth,
          y: (this.activeTile1.y - this.tileHeight / 2) / this.tileHeight
        };

        const tile2Pos = {
          x: (this.activeTile2.x - this.tileWidth / 2) / this.tileWidth,
          y: (this.activeTile2.y - this.tileHeight / 2) / this.tileHeight
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
            to: tile2Pos.y * this.tileHeight + (this.tileHeight / 2),
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
            to: tile1Pos.y * this.tileHeight + (this.tileHeight / 2),
          }
        });
        this.activeTile1 = this.tileGrid[tile1Pos.x][tile1Pos.y];
        this.activeTile2 = this.tileGrid[tile2Pos.x][tile2Pos.y];
    }
  }

  checkMatch(){
      const matches = this.getMatches(this.tileGrid);
      if (matches.length > 0) {
          this.removeTileGroup(matches);
          this.resetTile();
          this.fillTile();
          this.time.addEvent({ delay: 500, callback: () => this.tileUp()});
          this.time.addEvent({ delay: 600, callback: () => this.checkMatch()});
      }
      else {
          this.swapTiles();
          this.time.addEvent({ delay: 500, callback: () => {
              this.tileUp();
              this.canMove = true;
            }
          });
      }
  }

  tileUp(){
    this.activeTile1 = null;
    this.activeTile2 = null;
  }

  getMatches(tileGrid) {

    const matches = [];
    let groups = [];

    // Check for horizontal matches
    let i = 0;
    for (const tempArr of tileGrid) {
        groups = [];
        for (let j = 0; j < tempArr.length; j++)
        {
            if (j < tempArr.length - 2) {
              if (tileGrid[i][j] && tileGrid[i][j + 1] && tileGrid[i][j + 2]) {
                  if (tileGrid[i][j].tileType === tileGrid[i][j + 1].tileType &&
                    tileGrid[i][j + 1].tileType === tileGrid[i][j + 2].tileType) {
                      if (groups.length > 0) {
                          if (groups.indexOf(tileGrid[i][j]) === -1) {
                              matches.push(groups);
                              groups = [];
                          }
                      }

                      if (groups.indexOf(tileGrid[i][j]) === -1) {
                          groups.push(tileGrid[i][j]);
                      }
                      if (groups.indexOf(tileGrid[i][j + 1]) === -1) {
                          groups.push(tileGrid[i][j + 1]);
                      }
                      if (groups.indexOf(tileGrid[i][j + 2]) === -1) {
                          groups.push(tileGrid[i][j + 2]);
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
    for (const tempArr of tileGrid) {
        groups = [];
        for (i = 0; i < tempArr.length; i++)  {
            if (i < tempArr.length - 2) {
                if (tileGrid[i][j] && tileGrid[i + 1][j] && tileGrid[i + 2][j]) {
                    if (tileGrid[i][j].tileType === tileGrid[i + 1][j].tileType &&
                      tileGrid[i + 1][j].tileType === tileGrid[i + 2][j].tileType) {
                        if (groups.length > 0) {
                            if (groups.indexOf(tileGrid[i][j]) === -1) {
                                matches.push(groups);
                                groups = [];
                            }
                        }

                        if (groups.indexOf(tileGrid[i][j]) === -1) {
                            groups.push(tileGrid[i][j]);
                        }
                        if (groups.indexOf(tileGrid[i + 1][j]) === -1) {
                            groups.push(tileGrid[i + 1][j]);
                        }
                        if (groups.indexOf(tileGrid[i + 2][j]) === -1) {
                            groups.push(tileGrid[i + 2][j]);
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

  removeTileGroup(matches){
    for (const tempArr of matches){
        for (const tile of tempArr){
            const tilePos = this.getTilePos(this.tileGrid, tile);
            this.tiles.remove(tile, true);
            if (tilePos.x !== -1 && tilePos.y !== -1){
                this.tileGrid[tilePos.x][tilePos.y] = null;
            }
        }
    }
  }

  getTilePos(tileGrid, tile) {
    const pos = {x: -1, y: -1};

    for (let i = 0; i < tileGrid.length ; i++) {
        for (let  j = 0; j < tileGrid[i].length; j++) {
            if (tile === tileGrid[i][j]) {
                pos.x = i;
                pos.y = j;
                break;
            }
        }
    }

    return pos;
  }

  resetTile(){
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
                    to: (this.tileHeight * j) + (this.tileHeight / 2),
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
