import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomFieldComponent } from './custom-field.component';
import { CreateNewCustomFieldComponent } from './create-new-custom-field/create-new-custom-field.component';
import { CustomFieldListComponent } from './custom-field-list/custom-field-list.component';
const routes: Routes = [
  {
    path: '',
    component: CustomFieldComponent,
    children: [
      {
        path: '',
        component: CustomFieldListComponent
      },
      {
        path: 'create',
        component: CreateNewCustomFieldComponent,
      },
      {
        path: ':id',
        component: CreateNewCustomFieldComponent,
      },
    ],
    data: {
      title: 'Custom Field'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomFieldRoutingModule { }
