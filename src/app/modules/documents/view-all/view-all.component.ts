import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { IDocument } from '../documents.interface';
import { ISlides } from '../../intro-slides/intro-slides.interface';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';
import { DocumentsService } from '../documents.service';
import { AuditTrailService } from '../../../services/auditTrail.service';
import { ProjectService } from '../../projects/project/project.service';
import { WorkflowService } from '../../projects/workflow/workflow.service';
import { TaskService } from '../../projects/task/task.service';
import { UserService } from '../../user-management/user.service';
import { SharedService } from 'src/app/services/sharedService';
import { IntroService } from '../../intro-slides/intro-slides.service';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-view-all',
  templateUrl: './view-all.component.html',
  styleUrls: ['./view-all.component.scss']
})
export class ViewAllComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public totalRecords = 0;
  public arrDocuments: Array<IDocument> = [];
  public arrAuditTrail: Array<any> = [];
  public idDisplayDetail = false;
  public objDocument: IDocument;
  public isOpen = false;
  public calenderOpen = false;
  public openFilter = false;
  public defaultParams = {
    limit: 10,
    offset: 0,
    ordering: 'document_name',
    created_by: '',
    created_at_after: '',
    created_at_before: '',
    search: ''
  };
  public showModal = {
    isRemoveDocument: false,
    isShareDocument: false,
    isCopyDocument: false,
    isIntro: false,
    isDocumentUpload: false
  };
  public defaultTagParams = {
    limit: 100,
    offset: 0
  };
  public isDateSelected = false;
  public usersList: Array<any> = [];
  public userTitle = [];
  public tagTitle = [];
  public tagsList: Array<any> = [];
  public displayUserFilter = false;
  public displayTagPopup = false;
  public displayPWT = false;
  globalSearchFilter = this.sharedService.globalSearchFilter;
  sortByList: Array<any> = [];
  public displaySortBy = false;
  public module = 'document';
  public slides: Array<ISlides> = [];
  moduleSubs: any;
  public selectedId: Array<number> = [];
  public myFileArray: File[] = [];
  public displayTitle = 'No Assciation';
  public type = '';
  public typeId = 0;
  private fileId: Array<number> = [];
  public isopen = false;
  errorMsgSubs: any;
  public searchText = '';
  public file: File;

  /**
   * Handle mouse outside click event to close the popups, filters, calendars etc.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (event.target.className !== '' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'search_input ng-untouched ng-valid ng-dirty' &&
      event.target.className !== 'fitem-ck-txt text-center' &&
      event.target.className !== 'fix-filter mt-10 nav-dropdown' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'check-list' &&
      event.target.className !== 'drop-down' &&
      event.target.className !== 'footbtns' &&
      event.target.className !== 'day-num ng-star-inserted') {
      this.displayUserFilter = false;
      this.calenderOpen = false;
      this.displaySortBy = false;
      this.displayPWT = false;
    }
  }

  constructor(
    private documentsService: DocumentsService,
    private auditTrailService: AuditTrailService,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService,
    private userService: UserService,
    public sharedService: SharedService,
    private introService: IntroService
  ) { }

  ngOnInit() {
    /**
     * Set user selected limit
     */
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }

    /**
     * Subscribe and display error messages
     */
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(msg => {
      if (msg) {
        this.displayErrorMsg(msg);
        this.showModal.isCopyDocument = false;
      }
    });

    /**
     * API calls
     */
    Promise.all([
      this.displayIntro(),
      this.loadSortList(),
      this.listDocument(),
      this.listTags(),
      this.listUsers()
    ]);

    /**
     * Get document detail when user click on document under search
     */
    this.moduleSubs = this.sharedService.moduleCarrier.subscribe((resp: any) => {
      if (resp && resp.type && resp.type === 'document') {
        if (resp.data.length && resp.data[0].id) {
          this.getDocumentDetails(resp.data[0].id);
        }
      }
    });
  }

  /**
   * Method to display module introduction about how to use document module
   * and what are core feature of document module.
   */
  displayIntro = () => {
    this.introService.displayIntro(this.module).subscribe(res => {
      if (res && res.introslide && res.introslide.length > 0) {
        this.slides = res.introslide as Array<ISlides>;
        this.slides.map((obj, index) => {
          if (index === 0) {
            obj.slide.selected = true;
          } else {
            obj.slide.selected = false;
          }
        });
        this.showModal.isIntro = true;
      }
    });
  }

  /**
   * Method to close module introduction.
   */
  onClose = (response) => {
    if (response) {
      this.showModal.isIntro = false;
    }
  }

  /**
   * Method to load list of filter by which we can apply sorting to document.
   */
  loadSortList = () => {
    this.sortByList = [
      {
        id: 1,
        name: 'A-Z',
        checked: true
      },
      {
        id: 2,
        name: 'Z-A',
        checked: false
      }
    ];
  }

  /**
   * Method to load list of users to filter document by users.
   * @param search the key which is used to search by name.
   */
  listUsers = (search?) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: 100
    };
    const filteredParams = this.sharedService.filterParams(params);
    this.userService.listUsers(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem) => {
          elem.name = elem.first_name + ' ' + elem.last_name;
          return elem;
        });
        this.usersList = [...data];
      }
    });
  }

  /**
   * Method to set title of filter.
   * @param groupObj the object with key and value pair.
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
   * Method to clear filter and load result with default data.
   */
  clearSelections(): void {
    this.userTitle = [];
    this.listUsers();
  }

  /**
   * Method to load list of documents.
   */
  listDocument = (): void => {
    const params = this.sharedService.filterParams(this.defaultParams);
    this.documentsService.listDocument(params).subscribe(res => {
      if (res && res.results) {
        this.totalRecords = res.count as number;
        this.arrDocuments = res.results as Array<IDocument>;
      }
    });
  }

  /**
   * Method to load more documents when we select pagination.
   * @param offset the initial index from which to return the results.
   */
  loadMoreDocument = (offset: number): void => {
    this.objDocument = null;
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listDocument();
  }

  /**
   * Method to load specific docuement and its audit trail.
   * @param id the document id.
   */
  getDocumentDetails = (id: number): void => {
    Promise.all([this.getDocumentById(id), this.listAuditTrail(id)]).then(
      () => {
        this.idDisplayDetail = true;
        this.isopen = true;
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
        this.displayTitle = this.objDocument && this.objDocument.uploaded_to &&
          this.objDocument.uploaded_to.name ? this.objDocument.uploaded_to.name : '';
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
 * Method to view attach url.
 * @param file the obejct which is used to identity which file wants to view.
 */
  viewAttach = (file) => {
    window.open(file.document_url, "_blank")
  };

  isExternalDocument = (attachment) => {
    return this.sharedService.isExternalDocument(attachment.document_url);
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
      }, error => {
        this.displayErrorMsg(JSON.stringify(error));
      }, () => {
        this.notifier.displaySuccessMsg(Messages.notifier.downloadComplete);
      });
    } else {
      return;
    }
  }

  /**
   * Method to create audit trail if we done any kinbd of operation.
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
      this.isOpen = false;
      this.objDocument = null;
      this.arrAuditTrail = [];
      this.notifier.displaySuccessMsg(Messages.notifier.docRemove);
      this.idDisplayDetail = false;
      this.listDocument();
    });
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
      this.documentsService.shareDocument(params).subscribe(res => {
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

  onPWTSelection = (data: any) => {
    this.displayTitle = data.name;
    this.type = data.type;
    this.typeId = data.id;
  }

  copyDocument = (response) => {
    if (response) {
      this.copyDocumentConfirm();
    } else {
      this.showModal.isCopyDocument = false;
    }
  }

  /**
   * Method to allow document to copy in project / workflow / task.
   */
  copyDocumentConfirm = () => {
    this.showModal.isCopyDocument = false;
    const params = {
      source: {
        id: this.objDocument.uploaded_to.id,
        type: 'task'
      },
      destination: {
        id: this.typeId,
        type: this.type,
      },
      operation: 'copy',
      attachment_id: this.objDocument.id,
    };
    this.documentsService.move_or_copy_document(params).subscribe(res => {
      if (res) {
        const msg = `Document successfully copied to ${this.displayTitle}`;
        this.notifier.displaySuccessMsg(msg);
        this.listDocument();
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
   * Method to filter document my tag selection.
   * @param arrTagIds the array of Tag ids.
   */
  selectionChanged = (arrTagIds: Array<number>) => {
    this.objDocument = null;
    if (arrTagIds && arrTagIds.length > 0) {
      (this.defaultParams as any).tag = arrTagIds.join();
    } else {
      delete (this.defaultParams as any).tag;
    }
    this.displayTagPopup = false;
    this.listDocument();
  }

  /**
   * Method to search tag by name.
   * @param event is the key which is used to filter tags by name.
   */
  onSearchKeyup = (event) => {
    if (event.target.value.trim().length > 0) {
      this.displayTagPopup = true;
      (this.defaultTagParams as any).search = event.target.value;
    } else {
      this.displayTagPopup = false;
      delete (this.defaultTagParams as any).search;
    }
    this.listTags();
  }

  /**
   * Filter docs based on users
   */
  onSelectionChanged = (data: any) => {
    if (data && data.length > 0) {
      this.selectedId = data;
      this.defaultParams.created_by = data.join();
    } else {
      this.selectedId = [];
      this.defaultParams.created_by = '';
    }
    this.listDocument();
  }

  /**
   * Set start and end dates using date-range-picker filter
   */
  onSelectDate = (data) => {
    this.isDateSelected = data.clear;
    this.defaultParams.created_at_after = data ? data.start : '';
    this.defaultParams.created_at_before = data ? data.end : '';
  }

  /**
   * Date range picker clear event
   */
  clear = (data) => {
    this.isDateSelected = data.clear;
    this.defaultParams.created_at_after = data ? data.start : '';
    this.defaultParams.created_at_before = data ? data.end : '';
    delete this.defaultParams.created_at_after;
    delete this.defaultParams.created_at_before;
    this.listDocument();
  }

  /**
   * Get documents when date filter applied
   */
  apply = () => {
    this.listDocument();
  }

  /**
   * Handle sorting dropdown trigger
   * @param event Checkbox change event
   * @param item Sorting key
   */
  orderByChange(event: any, item: any): void {
    if (event.target.checked) {
      this.sortByList.map(obj => {
        obj.checked = false;
      });
      item.checked = true;
      if (item.id === 1) {
        this.defaultParams.ordering = 'document_name';
      } else if (item.id === 2) {
        this.defaultParams.ordering = '-document_name';
      }
    } else {
      this.defaultParams.ordering = 'document_name';
    }
    this.listDocument();
  }

  /**
   * Assign file array as blank array
   */
  cancelUpload = () => {
    this.myFileArray = [];
  }

  /**
   * Method to push new file in local object.
   * @param e is the object which contains file object.
   */
  uploadFile = (e) => {
    this.objDocument = null;
    this.type = '';
    this.typeId = 0;
    this.displayTitle = 'No Assciation';
    const file = e.target.files[0];
    this.file = file;
    const format = file.name.substr(file.name.lastIndexOf('.')).toLowerCase();
    const index = this.sharedService.allowedFileFormats.indexOf(format);
    if (index >= 0) {
      this.myFileArray.push(file);
      if (window.innerWidth < 768) {
        this.showModal.isDocumentUpload = true;
      }
      this.isopen = true;
    } else {
      this.displayErrorMsg(Messages.notifier.docAllowExtension);
    }
  }

  /**
   * Set fields when P/W/T selected from P/W/T selector
   */
  onValueSelected = (data) => {
    this.displayTitle = data.name;
    this.type = data.type;
    this.typeId = data.id;
    this.displayPWT = false;
  }

  /**
   * Remove local document from array
   */
  removeLocalDocument = (index: number) => {
    this.myFileArray.splice(index, 1);
  }

  /**
   * Method to upload document to server.
   */
  uploadDoc() {
    const arr = [];
    if (this.type === '' || this.typeId === 0) {
      return this.displayErrorMsg(Messages.notifier.selectPWT);
    }
    if (this.tagTitle && this.tagTitle.length > 0) {
      this.tagTitle.map(obj => {
        arr.push(obj.tag);
      });
    }
    for (const file of this.myFileArray) {
      if (file) {
        if (arr.length > 0) {
          (file as any).document_tag_save = [...arr].join();
        }
        this.sharedService.uploadDocument(file).subscribe(res => {
          if (res) {
            this.fileId.push(res.id);
            if (this.type === 'project') {
              this.updateProject();
            } else if (this.type === 'workflow') {
              this.updateWorkflow();
            } else if (this.type === 'task') {
              this.updateTask();
            }
          }
        }, (e) => {
          this.displayErrorMsg(Messages.notifier.errorUploadFile);
        });
      }
    }
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
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listDocument();
  }

  /**
   * Method to search document
   */
  searchDocument = (value: string) => {
    if (value.trim().length) {
      const params = {
        search: value,
        limit: this.defaultParams.limit,
        offset: 0
      };
      this.defaultParams.search = this.searchText;
      this.documentsService.listDocument(params).subscribe(res => {
        if (res && res.results) {
          this.totalRecords = res.count as number;
          this.arrDocuments = res.results as Array<IDocument>;
        }
      });
    } else {
      this.defaultParams.search = '';
      this.listDocument();
    }
  }

  clearSearch = () => {
    this.searchText = '';
    this.searchDocument('');
  }

  /**
   * Removing and unsubscribing observables
   */
  ngOnDestroy() {
    if (this.moduleSubs) {
      this.sharedService.moduleCarrier.next({ type: '', data: [] });
      this.moduleSubs.unsubscribe();
    }

    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }

  onCancel = (isCancel: boolean) => {
    this.objDocument = null;
    this.myFileArray = [];
    this.showModal.isDocumentUpload = false;
  }

  onUpload = (arrFile: any) => {
    this.showModal.isDocumentUpload = false;
    this.myFileArray = [];
    if (arrFile && arrFile.length) {
      this.myFileArray = [...arrFile];
    } else {
      this.displayErrorMsg(Messages.notifier.selectDocToUpload);
    }
  }

  displayErrorMsg(msg: string) {
    this.notifier.displayErrorMsg(msg);
    window.scrollTo(0, 0);
  }
}
