import { Component, Input, Output, EventEmitter, OnChanges, ElementRef, HostListener } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-select-privilege',
  templateUrl: './select-privilege.component.html',
  styleUrls: ['./select-privilege.component.scss']
})
export class SelectPrivilegeComponent implements OnChanges {

  /**
   * Bindings
   */
  @Input() checkedPrivilege: any;
  @Input() isDisabled = false;
  @Output() selectedPrivilege = new EventEmitter();
  @Output() isOpened: EventEmitter<boolean> = new EventEmitter<boolean>();
  arrPrivilege = [];
  showDropdown = false;
  importance: any;

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  constructor(
    private sharedService: SharedService,
    private elementRef: ElementRef
  ) { }

  /**
   * Check changes for checked privileges
   */
  ngOnChanges() {
    const privilegeList = [...this.sharedService.privilegeList];
    this.arrPrivilege = privilegeList.map(obj => ({ ...obj, checked: false }));
    if (this.checkedPrivilege && this.checkedPrivilege.length) {
      this.arrPrivilege = privilegeList.map(obj => ({ ...obj, checked: false }));
      this.arrPrivilege.map(obj => {
        const idx = this.checkedPrivilege.findIndex(x => x.id === obj.id);
        if (idx > -1) {
          obj.checked = true;
        } else {
          obj.checked = false;
        }
      });
    }
  }

  /**
   * Handle privilege checkbox change event
   */
  select = (event, obj: any): void => {
    const checked = event.target.checked;
    obj.checked = checked;
    let temp = [...this.arrPrivilege];
    this.handleCheck(obj);
    const as = temp.findIndex(x => x.id === '') > -1 ? true : false;
    if (as) {
      const noneIndex = temp.findIndex(x => x.id === '');
      if (noneIndex) {
        temp = [''];
      } else {
        const tmp = temp;
        tmp.splice(0, 1);
        temp = [...tmp];
      }
    }
    this.selectedPrivilege.emit(temp);
    this.showDropdown = false;
  }

  /**
   * Set privileges checkbox check/uncheck
   * @param obj Privilege object
   */
  handleCheck(obj: any): void {
    if (obj) {
      this.arrPrivilege.forEach((el: any, index) => {
        if (el.id && el.checked && obj.id) {
          const idx = this.arrPrivilege.findIndex(x => x.id === '');
          this.arrPrivilege[idx].checked = false;
          return;
        } else if (!obj.id && el.id) {
          this.arrPrivilege[index].checked = !obj.checked;
        }
      });
      this.handleTitle();
    }
  }

  /**
   * Set checked privileges array
   */
  handleTitle(): void {
    const idx = this.arrPrivilege.findIndex(x => x.id === '');
    if (this.arrPrivilege && this.arrPrivilege[idx].checked) {
      this.checkedPrivilege = [{ id: '', title: 'None' }];
    } else {
      this.checkedPrivilege = [];
      this.checkedPrivilege = this.arrPrivilege.map((el: any) => {
        if (el.id && el.checked) {
          return el;
        }
      });
    }
  }

  /**
   * Toggle privilege dropdown
   */
  public show() {
    this.showDropdown = !this.showDropdown;
    this.isOpened.emit(this.showDropdown);
  }

  /**
   * Return title for selected privileges
   */
  getTitle(): string {
    if (this.checkedPrivilege && this.checkedPrivilege.length) {
      let title = '';
      this.checkedPrivilege.forEach(x => {
        if (x && x.title) {
          title += x.title;
          title += ', ';
        }
      });

      // Remove last space and comma
      if (title && title.length) {
        title = title.substring(0, title.length - 2);
      }

      return title;
    }

    return '';
  }
}
