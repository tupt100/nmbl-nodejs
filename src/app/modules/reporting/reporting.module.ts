import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportingService } from './reporting.service';
import { GroupService } from '../user-management/group.service';
import { TaskService } from '../projects/task/task.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportingRoutingModule } from './reporting.routing';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportMgmtComponent } from './report-mgmt/report-mgmt.component';
import { CategoryFilterComponent } from './category-filter/category-filter.component';
import { GroupFilterComponent } from './group-filter/group-filter.component';
import { PrivilegeFilterComponent } from './privilege-filter/privilege-filter.component';
import { TagFilterComponent } from './tag-filter/tag-filter.component';
import { TeamMemberFilterComponent } from './team-member-filter/team-member-filter.component';
import { TypeFilterComponent } from './type-filter/type-filter.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { UserService } from '../user-management/user.service';
import { CustomPipes } from '../../pipes/pipes.module';
import { DownloadReportComponent } from './download-report/download-report.component';
import { ExportAsModule } from 'ngx-export-as';
import { ProdRptFilterComponent } from './prod-rpt-filter/prod-rpt-filter.component';
import { EfficiencyRptFilterComponent } from './efficiency-rpt-filter/efficiency-rpt-filter.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DaterangePickerModule } from '../ui-kit/daterange-picker/daterange-picker.module';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    ReportListComponent,
    ReportMgmtComponent,
    CategoryFilterComponent,
    GroupFilterComponent,
    PrivilegeFilterComponent,
    TagFilterComponent,
    TeamMemberFilterComponent,
    TypeFilterComponent,
    DownloadReportComponent,
    ProdRptFilterComponent,
    EfficiencyRptFilterComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportingRoutingModule,
    UIKitModule,
    CustomPipes,
    ExportAsModule,
    PerfectScrollbarModule,
    DaterangePickerModule
  ],
  providers: [
    ReportingService,
    GroupService,
    TaskService,
    UserService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: []
})
export class ReportingModule { }
