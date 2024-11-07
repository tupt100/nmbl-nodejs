import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GroupService } from '../../group.service';
import { IWorkGroup, IGroups } from '../../user-management.interface';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { MessageService } from '../../../../services/message.service';
import { UserService } from '../../user.service';
import { Messages } from 'src/app/services/messages';

@Component({
  selector: 'app-my-groups',
  templateUrl: './my-groups.component.html',
  styleUrls: ['./my-groups.component.scss']
})
export class MyGroupsComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public arrUserGroups: Array<IWorkGroup> = [];
  public totalRecords = 0;
  public infoMessages = '';
  private groupSubscribe: Subscription;
  public groupId = 0;
  public defaultParams = {
    limit: 10,
    offset: 0,
    ordering: ''
  };
  public showModal = {
    isRemoveGroup: false
  };

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }
    this.listUserGroups();
    this.isRecordCreatedUpdated();
  }

  /**
   * Get workgroups listing
   */
  listUserGroups = (): void => {
    this.groupService.work_group(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalRecords = res.count as number;
        this.arrUserGroups = res.results as Array<IWorkGroup>;
      }
    });
  }

  /**
   * Pagination control
   * @param offset Offset
   */
  loadMoreGroups = (offset: number) => {
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listUserGroups();
  }

  /**
   * Navigate to remove group page or open remove popup
   * @param group Group
   */
  removeGroupNavigate = (group: IGroups) => {
    if (
      (group as any).project.length ||
      (group as any).workflow.length ||
      (group as any).task.length
    ) {
      this.router.navigate(['main/remove-group', group.id]);
    } else {
      this.showModal.isRemoveGroup = true;
      this.groupId = group.id;
    }
  }

  /**
   * Remove group popup handler
   * @param response Popup confirmation [boolean]
   */
  removeGroupConfirm = (response): void => {
    if (response) {
      this.removeGroup(this.groupId);
    } else {
      this.showModal.isRemoveGroup = false;
    }
  }

  /**
   * Remove group
   * @param groupId Group ID
   */
  removeGroup = (groupId: number): void => {
    this.showModal.isRemoveGroup = false;
    this.userService.removeUserWorkGroup(groupId).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.groupRemoved);
      this.listUserGroups();
    }, (error) => {
      this.notifier.displayErrorMsg(Messages.notifier.errorGroupRemoved);
    });
  }

  /**
   * Sorting handler
   * @param fieldName Ordering field
   */
  sortGroupBy = (fieldName: string): void => {
    this.defaultParams.ordering = (this.defaultParams.ordering === fieldName) ? '-name' : 'name';
    this.listUserGroups();
  }

  /**
   * Navigate to add new group
   */
  addNewGroup = () => {
    this.router.navigate(['main/add-new-group']);
  }

  /**
   * Subscribe notifier messages
   */
  isRecordCreatedUpdated = () => {
    this.groupSubscribe = this.messageService.$isRecordCreatesUpdated.subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.message);
      }
    });
  }

  /**
   * Navigate to group detail page
   * @param Group ID
   */
  editGroup = (groupId: number): void => {
    this.router.navigate(['main/edit-group', groupId]);
  }


  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listUserGroups();
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.groupSubscribe) {
      this.groupSubscribe.unsubscribe();
    }
  }
}
