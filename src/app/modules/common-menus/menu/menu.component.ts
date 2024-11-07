import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  /**
   * Bindings
   */
  public objPermission$: any;
  public list1 = [
    {
      link: '/main/projects',
      title: 'Projects',
      icon: 'Projects.svg',
      width: 18,
      height: 18
    },
    {
      link: '/main/report-list',
      title: 'Reporting',
      icon: 'dash-reporting.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/projects/list-workflow',
      title: 'Workflows',
      icon: 'Workflows.svg',
      width: 18,
      height: 18
    },
    {
      link: '/main/users-and-permissions',
      title: 'Company Mgt',
      icon: 'dash-companymgt.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/projects/tasks',
      title: 'Tasks',
      icon: 'Tasks.svg',
      width: 18,
      height: 18
    },
    {
      link: '/main/groups',
      title: 'Groups',
      icon: 'dash-group.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/documents',
      title: 'Documents',
      icon: 'dash-documents.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/services',
      title: 'Requests',
      icon: 'dash-requests.svg',
      width: 21,
      height: 21
    }
  ];

  public list2 = [
    {
      link: '/main/dashboard',
      title: 'Dashboard',
      icon: 'dash-ico.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/projects',
      title: 'Projects',
      icon: 'Projects.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/projects/list-workflow',
      title: 'Workflows',
      icon: 'Workflows.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/projects/tasks',
      title: 'Tasks',
      icon: 'Tasks.svg',
      width: 21,
      height: 21
    },
    {
      link: '/main/documents',
      title: 'Documents',
      icon: 'dash-documents.svg',
      width: 25,
      height: 25
    }
  ];
  permissionList: any = {};

  constructor(
    private store: Store<fromRoot.AppState>
  ) { }

  ngOnInit() {
    this.showMenus();
  }

  /**
   * Show menu icons for responsive as per user permissions
   */
  showMenus() {
    this.objPermission$ = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permissionList = obj.datas.permission;
          if (!this.permissionList.task_task_view && !this.permissionList.task_task_view_all) {
            const idx = this.list1.findIndex(x => x.link === '/main/projects/tasks');
            this.list1.splice(idx, 1);
            const idx2 = this.list2.findIndex(x => x.link === '/main/projects/tasks');
            this.list2.splice(idx2, 1);
          }
          if (
            !this.permissionList.workflow_workflow_view && !this.permissionList.workflow_workflow_view_all
          ) {
            const idx = this.list1.findIndex(x => x.link === '/main/projects/list-workflow');
            this.list1.splice(idx, 1);
            const idx2 = this.list2.findIndex(x => x.link === '/main/projects/list-workflow');
            this.list2.splice(idx2, 1);
          }
          if (!this.permissionList.project_project_view && !this.permissionList.project_project_view_all) {
            const idx = this.list1.findIndex(x => x.link === '/main/projects');
            this.list1.splice(idx, 1);
            const idx2 = this.list2.findIndex(x => x.link === '/main/projects');
            this.list2.splice(idx2, 1);
          }
        }
      }
    });
  }
}
