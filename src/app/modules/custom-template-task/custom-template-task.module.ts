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
import { CustomTemplateTaskService } from './custom-template-task.service';
import { CustomTemplateComponent } from './custom-template.component';
import { CustomTemplateTaskCustomFieldComponent } from './create-new-task-template/custom-template-task-custom-field/custom-template-task-custom-field.component';
import { TemplateTaskRoutingModule } from './custom-template-task.routing';
import { CustomTemplateTaskFieldsComponent } from './create-new-task-template/custom-template-task-fields/custom-template-task-fields.component';
import { PreviewTemplateTaskComponent } from './create-new-task-template/preview-custom-template-task/preview-template-task.component';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { ProjectService } from '../projects/project/project.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomTemplateFacade } from './+state/custom-template.facade';
import { StoreModule } from '@ngrx/store';
import * as fromCustomTemplate from './+state/custom-template.reducer';
import { CustomTemplateEffects } from './+state/custom-template.effects';
import { EffectsModule } from '@ngrx/effects';
import { CreateNewTaskTemplateComponent } from './create-new-task-template/create-new-task-template.component';
import { CustomTemplateListComponent } from './custom-template-list/custom-template-list.component'

@NgModule({
  declarations: [
    CustomTemplateComponent,
    CustomTemplateTaskCustomFieldComponent,
    PreviewTemplateTaskComponent,
    CustomTemplateTaskFieldsComponent,
    CreateNewTaskTemplateComponent,
    CustomTemplateListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomPipes,
    UIKitModule,
    CustomDirectives,
    TemplateTaskRoutingModule,
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
    CustomTemplateTaskService
  ]
})
export class CustomTemplateTaskModule { }
