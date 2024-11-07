import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { TaskMainComponent } from './task-main/task-main.component';
import { Routes, RouterModule } from '@angular/router';
import { TaskService } from './task.service';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { UIKitModule } from '../../ui-kit/ui-kit.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng5SliderModule } from 'ng5-slider';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { WorkflowService } from '../workflow/workflow.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../../shared/shared.module';
import { SearchService } from '../../search/search.service';
import { IntroModule } from '../../intro-slides/intro-slides.module';
import { NRUService } from '../../nru/nru.service';
import { CommonMenu } from '../../common-menus/menu.module';
import { ExportAsModule } from 'ngx-export-as';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { CustomTemplateTaskService } from '../../custom-template-task/custom-template-task.service';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow/custom-template-workflow.service';
import { CustomTemplateWorkflowService as CustomTemplateProjectService } from '../../custom-template-project/custom-template-workflow.service';
import { CustomTemplateFacade } from '../../custom-template-task/+state/custom-template.facade';
import { CustomTemplateFacade as CustomWorkflowTemplateFacade } from '../../custom-template-workflow/+state/custom-template.facade';
import { CustomTemplateFacade as CustomProjectTemplateFacade } from '../../custom-template-project/+state/custom-template.facade';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

const routes: Routes = [
  {
    path: '',
    component: TaskMainComponent,
    data: {
      title: 'Tasks'
    }
  },
  {
    path: ':id',
    component: TaskDetailComponent,
    data: {
      title: 'Task'
    }
  }
];

@NgModule({
  declarations: [TaskMainComponent, TaskDetailComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UIKitModule,
    DragDropModule,
    Ng5SliderModule,
    NgxDropzoneModule,
    CustomPipes,
    BsDatepickerModule.forRoot(),
    SharedModule,
    IntroModule,
    PerfectScrollbarModule,
    CommonMenu,
    ExportAsModule
  ],
  providers: [
    CustomTemplateFacade,
    CustomWorkflowTemplateFacade,
    CustomProjectTemplateFacade,
    TaskService,
    WorkflowService,
    SearchService,
    CustomTemplateTaskService,
    CustomTemplateWorkflowService,
    CustomTemplateProjectService,
    NRUService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class TaskModule { }
