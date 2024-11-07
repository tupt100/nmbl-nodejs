import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NoSidebarLayoutComponent } from './layout/no-sidebar-layout/no-sidebar-layout.component';
import { LoginGuardService, AuthGuardService } from 'src/app/core/guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../../modules/dashboard/dashboard.module').then(mod => mod.DashboardModule)
      },
      {
        path: 'projects',
        loadChildren: () => import('../../modules/projects/projects.module').then(mod => mod.ProjectsModule)
      },
      {
        path: 'search',
        loadChildren: () => import('../../modules/search/search.module').then(mod => mod.SearchModule)
      },
      {
        path: 'typo',
        loadChildren: () => import('../../modules/typo/typo.module').then(mod => mod.TypoModule)
      },
      {
        path: 'custom-template-task',
        loadChildren: () => import('../../modules/custom-template-task/custom-template-task.module').then(mod => mod.CustomTemplateTaskModule)
      },
      {
        path: 'custom-template-project',
        loadChildren: () => import('../../modules/custom-template-project/custom-template-project.module').then(mod => mod.CustomTemplateProjectModule)
      },
      {
        path: 'custom-template-workflow',
        loadChildren: () => import('../../modules/custom-template-workflow/custom-template-workflow.module').then(mod => mod.CustomTemplateWorkflowModule)
      },
      {
        path: 'custom-fields',
        loadChildren: () => import('../../modules/custom-fields/custom-fields.module').then(mod => mod.CustomFieldModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/user-management/user-management.module').then(mod => mod.UserManagementModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/account-settings/account-settings.module').then(mod => mod.AccountSettingsModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/documents/documents.module').then(mod => mod.DocumentsModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/reporting/reporting.module').then(mod => mod.ReportingModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/requests/requests.module').then(mod => mod.RequestsModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/notifications/notifications.module').then(mod => mod.NotificationsModule)
      },
      {
        path: '',
        loadChildren: () => import('../../modules/tags-manager/tags-manager.module').then(m => m.TagsManagerModule)
      }
    ],
    canActivate: [AuthGuardService]
  },
  {
    path: '',
    component: NoSidebarLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () => import('../../modules/auth/auth.module').then(m => m.AuthModule)
      }
    ],
    canActivate: [LoginGuardService]
  },
  {
    path: '',
    children: [
      {
        path: '',
        loadChildren: () => import('../../modules/nru/nru.module').then(m => m.NruModule)
      }
    ],
    canActivate: [LoginGuardService]
  },
  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
