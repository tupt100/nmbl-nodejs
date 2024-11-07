import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ServiceListComponent } from './service-list/service-list.component';
import { ConvertRequestComponent } from './convert-request/convert-request.component';
import { ViewRequestComponent } from './view-request/view-request.component';
import { RequestComponent } from './request/request.component';

const routes: Routes = [
  {
    path: '',
    component: RequestComponent,
    children: [
      {
        path: 'services',
        component: ServiceListComponent,
        data: {
          title: 'Requests'
        }
      },
      {
        path: 'services/:id',
        component: ViewRequestComponent,
        data: {
          title: 'View Requests'
        }
      }
    ]
  },
  {
    path: 'convert-request/:id',
    component: ConvertRequestComponent,
    data: {
      title: 'Convert Requests'
    },
    pathMatch: 'full'
  },
  {
    path: 'convert-multiple-request',
    component: ConvertRequestComponent,
    data: {
      title: 'Convert Multiple Requests'
    },
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule { }
