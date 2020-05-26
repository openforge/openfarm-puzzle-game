import { Injectable } from '@angular/core';
import {
  Plugins,
  HapticsImpactStyle
} from '@capacitor/core';

const { Haptics } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class VibrationService {

  constructor() { }

  giveHapticFeedback(style = HapticsImpactStyle.Light) {
    Haptics.impact({
      style
    });
  }

  vibrate() {
    Haptics.vibrate();
  }
}
