import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  /**
   * Bindings
   */
  @Input() message1 = '';
  @Input() message2 = '';
  @Input() message3 = '';
  @Input() okButtonText = '';
  @Input() cancelButtonText = '';
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

  constructor() { }

  /**
   * Emit confirmation as true
   */
  onSubmit() {
    this.onClose.emit(true);
  }

  /**
   * Emit confirmation as false
   */
  cancel(): void {
    this.onClose.emit(false);
  }

}
