import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from '../workflow/list/list.component';
import { ProjectService } from '../project/project.service';
import { WorkflowService } from '../workflow/workflow.service';
import { TaskService } from '../task/task.service';
import { UIKitModule } from '../../ui-kit/ui-kit.module';
import { CustomPipes } from '../../../pipes/pipes.module';
import { WorkflowEditComponent } from './workflow-edit/workflow-edit.component';
import { SharedModule } from '../../shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { IntroModule } from '../../intro-slides/intro-slides.module';
import { NRUService } from '../../nru/nru.service';
import { CommonMenu } from '../../common-menus/menu.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
const routes: Routes = [
  {
    path: '',
    redirectTo: 'list-workflow'
  },
  {
    path: 'list-workflow',
    component: ListComponent,
    data: {
      title: 'Workflows'
    }
  },
  {
    path: 'workflow/:id',
    component: WorkflowEditComponent,
    data: {
      title: 'Workflow'
    }
  },
];

@NgModule({
  declarations: [
    ListComponent,
    WorkflowEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    UIKitModule,
    CustomPipes,
    RouterModule.forChild(routes),
    SharedModule,
    BsDatepickerModule.forRoot(),
    IntroModule,
    DragDropModule,
    PerfectScrollbarModule,
    CommonMenu
  ],
  exports: [],
  providers: [
    ProjectService,
    WorkflowService,
    TaskService,
    NRUService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})

export class WorkflowModule { }
