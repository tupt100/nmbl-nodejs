import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { ImportanceComponent } from './importance/importance.component';
import { PaginationComponent } from './pagination/pagination.component';
import { NotifierComponent } from './notifier/notifier.component';
import { DocumentUploadComponent } from './document-upload/document-upload.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { RankNumberComponent } from './rank-number/rank-number.component';
import { MultiSelectDropdownComponent } from './multiselect-dropdown/multiselect-dropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectTaskStatusComponent } from './select-task-status/select-task-status.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { SelectPrivilegeComponent } from './select-privilege/select-privilege.component';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { ShareDocumentComponent } from './share-document/share-document.component';
import { CopyDocumentComponent } from './copy-document/copy-document.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { ShareMyListComponent } from './share-my-list/share-my-list.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
    CustomPipes,
    PerfectScrollbarModule
  ],
  declarations: [
    PieChartComponent,
    ImportanceComponent,
    PaginationComponent,
    NotifierComponent,
    DocumentUploadComponent,
    RankNumberComponent,
    SelectTaskStatusComponent,
    MultiSelectDropdownComponent,
    ConfirmModalComponent,
    SelectPrivilegeComponent,
    ShareDocumentComponent,
    CopyDocumentComponent,
    ShareMyListComponent
  ],
  exports: [
    PieChartComponent,
    ImportanceComponent,
    PaginationComponent,
    NotifierComponent,
    DocumentUploadComponent,
    RankNumberComponent,
    SelectTaskStatusComponent,
    MultiSelectDropdownComponent,
    ConfirmModalComponent,
    SelectPrivilegeComponent,
    ShareDocumentComponent,
    CopyDocumentComponent,
    ShareMyListComponent
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})

export class UIKitModule { }
