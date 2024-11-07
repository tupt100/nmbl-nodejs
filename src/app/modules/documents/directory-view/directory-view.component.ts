import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { IDocument } from '../documents.interface';
import { IProject } from '../../projects/project/project.interface';
import { IWorkflow, ITask, IAttachments } from '../documents.interface';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';
import { DocumentsService } from '../documents.service';
import { ProjectService } from '../../projects/project/project.service';
import { WorkflowService } from '../../projects/workflow/workflow.service';
import { TaskService } from '../../projects/task/task.service';
import { AuditTrailService } from '../../../services/auditTrail.service';
import { SharedService } from 'src/app/services/sharedService';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-directory-view',
  templateUrl: './directory-view.component.html',
  styleUrls: ['./directory-view.component.scss']
})
export class DirectoryViewComponent implements OnInit, OnDestroy {

  constructor(
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    private documentsService: DocumentsService,
    private auditTrailService: AuditTrailService,
    public sharedService: SharedService
  ) { }

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public arrProjects: Array<IProject> = [];
  public arrWorkflow: Array<IWorkflow> = [];
  public projectAttachments: Array<IAttachments> = [];
  public workflowAttachments: Array<IAttachments> = [];
  public taskAttachments: Array<IAttachments> = [];
  public arrTasks: Array<ITask> = [];
  public arrAuditTrail: Array<any> = [];
  public idDisplayDetail = false;
  public objDocument: IDocument;
  public projectId = 0;
  public workflowId = 0;
  public taskId = 0;
  public type = '';
  public isOpen = false;
  public showModal = {
    isRemoveDocument: false,
    isShareDocument: false,
    isCopyDocument: false
  };
  public defaultParams = {
    limit: 200,
    offset: 0,
    search: ''
  };
  public imageExt = this.sharedService.allowedFileFormats;
  public objFinalCopy = {};
  public destinationName = '';
  public tagsList: Array<any> = [];
  public tagTitle = [];
  public myFileArray: File[] = [];
  public fileId: Array<number> = [];
  public displayPWT = false;
  public typeId = 0;
  public displayTitle = 'No Assciation';
  errorMsgSubs: any;
  public searchText = '';

  ngOnInit() {
    /**
     * Subscribing and display error messages and hide copy document popup
     */
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(msg => {
      if (msg) {
        this.notifier.displayErrorMsg(msg);
        window.scroll(0, 0);
        this.showModal.isCopyDocument = false;
      }
    });

    /**
     * Get projects and tags listing
     */
    Promise.all([
      this.listProjects(), this.listTags()
    ]);
  }

  /**
   * Method to dispose active objects.
   */
  ngOnDestroy() {
    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }

  /**
   * Method to load list of projects.
   */
  listProjects = (): void => {
    this.arrProjects = [];
    this.arrWorkflow = [];
    this.arrTasks = [];
    this.type = '';
    this.projectAttachments = [];
    this.workflowAttachments = [];
    this.taskAttachments = [];
    this.projectService.listProjects(this.defaultParams).subscribe(res => {
      this.arrProjects = res && res.results && res.results.length ? res.results as Array<IProject> : [];
    });
  }

  /**
   * Method to select project and returns its document and workflow.
   * @param project is the object which is used to load specific project information
   */
  selectProject = (project: IProject): void => {
    this.arrTasks = [];
    this.projectAttachments = [];
    this.workflowAttachments = [];
    this.taskAttachments = [];
    this.projectId = project.project.id;
    this.type = 'project';
    this.objDocument = null;
    this.arrWorkflow = project && project.project && project.project.workflow &&
      project.project.workflow.length ? project.project.workflow as Array<IWorkflow> : [];
    if (project && project.project && project.project.attachments.length) {
      project.project.attachments.map(obj => {
        this.projectAttachments.push(obj);
      });
    }
  }

  /**
   * Method to select workflow and returns its document and tasks.
   * @param workflow is the object which is used to load specific workflow information
   */
  selectWorkflow = (workflow: IWorkflow): void => {
    this.workflowAttachments = [];
    this.taskAttachments = [];
    this.workflowId = workflow.id;
    this.type = 'workflow';
    this.objDocument = null;
    this.arrTasks = workflow && workflow.task && workflow.task.length ? workflow.task as Array<ITask> : [];
    if (workflow && workflow.attachments && workflow.attachments.length) {
      workflow.attachments.map(obj => {
        this.workflowAttachments.push(obj);
      });
    }
  }

  /**
   * Method to select project and returns its document.
   * @param task is the object which is used to load it documents
   */
  selectTask = (task: ITask) => {
    this.taskId = task.id;
    this.type = 'task';
    this.objDocument = null;
    this.taskAttachments = task && task.attachments && task.attachments.length ? task.attachments as Array<IAttachments> : [];
  }

