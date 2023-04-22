/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { Motion } from '@capacitor/motion';
import { GameServices } from '@openforge/capacitor-game-services';
import { AchievementsGlobalPlugin, WorldScene } from '@openforge/shared-phaser-singleton';
import * as Phaser from 'phaser';
import { BehaviorSubject } from 'rxjs';

import { VibrationService } from './vibration.service';

@Injectable({
    providedIn: 'root',
})
export class GameInstanceService {
    private readonly leaderboardId = 'CgkIzPzc8d4XEAIQAQ';

    public gameInstance: any;
    score = 0;
    level = 1;
    levelChangeScore = 1000;
    currentActiveTileTypes = 4;
    bombPowerUps = 3;
    powerUpEmitter$: BehaviorSubject<void> = new BehaviorSubject(null);

    constructor(private vibrationService: VibrationService) {
        void Motion.addListener('accel', ({ acceleration: { x, y, z } }) => {
            const threshhold = 20;
            const absX = Math.abs(x);
            const absY = Math.abs(y);
            const absZ = Math.abs(z);
            if (this.bombPowerUps > 0 && (absX > threshhold || absY > threshhold || absZ > threshhold)) {
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
                    global: [AchievementsGlobalPlugin],
                },
                type: Phaser.AUTO,
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                parent: 'forge-main',
                dom: {
                    createContainer: true,
                },
                scene: [WorldScene],
                fps: {
                    forceSetTimeOut: true,
                },
            });
            this.gameInstance.gameInstanceService = this;
            this.gameInstance.vibrationService = this.vibrationService;
            void GameServices.signIn();
        }
    }

    restart() {
        this.submitScore();
        this.score = 0;
        this.level = 1;
        this.currentActiveTileTypes = 4;
        this.bombPowerUps = 3;
        const game = this.gameInstance as Phaser.Game;
        game.scene.getScene(WorldScene.KEY).scene.restart();
    }

    public submitScore(): void {
        const { leaderboardId, score } = this;
        if (score === 0) {
            console.warn('cannot submit score of 0, make sure to call this method before resetting the score property');
            return;
        }
        void GameServices.submitScore({ leaderboardId, score });
        return;
    }

    public showLeaderboard(): void {
        const { leaderboardId } = this;
        void GameServices.showLeaderboard({ leaderboardId });
    }
}
