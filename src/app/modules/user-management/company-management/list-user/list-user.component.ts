import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IUsers, IPendingUsers, WorkGroup } from '../../user-management.interface';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { MessageService } from '../../../../services/message.service';
import { UserService } from '../../user.service';
import { Messages } from 'src/app/services/messages';

export const userFilter = {
  first_name: 'first_name',
  last_name: 'last_name',
  title: 'title',
};

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.scss']
})
export class ListUserComponent implements OnInit, OnDestroy {

  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  private groupSubscribe: Subscription;
  public arrUsers: Array<IUsers> = [];
  public arrPendingUsers: Array<IPendingUsers> = [];
  public arrCheckedGroups: Array<number> = [];
  public isPendingUserVisible = false;
  public isDisplayFilter = false;
  public totalActiveCount = 0;
  public totalPendingCount = 0;
  public userId = 0;
  public activeUsersdefaultParams = {
    limit: 10,
    offset: 0,
    ordering: ''
  };

  public PendingUsersdefaultParams = {
    limit: 10,
    offset: 0,
    ordering: '',
  };

  public showModal = {
    isRemoveUser: false,
    isRemovePendingUser: false
  };

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className !== '' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'btn fbtn' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'search_input ng-pristine ng-valid ng-touched' &&
      event.target.className !== 'check-list' &&
      event.target.className !== 'cpointer') {
      this.isDisplayFilter = false;
    }
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.activeUsersdefaultParams.limit = +perPage === 12 ? 10 : +perPage;
      this.PendingUsersdefaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }
    this.listCompanyUsers();
    this.isRecordCreatedUpdated();
  }

  /**
   * Function to get company user's list
   */
  listCompanyUsers = (): void => {
    this.userService.listCompanyUsers(this.activeUsersdefaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalActiveCount = res.count as number;
        this.arrUsers = res.results as Array<IUsers>;
      }
    });
  }

  /**
   *  @param offset offset
   * Function to load more user's
   */
  loadMoreCompanyUsers = (offset: number) => {
    this.activeUsersdefaultParams.offset = offset;
    window.scroll(0, 0);
    this.listCompanyUsers();
  }

  /**
   * Function to get pending user's list
   */
  listPendingUsers = (): void => {
    this.userService.listPendingUsers(this.PendingUsersdefaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalPendingCount = res.count as number;
        this.arrPendingUsers = res.results as Array<IPendingUsers>;
      }
    });
  }

  /**
   * @param offset offset
   * Function to load more pending user's list
   */
  loadMorePendingUsers = (offset: number) => {
    this.PendingUsersdefaultParams.offset = offset;
    window.scroll(0, 0);
    this.listPendingUsers();
  }

  /**
   *  @param isPendingUser isPendingUser
   * Function to view tab between active and pending user's
   */
  viewActivePendingUsers = (isPendingUser: boolean) => {
    this.isPendingUserVisible = isPendingUser;
    if (this.isPendingUserVisible) {
      this.listPendingUsers();
    } else {
      this.listCompanyUsers();
    }
  }

  /**
   * @param event event
   * Function to get pending user's list
   */
  viewPendingUsers = (event: any) => {
    if (event.target.checked) {
      this.listPendingUsers();
    }
  }

  /**
   * @param response response
   * Function to display confirmation popup while user removal 
   */
  removeUserConfirm = (response) => {
    if (response) {
      this.removeUser(this.userId);
    } else {
      this.showModal.isRemoveUser = false;

    }
  }

  /**
   * @param userId userId
   * Function to remove active user
   */
  removeUser = (userId: number) => {
    this.showModal.isRemoveUser = false;
    this.userService.removeUser(userId).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.userRemoved);
      this.listCompanyUsers();
    });
  }

  /**
   * @param response response
   * Function to display confirmation popup while pending user removal
   */
  removePendingUserConfirm = (response) => {
    if (response) {
      this.removePendingUser(this.userId);
    } else {
      this.showModal.isRemovePendingUser = false;
    }
  }

  /**
   * @param userId userId
   * Function to remove pending user's from list
   */
  removePendingUser = (userId: number) => {
    this.showModal.isRemovePendingUser = false;
    this.userService.removePendingUser(userId).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.userRemoved);
      this.listPendingUsers();
    });
  }

  /**
   * @param userId userId
   * Function to resend invite to pending users
   */
  resend = (userId: number) => {
    this.userService.reSend(userId).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.detail);
      }
    }, (e) => {
      if (e && e.error && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.group) {
        this.notifier.displayErrorMsg(e.error.detail.group);
      } else if (e && e.error && e.error.detail && e.error.detail.email && e.error.detail.email.length) {
        this.notifier.displayErrorMsg(e.error.detail.email[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * @param fieldName fieldName
   * Function to sort record by key provided
   */
  sortUsersBy = (fieldName: string): void => {
    if (fieldName === 'first_name') {
      this.activeUsersdefaultParams.ordering = userFilter.first_name =
        (userFilter.first_name === 'first_name') ?
        '-first_name' : 'first_name';
    } else if (fieldName === 'last_name') {
      this.activeUsersdefaultParams.ordering = userFilter.last_name = (userFilter.last_name === 'last_name') ? '-last_name' : 'last_name';
    } else if (fieldName === 'title') {
      this.activeUsersdefaultParams.ordering = userFilter.title = (userFilter.title === 'title') ? '-title' : 'title';
    }
    this.listCompanyUsers();
  }

  /**
   * @param fieldName fieldName
   * Function to sory pending users by key provided
   */
  sortPendingUsersBy = (fieldName: string): void => {
    if (fieldName === 'first_name') {
      this.PendingUsersdefaultParams.ordering = userFilter.first_name =
        (userFilter.first_name === 'first_name') ?
        '-first_name' : 'first_name';
    } else if (fieldName === 'last_name') {
      this.PendingUsersdefaultParams.ordering = userFilter.last_name = (userFilter.last_name === 'last_name') ? '-last_name' : 'last_name';
    } else if (fieldName === 'title') {
      this.PendingUsersdefaultParams.ordering = userFilter.title = (userFilter.title === 'title') ? '-title' : 'title';
    }
    this.listPendingUsers();
  }

  /**
   * Function to navigate to add-new-user page
   */
  inviteNewUser = () => {
    this.router.navigate(['main/add-new-user']);
  }

  /**
   * @param userId userId
   * Function to navigate to edit-user page
   */
  editUser = (userId: number) => {
    this.router.navigate(['main/edit-user', userId]);
  }

  /**
   * Function to navigate to permission-manager page
   */
  permissionManager = () => {
    this.router.navigate(['main/permission-manager']);
  }

  /**
   * Function to navigate to group-list page
   */
  myGroups = () => {
    this.router.navigate(['main/mygroupslist']);
  }

  /**
   * @param groups groups
   * Function to select group from list
   */
  selectedGroup = (groups: Array<number>) => {
    this.arrCheckedGroups = groups;
    this.activeUsersdefaultParams.offset = 0;
    if (groups.length === 0) {
      delete (this.activeUsersdefaultParams as any).groups;
    } else {
      (this.activeUsersdefaultParams as any).groups = groups.join();
    }
    this.listCompanyUsers();
  }

  /**
   * Function to select pending user's group
   */
  selectedPendingGroup = (groups) => {
    if (groups.length === 0) {
      delete (this.PendingUsersdefaultParams as any).groups;
    } else {
      (this.PendingUsersdefaultParams as any).groups = groups.join();
    }
    this.listPendingUsers();
  }

  /**
   * Function to check weather record created or updated to display message
   */
  isRecordCreatedUpdated = () => {
    this.groupSubscribe = this.messageService.$isRecordCreatesUpdated.subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.message);
      }
    });
  }

  /**
   * @param arrWorkGroup arrWorkGroup
   * Function to display groups
   */
  displayGroups = (arrWorkGroup: Array<WorkGroup>) => {
    if (arrWorkGroup.length > 1) {
      return `${arrWorkGroup[0].name},+${arrWorkGroup.length - 1}`;
    } else {
      return `${arrWorkGroup[0].name}`;
    }
  }

  /**
   * Function to clear status of active user's
   */
  clearStatusOfActiveUsers = () => {
    this.arrCheckedGroups = [];
    delete (this.activeUsersdefaultParams as any).groups;
    this.isDisplayFilter = false;
    this.listCompanyUsers();
  }

  /**
   * Function to clear status of pending user's
   */
  clearStatusOfPendingUsers = () => {
    delete (this.PendingUsersdefaultParams as any).groups;
    this.isDisplayFilter = false;
    this.listPendingUsers();
  }

  /**
   * @param id id
   * Function to navigate to edit-permission page
   */
  editPermission = (id: number) => {
    this.router.navigate(['main/edit-permission', id]);
  }

  /**
   * @param perPage perPage
   * Function to set active users list
   */
  setActivePerPage = (perPage) => {
    window.scroll(0, 0);
    this.activeUsersdefaultParams.limit = perPage;
    this.activeUsersdefaultParams.offset = 0;
    this.listCompanyUsers();
  }

  /**
   * @param perPage perPage
   * Function to set pending users list
   */
  setPendingPerPage = (perPage) => {
    window.scroll(0, 0);
    this.PendingUsersdefaultParams.limit = perPage;
    this.PendingUsersdefaultParams.offset = 0;
    this.listPendingUsers();
  }

  ngOnDestroy() {
    if (this.groupSubscribe) {
      this.messageService.recordCreatedUpdated(null);
      this.groupSubscribe.unsubscribe();
    }
  }
}
