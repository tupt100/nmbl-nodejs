import { Component, OnInit, Output, EventEmitter, Input, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { IUsers } from '../user-management.interface';
import { UserService } from '../user.service';

@Component({
  selector: 'app-select-member',
  templateUrl: './select-member.component.html',
  styleUrls: ['./select-member.component.scss'],
})
export class SelectMemberComponent implements OnInit {

  /**
   * Bindings
   */
  @Output() returnSelectedMemeber: EventEmitter<Array<IUsers>> = new EventEmitter<Array<IUsers>>();
  @Input() arrSelectedMembers: Array<IUsers> = [];
  public usersForm: FormGroup;
  public memberName = 'Type a name to search';
  public arrMembers: Array<IUsers> = [];
  public isMemberBoxOpen = false;

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMemberBoxOpen = false;
      this.usersForm.get('assignToSearch').setValue('');
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    // Init search form call
    this.initForm();

    // Load members
    this.listMembers();

    // Search change event
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.userService.listUsers({ search: value, limit: 10000, ordering: 'first_name' }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrMembers = res.results.map(obj => ({ ...obj, checked: false }));
        this.arrMembers.map(obj => {
          const index: number = this.arrSelectedMembers.findIndex(x => x.id === obj.id);
          if (index !== -1) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
      }
    });
  }

  /**
   * Initialize search form
   */
  initForm = () => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Get users listing
   */
  listMembers = (): void => {
    this.arrMembers = [];
    this.userService.listUsers({ limit: 10000, ordering: 'first_name' }).subscribe(res => {
      if (res && res.results) {
        this.arrMembers = res.results.map(obj => ({ ...obj, checked: false }));
      }
    });
  }

  /**
   * Trigger when user selection changes
   * @param event Checkbox change event
   * @param member User
   */
  selectMember = (event: any, member: IUsers) => {
    if (event.target.checked) {
      member.checked = true;
      this.arrSelectedMembers.push(member);
    } else {
      member.checked = false;
      const index: number = this.arrSelectedMembers.findIndex(x => x.id === member.id);
      this.arrSelectedMembers.splice(index, 1);
    }
    this.returnSelectedMemeber.emit(this.arrSelectedMembers);
    this.usersForm.get('assignToSearch').setValue('');
  }
}
