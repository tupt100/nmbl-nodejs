import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnChanges, HostListener, SimpleChanges } from '@angular/core';
import { CategoryFilter } from './category-filter.interface';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  @Input() isReset = false;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectCategory: EventEmitter<string> = new EventEmitter<string>();
  public isCategoryOpen = false;
  public arrSelectedCategory: Array<string> = ['All'];
  public arrCategory: Array<CategoryFilter> = [];

  /**
   * Handle mouse outside click event to close dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isCategoryOpen = false;
    }
  }

  constructor(
    private elementRef: ElementRef
  ) { }

  /**
   * Check for reset changes
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('isReset')) {
      this.isReset = changes.isReset.currentValue;
      if (this.isReset) {
        this.arrSelectedCategory = ['All'];
        this.listDefaultCategory();
        this.onSelectCategory.emit(null);
      }
    }
  }

  ngOnInit() {
    this.listDefaultCategory();
  }

  /**
   * Method to load default category
   */
  listDefaultCategory = (): void => {
    this.arrCategory = [
      {
        id: 1,
        name: 'All',
        code: 'All',
        checked: true
      },
      {
        id: 2,
        name: 'Project',
        code: 'Project',
        checked: false
      },
      {
        id: 3,
        name: 'Workflow',
        code: 'Workflow',
        checked: false
      },
      {
        id: 4,
        name: 'Task',
        code: 'Task',
        checked: false
      }
    ];
  }

  /**
   * Method to select category
   * @param event to check weather checkbox checked or not.
   * @param category object.
   */
  selectCategory = (event: any, category: CategoryFilter) => {
    if (event.target.checked) {
      if (category.name === 'All') {
        this.arrSelectedCategory = [];
        this.arrCategory.map((obj) => {
          if (obj.name === 'All') {
            obj.checked = true;
            this.arrSelectedCategory.push(category.code);
          } else {
            obj.checked = false;
          }
        });
      } else {
        this.arrCategory.map((obj) => {
          if (obj.name === category.name) {
            obj.checked = true;
            const index: number = this.arrSelectedCategory.indexOf(category.code);
            if (index === -1) {
              this.arrSelectedCategory.push(category.code);
            }
          } else if (obj.name === 'All') {
            obj.checked = false;
            const index: number = this.arrSelectedCategory.indexOf('All');
            if (index > -1) {
              this.arrSelectedCategory.splice(index, 1);
            }
          }
        });
      }
    } else {
      if (category.name === 'All') {
        category.checked = false;
        this.arrSelectedCategory = [];
      } else {
        this.arrCategory.map((obj) => {
          if (obj.name === category.name) {
            obj.checked = false;
            const index: number = this.arrSelectedCategory.indexOf(category.code);
            if (index > -1) {
              this.arrSelectedCategory.splice(index, 1);
            }
          }
        });
      }
    }

    // If all check box checked
    if (this.arrSelectedCategory.length === 3) {
      this.listDefaultCategory();
      this.arrCategory[0].checked = true;
      this.arrSelectedCategory = [];
      this.arrSelectedCategory.push('All');
    }

    if (this.arrSelectedCategory && this.arrSelectedCategory.length > 0) {
      this.onSelectCategory.emit(this.arrSelectedCategory.join());
    }
  }
}
