import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { ListComponent } from './list/list.component';
import { ViewRequestComponent } from './view-request/view-request.component';
import { AddRequestComponent } from './add-request/add-request.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'requests'
  },
  {
    path: 'requests',
    component: ContactInfoComponent,
    data: {
      title: 'Requests'
    }
  },
  {
    path: 'requests/pending-requests/:token',
    component: ListComponent,
    data: {
      title: 'Pending List'
    }
  },
  {
    path: 'requests/add-requests/:token',
    component: AddRequestComponent,
    data: {
      title: 'Add Request'
    }
  },
  {
    path: 'requests/view-request/:id/:token',
    component: ViewRequestComponent,
    data: {
      title: 'View Request'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NruRoutingModule { }
