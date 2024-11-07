import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { RequestsService } from './requests.service';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { GroupService } from '../user-management/group.service';
import { RequestsRoutingModule } from './requests.routing';
import { ServiceListComponent } from './service-list/service-list.component';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { ConvertRequestComponent } from './convert-request/convert-request.component';
import { ViewRequestComponent } from './view-request/view-request.component';
import { UserService } from '../user-management/user.service';
import { SharedModule } from '../shared/shared.module';
import { RequestComponent } from './request/request.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    ServiceListComponent,
    ConvertRequestComponent,
    ViewRequestComponent,
    RequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    RequestsRoutingModule,
    CustomPipes,
    UIKitModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    PerfectScrollbarModule
  ],
  providers: [
    RequestsService,
    WorkflowService,
    TaskService,
    GroupService,
    UserService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: []
})
export class RequestsModule { }
