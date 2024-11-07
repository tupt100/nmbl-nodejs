import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-tag-popup',
  templateUrl: './tag-popup.component.html',
  styleUrls: ['./tag-popup.component.scss']
})
export class TagPopupComponent implements OnInit {

  /**
   * Bindings
   */
  @Output() viewTag: EventEmitter<void> = new EventEmitter<void>();
  @Output() editTag: EventEmitter<void> = new EventEmitter<void>();
  @Output() deleteTag: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {

  }

  /**
   * Emit view tag event
   */
  view = () => {
    this.viewTag.emit();
  }

  /**
   * Emit edit tag event
   */
  edit = () => {
    this.editTag.emit();
  }

  /**
   * Emit delete tag event
   */
  delete = () => {
    this.deleteTag.emit();
  }

}
