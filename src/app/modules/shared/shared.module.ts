import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditTrailHistoryComponent } from './audit-trail-history/audit-trail-history.component';
import { CommonService } from './common.service';
import { CustomPipes } from 'src/app/pipes/pipes.module';
import { DocumentsComponent } from './documents/documents.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { DiscussionsComponent } from './discussions/discussions.component';
import { FormsModule } from '@angular/forms';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { TaskPriorComponent } from './task-prior/task-prior.component';
import { NRUService } from '../nru/nru.service';
import { TaskService } from '../projects/task/task.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { FavouriteTaskComponent } from './favourite-task/favourite-task.component';
import { ClipboardModule } from 'ngx-clipboard';
import { DocumentUploadPopupComponent } from './document-upload-popup/document-upload-popup.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};
@NgModule({
  declarations: [
    AuditTrailHistoryComponent,
    DocumentsComponent,
    DiscussionsComponent,
    SearchFilterComponent,
    TaskPriorComponent,
    FavouriteTaskComponent,
    DocumentUploadPopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CustomPipes,
    UIKitModule,
    PerfectScrollbarModule,
    ClipboardModule
  ],
  exports: [
    AuditTrailHistoryComponent,
    DocumentsComponent,
    DiscussionsComponent,
    SearchFilterComponent,
    TaskPriorComponent,
    FavouriteTaskComponent,
    DocumentUploadPopupComponent
  ],
  providers: [
    CommonService,
    NRUService,
    TaskService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class SharedModule { }
