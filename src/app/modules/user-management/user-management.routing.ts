import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListUserComponent } from './company-management/list-user/list-user.component';
import { AddNewUserComponent } from './company-management/add-new-user/add-new-user.component';
import { EditUserComponent } from './company-management/edit-user/edit-user.component';
import { MassInviteUsersComponent } from './company-management/mass-invite-users/mass-invite-users.component';
import { ListGroupsComponent } from './groups/list-groups/list-groups.component';
import { PermissionManagerComponent } from './permission/permission-manager/permission-manager.component';
import { RemovePermissionComponent } from './permission/remove-permission/remove-permission.component';
import { MyGroupsComponent } from './mygroups/my-groups/my-groups.component';
import { AddNewGroupComponent } from './mygroups/add-new-group/add-new-group.component';
import { AddNewPermissionComponent } from './permission/add-new-permission/add-new-permission.component';
import { EditGroupComponent } from './mygroups/edit-group/edit-group.component';
import { EditPermissionComponent } from './permission/edit-permission/edit-permission.component';
import { NotificationSettingsComponent } from '../user-management/notification-settings/notification-settings.component';
import { RemoveGroupComponent } from './mygroups/remove-group/remove-group.component';
import { GroupsPwtComponent } from './groups/groups-pwt/groups-pwt.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'users-and-permissions'
  },
  {
    path: 'users-and-permissions',
    component: ListUserComponent,
    data: {
      title: 'Users'
    }
  },
  {
    path: 'add-new-user',
    component: AddNewUserComponent,
    data: {
      title: 'Add User'
    }
  },
  {
    path: 'edit-user/:userId',
    component: EditUserComponent,
    data: {
      title: 'Edit User'
    }
  },
  {
    path: 'mass-invite',
    component: MassInviteUsersComponent,
    data: {
      title: 'Mass Invite'
    }
  },
  {
    path: 'groups',
    component: ListGroupsComponent,
    data: {
      title: 'My Groups'
    }
  },
  {
    path: 'groups/:id',
    component: GroupsPwtComponent,
    data: {
      title: 'My Groups'
    }
  },
  {
    path: 'permission-manager',
    component: PermissionManagerComponent,
    data: {
      title: 'Permission Manager'
    }
  },
  {
    path: 'add-new-permission',
    component: AddNewPermissionComponent,
    data: {
      title: 'Add New Permission'
    }
  },
  {
    path: 'edit-permission/:id',
    component: EditPermissionComponent,
    data: {
      title: 'Edit Permission'
    }
  },
  {
    path: 'remove-permission/:id',
    component: RemovePermissionComponent,
    data: {
      title: 'Remove Permission'
    }
  },
  {
    path: 'mygroupslist',
    component: MyGroupsComponent,
    data: {
      title: 'My Groups'
    }
  },
  {
    path: 'add-new-group',
    component: AddNewGroupComponent,
    data: {
      title: 'Add Group'
    }
  },
  {
    path: 'edit-group/:id',
    component: EditGroupComponent,
    data: {
      title: 'Edit Group'
    }
  },
  {
    path: 'remove-group/:id',
    component: RemoveGroupComponent,
    data: {
      title: 'Remove Group'
    }
  },
  {
    path: 'notification-settings/:id',
    component: NotificationSettingsComponent,
    data: {
      title: 'Notification Settings'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
