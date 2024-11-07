import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnChanges {

  /**
   * Bindings
   */
  @Input() displaySubItem: Array<any> = [];
  @Input() selectedId: Array<number> = [];
  @Input() isMultiSelect = true;
  @Input() searchPlaceholder = '';
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSearch: EventEmitter<void> = new EventEmitter();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectionChanged: EventEmitter<any> = new EventEmitter();
  public searchValue = '';
  public selectedIds: Array<number> = [];

  constructor() { }

  /**
   * Check changes for user IDs
   * @param changes Changes
   */
  ngOnChanges(changes) {
    if (changes.hasOwnProperty('selectedId')) {
      this.selectedId = changes.selectedId.currentValue;
      if (this.selectedId && this.selectedId.length) {
        this.displaySubItem.map(obj => {
          const index = this.selectedId.indexOf(obj.id);
          if (index !== -1) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
      } else {
        this.displaySubItem.map(obj => {
          obj.checked = false;
        });
      }
    }
  }

  /**
   * Search event emitter
   */
  onSearchKeyup = (ev: any): void => {
    this.searchValue = ev.target.value;
    this.onSearch.emit(ev);
  }

  /**
   * Handle selection
   */
  changeSelection = (event, itemId) => {
    if (this.isMultiSelect) {
      if (event.target.checked) {
        event.target.checked = true;
        this.selectedIds.push(itemId);
      } else {
        event.target.checked = false;
        const index = this.selectedIds.indexOf(itemId);
        this.selectedIds.splice(index, 1);
      }
      this.onSelectionChanged.emit(this.selectedIds);
    } else {
      if (event.target.checked) {
        this.selectedIds = [];
        this.displaySubItem.map(obj => {
          if (obj.id === itemId) {
            obj.checked = true;
            this.selectedIds.push(itemId);
          } else {
            obj.checked = false;
          }
        });
        this.onSelectionChanged.emit(this.selectedIds);
      } else {
        this.onSelectionChanged.emit(null);
      }
    }
  }
}
