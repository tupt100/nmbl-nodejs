import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewAllComponent } from './view-all/view-all.component';
import { DirectoryViewComponent } from './directory-view/directory-view.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'documents'
  },
  {
    path: 'documents',
    component: ViewAllComponent,
    data: {
      title: 'Documents'
    }
  },
  {
    path: 'documents-directory',
    component: DirectoryViewComponent,
    data: {
      title: 'Documents'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
