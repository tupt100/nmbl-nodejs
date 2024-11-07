import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomTemplateComponent } from './custom-template.component';
import { CreateNewTaskTemplateComponent } from './create-new-task-template/create-new-task-template.component';
import { CustomTemplateListComponent } from './custom-template-list/custom-template-list.component';
const routes: Routes = [
  {
    path: '',
    component: CustomTemplateComponent,
    children: [
      {
        path: '',
        component: CustomTemplateListComponent
      },
      {
        path: 'create',
        component: CreateNewTaskTemplateComponent,
      },
      {
        path: ':id',
        component: CreateNewTaskTemplateComponent,
      },
    ],
    data: {
      title: 'Custom Task Template'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateTaskRoutingModule { }
