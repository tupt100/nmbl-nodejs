import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { UserManagementRoutingModule } from './user-management.routing';
import { ListUserComponent } from './company-management/list-user/list-user.component';
import { EditUserComponent } from './company-management/edit-user/edit-user.component';
import { AddNewUserComponent } from './company-management/add-new-user/add-new-user.component';
import { MassInviteUsersComponent } from './company-management/mass-invite-users/mass-invite-users.component';
import { GroupService } from './group.service';
import { PermissionService } from './permission.service';
import { ProjectService } from '../projects/project/project.service';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { SelectGroupComponent } from './select-group/select-group.component';
import { ListGroupsComponent } from './groups/list-groups/list-groups.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { PermissionManagerComponent } from './permission/permission-manager/permission-manager.component';
import { RemovePermissionComponent } from './permission/remove-permission/remove-permission.component';
import { MyGroupsComponent } from './mygroups/my-groups/my-groups.component';
import { AddNewGroupComponent } from './mygroups/add-new-group/add-new-group.component';
import { SelectMemberComponent } from './select-member/select-member.component';
import { AddNewPermissionComponent } from './permission/add-new-permission/add-new-permission.component';
import { EditUserPopupComponent } from './company-management/list-user/edit-user-popup/edit-user-popup.component';
import { PermissionFilterComponent } from './company-management/list-user/permission-filter/permission-filter.component';
import { MessageService } from '../../services/message.service';
import { EditGroupComponent } from './mygroups/edit-group/edit-group.component';
import { EditPermissionComponent } from './permission/edit-permission/edit-permission.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { SelectPermissionComponent } from './select-permission/select-permission.component';
import { RemoveGroupComponent } from './mygroups/remove-group/remove-group.component';
import { GroupsPwtComponent } from './groups/groups-pwt/groups-pwt.component';
import { CustomPipes } from '../../pipes/pipes.module';
import { UserService } from './user.service';
import { SharedModule } from '../shared/shared.module';
import { IntroModule } from '../intro-slides/intro-slides.module';
import { CtrlUserComponent } from './mygroups/ctrl-user/ctrl-user.component';
import { CtrlGroupComponent } from './mygroups/ctrl-group/ctrl-group.component';
import { CommonMenu } from '../common-menus/menu.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    ListUserComponent,
    EditUserComponent,
    AddNewUserComponent,
    MassInviteUsersComponent,
    SelectGroupComponent,
    ListGroupsComponent,
    PermissionManagerComponent,
    RemovePermissionComponent,
    MyGroupsComponent,
    AddNewGroupComponent,
    SelectMemberComponent,
    AddNewPermissionComponent,
    EditUserPopupComponent,
    PermissionFilterComponent,
    EditGroupComponent,
    EditPermissionComponent,
    NotificationSettingsComponent,
    SelectPermissionComponent,
    RemoveGroupComponent,
    GroupsPwtComponent,
    CtrlUserComponent,
    CtrlGroupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule,
    UserManagementRoutingModule,
    UIKitModule,
    CustomPipes,
    SharedModule,
    IntroModule,
    PerfectScrollbarModule,
    CommonMenu
  ],
  providers: [GroupService, PermissionService, MessageService, ProjectService, WorkflowService, TaskService, UserService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: []
})
export class UserManagementModule { }
