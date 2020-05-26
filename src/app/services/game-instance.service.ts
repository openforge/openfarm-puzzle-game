import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { MainScene } from '../phaser/main.scene';
import { VibrationService } from './vibration.service';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

const { Motion } = Plugins;

@Injectable({ providedIn: 'root' })
export class GameInstanceService {

  public gameInstance: any;
  score = 0;
  level = 1;
  levelChangeScore = 1000;
  currentActiveTileTypes = 4;
  bombPowerUps = 3;
  powerUpEmitter$: BehaviorSubject<void> = new BehaviorSubject(null);

  constructor(
    private vibrationSvc: VibrationService
  ) {
    Motion.addListener('accel', ({ acceleration: { x, y, z } }) => {
      const threshhold = 20;
      const absX = Math.abs(x);
      const absY = Math.abs(y);
      const absZ = Math.abs(z);
      if ((this.bombPowerUps > 0) && (absX > threshhold || absY > threshhold || absZ > threshhold)) {
        this.powerUpEmitter$.next();
        this.bombPowerUps--;
        console.log('remaining powerups: ', this.bombPowerUps);
      }
    });
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
      this.gameInstance.gameInstanceService = this;
      this.gameInstance.vibrationSvc = this.vibrationSvc;
    }
  }

  restart() {
    this.score = 0;
    this.level = 1;
    this.currentActiveTileTypes = 4;
    const game = this.gameInstance as Phaser.Game;
    game.scene.getScene(MainScene.KEY).scene.restart();
  }

}
