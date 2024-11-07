import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomPipes } from '../../pipes/pipes.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { CustomDirectives } from '../../directives/directive.module';
import { SharedModule } from '../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { IntroModule } from '../intro-slides/intro-slides.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CommonMenu } from '../common-menus/menu.module';
import { DaterangePickerModule } from '../ui-kit/daterange-picker/daterange-picker.module';
import { CustomTemplateWorkflowService } from './custom-template-workflow.service';
import { CustomTemplateComponent } from './custom-template.component';
import { CustomTemplateWorkflowTasks } from './create-new-workflow-template/custom-template-workflow-tasks/custom-template-workflow-tasks.component';
import { CustomWorkflowTemplateTaskFormComponent } from './create-new-workflow-template/custom-template-workflow-tasks/custom-workflow-template-task-form/custom-workflow-template-task-form.component';
import { CustomTemplateWorkflowCustomFieldComponent } from './create-new-workflow-template/custom-template-workflow-custom-field/custom-template-workflow-custom-field.component';
import { TemplateProjectRoutingModule } from './custom-template-project.routing';
import { CustomTemplateWorkflowFieldsComponent } from './create-new-workflow-template/custom-template-workflow-fields/custom-template-workflow-fields.component';
import { PreviewTemplateWorkflowComponent } from './create-new-workflow-template/preview-custom-template-workflow/preview-template-workflow.component';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { ProjectService } from '../projects/project/project.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomTemplateFacade } from './+state/custom-template.facade';
import { StoreModule } from '@ngrx/store';
import * as fromCustomTemplate from './+state/custom-template.reducer';
import { CustomTemplateEffects } from './+state/custom-template.effects';
import { EffectsModule } from '@ngrx/effects';
import { CreateNewWorkflowTemplateComponent } from './create-new-workflow-template/create-new-workflow-template.component';
import { CustomTemplateListComponent } from './custom-template-list/custom-template-list.component'

@NgModule({
  declarations: [
    CustomTemplateComponent,
    CustomTemplateWorkflowCustomFieldComponent,
    CustomTemplateWorkflowTasks,
    CustomWorkflowTemplateTaskFormComponent,
    PreviewTemplateWorkflowComponent,
    CustomTemplateWorkflowFieldsComponent,
    CreateNewWorkflowTemplateComponent,
    CustomTemplateListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomPipes,
    UIKitModule,
    CustomDirectives,
    TemplateProjectRoutingModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    IntroModule,
    PerfectScrollbarModule,
    CommonMenu,
    DaterangePickerModule,
    BsDatepickerModule.forRoot(),
    StoreModule.forFeature(
      fromCustomTemplate.CUSTOM_TEMPLATE_STATE,
      fromCustomTemplate.reducer
    ),
    EffectsModule.forRoot([CustomTemplateEffects])
  ],
  providers: [
    CustomTemplateFacade,
    WorkflowService,
    TaskService,
    ProjectService,
    CustomTemplateWorkflowService
  ]
})
export class CustomTemplateProjectModule { }
