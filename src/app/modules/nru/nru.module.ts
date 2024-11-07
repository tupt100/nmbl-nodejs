import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { RecaptchaModule } from 'ng-recaptcha';
import { NruRoutingModule } from './nru-routing';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { SharedModule } from '../shared/shared.module';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { ListComponent } from './list/list.component';
import { ViewRequestComponent } from './view-request/view-request.component';
import { AddRequestComponent } from './add-request/add-request.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RequestName, AssignedTo, AssignedToGroup, Status, Importance } from './utility-pipe';
import { NRUService } from './nru.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    ContactInfoComponent,
    ListComponent,
    ViewRequestComponent,
    AddRequestComponent,
    RequestName,
    AssignedTo,
    AssignedToGroup,
    Status,
    Importance,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NruRoutingModule,
    UIKitModule,
    RecaptchaModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    NgxDropzoneModule,
    CustomPipes,
    PerfectScrollbarModule
  ],
  providers: [
    NRUService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: []
})
export class NruModule { }
