import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { GroupService } from '../../user-management/group.service';

import { GroupFilter } from './group-filter.interface';

@Component({
  selector: 'app-group-filter',
  templateUrl: './group-filter.component.html',
  styleUrls: ['./group-filter.component.scss']
})
export class GroupFilterComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  @Input() isReset = false;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectGroup: EventEmitter<string> = new EventEmitter<string>();
  public usersForm: FormGroup;
  public isGroupOpen = false;
  public isLoading = false;
  public arrSelectedGroupIds: Array<number> = [];
  public arrSelectedGroupNames: Array<string> = ['All'];
  public arrGroups: Array<GroupFilter> = [];

  /**
   * Handle mouse outside click event to close dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isGroupOpen = false;
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private groupService: GroupService
  ) { }

  /**
   * Check for reset changes
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('isReset')) {
      this.isReset = changes.isReset.currentValue;
      if (this.isReset) {
        this.arrSelectedGroupIds = [];
        this.arrSelectedGroupNames = [];
        this.listGroups();
        this.onSelectGroup.emit(null);
      }
    }
  }

  ngOnInit() {
    this.initForm();
    this.listGroups();

    // smart search for assign to member
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.groupService.company_work_group({ search: value })
        .pipe(
          finalize(() => this.isLoading = false),
        )
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrSelectedGroupNames = [];
        this.arrGroups = res.results as Array<GroupFilter>;
        this.arrGroups.map(obj => {
          if (this.arrSelectedGroupIds.indexOf(obj.id) > -1) {
            this.arrSelectedGroupNames.push(`${obj.name}`);
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        if (
          this.usersForm.value.assignToSearch === '' ||
          this.usersForm.value.assignToSearch === null
        ) {
          const params = {
            id: 0,
            name: 'All',
            checked: this.arrSelectedGroupIds.length === 0 ? true : false
          };
          this.arrGroups.unshift(params);
        }
      }
    });
  }

  /**
   * Initialize form for searching groups
   */
  initForm = () => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Method to load company workgroup
   */
  listGroups = () => {
    this.groupService.company_work_group({ ordering: 'name', limit: 100 }).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<GroupFilter>;
        const params = {
          id: 0,
          name: 'All',
          checked: true
        };
        this.arrGroups.unshift(params);
      }
    });
  }

  /**
   * Method to select specific group from list.
   * @param event is used to identify weather group selected or not.
   * @param group is object
   */
  selectGroup = (event: any, group: GroupFilter) => {
    this.usersForm.get('assignToSearch').setValue('');
    if (event.target.checked) {
      if (group.name === 'All') {
        this.arrSelectedGroupIds = [];
        this.arrSelectedGroupNames = [];
        this.arrGroups.map((obj, index) => {
          if (obj.id === 0) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
        this.onSelectGroup.emit(null);
      } else {
        this.arrGroups.map((obj) => {
          if (obj.id === 0) {
            obj.checked = false;
            const index: number = this.arrSelectedGroupNames.indexOf('All');
            if (index !== -1) {
              this.arrSelectedGroupNames.splice(index, 1);
            }
          }
          if (obj.name === group.name) {
            obj.checked = true;
            const index: number = this.arrSelectedGroupIds.indexOf(group.id);
            if (index === -1) {
              if (obj.id > 0) {
                this.arrSelectedGroupIds.push(obj.id);
                this.arrSelectedGroupNames.push(obj.name);
              }
            }
          }
        });
      }
    } else {
      if (group.name === 'All') {
        this.arrSelectedGroupIds = [];
        this.arrSelectedGroupNames = [];
        this.arrGroups.map((obj) => {
          obj.checked = false;
        });
        event.target.checked = true;
        this.onSelectGroup.emit(null);
      } else {
        this.arrGroups.map((obj) => {
          if (obj.name === 'All') {
            obj.checked = false;
          }
          if (obj.id === group.id) {
            obj.checked = false;
            const index: number = this.arrSelectedGroupIds.indexOf(group.id);
            if (index > -1) {
              this.arrSelectedGroupIds.splice(index, 1);
              this.arrSelectedGroupNames.splice(index, 1);
            }
          }
        });
      }
    }
    if (this.arrGroups && this.arrGroups.length > 0) {
      const data = this.arrGroups.find(obj => obj.checked === true);
      if (!data) {
        this.arrSelectedGroupNames = [];
        this.arrSelectedGroupIds = [];
        this.arrGroups[0].checked = true;
        this.onSelectGroup.emit(null);
      }
    }

    if (this.arrSelectedGroupIds && this.arrSelectedGroupIds.length > 0) {
      this.onSelectGroup.emit(this.arrSelectedGroupIds.join());
    }
  }

  /**
   * Method to display group name at the top.
   * @param size is used how many groups wants to display at top.
   */
  displayGroups = (size: number) => {
    const arrNames: Array<string> = this.arrSelectedGroupNames.slice(0, size);
    return arrNames;
  }
}
