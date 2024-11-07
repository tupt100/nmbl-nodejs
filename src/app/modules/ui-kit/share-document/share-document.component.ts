import { Component, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-share-document',
  templateUrl: './share-document.component.html',
  styleUrls: ['./share-document.component.scss']
})
export class ShareDocumentComponent {

  @Input() isPrivate: boolean = true;

  constructor(
    private sharedService: SharedService
  ) { }

  /**
   * Bindings
   */
  public email = '';
  public submitted = false;
  public isInvalidEmail = false;
  public emailRegEx = this.sharedService.emailRegEx;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.onClose.emit(false);
    }
  }

  /**
   * Validate and send email address
   */
  onSubmit() {
    this.submitted = false;
    this.isInvalidEmail = false;
    if (this.email.trim().length > 0) {
      if (this.emailRegEx.test(this.email)) {
        this.onClose.emit(this.email);
        setTimeout( () => {
          this.email = '';
        });
      } else {
        this.isInvalidEmail = true;
        this.submitted = true;
      }
    } else {
      this.submitted = true;
    }
  }

  /**
   * Close popup
   */
  cancel(): void {
    this.email = '';
    this.submitted = false;
    this.onClose.emit(false);
  }

}
