import { Component, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, OnChanges, HostListener } from '@angular/core';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  encapsulation: ViewEncapsulation.None
})

export class MultiSelectDropdownComponent implements OnChanges {

  /**
   * Bindings
   */
  @Input() allText = 'All';
  @Input() noneText = 'None';
  @Input() isTag = false;
  @Input() isAssignTo = false;
  @Input() displaySubItem: any;
  @Input() isFilter = true;
  @Input() isMultiple = true;
  @Input() searchPlaceholder: string;
  @Input() title: any;
  @Input() isSearch = true;
  @Input() isStandAloneTag = false;
  @Input() showTitle = true;
  @Input() isDisabled = false;
  @Input() canEmpty = false;
  @Output() search: EventEmitter<void> = new EventEmitter();
  @Output() allClear: EventEmitter<void> = new EventEmitter();
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter();
  @Output() isOpened: EventEmitter<boolean> = new EventEmitter<boolean>();
  public showDropdown = false;
  private allItems: any;
  public searchValue = '';
  public selections: Array<any> = [];

  /**
   * Handler to close dropdown, clear search on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      if (!this.isStandAloneTag) {
        this.showDropdown = false;
        this.searchValue = '';
        this.displaySubItem = [...this.allItems];
        if (this.isFilter && this.displaySubItem.length === 1) {
          this.search.emit();
        } else if (!this.isFilter && !this.displaySubItem.length) {
          this.search.emit();
        }
      }
    }
  }

  constructor(
    private elementRef: ElementRef
  ) { }

  /**
   * Check changes for defined inputs
   * @param changes SimpleChanges
   */
  ngOnChanges(changes) {
    setTimeout(() => {
      if (changes.hasOwnProperty('showTitle')) {
        this.showTitle = changes.showTitle.currentValue;
        this.showDropdown = true;
      }

      if (changes.hasOwnProperty('isStandAloneTag')) {
        this.showDropdown = true;
      }
    }, 5);

    if (changes.hasOwnProperty('displaySubItem')) {
      if (this.isFilter) {
        const getAllObj = [{ id: -1, name: 'All', checked: true }];
        if (this.title && this.title.length) {
          getAllObj[0].checked = false;
        }
        this.displaySubItem = getAllObj.concat(changes.displaySubItem.currentValue);
      } else {
        this.displaySubItem = changes.displaySubItem.currentValue;
      }
      this.allItems = this.displaySubItem && this.displaySubItem.length ? [...this.displaySubItem] : [];
    }

    if (this.title && this.title.length) {
      if (this.isFilter && this.displaySubItem && this.displaySubItem.length) {
        this.displaySubItem[0].checked = false;
      }
      this.displaySubItem.map(x => {
        const index = this.title.findIndex(y => +x.id === +y.id);
        if (index > -1) {
          x.checked = true;
        } else {
          x.checked = false;
        }
      });
    }
  }

  /**
   * Toggle dropdown
   */
  public show() {
    this.showDropdown = !this.showDropdown;
    this.isOpened.emit(this.showDropdown);
    this.displaySubItem = [...this.allItems];
  }

  /**
   * Emit search value on keyup
   * @param ev Keyboard event
   */
  public onSearchKeyup(ev: any): void {
    this.searchValue = ev.target.value;
    this.search.emit(ev);
  }

  /**
   * Checkbox change handler
   * @param event Checkbox change event
   * @param itemId Item
   */
  public changeSelection(event, itemId): void {
    if ((!this.isMultiple && event.srcElement.checked) || this.isMultiple) {
      if (itemId !== -1) {
        if (!this.isFilter && this.displaySubItem && this.displaySubItem.length) {
          this.displaySubItem[0].checked = false;
        }
        const checked: boolean = event.srcElement.checked;
        const indx = this.title.findIndex(x => x.id === itemId);
        this.selections = [];
        this.title.forEach(x => {
          this.selections.push(x.id);
        });
        if (!checked) {
          if (indx > -1) {
            this.selections.splice(indx, 1);
          }
        } else {
          this.selections.push(itemId);
        }
        this.allItems.filter((item, index) => {
          if (item.id === itemId) {
            this.allItems[index].checked = checked;
          }
        });
        const data = this.allItems.filter( x => x.checked === true);
        if (data && data.length > 0) {
          this.displaySubItem = this.allItems;
          this.selectionChanged.emit(this.selections);
          this.searchValue = '';
        } else {
          this.allClear.emit();
        }        
      } else {
        this.allClear.emit();
      }
    } else if (this.canEmpty && !this.isMultiple && !event.srcElement.checked) {
      this.allClear.emit();
    }

    if (!this.isStandAloneTag) {
      this.searchValue = '';
      this.showDropdown = false;
    }
  }

  /**
   * Emit new tag value
   */
  addTag() {
    if (!this.isTag || this.searchValue.trim() === '') {
      return;
    }

    if (!this.selections) {
      this.selections = [];
    }

    this.selections.push(this.searchValue);
    this.selectionChanged.emit(this.selections);
    if (!this.isStandAloneTag) {
      this.showDropdown = false;
    }
    this.searchValue = '';
  }

  /**
   * Return title for selected values
   */
  getTitle() {
    if (this.title && this.title.length) {
      let title = '';
      this.title.forEach(x => {
        title += x.name || x.tag || x.title;
        title += ', ';
      });
      title = title.substring(0, title.length - 2);
      return title;
    }
  }
}
