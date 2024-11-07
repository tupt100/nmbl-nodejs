import { Component, OnInit, Output, EventEmitter, Input, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { IUsers } from '../../user-management.interface';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-ctrl-user',
  templateUrl: './ctrl-user.component.html',
  styleUrls: ['./ctrl-user.component.scss']
})
export class CtrlUserComponent implements OnInit {

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onMemberSelect: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();
  @Input() selectedMembers: Array<IUsers> = [];
  @Input() isMultiple = false;
  public usersForm: FormGroup;
  public arrMembers: Array<IUsers> = [];
  public isMemberBoxOpen = false;
  public memberNames: Array<string> = [];

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click',  ['$event'])
  onClickOutside(event) {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMemberBoxOpen = false;
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    // Init form
    this.initForm();

    // List users
    this.listMembers();

    // User search change event
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.userService.listUsers({ search: value, limit: 100 }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrMembers = res.results.map(obj => ({ ...obj, checked: false }));
        this.arrMembers.map(obj => {
          const index: number = this.selectedMembers.findIndex(x => x.id === obj.id);
          obj.checked = index !== -1 ? true : false;
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
   * Get user listing
   */
  listMembers = (): void => {
    this.userService.listUsers({ limit: 100 }).subscribe(res => {
      this.arrMembers = res.results.map(obj => ({ ...obj, checked: false }));
    });
  }

  /**
   * Handler for user checkbox change event and emit selected user(s)
   * @param event Checkbox change event
   * @param member User
   */
  selectMember = (event: any, member: IUsers) => {
    if (this.isMultiple) {
      if (event.target.checked) {
        member.checked = true;
        const name = `${member.first_name} ${member.last_name}`;
        this.memberNames.push(name);
        this.selectedMembers.push(member);
      } else {
        member.checked = false;
        const index: number = this.selectedMembers.findIndex(x => x.id === member.id);
        this.selectedMembers.splice(index, 1);
        this.memberNames.splice(index, 1);
      }
      this.onMemberSelect.emit(this.selectedMembers);
    } else {
      const name = `${member.first_name} ${member.last_name}`;
      this.memberNames = [];
      this.selectedMembers = [];
      this.arrMembers.map(obj => {
        if (obj.id === member.id) {
          obj.checked = true;
          this.selectedMembers.push(member);
          this.memberNames.push(name);
        } else {
          obj.checked = false;
        }
      });

      this.onMemberSelect.emit(this.selectedMembers);
      setTimeout(() => {
        this.isMemberBoxOpen = false;
      }, 500);
    }
  }
}
