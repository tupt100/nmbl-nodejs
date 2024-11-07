import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportMgmtComponent } from './report-mgmt/report-mgmt.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'report-list'
  },
  {
    path: 'report-list',
    component: ReportListComponent,
    data: {
      title: 'Reporting'
    }
  },
  {
    path: 'report-mgmt',
    component: ReportMgmtComponent,
    data: {
      title: 'Report Management'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingRoutingModule { }
