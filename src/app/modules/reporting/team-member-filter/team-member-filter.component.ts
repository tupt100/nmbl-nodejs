import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { TeamMemberFilter } from './team-member-filter.interface';
import { UserService } from '../../user-management/user.service';

@Component({
  selector: 'app-team-member-filter',
  templateUrl: './team-member-filter.component.html',
  styleUrls: ['./team-member-filter.component.scss']
})
export class TeamMemberFilterComponent implements OnInit, OnChanges {
  /**
   * Bindings
   */
  public isLoading = false;
  public usersForm: FormGroup;
  public isMemberOpen = false;
  public arrSelectedMemberIds: Array<number> = [];
  public arrSelectedMemberNames: Array<string> = ['All'];
  public arrTeamMember: Array<TeamMemberFilter> = [];
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectMember: EventEmitter<string> = new EventEmitter<string>();
  @Input() isReset = false;

  /**
   * Handle mouse outside click event to close dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isMemberOpen = false;
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private userService: UserService
  ) { }

  /**
   * Check for reset changes
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('isReset')) {
      this.isReset = changes.isReset.currentValue;
      if (this.isReset) {
        this.arrSelectedMemberIds = [];
        this.arrSelectedMemberNames = [];
        this.listUsers();
        this.onSelectMember.emit(null);
      }
    }
  }

  ngOnInit() {
    this.initForm();
    this.listUsers();

    // User search
    this.usersForm.get('assignToSearch').valueChanges.pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap(value => this.userService.listUsers({ search: value })
        .pipe(
          finalize(() => this.isLoading = false),
        )
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrSelectedMemberNames = [];
        this.arrTeamMember = res.results as Array<TeamMemberFilter>;
        this.arrTeamMember.map(obj => {
          if (this.arrSelectedMemberIds.indexOf(obj.id) > -1) {
            this.arrSelectedMemberNames.push(`${obj.first_name} ${obj.last_name}`);
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
            first_name: 'All',
            last_name: '',
            checked: this.arrSelectedMemberIds.length === 0 ? true : false
          };
          this.arrTeamMember.unshift(params);
        }
      }
    });
  }

  /**
   * Initialize user search form
   */
  initForm = () => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Get users listing
   */
  listUsers = (): void => {
    this.userService.listUsers({ ordering: 'first_name', limit: 100 }).subscribe(res => {
      if (res && res.results) {
        this.arrTeamMember = res.results.map(obj => ({ ...obj, checked: false })) as Array<TeamMemberFilter>;
        const params = {
          id: 0,
          first_name: 'All',
          last_name: '',
          checked: true
        };
        this.arrTeamMember.unshift(params);
      }
    });
  }

  /**
   * Method to select specific tag to filter the data
   * @param event to check weather checkbox checked or not.
   * @param member object
   */
  selectMember = (event: any, member: TeamMemberFilter) => {
    this.usersForm.get('assignToSearch').setValue('');
    if (event.target.checked) {
      if (member.first_name === 'All') {
        this.arrSelectedMemberIds = [];
        this.arrSelectedMemberNames = [];
        this.arrTeamMember.map((obj) => {
          if (obj.id === 0) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
        this.onSelectMember.emit(null);
      } else {
        this.arrTeamMember.map((obj) => {
          if (obj.id === 0) {
            obj.checked = false;
            const index: number = this.arrSelectedMemberNames.indexOf('All');
            if (index !== -1) {
              this.arrSelectedMemberNames.splice(index, 1);
            }
          }
          if (obj.first_name === member.first_name && obj.last_name === member.last_name) {
            obj.checked = true;
            const index: number = this.arrSelectedMemberIds.indexOf(member.id);
            if (index === -1) {
              if (obj.id > 0) {
                this.arrSelectedMemberIds.push(obj.id);
                this.arrSelectedMemberNames.push(`${obj.first_name} ${obj.last_name}`);
              }
            }
          }
        });
      }
    } else {
      if (member.first_name === 'All') {
        this.arrSelectedMemberIds = [];
        this.arrSelectedMemberNames = [];
        this.arrTeamMember.map((obj) => {
          obj.checked = false;
        });
        event.target.checked = true;
        this.onSelectMember.emit(null);
      } else {
        this.arrTeamMember.map((obj) => {
          if (obj.first_name === 'All') {
            obj.checked = false;
          }
          if (obj.id === member.id) {
            obj.checked = false;
            const index: number = this.arrSelectedMemberIds.indexOf(member.id);
            if (index > -1) {
              this.arrSelectedMemberIds.splice(index, 1);
              this.arrSelectedMemberNames.splice(index, 1);
            }
          }
        });
      }
    }

    if (this.arrTeamMember && this.arrTeamMember.length > 0) {
      const data = this.arrTeamMember.find(obj => obj.checked === true);
      if (!data) {
        this.arrSelectedMemberNames = [];
        this.arrSelectedMemberIds = [];
        this.arrTeamMember[0].checked = true;
        this.onSelectMember.emit(null);
      }
    }
    if (this.arrSelectedMemberIds && this.arrSelectedMemberIds.length > 0) {
      this.onSelectMember.emit(this.arrSelectedMemberIds.join());
    }
  }

  /**
   * Method to display members name at the top.
   * @param size is used how many members wants to display at top.
   */
  displayMemers = (size: number) => {
    const arrNames: Array<string> = this.arrSelectedMemberNames.slice(0, size);
    return arrNames;
  }

}
