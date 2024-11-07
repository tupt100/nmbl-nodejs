import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountSettingsComponent } from './account-settings.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account-settings'
  },
  {
    path: 'account-settings',
    component: AccountSettingsComponent,
    data: {
      title: 'Account Settings'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountSettingsRoutingModule { }
