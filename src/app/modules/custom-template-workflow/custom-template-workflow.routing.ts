import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomTemplateComponent } from './custom-template.component';
import { CreateNewWorkflowTemplateComponent } from './create-new-workflow-template/create-new-workflow-template.component';
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
        component: CreateNewWorkflowTemplateComponent,
      },
      {
        path: ':id',
        component: CreateNewWorkflowTemplateComponent,
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
export class TemplateWorkflowRoutingModule { }