  /**
   * Method to load specific docuement and its audit trail.
   * @param id the document id.
   */
  getDocumentDetails = (id: number, type: string): void => {
    this.type = type;
    Promise.all([this.getDocumentById(id), this.listAuditTrail(id)]).then(
      () => {
        this.idDisplayDetail = true;
      },
    );
  }

  /**
   * Method to load document by document id
   * @param id the document id.
   */
  getDocumentById = (id: number): void => {
    this.documentsService.getDocumentById(id).subscribe(res => {
      if (res) {
        this.tagTitle = [];
        this.objDocument = res as IDocument;
        this.displayTitle = this.objDocument.uploaded_to.name;
        if (this.objDocument && this.objDocument.document_tags.length > 0) {
          this.objDocument.document_tags.map(obj => {
            this.tagTitle.push(obj);
          });
        }
      }
    });
  }

  /**
   * Method to load document audit trail by document id.
   * @param id the document id.
   */
  listAuditTrail = (id: number): void => {
    const params = {
      model_type: 'attachment',
      model_id: id,
      offset_time: moment().utcOffset()
    };
    this.auditTrailService.listAuditTrail(params).subscribe(res => {
      const list: any[] = res && res.results && res.results.length ? res.results : [];
      if (list && list.length) {
        list.map(x => {
          const key = Object.keys(x.change_message)[0];
          const value = x.change_message[key];
          if (value.includes(' at ')) {
            let arr = value.split(' at ');
            if (arr && arr.length) {
              arr[0] = '<b>' + arr[0] + '</b>';
            }
            arr = arr.join(' at ');
            x.change_message[key] = arr;
          } else if (value.includes(' by ')) {
            let arr = value.split(' by ');
            if (arr && arr.length) {
              arr[arr.length - 1] = '<b>' + arr[arr.length - 1] + '</b>';
            }
            arr = arr.join(' by ');
            x.change_message[key] = arr;
          }
        });
      }
      this.arrAuditTrail = list;
    });
  }

  /**
   * Method to download document.
   * @param file the obejct which is used to identity which file wants to download.
   */
  downloadFile = (file) => {
    if (this.objDocument && this.objDocument.document_name) {
      file.name = (this.objDocument.document_name || (this.objDocument as any).attachment_name);
      this.sharedService.getFileBlob(file.document).subscribe(res => {
        const blob = new Blob([res]);
        if (window.navigator.msSaveOrOpenBlob) {  // File download for IE & Edge
          window.navigator.msSaveBlob(blob, file.name);
        } else {                                    // For other browsers
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.setAttribute('style', 'display: none');
          a.href = url;
          a.download = file.name;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove(); // remove the element
        }
        this.createAuditTrail(file.id);
      });
    } else {
      return;
    }
  }

  /**
   * Method to create audit trail if we done any kind of operation.
   * @param id the document id.
   */
  createAuditTrail = (id: number) => {
    const body = {
      model_reference: 'attachment',
      model_id: id,
      change_message: { 'Last time downloaded': '' },
    };
    this.auditTrailService.createAuditTrail(body).subscribe(res => {
      this.listAuditTrail(this.objDocument.id);
    });
  }

  /**
   * Method to upload document to server.
   */
  uploadFile = (e): void => {
    const file = e.target.files[0];
    const filename: string = file.name;
    const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
    if (this.imageExt.indexOf(format) >= 0) {
      this.documentsService.uploadDocument(file).subscribe(res => {
        if (res) {
          this.notifier.displaySuccessMsg(Messages.notifier.docUpload);
          this.doAfterUpload(res.id);
        }
      });
    } else {
      this.notifier.displayErrorMsg(Messages.notifier.docAllowExtension);
    }
  }

