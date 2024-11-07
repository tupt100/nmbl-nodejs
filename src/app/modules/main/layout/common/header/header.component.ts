import { Component, OnInit, ElementRef, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Store } from '@ngrx/store';

import { INotifications } from '../../../../../modules/notifications/notifications.interface';
import * as fromRoot from '../../../../../store';
import { MessageService } from '../../../../../services/message.service';
import { NotificationsService } from '../../../../../modules/notifications/notifications.service';
import * as moment from 'moment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild('inside') inside: ElementRef;
  public searchEnabled = false;
  public userAvatar = '';
  public nameInitial = '';
  public fullName = '';
  public showNotification = false;
  public isSearching = false;
  projectSubscribe: any;
  permissionList: any = {};
  public arrNotifications: Array<INotifications> = [];
  public totalNotifications = 0;
  public unreadMessagegCount = 0;
  public appTitle = '';
  public isshow = false;

  /**
   * Handle mouse outside click event to close notification dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (event.target.className !== '' && event.target.className !== 'unread-ping' &&
      event.target.className !== 'notification notify-item unread' && event.target.className !== 'flex notify-caption' &&
      event.target.className !== 'opacity6 time' && event.target.className !== 'low noti-prior-box') {
      this.showNotification = false;
    }
  }

  constructor(
    private router: Router,
    private store: Store<fromRoot.AppState>,
    private messageService: MessageService,
    private notificationsService: NotificationsService
  ) {
    this.notificationsService.messages.subscribe(() => {
      this.getNotifications();
    });

    this.messageService.$isNotificationPosted.subscribe(res => {
      if (res) {
        this.getNotifications();
      }
    });
  }

  ngOnInit() {
    // Title for current route in responsive
    this.appTitle = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');

    // Subscribing for router event to change title in responsive
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.appTitle = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
      }
    });

    // Get user permissions
    this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permissionList = obj.datas.permission;
        }
      }
    });

    this.getNotifications();
    this.getUserDetails();
    this.avatarUpdated();

    // Toggle search and cross icon accordingly (cross icon for search page only)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.isSearching = event.url.includes('/main/search') ? true : false;
        }, 0);
      }
    });
    this.isSearching = this.router.url.includes('/main/search') ? true : false;
  }

  /**
   * Return title
   * @param state Router state
   * @param parent Root route
   */
  getTitle(state, parent) {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(...this.getTitle(state, state.firstChild(parent)));
    }
    return data;

  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }
    this.isshow = false;
  }

  /**
   * Get user details
   */
  getUserDetails = () => {
    this.store.select('userDetails').subscribe((obj: any) => {
      if (obj.loaded) {
        this.userAvatar = obj.datas.user_avatar || '';
        const firstName: string = obj.datas.first_name || '';
        const lastName: string = obj.datas.last_name || '';
        this.fullName = firstName + ' ' + lastName;
        this.nameInitial = firstName.charAt(0) + lastName.charAt(0);
      }
    });
  }

  /**
   * Get Notifications
   */
  getNotifications = () => {
    const notificationParams = {
      limit: 3,
      status: 1,
      ordering: '-id'
    };
    this.notificationsService.listNotifications(notificationParams).subscribe(res => {
      if (res && res.results) {
        this.totalNotifications = res.count as number;
        this.arrNotifications = res.results as Array<INotifications>;
        this.arrNotifications = this.arrNotifications.filter(x => x.status === 1);
        this.unreadMessagegCount = this.totalNotifications;
      }
    });
  }

  /**
   * Mark notification as read and navigate to redirection url if any
   */
  readNotification = (notification: INotifications) => {
    const params = {
      status: 2
    };
    this.notificationsService.readNotification(notification.id, params).subscribe(res => {
      if (res) {
        this.showNotification = false;
        this.getNotifications();
        if (notification.notification_url) {
          const id = notification.notification_url.match(/\d+/g).map(Number)[0];
          const url = notification.notification_url.replace(/\d+/g, '');
          this.router.navigate([`/main/${url}/`, id]);
        }
      }
    });
  }

  /**
   * Toggle sidebar
   */
  openmenu = () => {
    const body = document.getElementsByTagName('body')[0];
    body.classList.toggle('haspanel');
    this.messageService.notificationPosted(true);
  }

  /**
   * Navigate to notifications
   */
  notifications = () => {
    this.showNotification = false;
    this.router.navigate(['main/notifications']);
  }

  /**
   * Update user image when updated from account settings
   */
  avatarUpdated = () => {
    this.messageService.$isUserImageUpdated.subscribe(res => {
      if (res) {
        this.userAvatar = res;
      }
    });
  }

  /**
   * Toggle notification dropdown
   */
  showNotifications = () => {
    if (this.totalNotifications > 0) {
      this.showNotification = !this.showNotification;
    } else {
      this.router.navigate(['main/notifications']);
    }
  }

  /**
   * Navigate to creation pages link
   * @param link Link
   */
  openLink(link) {
    this.isshow = false;
    this.router.navigate([link]);
  }

  validateTime = (date) => {
    if (date) {
      const today = moment().startOf('day');
      if (moment(date).isSame(today, 'd')) {
        return moment(date).format('hh:mm A');
      } else {
        return moment(date).format('MM/DD/YYYY hh:mm A');
      }
    }
  }
}
