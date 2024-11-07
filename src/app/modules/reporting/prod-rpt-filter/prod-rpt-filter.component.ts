import { Component, OnInit, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-prod-rpt-filter',
  templateUrl: './prod-rpt-filter.component.html',
  styleUrls: ['./prod-rpt-filter.component.scss']
})
export class ProdRptFilterComponent implements OnInit {

  /**
   * Bindings
   */
  public isFilter = false;
  public displayDownload = false;
  public listProductivityFilter: Array<{id: number, name: string, checked: boolean}>;
  public arrSelectedFilter: Array<string> = ['Show All'];
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onFilterSelect: EventEmitter<string> = new EventEmitter<string>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDownload: EventEmitter<void> = new EventEmitter<void>();

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
    this.loadProductivityFilters();
  }

  /**
   * Method to load default productivity filters
   */
  loadProductivityFilters = () => {
    this.listProductivityFilter = [
      {
        id: 1,
        name: 'Show All',
        checked: true
      },
      {
        id: 2,
        name: 'New PWT',
        checked: false
      },
      {
        id: 3,
        name: 'Completed PWT',
        checked: false
      },
    ];
  }

  /**
   * Method to select prod filter
   * @param event to check weather checkbox checked or not.
   * @param privilege object.
   */
  selectFilter = (event: any, privilege) => {
    if (event.target.checked) {
      if (privilege.name === 'Show All') {
        this.arrSelectedFilter = [];
        this.listProductivityFilter.map((obj, index) => {
          if (obj.name === 'Show All') {
            obj.checked = true;
            this.arrSelectedFilter.push(privilege.name);
          } else {
            obj.checked = false;
          }
        });
      } else {
        this.listProductivityFilter.map((obj) => {
          if (obj.name === privilege.name) {
            obj.checked = true;
            const index: number = this.arrSelectedFilter.indexOf(privilege.name);
            if (index === -1) {
              this.arrSelectedFilter.push(privilege.name);
            }
          } else if (obj.name === 'Show All') {
            obj.checked = false;
            const index: number = this.arrSelectedFilter.indexOf('Show All');
            if (index > -1) {
              this.arrSelectedFilter.splice(index, 1);
            }
          }
        });
      }
    } else {
      if (privilege.name === 'Show All') {
        privilege.checked = false;
        this.arrSelectedFilter = [];
      } else {
        this.listProductivityFilter.map((obj) => {
          if (obj.name === privilege.name) {
            obj.checked = false;
            const index: number = this.arrSelectedFilter.indexOf(privilege.name);
            if (index > -1) {
              this.arrSelectedFilter.splice(index, 1);
            }
          }
        });
      }
    }
    if (this.arrSelectedFilter && this.arrSelectedFilter.length > 0) {
      this.onFilterSelect.emit(this.arrSelectedFilter.join());
    } else if (this.arrSelectedFilter.length === 0) {
      this.arrSelectedFilter.push('Show All');
      this.listProductivityFilter[0].checked = true;
      this.onFilterSelect.emit(this.arrSelectedFilter.join());
    }
  }

  /**
   * Emit to trigger prod report download
   */
  download = () => {
    this.onDownload.emit();
  }
}
