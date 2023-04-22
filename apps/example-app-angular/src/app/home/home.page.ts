/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Component, OnInit } from '@angular/core';
import { GameInstanceService } from '@openforge/shared/data-access-model';
// import { PhaserSingletonService } from '@openforge/shared-phaser-singleton';

@Component({
    selector: 'openforge-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePageComponent implements OnInit {
    constructor(private gameInstanceService: GameInstanceService) {}
    /**
     * * On Init, initilize the Phaser Singleton instance
     * The initialisation is delayed by 500ms to give the HomePage the chance to render
     * the <div class="phaser" id="forge-main">
     *
     * If we don't delay it, the canvas size in preload() and create() will be 0.
     * With the delay the canvas size will be set correctly.
     */
    async ngOnInit(): Promise<void> {
        console.log('HomePageComponent', 'ngOnInit');
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        setTimeout(() => {
            this.gameInstanceService.init();
        }, 500);
    }
}
