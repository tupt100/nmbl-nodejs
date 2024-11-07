import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { GroupService } from '../../group.service';
import { IGroups } from '../../user-management.interface';

@Component({
  selector: 'app-ctrl-group',
  templateUrl: './ctrl-group.component.html',
  styleUrls: ['./ctrl-group.component.scss']
})
export class CtrlGroupComponent implements OnInit {

  /**
   * Bindings
   */
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onGroupSelect: EventEmitter<Array<IGroups>> = new EventEmitter<Array<IGroups>>();
  @Input() selectedGroup: Array<IGroups> = [];
  public isLoading = false;
  public usersForm: FormGroup;
  public arrGroups: Array<IGroups> = [];
  public isGroupBoxOpen = false;
  public groupNames: Array<string> = [];

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
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

    // List groups
    this.listGroups();

    // Groups search form
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.groupService.company_work_group({ search: value, limit: 100, ordering: 'name' }))
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
   * Get company worgroups listing
   */
  listGroups = (): void => {
    this.groupService.company_work_group({ limit: 100, ordering: 'name' }).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
      }
    });
  }

  /**
   * Handler for group checkbox change event and emit selected group
   * @param event Checkbox change event
   * @param group Group
   */
  selectGroup = (event, group: IGroups) => {
    if (event.target.checked) {
      const name = group.name;
      this.groupNames.push(name);
      group.checked = true;
      this.selectedGroup.push(group);
    } else {
      group.checked = false;
      const index: number = this.selectedGroup.findIndex(x => x.id === group.id);
      this.selectedGroup.splice(index, 1);
      this.groupNames.splice(index, 1);
    }
    this.onGroupSelect.emit(this.selectedGroup);
  }
}
