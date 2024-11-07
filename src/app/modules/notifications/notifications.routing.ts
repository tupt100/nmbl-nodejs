import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationsComponent } from './notifications.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'notifications'
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    data: {
      title: 'Your Notifications'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