  /**
   * Method to check if document uploaded successfully to server it updates its id to P/W/T
   */
  doAfterUpload = (id): void => {
    if (this.type === 'project') {
      const params = {
        attachments: [id]
      };
      this.projectService.updateProject(this.projectId, params).subscribe(res => {
        if (res && res.attachments && res.attachments.length > 0) {
          this.projectAttachments = res.attachments;
          this.arrProjects.map(obj => {
            if (obj.project.id === this.projectId) {
              if (obj.project.attachments && obj.project.attachments.length > 0) {
                res.attachments.map(x => {
                  const index = obj.project.attachments.findIndex(y => y.id === x.id);
                  if (index === -1) {
                    obj.project.attachments.push(x);
                  }
                });
              } else {
                obj.project.attachments.push(res.attachments[0]);
              }
            }
          });
        }
      });
    } else if (this.type === 'workflow') {
      const params = {
        attachments: [id]
      };
      this.workflowService.updateWorkflow(this.workflowId, params).subscribe(res => {
        if (res && res.attachments && res.attachments.length > 0) {
          this.workflowAttachments = res.attachments;
          this.arrWorkflow.map(obj => {
            if (obj.id === this.workflowId) {
              if (obj.attachments && obj.attachments.length > 0) {
                res.attachments.map(x => {
                  const index = obj.attachments.findIndex(y => y.id === x.id);
                  if (index === -1) {
                    obj.attachments.push(x);
                  }
                });
              }
            }
          });
        }
      });
    } else if (this.type === 'task') {
      const params = {
        attachments: [id]
      };
      this.taskService.updateTask(this.taskId, params).subscribe(res => {
        if (res && res.attachments && res.attachments.length > 0) {
          this.taskAttachments = res.attachments;
          this.arrTasks.map(obj => {
            if (obj.id === this.taskId) {
              if (obj.attachments && obj.attachments.length > 0) {
                res.attachments.map(x => {
                  const index = obj.attachments.findIndex(y => y.id === x.id);
                  if (index === -1) {
                    obj.attachments.push(x);
                  }
                });
              }
            }
          });
        }
      });
    }
  }

  /**
   * Method to prompt user for remove document
   * @param response the key to retuen true or false.
   */
  removeDocumentConfirm = (response) => {
    if (response) {
      this.removeDocument();
    } else {
      this.showModal.isRemoveDocument = false;
    }
  }

  /**
   * Method to remove document by document id.
   */
  removeDocument = () => {
    this.showModal.isRemoveDocument = false;
    this.documentsService.removeDocument(this.objDocument.id).subscribe(res => {
      this.removeDocFromPWT(this.objDocument.id);
      this.notifier.displaySuccessMsg(Messages.notifier.docDelete);
      this.isOpen = false;
      this.idDisplayDetail = false;
      this.objDocument = null;
      this.arrAuditTrail = [];
    }, (error) => {
      this.notifier.displayErrorMsg(Messages.notifier.errorRemoveFile);
    });
  }

  /**
   * Splicing doc from local P/W/T array
   */
  removeDocFromPWT = (attachmentId: number) => {
    const arr = this.type + 'Attachments';
    const index = this[arr].findIndex(x => +x.id === attachmentId);
    if (index > -1) {
      this[arr].splice(index, 1);
    }
  }

  /**
   * Handle share document popup
   */
  shareDocument = (data) => {
    if (data) {
      this.shareDocumentConfirm(data);
    } else {
      this.showModal.isShareDocument = false;
    }
  }

  /**
   * Handle share document confirmation
   */
  shareDocumentConfirm = (email: string) => {
    if (email) {
      this.showModal.isShareDocument = false;
      const params = {
        document_id: this.objDocument.id,
        email: [email]
      }
      this.documentsService.shareDocument(params).subscribe( res => {
        if (res) {
          this.notifier.displaySuccessMsg(res.detail);
        }
      }, (error) => {
        if (error.error && typeof error.error.detail === 'string') {
          this.notifier.displayErrorMsg(error.error.detail);
        } else {
          if (error.error && error.error.detail) {
            this.notifier.displayErrorMsg(error.error.detail[0]);
          }
        }
      });
    } else {
      this.showModal.isShareDocument = false;
      this.notifier.displayErrorMsg('Please provide valid email address.')
    }
  }

  /**
   * Creating params for copy document when a value is selected
   */
  onValueSelected = (data) => {
    this.destinationName = data.name;
    const params: any = {
      destination: {
        id: data.id,
        type: data.type,
      },
      operation: 'copy',
      attachment_id: this.objDocument.id,
    };

    const docId = this.type + 'Id';
    const source = {
      id: this[docId],
      type: this.type
    };
    params.source = source;
    this.objFinalCopy = params;
  }

  /**
   * Method to copy or move document to project / workflow / task.
   * @param isCopy is the key which is used to copy or move the document.
   */
  copyDocument = (isCopy) => {
    if (isCopy) {
      this.showModal.isCopyDocument = false;
      this.documentsService.move_or_copy_document(this.objFinalCopy).subscribe(res => {
        if (res) {
          const msg = `Your document was successfully copied to ${this.destinationName}`;
          this.notifier.displaySuccessMsg(msg);
        }
      });
    } else {
      this.showModal.isCopyDocument = false;
    }
  }

