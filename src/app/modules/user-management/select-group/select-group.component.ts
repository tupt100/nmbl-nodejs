import { Component, OnInit, HostListener, Output, EventEmitter, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { GroupService } from '../group.service';
import { IGroups } from '../user-management.interface';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss']
})
export class SelectGroupComponent implements OnInit {
  /**
   * Bindings
   */
  @Output() invitedBy: EventEmitter<number> = new EventEmitter<number>();
  public usersForm: FormGroup;
  public arrGroups: Array<IGroups> = [];
  public isGroupBoxOpen = false;
  public groupName = 'Select permission';

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isGroupBoxOpen = false;
    }
  }

  constructor(
    private elementRef: ElementRef,
    private fb: FormBuilder,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    // Init form
    this.initForm();

    // List permissions
    this.listGroups();

    // Search change event
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.groupService.group_list({ search: value, limit: 100, ordering: 'name' }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
      }
    });
  }

  /**
   * Initialize search form
   */
  initForm = (): void => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * List permission groups
   */
  listGroups = (): void => {
    this.groupService.group_list({ limit: 100, ordering: 'name' }).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
      }
    });
  }

  /**
   * Emit selected group
   * @param group Permission group
   */
  selectGroup = (group: IGroups) => {
    this.groupName = group.name || '';
    this.arrGroups.map(obj => {
      if (obj.id === group.id) {
        obj.checked = true;
      } else {
        obj.checked = false;
      }
    });
    this.invitedBy.emit(group.id);

    // Hide dropdown
    setTimeout(() => {
      this.isGroupBoxOpen = false;
    }, 500);
  }
}
