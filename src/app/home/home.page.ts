import { Component } from '@angular/core';
import { GameInstanceService } from '../services/game-instance.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private gameInstanceService: GameInstanceService) {
    this.gameInstanceService.init();
  }

}
