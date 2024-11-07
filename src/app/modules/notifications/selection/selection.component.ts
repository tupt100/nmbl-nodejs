import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss']
})
export class SelectionComponent {

  /**
   * Bindings
   */
  public isOpen = false;
  @Input() status = 1;
  @Output() read: EventEmitter<number> = new EventEmitter<number>();
  @Output() unread: EventEmitter<number> = new EventEmitter<number>();
  @Output() removeNotification: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Handle mouse outside click event to close remove notification dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  constructor(private elementRef: ElementRef) { }

  /**
   * Emit read status for notification
   */
  maskAsRead = () => {
    this.read.emit(2);
  }

  /**
   * Emit unread status for notification
   */
  maskAsUnread = () => {
    this.unread.emit(1);
  }

  /**
   * Emit remove status for notification
   */
  remove = () => {
    this.removeNotification.emit();
  }
}
