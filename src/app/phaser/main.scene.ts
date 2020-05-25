import * as Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  static KEY = 'main-scene';

  constructor() {
    super({ key: MainScene.KEY });
  }

  preload() {
    this.load.atlas('animals', 'assets/animals.png', 'assets/animals_atlas.json');
  }

  create() {
    console.log(this.add);
    this.add.image(0, 0, 'animals', 'gorilla');
  }

  update() {

  }
}