import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-upload-user-avatar',
  templateUrl: './upload-user-avatar.component.html',
  styleUrls: ['./upload-user-avatar.component.scss'],
})
export class UploadUserAvatarComponent {

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();
  @Input() imageChangedEvent: any = '';
  croppedImage: any = '';

  constructor() { }

  /**
   * Cropped image event
   */
  imageCropped = (event: ImageCroppedEvent): void => {
    this.croppedImage = event.base64;
  }

  /**
   * Close cropper popup
   */
  closeDialog = (): void => {
    this.croppedImage = '';
    this.onClose.emit(false);
  }

  /**
   * Emit new cropped image
   */
  setProfileImage = (): void => {
    this.onClose.emit(this.croppedImage);
  }
}
