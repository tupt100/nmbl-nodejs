import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, HostListener, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';
import { Messages } from 'src/app/services/messages';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';
import * as moment from 'moment';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit, OnChanges, OnDestroy {

  /**
   * Bindings
   */
  @Input() modalType = '';
  @Input() modalId = '';
  @Input() attachments = [];
  @Input() createOrUpdate = 'update';
  @Output() updateModal = new EventEmitter();
  @Output() updateTrails = new EventEmitter();
  @Input() detail: any = {};
  momentObj = moment;
  docActionOpen = [];
  showModal = {
    uploadDoc: false,
    deleteDoc: false
  };
  deleteObj = {
    message1: Messages.popups.deleteDoc.title,
    message2: Messages.popups.deleteDoc.message,
    buttonText: 'Delete',
    docToDelete: null
  };
  projectSubscribe: any;
  permisionList: any = {};
  errorMsgSubs: any;
  urlRegex = this.sharedService.getExternalUrlPattern();
  googledocRegex = this.sharedService.getGoogleDocUrlPattern();
  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (['action-dropdown more pos-relative', 'sm-span', 'docAction'].indexOf(event.target.className) === -1) {
      this.docActionOpen = [];
    }
  }

  constructor(
    private sharedService: SharedService,
    private store: Store<fromRoot.AppState>
  ) { }

  ngOnInit() {
    // Subscribing error message and close popup
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(res => {
      if (res) {
        this.closeAndResetConfirm();
      }
    });
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }

  /**
   * Attachments changes
   * @param changes Changes: SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
        }
      }
    });
    if (changes.attachments) {
      this.attachments = changes.attachments.currentValue;
    }
  }

  /**
   * Download file
   * @param file File
   */
  downloadFile(file: any) {
    const fileObj = Object.assign(file);
    fileObj.name = file.document_name || file.attachment_name;
    this.sharedService
      .getFileBlob(fileObj.document_url || fileObj.attachment_url)
      .subscribe(
        res => {
          const blob = new Blob([res]);
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileObj.name);
          } else {                                    // For other browsers
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = fileObj.name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          }
        });
  }

  /**
   * Method to view attach url.
   * @param file the obejct which is used to identity which file wants to view.
   */
  viewAttach = (file) => {
    window.open(file.document_url, "_blank")
  };

  /**
   * Open popup for upload and delete doc
   * @param key Popup key
   * @param id ID
   */
  openPopup(key: string, id?: string): void {
    this.showModal[key] = true;
    if (id) {
      this.deleteObj.docToDelete = id;
    }
  }

  /**
   * Handler delete doc popup
   * @param response Delete doc popup confrimation response
   */
  confirmationDone(response: boolean): void {
    if (response) {
      const id = this.deleteObj.docToDelete;
      this.sharedService.deleteDocument(id).subscribe(() => {
        if (
          this.attachments &&
          this.attachments.length
        ) {
          const idx = this.attachments.findIndex(x => +x.id === +id);
          if (idx > -1) {
            this.attachments.splice(idx, 1);
          }
        }
        this.closeAndResetConfirm();
        this.updateTrails.emit();
      }, (e) => {
        this.closeAndResetConfirm();
      });
    } else {
      this.closeAndResetConfirm();
    }
  }

  /**
   * Close and reset popups
   */
  closeAndResetConfirm() {
    this.showModal = {
      deleteDoc: false,
      uploadDoc: false
    };
    this.deleteObj.docToDelete = null;
  }

  /**
   * Handler for document upload component response
   * @param res Response from document upload component
   */
  updateDocs(res: any) {
    if (res && res.fileError) {
      return this.sharedService.errorMessage.next(res.fileError);
    } else if (res && res.files && res.files.length) {
      this.updateModal.emit({ fileIds: res.files, uploadedFiles: res.uploadedFiles });
      this.closeAndResetConfirm();
    } else {
      this.showModal.uploadDoc = false;
    }
  }
  isExternalDocument = (attachment) => {
    return this.sharedService.isExternalDocument(attachment.document_url);
  }
  isGoogleDoc = (attachment) => {
    let re = new RegExp(this.googledocRegex);
    return re.test(attachment.document_url);
  }
  /**
   * Check permissions for delete and upload documents
   */
  hasPermission = (upload?: boolean): boolean => {


    switch (this.modalType) {
      case 'submitrequest':
        return true;

      case 'task':
        if (this.createOrUpdate == 'create') {
          if (upload && this.permisionList.task_upload_docs) {
            return true;
          } else if (!upload && this.permisionList.task_delete_doc) {
            return true;
          }
        }
        return upload ?
          this.permisionList.task_upload_docs && this.detail &&
          this.detail.status !== 3 && this.detail.status !== 4
          : this.permisionList.task_delete_doc && this.detail && this.detail.status !== 3 && this.detail.status !== 4;

      case 'workflow':
        if (this.createOrUpdate == 'create') {
          if (upload && this.permisionList.workflow_upload_docs) {
            return true;
          } else if (!upload && this.permisionList.workflow_delete_doc) {
            return true;
          }
        }
        return upload ?
          this.permisionList.workflow_upload_docs && this.detail && this.detail.workflow && this.detail.workflow.status === 1
          : this.permisionList.workflow_delete_doc && this.detail && this.detail.workflow &&
          this.detail.workflow.status === 1;

      case 'project':
        if (this.createOrUpdate == 'create') {
          if (upload && this.permisionList.project_upload_docs) {
            return true;
          } else if (!upload && this.permisionList.project_delete_doc) {
            return true;
          }
        }


        return upload ?
          this.permisionList.project_upload_docs && this.detail && this.detail.project && this.detail.project.status === 1
          : this.permisionList.project_delete_doc && this.detail && this.detail.project &&
          this.detail.project.status === 1;
    }
  }

}
