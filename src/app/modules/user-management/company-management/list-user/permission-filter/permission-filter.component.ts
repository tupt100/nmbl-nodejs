import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { GroupService } from '../../../group.service';
import { IGroups } from '../../../user-management.interface';

@Component({
  selector: 'app-permission-filter',
  templateUrl: './permission-filter.component.html',
  styleUrls: ['./permission-filter.component.scss']
})
export class PermissionFilterComponent implements OnInit {

  @Output() selectedGroup: EventEmitter<Array<number>> = new EventEmitter<Array<number>>();
  @Output() clearStatus: EventEmitter<boolean> = new EventEmitter<false>();
  @Input() arrCheckedGroups: Array<number> = [];
  public usersForm: FormGroup;
  public arrGroups: Array<IGroups> = [];
  public arrSelectedGroups: Array<number> = [];
  public isLoading = false;

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.initForm();
    this.listPermissions();
    if (this.arrCheckedGroups && this.arrCheckedGroups.length > 0) {
      this.arrSelectedGroups = [...this.arrCheckedGroups];
    }

    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.groupService.group_list({ search: value, limit: 100 })
        .pipe(
          finalize(() => this.isLoading = false),
        )
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
        this.arrGroups.map( obj => {
          if (this.arrCheckedGroups.indexOf(obj.id) !== -1) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
      }
    });
  }

  /**
   * Initilization creation view
   */
  initForm = () => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Function to get permission list
   */
  listPermissions = (): void => {
    this.groupService.group_list({ ordering: 'name', limit: 100 }).subscribe(res => {
      if (res && res.results) {
        this.arrGroups = res.results.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
        this.arrGroups.map( obj => {
          if (this.arrCheckedGroups.indexOf(obj.id) !== -1) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
      }
    });
  }

  /**
   * @param event event
   * @param group group
   * Function to select group
   */
  selectGroup = (event: any, group: IGroups): void => {
    if (event.target.checked) {
      group.checked = true;
      this.arrSelectedGroups.push(group.id);
    } else {
      group.checked = false;
      const index: number = this.arrSelectedGroups.indexOf(group.id);
      this.arrSelectedGroups.splice(index, 1);
    }
    this.selectedGroup.emit(this.arrSelectedGroups);
  }

  /**
   * Function to clear form
   */
  clear = () => {
    this.arrSelectedGroups = [];
    this.arrCheckedGroups = [];
    this.listPermissions();
    this.clearStatus.emit(true);
  }

  /**
   * Function to check weather group is exist is not
   */
  isExist = (): boolean => {
    const data = this.arrGroups.filter( x => x.checked === true);
    if (data && data.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
