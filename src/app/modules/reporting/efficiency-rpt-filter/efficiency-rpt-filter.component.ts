import { Component, OnInit, Output, EventEmitter, ElementRef, Input, HostListener } from '@angular/core';
import { CategoryFilter } from '../category-filter/category-filter.interface';

@Component({
  selector: 'app-efficiency-rpt-filter',
  templateUrl: './efficiency-rpt-filter.component.html',
  styleUrls: ['./efficiency-rpt-filter.component.scss']
})
export class EfficiencyRptFilterComponent implements OnInit {

  /**
   * Bindings
   */
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectCategory: EventEmitter<string> = new EventEmitter<string>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDownload: EventEmitter<void> = new EventEmitter<void>();
  @Input() displayText = '';
  public isFilter = false;
  public displayDownload = false;
  public arrSelectedCategory: Array<string> = ['All'];
  public arrCategory: Array<CategoryFilter> = [];

  /**
   * Handle mouse outside click event to close dropdowns.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isFilter = false;
      this.displayDownload = false;
    }
  }

  constructor(private elementRef: ElementRef) { }

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

  /**
   * Emit to trigger efficiency report download
   */
  download = () => {
    this.onDownload.emit();
  }
}
