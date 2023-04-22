import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({
    providedIn: 'root',
})
export class VibrationService {
    constructor() {}

    public async giveHapticFeedback(style = ImpactStyle.Light) {
        await Haptics.impact({
            style,
        });
    }

    public async vibrate() {
        await Haptics.vibrate();
    }
}