  /**
   * Method to load list of tags to filter document by tag.
   * @param search the key which is used to search tags by name.
   */
  listTags = (search?) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: 100
    };
    const filteredParams = this.sharedService.filterParams(params);
    this.taskService.getTags(filteredParams).subscribe(res => {
      if (res) {
        this.tagsList = res.results.map((elem) => {
          elem.name = elem.tag;
          return elem;
        });
      }
    });
  }

  /**
   * Trigger when tags filter changed
   */
  selectionChanged = (arrTagIds: Array<number>) => {
    this.objDocument = null;
    if (arrTagIds && arrTagIds.length > 0) {
      (this.defaultParams as any).tag = arrTagIds.join();
    } else {
      delete (this.defaultParams as any).tag;
    }
    this.listProjects();
  }

  /**
   * Associate document to selected P/W/T
   */
  updatePWT = (data) => {
    this.fileId = [this.objDocument.id];
    this.typeId = data.id;
    const type = data.type;
    this.displayPWT = false;
    if (type === 'project') {
      this.updateProject();
    } else if (type === 'workflow') {
      this.updateWorkflow();
    } else if (type === 'task') {
      this.updateTask();
    }
  }

  /**
   * Set tags selection
   * @param groupObj Tags  selection
   */
  setFilterTitle(groupObj) {
    const ad = [];
    if (this.tagsList && this.tagsList.length) {
      this.tagsList.forEach(x => {
        if (groupObj.indexOf(x.id) > -1) {
          ad.push(x);
        }
      });
    } else {
      if (groupObj && groupObj.length) {
        groupObj.forEach(tag => {
          if (typeof tag === 'string') {
            ad.push({ id: tag, tag });
          }
        });
      }
    }

    const array = _.uniqBy([...ad, ...this.tagTitle], 'id');
    this.tagTitle = array;

    if (this.tagTitle.length !== groupObj.length) {
      this.tagTitle = _.remove(this.tagTitle, obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Set tags selection for assigning to document
   * @param groupObj Tags selection
   */
  setFilterTitleUpdate(groupObj) {
    const ad = [];
    if (this.tagsList && this.tagsList.length) {
      this.tagsList.forEach(x => {
        if (groupObj.indexOf(x.id) > -1) {
          ad.push(x);
        }
      });
    } else {
      if (groupObj && groupObj.length) {
        groupObj.forEach(tag => {
          if (typeof tag === 'string') {
            ad.push({ id: tag, tag });
          }
        });
      }
    }

    const array = _.uniqBy([...ad, ...this.tagTitle], 'id');
    this.tagTitle = array;

    if (this.tagTitle.length !== groupObj.length) {
      this.tagTitle = _.remove(this.tagTitle, obj => groupObj.indexOf(obj.id) > -1);
    }


    if (this.tagsList && !this.tagsList.length) {
      this.listTags();
    }

    const tagNames = this.tagTitle && this.tagTitle.length ? this.tagTitle.map(x => x.tag) : [];
    const params = {
      document_tag_save: tagNames.join()
    };
    this.documentsService.updateDocument(this.objDocument.id, params).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(Messages.notifier.docTags);
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Method to update task if copy document to task.
   */
  updateTask = () => {
    const data = { attachments: this.fileId };
    this.taskService.updateTask(this.typeId, data).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(Messages.notifier.fileUpload);
        if (this.objDocument) {
          this.getDocumentById(this.objDocument.id);
        }
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Method to update workflow if copy document to workflow.
   */
  updateWorkflow = () => {
    const data = { attachments: this.fileId };
    this.workflowService.updateWorkflow(this.typeId, data).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(Messages.notifier.fileUpload);
        if (this.objDocument) {
          this.getDocumentById(this.objDocument.id);
        }
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Method to update project if copy document to project.
   */
  updateProject = () => {
    const data = { attachments: this.fileId };
    this.projectService.updateProject(this.typeId, data).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(Messages.notifier.fileUpload);
        if (this.objDocument) {
          this.getDocumentById(this.objDocument.id);
        }
      }
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.notifier.displayErrorMsg(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.notifier.displayErrorMsg(e.error.detail[0]);
      } else {
        this.notifier.displayErrorMsg(Messages.errors.serverErr);
      }
    });
  }

  /**
   * Method to search document inside project
   */
  searchDocument = (value: string) => {
    if (value.trim().length) {
      this.defaultParams.search = this.searchText;
      this.projectService.listProjects(this.defaultParams).subscribe(res => {
        this.arrProjects = res && res.results && res.results.length ? res.results as Array<IProject> : [];
      });
    } else {
      this.defaultParams.search = '';
      this.listProjects();
    }
  }

  clearSearch = () => {
    this.searchText = '';
    this.searchDocument('');
  }
}


