import { Component, OnInit, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { ShareMyList } from './share-my-list.interface';
import { UserService } from '../../user-management/user.service';

@Component({
  selector: 'app-share-my-list',
  templateUrl: './share-my-list.component.html',
  styleUrls: ['./share-my-list.component.scss']
})
export class ShareMyListComponent implements OnInit {

  /**
   * Bindings
   */
  public usersForm: FormGroup;
  public isMemberOpen = false;
  public arrTeamMember: Array<ShareMyList> = [];
  public memberId = 0;
  public memberName = '';
  @Output() selectedMember: EventEmitter<number> = new EventEmitter<number>();
  @Output() download: EventEmitter<boolean> = new EventEmitter<boolean>();

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

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.memberId = 0;
      this.memberName = '';
      this.isMemberOpen = false;
      this.selectedMember.emit(0);
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.listUsers();

    // User search
    this.usersForm.get('assignToSearch').valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.userService.listUsers({ search: value }))
    ).subscribe(res => {
      if (res && res.results) {
        this.arrTeamMember = res.results.map(obj => ({ ...obj, checked: false })) as Array<ShareMyList>;
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
        this.arrTeamMember = res.results.map(obj => ({ ...obj, checked: false })) as Array<ShareMyList>;
      }
    });
  }

  /**
   * Method to select specific tag to filter the data
   * @param event to check weather checkbox checked or not.
   * @param member object
   */
  selectMember = (event: any, member: ShareMyList) => {
    if (event.target.checked) {
      this.arrTeamMember.map(obj => {
        if (obj.id === member.id) {
          this.memberId = member.id;
          this.memberName = `${member.first_name} ${member.last_name}`;
          obj.checked = true;
        } else {
          obj.checked = false;
        }
      });
    } else {
      this.memberName = '';
      this.memberId = 0;
      this.arrTeamMember.map(obj => {
        obj.checked = false;
      });
    }

    setTimeout(() => {
      this.isMemberOpen = false;
    }, 500);
  }

  cancel(): void {
    this.memberId = 0;
    this.memberName = '';
    this.isMemberOpen = false;
    this.arrTeamMember.map( obj => {
      obj.checked = false;
    });
    this.selectedMember.emit(0);
  }

  downloadList = (): void => {
    /*
    let div = '';
    div += '<div id="wrapper">';
    div += '<div id="content-area">';
    div += '<app-task-main>';
    div += '<div class="main-page listing_pg">';
    div += '<div class="sm-block-row task-main-pg">';
    div += '<div class="container">';
    div += '<div class="cdk-drop-list ttable-row">';
    div += '<div class="titem-row-head titem-bg">';
    div += '<span class="titem ttable-rank active" style="visibility: hidden; pointer-events: none;"></span>'
    div += '<span class="titem ttable-full">Task Name </span>';
    div += '<span class="titem ttable-date">Due Date</span>';
    div += '<span class="titem ttable-status pos-relative">Status</span>'
    div += '<span class="titem ttable-assign pos-relative">Assigned To</span>'
    div += '</div>'
    div += '<div>';
    div += '<div class="cdk-drag flex-ttable-item ttable-warn">';

    //Task Rank Block
    div += '<div class="ttable-rank">'
    div += '</div>'
    //Task Rank Block Ends Here

    //Task Name Block
    div += '<div class="ttable-full">'
    div += '</div>'
    //Task Name Block Ends Here

    //Due Date Block
    div += '<div class="ttable-date">  11/01/2019 </div>'
    //Due Date Block Ends Here

    //Status Block
    div += '<div class="ttable-status">  External Request </div>'
    //Status Block Ends Here

    //Assigned To Block
    div += '<div class="ttable-assign">'
    div += '<div class="profile-wrap">'
    div += '<span class="no-img">sd</span>'
    div += '<p> san deep</p>'
    div += '</div>'
    div += '</div>'
    //Assigned To Block Ends Here

    div += '</div>';
    div += '</div>';
    div += '</div>'
    div += '</div>'
    div += '</div>';
    div += '</div>';
    div += '</app-task-main>';
    div += '</div>';
    div += '</div>';
    */
    this.download.emit();
  }

  onSubmit = (): void => {
    this.isMemberOpen = false;
    this.selectedMember.emit(this.memberId);
  }
}
