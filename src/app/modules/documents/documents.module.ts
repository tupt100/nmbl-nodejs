import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { DocumentsRoutingModule } from './documents.routing';
import { CommonMenu } from '../common-menus/menu.module';
import { IntroModule } from '../intro-slides/intro-slides.module';
import { DaterangePickerModule } from '../ui-kit/daterange-picker/daterange-picker.module';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { SharedModule } from '../shared/shared.module';
import { CustomDirectives } from '../../directives/directive.module';
import { ViewAllComponent } from './view-all/view-all.component';
import { DirectoryViewComponent } from './directory-view/directory-view.component';
import { TagFilterComponent } from './tag-filter/tag-filter.component';
import { SelectPwtComponent } from './select-pwt/select-pwt.component';
import { DocumentsService } from './documents.service';
import { AuditTrailService } from '../../services/auditTrail.service';
import { ProjectService } from '../projects/project/project.service';
import { WorkflowService } from '../projects/workflow/workflow.service';
import { TaskService } from '../projects/task/task.service';
import { UserService } from '../user-management/user.service';
import { TagsService } from '../tags-manager/tags-manager.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
    declarations: [
        ViewAllComponent,
        DirectoryViewComponent,
        TagFilterComponent,
        SelectPwtComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CustomPipes,
        UIKitModule,
        CustomDirectives,
        DocumentsRoutingModule,
        SharedModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatChipsModule,
        MatSelectModule,
        IntroModule,
        PerfectScrollbarModule,
        CommonMenu,
        DaterangePickerModule
    ],
    providers: [
        DocumentsService,
        AuditTrailService,
        ProjectService,
        WorkflowService,
        TaskService,
        UserService,
        TagsService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        }
    ],
    exports: [
        DirectoryViewComponent
    ],
    bootstrap: []
})
export class DocumentsModule { }
