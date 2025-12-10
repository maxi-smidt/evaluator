import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ChangePasswordComponent } from './change-password/change-password.component';

@Component({
    selector: 'ms-settings-view',
    templateUrl: './settings-view.component.html',
    imports: [TranslatePipe, ChangePasswordComponent]
})
export class SettingsViewComponent {}
