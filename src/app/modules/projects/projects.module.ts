import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectComponent } from './project/project/project.component';
import { ProjectsDetailComponent } from './project/projects-detail/projects-detail.component';
import { ProjectsMainComponent } from './project/projects-main/projects-main.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IntroModule } from '../intro-slides/intro-slides.module';
import { TaskService } from './task/task.service';
import { WorkflowService } from './workflow/workflow.service';
import { ProjectService } from './project/project.service';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CreateComponent } from './create/create.component';
import { NRUService } from '../nru/nru.service';
import { CommonMenu } from '../common-menus/menu.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TemplateAddDropdownComponent } from '../custom-template-task/template-add-dropdown/template-add-dropdown.component';
import { WorkflowTemplateAddDropdownComponent } from '../custom-template-workflow/template-add-dropdown/template-add-dropdown.component';
import { ProjectTemplateAddDropdownComponent } from '../custom-template-project/template-add-dropdown/template-add-dropdown.component';
import { CustomTemplateTaskService } from '../custom-template-task/custom-template-task.service';
import { CustomTemplateWorkflowService } from '../custom-template-workflow/custom-template-workflow.service';
import { CustomTemplateWorkflowService as CustomTemplateProjectService } from '../custom-template-project/custom-template-workflow.service';
import { CustomTemplateFacade } from '../custom-template-task/+state/custom-template.facade';
import { CustomTemplateFacade as CustomWorkflowTemplateFacade } from '../custom-template-workflow/+state/custom-template.facade';
import { CustomTemplateFacade as CustomProjectTemplateFacade } from '../custom-template-project/+state/custom-template.facade';
import { GlobalCustomFieldService } from '../custom-fields/custom-field.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    ProjectsMainComponent,
    ProjectsDetailComponent,
    ProjectComponent,
    CreateComponent,
    TemplateAddDropdownComponent,
    ProjectTemplateAddDropdownComponent,
    WorkflowTemplateAddDropdownComponent
  ],
  imports: [
    CommonModule,
    UIKitModule,
    CustomPipes,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    BsDatepickerModule.forRoot(),
    SharedModule,
    IntroModule,
    ProjectsRoutingModule,
    CustomPipes,
    BsDatepickerModule.forRoot(),
    PerfectScrollbarModule,
    CommonMenu,
    DragDropModule,
  ],
  providers: [
    ProjectService,
    WorkflowService,
    TaskService,
    CustomTemplateTaskService,
    CustomTemplateWorkflowService,
    CustomTemplateProjectService,
    GlobalCustomFieldService,
    CustomTemplateFacade,
    CustomWorkflowTemplateFacade,
    CustomProjectTemplateFacade,
    NRUService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class ProjectsModule { }
