import { Injectable } from '@angular/core';
import * as Phaser from 'phaser';
import { MainScene } from '../phaser/main.scene';
import { VibrationService } from './vibration.service';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import '@openforge/capacitor-game-services';
import { GameServicesPlugin } from '@openforge/capacitor-game-services';
import { AchievementsGlobalPlugin } from '../phaser/achievement.plugin';

const { Motion } = Plugins;
const GameServices = Plugins.GameServices as GameServicesPlugin;

@Injectable({ providedIn: 'root' })
export class GameInstanceService {
  private readonly leaderboardId = 'CgkIzPzc8d4XEAIQAQ';

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
      }
    });
  }

  decreasePowerup() {
    this.bombPowerUps--;
  }

  init() {
    if (!this.gameInstance) {
      this.gameInstance = new Phaser.Game({
        plugins: {
          global: [
            AchievementsGlobalPlugin,
          ]
        },
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
      GameServices.signIn();
    }
  }

  restart() {
    this.submitScore();
    this.score = 0;
    this.level = 1;
    this.currentActiveTileTypes = 4;
    this.bombPowerUps = 3;
    const game = this.gameInstance as Phaser.Game;
    game.scene.getScene(MainScene.KEY).scene.restart();
  }

  public submitScore(): void {
    const { leaderboardId, score } = this;
    if (score === 0) {
      console.warn('cannot submit score of 0, make sure to call this method before resetting the score property');
      return;
    }
    GameServices.submitScore({ leaderboardId, score, });
    return;
  }

  public showLeaderboard(): void {
    const { leaderboardId } = this;
    GameServices.showLeaderboard({ leaderboardId });
  }

}
