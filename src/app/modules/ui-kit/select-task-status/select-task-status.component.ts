import { Component, Input, Output, EventEmitter, OnChanges, ElementRef, HostListener } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-select-task-status',
  templateUrl: './select-task-status.component.html',
  styleUrls: ['./select-task-status.component.scss'],
})
export class SelectTaskStatusComponent implements OnChanges {

  /**
   * Bindings
   */
  @Input() checkedStatus: any;
  @Input() isFilter = false;
  @Output() selectedStatus = new EventEmitter();
  statusToDisplay: any;
  arrStatues = [];
  showDropdown = false;

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  constructor(
    private sharedService: SharedService,
    private elementRef: ElementRef
  ) { }

  /**
   * Check changes for selected statues
   */
  ngOnChanges() {
    setTimeout(() => {
      if (this.isFilter) {
        this.showDropdown = true;
      }
    }, 5);
    const statusList = [...this.sharedService.statusList];
    this.arrStatues = statusList.map(obj => ({ ...obj, checked: false }));
    this.checkUncheck();
  }

  /**
   * Check/uncheck statuses checkboxes
   */
  checkUncheck() {
    if (this.isFilter) {
      this.arrStatues.map(obj => {
        if (this.checkedStatus && this.checkedStatus.length && this.checkedStatus.indexOf(obj.id) !== -1) {
          obj.checked = true;
        } else {
          obj.checked = false;
        }
      });
    } else {
      this.arrStatues.map(obj => {
        if (this.checkedStatus && +this.checkedStatus === +obj.id) {
          this.statusToDisplay = obj;
          obj.checked = true;
        } else {
          obj.checked = false;
        }
      });
    }
  }

  /**
   * Handle statuses checkbox change event
   */
  select = (event: any, status: any): void => {
    if (this.isFilter) {
      if (event.target.checked) {
        status.checked = true;
        this.checkedStatus.push(status.id);
      } else {
        status.checked = false;
        const index: number = this.checkedStatus.indexOf(status.id);
        this.checkedStatus.splice(index, 1);
      }
    } else {
      this.checkedStatus = status.id;
    }
    this.selectedStatus.emit(this.checkedStatus);
    if (!this.isFilter) {
      this.showDropdown = false;
    }
  }

  /**
   * Clear statuses
   */
  clearStatus(): void {
    this.checkedStatus = [];
    this.selectedStatus.emit(this.checkedStatus);
  }

  /**
   * Show status dropdown
   */
  show() {
    this.showDropdown = true;
  }

}

