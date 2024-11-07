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
import { GlobalCustomFieldService } from './custom-field.service';
import { CustomFieldComponent } from './custom-field.component';
import { CustomFieldFormComponent } from './create-new-custom-field/custom-field-form/custom-field-form.component';
import { CustomFieldRoutingModule } from './custom-fields.routing';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { ProjectService } from '../projects/project/project.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CustomFieldFacade } from './+state/custom-field.facade';
import { StoreModule } from '@ngrx/store';
import * as fromCustomField from './+state/custom-field.reducer';
import { CustomFieldEffects } from './+state/custom-field.effects';
import { EffectsModule } from '@ngrx/effects';
import { CreateNewCustomFieldComponent } from './create-new-custom-field/create-new-custom-field.component';
import { CustomFieldListComponent } from './custom-field-list/custom-field-list.component'

@NgModule({
  declarations: [
    CustomFieldComponent,
    CustomFieldFormComponent,
    CreateNewCustomFieldComponent,
    CustomFieldListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomPipes,
    UIKitModule,
    CustomDirectives,
    CustomFieldRoutingModule,
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
      fromCustomField.CUSTOM_FIELD_STATE,
      fromCustomField.reducer
    ),
    EffectsModule.forRoot([CustomFieldEffects])
  ],
  providers: [
    CustomFieldFacade,
    WorkflowService,
    TaskService,
    ProjectService,
    GlobalCustomFieldService
  ]
})
export class CustomFieldModule { }
