import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { INotifications } from './notifications.interface';
import { NotifierComponent } from '../ui-kit/notifier/notifier.component';
import * as fromRoot from '../../store';
import * as fromSave from '../../store/reducers/save.reducer';
import { Messages } from 'src/app/services/messages';
import { NotificationsService } from './notifications.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public isOpen = false;
  public objUser$: Observable<fromSave.SaveDataState>;
  public arrNotifications: Array<INotifications> = [];
  public totalRecords = 0;
  public notificationId = 0;
  public defaultParams = {
    limit: 10,
    offset: 0
  };
  public showModal = {
    isRemoveNotification: false
  };

  constructor(
    private router: Router,
    private notificationsService: NotificationsService,
    private store: Store<fromRoot.AppState>,
    private messageService: MessageService,
  ) {
    this.objUser$ = this.store.select('userDetails');
  }

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }
    this.listNotifications();
  }

  /**
   * Get all notifications
   */
  listNotifications = (): void => {
    this.notificationsService.listNotifications(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalRecords = res.count as number;
        this.arrNotifications = res.results as Array<INotifications>;
      }
    });
  }

  /**
   * Pagination control for notification listing
   */
  loadMoreNotifications = (offset: number) => {
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listNotifications();
  }

  /**
   * Mark notificataion as read
   */
  readNotification = (id: number, status: string): void => {
    this.notificationsService.readNotification(id, { status }).subscribe(res => {
      if (res) {
        this.messageService.notificationPosted(true);
        this.listNotifications();
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Mark all notification as read
   */
  readAllNotifications = () => {
    this.notificationsService.readAllNotifications({ read_all: true }).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(Messages.notifier.readAllNotifications);
        this.messageService.notificationPosted(true);
        this.listNotifications();
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Open remove notification confirmation popup
   */
  removeNotification = (id: number) => {
    this.notificationId = id;
    this.showModal.isRemoveNotification = true;
  }

  /**
   * Handler for remove confirmation popup
   */
  removeNotificationConfirm = (response) => {
    if (response) {
      this.deleteNotifications();
    } else {
      this.showModal.isRemoveNotification = false;
    }
  }

  /**
   * Remove notification
   */
  deleteNotifications = () => {
    this.showModal.isRemoveNotification = false;
    this.notificationsService.deleteNotifications(this.notificationId).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.notificationRemoved);
      this.listNotifications();
    }, (e) => {
      const error = e && e.error && e.error.detail ? e.error.detail : '';
      this.notifier.displayErrorMsg(error);
    });
  }

  /**
   * Navigate to account settings
   */
  notificationSettings = () => {
    this.router.navigate(['/main/account-settings']);
  }

  /**
   * Navigate to notification redirection URL if any
   */
  redirect = (notification: INotifications) => {
    if (notification.notification_url) {
      const id = notification.notification_url.match(/\d+/g).map(Number)[0];
      const url = notification.notification_url.replace(/\d+/g, '');
      this.router.navigate([`/main/${url}/`, id]);
    }
  }

  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listNotifications();
  }
}
