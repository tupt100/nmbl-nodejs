import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener, OnChanges, SimpleChanges } from '@angular/core';
import { PrivilegeFilter } from './privilege-filter.innterface';

@Component({
  selector: 'app-privilege-filter',
  templateUrl: './privilege-filter.component.html',
  styleUrls: ['./privilege-filter.component.scss']
})
export class PrivilegeFilterComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  @Input() isReset = false;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectPrivilege: EventEmitter<string> = new EventEmitter<string>();
  public isPrivilegeOpen = false;
  public arrPrivilege: Array<PrivilegeFilter> = [];
  public arrSelectedPrivilege: Array<string> = ['All'];

  /**
   * Handle mouse outside click event to close dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isPrivilegeOpen = false;
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
        this.arrSelectedPrivilege = [];
        this.listDefaultPrivilege();
        this.onSelectPrivilege.emit(null);
      }
    }
  }

  ngOnInit() {
    this.listDefaultPrivilege();
  }

  /**
   * Method to load default privilege
   */
  listDefaultPrivilege = (): void => {
    this.arrPrivilege = [
      {
        id: 1,
        name: 'All',
        checked: true
      },
      {
        id: 2,
        name: 'Attorney Client',
        checked: false
      },
      {
        id: 3,
        name: 'Work Product',
        checked: false
      },
      {
        id: 4,
        name: 'Confidential',
        checked: false
      }
    ];
  }

  /**
   * Method to select privilege
   * @param event to check weather checkbox checked or not.
   * @param privilege object.
   */
  selectPrivilege = (event: any, privilege: PrivilegeFilter) => {
    if (event.target.checked) {
      if (privilege.name === 'All') {
        this.arrSelectedPrivilege = [];
        this.arrPrivilege.map((obj, index) => {
          if (obj.name === 'All') {
            obj.checked = true;
            this.arrSelectedPrivilege.push(privilege.name);
          } else {
            obj.checked = false;
          }
        });
      } else {
        this.arrPrivilege.map((obj) => {
          if (obj.name === privilege.name) {
            obj.checked = true;
            const index: number = this.arrSelectedPrivilege.indexOf(privilege.name);
            if (index === -1) {
              this.arrSelectedPrivilege.push(privilege.name);
            }
          } else if (obj.name === 'All') {
            obj.checked = false;
            const index: number = this.arrSelectedPrivilege.indexOf('All');
            if (index > -1) {
              this.arrSelectedPrivilege.splice(index, 1);
            }
          }
        });
      }
    } else {
      if (privilege.name === 'All') {
        privilege.checked = false;
        this.arrSelectedPrivilege = [];
      } else {
        this.arrPrivilege.map((obj) => {
          if (obj.name === privilege.name) {
            obj.checked = false;
            const index: number = this.arrSelectedPrivilege.indexOf(privilege.name);
            if (index > -1) {
              this.arrSelectedPrivilege.splice(index, 1);
            }
          }
        });
      }
    }
    // If all check box checked
    if (this.arrSelectedPrivilege.length === 3) {
      this.listDefaultPrivilege();
      this.arrPrivilege[0].checked = true;
      this.arrSelectedPrivilege = [];
      this.arrSelectedPrivilege.push('All');
    }
    if (this.arrSelectedPrivilege && this.arrSelectedPrivilege.length > 0) {
      this.onSelectPrivilege.emit(this.arrSelectedPrivilege.join());
    }
  }
}
