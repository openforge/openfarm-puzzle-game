// eslint-disable-next-line simple-import-sort/imports
import { Injectable } from '@angular/core';
import { AlertController, AlertButton } from '@ionic/angular';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {
    constructor(private alertController: AlertController) {}

    public async createAlert(header: string, message: string, buttons: AlertButton[]) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons,
        });
        await alert.present();
        return alert;
    }
}
