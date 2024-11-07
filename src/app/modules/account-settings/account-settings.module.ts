import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AccountSettingsRoutingModule } from './account-settings.routing';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { CustomDirectives } from '../../directives/directive.module';
import { CommonMenu } from '../common-menus/menu.module';
import { AccountSettingsComponent } from './account-settings.component';
import { UploadUserAvatarComponent } from './upload-user-avatar/upload-user-avatar.component';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user-management/user.service';
import { AccountSettingsService } from './account-settings.service';

@NgModule({
  declarations: [
    AccountSettingsComponent,
    UploadUserAvatarComponent
  ],
  imports: [
    ImageCropperModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountSettingsRoutingModule,
    UIKitModule,
    CustomDirectives,
    CommonMenu
  ],
  providers: [
    AccountSettingsService,
    UserService,
    AuthService
  ],
  bootstrap: []
})
export class AccountSettingsModule { }
