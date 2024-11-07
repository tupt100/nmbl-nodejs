import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { Store } from '@ngrx/store';

import { IUserProfile } from '../../../main.interface';
import * as fromRoot from '../../../../../store';
import { SharedService } from 'src/app/services/sharedService';
import { MessageService } from 'src/app/services/message.service';
import { NotificationsService } from '../../../../../modules/notifications/notifications.service';


export interface IMenu {
  id: number;
  link: string;
  title: string;
  icon: string;
  icon2: string;
  submenu: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  public pages: Array<IMenu> = [
    {
      id: 1,
      link: '/main/dashboard',
      title: 'Dashboard',
      icon: 'Dashboard-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 2,
      link: '/main/projects',
      title: 'Projects',
      icon: 'Projects-White.svg',
      icon2: 'plus-square.svg',
      submenu: '/main/projects/create/project'
    },
    {
      id: 3,
      link: '/main/projects/list-workflow',
      title: 'Workflows',
      icon: 'Workflows-White.svg',
      icon2: 'plus-square.svg',
      submenu: '/main/projects/create/workflow'
    },
    {
      id: 4,
      link: '/main/projects/tasks',
      title: 'Tasks',
      icon: 'Tasks-White.svg',
      icon2: 'plus-square.svg',
      submenu: '/main/projects/create/task'
    },
    {
      id: 5,
      link: '/main/documents',
      title: 'Documents',
      icon: 'Documents-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 6,
      link: '/main/report-list',
      title: 'Reporting',
      icon: 'Reporting-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 7,
      link: '/main/services',
      title: 'Requests',
      icon: 'Requests-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 8,
      link: '/main/groups',
      title: 'My Groups',
      icon: 'Groups-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 9,
      link: '/main/users-and-permissions',
      title: 'Users & Permissions',
      icon: 'CompanyMGT-White.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 10,
      link: '/main/tags-manager',
      title: 'Tag Manager',
      icon: 'tag_grey.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 11,
      link: '/main/custom-fields',
      title: 'Custom Fields Manager',
      icon: 'Template.svg',
      icon2: '',
      submenu: ''
    },
    {
      id: 12,
      link: '/main/custom-template-task',
      title: 'Template Manager',
      icon: 'Template.svg',
      icon2: '',
      submenu: ''
    }
  ];
  currentRoute = '';
  unreadMessagegCount = 0;
  objPermission$: any;
  objFeatures$: any;
  objUser$: any;
  permissionList: any = {};
  userDetails: IUserProfile;

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private notificationsService: NotificationsService,
    private store: Store<fromRoot.AppState>,
    private messageService: MessageService
  ) {
    this.messageService.$isNotificationPosted.subscribe(res => {
      if (res) {
        this.getNotifications();
      }
    });
  }

  /**
   * Navigate to creation pages
   * @param title Modal type
   */
  goToCreatePage(title: string) {
    document.body.classList.remove('haspanel');
    switch (title) {
      case 'Projects':
        return this.router.navigate(['/main/projects/create/project']);

      case 'Workflows':
        return this.router.navigate(['/main/projects/create/workflow']);

      case 'Tasks':
        return this.router.navigate(['/main/projects/create/task']);
    }
  }

  ngOnInit() {
    // Subscribing event urls for current route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        document.body.classList.remove('haspanel');
      }
    });
    this.currentRoute = this.router.url;

    /**
     * Fetching user details to display in sidebar
     */
    this.objUser$ = this.store.select('userDetails').subscribe((obj: any) => {
      if (obj.loaded) {
        this.userDetails = {
          email: obj.datas.email || '',
          first_name: obj.datas.first_name || '',
          group: {
            is_company_admin: obj.datas.group.is_company_admin,
            name: obj.datas.group.name,
          },
          has_request_permission: obj.datas.has_request_permission || false,
          id: obj.datas.id || 0,
          is_owner: obj.datas.is_owner || false,
          last_name: obj.datas.last_name || '',
          title: obj.datas.title || '',
          user_avatar: obj.datas.user_avatar || '',
        };

        if (!(this.userDetails.group.is_company_admin === true || this.userDetails.is_owner)) {
          const index = this.pages.findIndex(x => x.id === 9 || x.id === 10);
          if (index !== -1) {
            this.pages.splice(index, 1);
          }
        }
      }
    });

    /**
     * Check user permissions for creation and listing pages for P/W/T link in sidebar
     */
    this.objPermission$ = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permissionList = obj.datas.permission;
          if (!this.permissionList.task_task_create) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects/tasks');
            if (idx > -1) {
              this.pages[idx].icon2 = '';
            }
          }
          if (!this.permissionList.workflow_workflow_create) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects/list-workflow');
            if (idx > -1) {
              this.pages[idx].icon2 = '';
            }
          }
          if (!this.permissionList.project_project_create) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects');
            if (idx > -1) {
              this.pages[idx].icon2 = '';
            }
          }
          if (!this.permissionList.task_task_view && !this.permissionList.task_task_view_all) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects/tasks');
            this.pages.splice(idx, 1);
          }
          if (
            !this.permissionList.workflow_workflow_view && !this.permissionList.workflow_workflow_view_all
          ) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects/list-workflow');
            this.pages.splice(idx, 1);
          }
          if (!this.permissionList.project_project_view && !this.permissionList.project_project_view_all) {
            const idx = this.pages.findIndex(x => x.link === '/main/projects');
            this.pages.splice(idx, 1);
          }
          this.objFeatures$ = this.store.select('features').subscribe((features) => {
            if (features.loaded && features.datas && features.datas.features) {
              if (!features.datas.features.TASKTEMPLATE || (!this.permissionList.tasktemplate_tasktemplate_view && !this.permissionList.tasktemplate_tasktemplate_view)) {
                const idx = this.pages.findIndex(x => x.link === '/main/custom-template-task');
                this.pages.splice(idx, 1);
              }
            }
          });
        }
      }
    });

    /**
     * Check for splicing request link from sidebar
     */
    if (this.userDetails && this.permissionList) {
      if (
        !(
          this.userDetails.group.name === 'Legal Team' ||
          this.userDetails.group.is_company_admin === true ||
          this.userDetails.is_owner ||
          this.permissionList.request_request_view === true
        )
      ) {
        const index = this.pages.findIndex(x => x.id === 7);
        if (index !== -1) {
          this.pages.splice(index, 1);
        }
      }
    }
  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.objPermission$) {
      this.objPermission$.unsubscribe();
    } 
    if (this.objFeatures$) {
      this.objFeatures$.unsubscribe();
    }
    if (this.objUser$) {
      this.objUser$.unsubscribe();
    }
  }

  /**
   * Navigate to selected link
   * @param page Selected page
   */
  openLink(page: any): void {
    this.router.navigate([page.link]);
    document.body.classList.remove('haspanel');
  }

  /**
   * Check for creation permission
   * @param menu Modal type
   */
  hasPermission(menu): boolean {
    if (menu === 'Projects') {
      return this.permissionList.project_project_create;
    } else if (menu === 'Workflows') {
      return this.permissionList.workflow_workflow_create;
    } else if (menu === 'Tasks') {
      return this.permissionList.task_task_create;
    }
  }

  /**
   * Get unread notification count
   */
  getNotifications = () => {
    const notificationParams = {
      limit: 3,
      status: 1,
      ordering: '-id'
    };
    this.notificationsService.listNotifications(notificationParams).subscribe(res => {
      if (res && res.results) {
        this.unreadMessagegCount = res.count as number;
      }
    });
  }

  /**
   * Logout
   */
  logout(): void {
    this.sharedService.logOut().subscribe(() => {
      this.sharedService.clearStorageAndRedirectToLogin();
      document.body.classList.remove('haspanel');
    });
  }

}
