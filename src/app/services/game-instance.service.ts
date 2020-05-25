import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { MainScene } from '../phaser/main.scene';

@Injectable({ providedIn: 'root' })
export class GameInstanceService {

  public gameInstance: any;

  image: Phaser.GameObjects.Image;
  key;

  currentScene;

  constructor() {
  }

  init() {
    if (!this.gameInstance) {
      this.gameInstance = new Phaser.Game({
        width: window.innerWidth,
        height: window.innerHeight,
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: 'game-main',
        dom: {
          createContainer: true
        },
        scene: [MainScene],
        fps: {
          forceSetTimeOut: true
        }
      });
    }
  }

}
