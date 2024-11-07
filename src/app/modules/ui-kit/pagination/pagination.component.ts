import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  public currentPage = 1;
  public arrTotalPages: Array<number> = [];
  public totalViewRecords = 10;
  public recordsStart = 1;
  @Input() totalRecords = 0;
  @Input() type = 'Tasks';
  @Input() isTwelve = false;
  @Input() viewBy: number = null;
  @Output() getPageCount: EventEmitter<number> = new EventEmitter<number>();
  @Output() changePerPage: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  /**
   * Check for input changes
   */
  ngOnChanges() {
    setTimeout(() => {
      this.currentPage = 1;
      this.recordsStart = 1;
      this.arrTotalPages = [];
      this.loadPages();
      this.totalViewRecords = this.viewBy;
    }, 5);
  }

  ngOnInit() {
    if (this.isTwelve) {
      this.viewBy = this.viewBy || 12;
    } else {
      this.viewBy = this.viewBy || 10;
    }
  }

  /**
   * Create pages according to total records and limit per page
   */
  loadPages = () => {
    this.totalViewRecords = this.viewBy;
    const pages: number = Math.ceil(this.totalRecords / this.viewBy);
    for (let i = 1; i <= pages; i++) {
      this.arrTotalPages.push(i);
    }
  }

  /**
   * Emit offset for the selected page
   */
  getPage = (page: number) => {
    this.currentPage = page;
    this.totalViewRecords = (page * this.viewBy);
    this.recordsStart = (page * this.viewBy - (this.viewBy - 1));
    if (this.totalViewRecords > this.totalRecords) {
      this.totalViewRecords = this.totalRecords;
    }
    this.getPageCount.emit((page - 1) * this.viewBy);
  }

  /**
   * Trigger when next click
   */
  getNextPage = () => {
    if (this.arrTotalPages.length > this.currentPage) {
      this.getPageCount.emit(this.currentPage * this.viewBy);
      this.currentPage = (this.currentPage + 1);
      this.totalViewRecords = (this.currentPage * this.viewBy);
      this.recordsStart = (this.currentPage * this.viewBy - (this.viewBy - 1));
      if (this.totalViewRecords > this.totalRecords) {
        this.totalViewRecords = this.totalRecords;
      }
    }
  }

  /**
   * Trigger when previous click
   */
  getPreviousPage = () => {
    if (this.currentPage > 1) {
      const page = (this.currentPage - 2);
      this.getPageCount.emit(page * this.viewBy);
      this.currentPage = (this.currentPage - 1);
      this.recordsStart = (this.currentPage * this.viewBy - (this.viewBy - 1));
      this.totalViewRecords = (this.currentPage * this.viewBy);
      if (this.totalViewRecords > this.totalRecords) {
        this.totalViewRecords = this.totalRecords;
      }
    }
  }

  /**
   * Set and emit view by limit
   */
  setPerPage = (page: number) => {
    this.viewBy = page;
    localStorage.setItem('perPage', `${page}`);
    this.changePerPage.emit(page);
  }
}
