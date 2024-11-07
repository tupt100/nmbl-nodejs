import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { GroupService } from '../group.service';
import { IGroups } from '../user-management.interface';

@Component({
  selector: 'app-select-permission',
  templateUrl: './select-permission.component.html',
  styleUrls: ['./select-permission.component.scss']
})
export class SelectPermissionComponent implements OnInit, OnChanges {
  /**
   * Bindings
   */
  public permissionForm: FormGroup;
  public groupName = 'Select New Permission Group';
  public isGroupBoxOpen = false;
  public arrGroups: Array<IGroups> = [];
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelection: EventEmitter<number> = new EventEmitter<number>();
  @Input() groupId = 0;


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

  ngOnChanges() {
    if (this.groupId > 0) {
      this.group_list_by_id();
    }
  }

  ngOnInit() {
    // Init form call
    this.initForm();

    // Load permission groups
    this.listPermissions();

    // Search changes event
    this.permissionForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.groupService.group_list({ search: value, limit: 10000 }))
    ).subscribe(res => {
      if (res && res.results) {
        const arrData = res.results.sort((a, b) => a.id - b.id);
        this.arrGroups = arrData.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
        if (this.groupId > 0) {
          this.arrGroups.map(obj => {
            if (obj.id === this.groupId) {
              obj.checked = true;
            }
          });
        }
      }
    });
  }

  /**
   * Initialize search form
   */
  initForm = () => {
    this.permissionForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Get permission groups lisitng
   */
  listPermissions = (): void => {
    this.groupService.group_list({ ordering: 'name', limit: 10000 }).subscribe(res => {
      if (res && res.results) {
        const arrData = res.results.sort((a, b) => a.id - b.id);
        this.arrGroups = arrData.map(obj => ({ ...obj, checked: false })) as Array<IGroups>;
      }
    });
  }

  /**
   * Get permission group detail
   */
  // tslint:disable-next-line:variable-name
  group_list_by_id = () => {
    this.groupService.group_list_by_id(this.groupId).subscribe(res => {
      if (res) {
        this.groupName = res.name as string;
      }
    });
  }

  /**
   * Trigger when group selection changes
   * @param event Checkbox change event
   * @param group Permission group
   */
  selectGroup = (event: any, group: IGroups) => {
    this.groupName = group.name || '' as string;
    if (event.target.checked) {
      this.arrGroups.map(obj => {
        if (obj.id === group.id) {
          obj.checked = true;
        } else {
          obj.checked = false;
        }
      });
      this.onSelection.emit(group.id);
    } else {
      this.groupName = 'Select Permission Group';
      group.checked = false;
      this.onSelection.emit(0);
    }

    // Hide dropdown
    setTimeout(() => {
      this.isGroupBoxOpen = false;
    }, 500);
  }
}
