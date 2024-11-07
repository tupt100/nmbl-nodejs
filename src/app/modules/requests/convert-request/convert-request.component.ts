import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RequestsService } from '../requests.service';
import { SharedService } from 'src/app/services/sharedService';
import { WorkflowService } from '../../projects/workflow/workflow.service';
import { TaskService } from '../../projects/task/task.service';
import { GroupService } from '../../user-management/group.service';
import { MessageService, IMessage } from '../../../services/message.service';
import { IPrivilege } from '../requests.interface';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Messages } from '../../../services/messages';
import { Store } from '@ngrx/store';
import { UserService } from '../../user-management/user.service';
import { TaskPriorComponent } from '../../shared/task-prior/task-prior.component';
import * as _ from 'lodash';
import * as fromRoot from '../../../store';
import * as fromSave from '../../../store/reducers/save.reducer';

@Component({
  selector: 'app-convert-request',
  templateUrl: './convert-request.component.html',
  styleUrls: ['./convert-request.component.scss']
})
export class ConvertRequestComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(TaskPriorComponent) taskPrior: TaskPriorComponent;
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public taskForm: FormGroup;
  public objUser$: Observable<fromSave.SaveDataState>;
  public objPermission$: any;
  public permisionList: any = {};
  public arrPrivilege: Array<IPrivilege> = [];
  public usersList: Array<any> = [];
  public userTitle: Array<any> = [];
  public workFlowList: Array<{ id: number, name: string }> = [];
  public workflowTitle: Array<any> = [];
  public workGroupList: Array<{ id: number, name: string }> = [];
  public groupTitle: Array<any> = [];
  public tagsList: Array<any> = [];
  public tagTitle: Array<any> = [];
  public requestId = 0;
  public importance = 1;
  public userId = 0;
  public taskDocuments = [];
  public reqAttachments = [];
  public fileId: Array<number> = [];
  public minDate = new Date();
  public showModal = {
    isConvert: false
  };
  public isSelfAssign = false;
  public requestIds: Array<number> = [];
  public arrResolveBulkArray: Array<any> = [];
  public arrRejectBulkArray: Array<any> = [];
  public allowedFormats = this.sharedService.allowedFileFormats.join();
  public setToday = false;
  public currentRequest = 0;
  public workFlowUpdated = false;
  public convertIDsCookie = 'ConvertIds';
  public isPrivate = false;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService, private workflowService: WorkflowService,
    private userService: UserService, private groupService: GroupService,
    private taskService: TaskService, private requestsService: RequestsService,
    private messageService: MessageService, private store: Store<fromRoot.AppState>) {
    this.objUser$ = this.store.select('userDetails');
  }

  ngOnInit() {
    // Getting logged user ID
    this.objUser$.subscribe((res: any) => {
      if (res.loaded) {
        this.userId = res.datas.id;
      }
    });

    // Getting permissions for logged user
    this.objPermission$ = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
        }
      }
    });

    /**
     * Dropdown listing
     */
    Promise.all([
      this.getLists('user'),
      this.getLists('group'),
      this.getLists('tag'),
      this.listPrivilege()
    ]);

    // Initialize form
    this.initForm();

    // Check for single or multiple conversion of requests into task
    this.activatedRoute.params.subscribe(params => {
      this.requestId = params.id || '';
      if (this.requestId) {
        this.getRequestDetails(this.requestId);
      } else {
        this.requestIds = this.getCookie(this.convertIDsCookie) &&
          JSON.parse(this.getCookie(this.convertIDsCookie))
          ? JSON.parse(this.getCookie(this.convertIDsCookie))
          : 0;
        if (this.requestIds && this.requestIds.length > 0) {
          this.requestId = this.requestIds[this.currentRequest];
          this.getRequestDetails(this.requestId);
        } else {
          this.showErrorMessage(Messages.errors.invalidToken);
          this.cancel();
        }
      }
    });
  }

  /**
   * Initialize form and validation
   */
  initForm = (): void => {
    this.taskForm = this.fb.group({
      name: [null, Validators.required],
      due_date: null,
      start_date: null,
      description: null
    });
    this.getLists('workflows');
  }

  /**
   * Get requests ids data using ConvertIds cookie
   * @param name Cookie name
   */
  getCookie = (name: string) => {
    const ca: Array<string> = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = `${name}=`;
    let c: string;
    for (let i = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) === 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  /**
   * Get request detail to populate form with details
   * @param id Request ID
   */
  getRequestDetails = (id: number) => {
    this.requestsService.getRequestDetailsById(id).subscribe(res => {
      if (res) {
        this.importance = res.request_priority;
        const attachment = res.attachments || [];

        if (attachment && attachment.length) {
          attachment.map(x => {
            const obj = {
              id: x.id,
              name: x.document_name
            };
            this.reqAttachments.push(obj);
            this.fileId.push(x.id);
          });
        }

        this.taskForm = this.fb.group({
          name: res.subject || '',
          due_date: new Date(res.requested_due_date) < this.minDate ? this.minDate : new Date(res.requested_due_date),
          start_date: null,
          description: ''
        });
        if (res.assigned_to) {
          this.userTitle = this.usersList.filter(x => x.id === res.assigned_to);
        }
      }
    }, (error) => {
      this.showErrorMessage(Messages.errors.noRequestFound);
      this.router.navigate(['/main/services']);
    });
  }

  /**
   * Return dropdown listing
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : ''
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        return this.getUsers(filteredParams);
      case 'group':
        return this.getWorkGroups(filteredParams);
      case 'tag':
        if (search && search.keyCode === 13) {
          delete filteredParams.search;
        }
        return this.getTags(filteredParams);
      case 'workflows':
        return this.getWorkFlows(filteredParams);
    }
  }

  /**
   * Return users listing
   */
  getUsers = (filteredParams) => {
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
   * Return workgroups listing
   */
  getWorkGroups = (filteredParams) => {
    this.groupService.company_work_group(filteredParams).subscribe(res => {
      if (res) {
        this.workGroupList = res.results as Array<{ id: number, name: string }>;
      }
    });
  }

  /**
   * Return tags listing
   */
  getTags = (filteredParams) => {
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
   * Return workflows listing
   */
  getWorkFlows = (filteredParams) => {
    this.workflowService.listWorkflow(filteredParams).subscribe(res => {
      if (res) {
        const data = res.results.map((elem: any) => {
          return {
            id: elem.workflow.id,
            name: elem.workflow.name
          };
        });
        this.workFlowList = [...data];
      }
    });
  }

  /**
   * Trigger when assignee dropdown selection changed
   * @param groupObj Assignments array
   * @param filterType Assignee dropdown type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'group':
        this.setFilterTitle('workGroupList', 'groupTitle', groupObj);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj, 'tag');
        break;
      case 'workflows':
        this.workFlowUpdated = false;
        if (this.workflowTitle && this.workflowTitle.length) {
          this.onSingleFilterSelected('workFlowList', 'workflowTitle', groupObj);
        }
        this.setFilterTitle('workFlowList', 'workflowTitle', groupObj);
        setTimeout(() => {
          this.workFlowUpdated = true;
        });
        break;
      case 'user':
        if (this.userTitle && this.userTitle.length) {
          this.onSingleFilterSelected('usersList', 'userTitle', groupObj);
        }
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
      default:
        break;
    }
  }

  /**
   * Handle assignment dropdown selections
   * @param data Dropdown list
   * @param title Assignee dropdown list
   * @param groupObj Assignments array
   * @param filter Assignee dropdown type (optional special case for tags)
   */
  setFilterTitle(data, title, groupObj, filter?) {
    const ad = [];
    if (this[data] && this[data].length) {
      this[data].forEach(x => {
        if (groupObj.indexOf(x.id) > -1) {
          ad.push(x);
        }
      });
    } else if (filter === 'tag') {
      if (groupObj && groupObj.length) {
        groupObj.forEach(tag => {
          if (typeof tag === 'string') {
            ad.push({ id: tag, tag });
          }
        });
      }
    }
    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Handle single selection for workflows and users
   * @param filterType Dropdown type
   * @param title Dropdown selection list
   * @param groupObj selections
   */
  onSingleFilterSelected(filterType, title, groupObj): void {
    const index = groupObj.indexOf(this[title][0].id);
    if (index > -1) {
      groupObj.splice(index, 1);
    }
    if (title === 'userTitle') {
      this.isSelfAssign = groupObj[0] === this.userId;
    }
    this.filterOptions(filterType, groupObj);
  }

  /**
   * Set checked for single selection
   * @param filterType Dropdown type
   * @param groupObj Selections
   */
  filterOptions(filterType, groupObj) {
    this[filterType].map((elem: any) => {
      elem.checked = (+elem.id === +groupObj) ? true : false;
    });
  }

  /**
   * Set importance
   * @param value Selected importance
   * @param formtype Form Type
   */
  updateImportance(event) {
    this.importance = event;
  }

  /**
   * Set start date as current date
   * @param event Checkbox change event
   */
  setCurrentDate(event) {
    const startDate = this.taskForm.get('start_date');
    const currentDate = new Date();
    if (event.target.checked) {
      startDate.setValue(currentDate);
      this.setToday = true;
    } else {
      startDate.setValue('');
      this.setToday = false;
    }
  }

  /**
   * Clear workflows selections
   */
  clearWorkFlows(): void {
    this.workflowTitle = [];
    this.workFlowList.map((x: any) => x.checked = false);
  }

  /**
   * Handle privilege checkbox trigger
   * @param event Checkbox change event
   * @param id Privilege ID
   */
  updatePrivilege(event, id) {
    if (event.target.checked) {
      if (id === '') {
        this.arrPrivilege = this.arrPrivilege.map((obj: any, i) => {
          if (i !== 0) { obj.checked = false; }
          return obj;
        });
      } else {
        (this.arrPrivilege[0] as any).checked = false;
      }
    }
  }

  /**
   * Clear workgroup selections
   */
  clearSelections(): void {
    this.groupTitle = [];
    this.workGroupList.map((x: any) => x.checked = false);
  }

  /**
   * Remove file from local array
   * @param idx File index
   */
  removeFile = (idx) => {
    this.taskDocuments.splice(idx, 1);
  }

  /**
   * Dropzone drop event (multiple docs for single and single doc for multiple conversions)
   */
  dropped = (event: any) => {
    const arr = [...event.addedFiles];
    const validFiles = [];
    arr.forEach((file) => {
      const filename = file.name;
      const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
      if (this.sharedService.allowedFileFormats.indexOf(format) > -1) {
        validFiles.push(file);
      }
    });

    if (!validFiles.length) {
      return this.showErrorMessage('Extensions of the allowed file types are ' + this.sharedService.allowedFileFormats.join(', '));
    }

    this.taskDocuments = !this.requestIds.length && !this.arrResolveBulkArray.length &&
      !this.arrRejectBulkArray.length ? this.taskDocuments.concat(validFiles) : validFiles;
  }

  /**
   * Return due date value to set max date for start date calendar
   */
  getDueDate() {
    return this.taskForm.get('due_date').value;
  }

  /**
   * Return start date value to set min date for due date calendar
   */
  getMinDate() {
    return this.taskForm.get('start_date').value ? this.taskForm.get('start_date').value : this.minDate;
  }

  /**
   * Get privileges listings
   */
  listPrivilege = () => {
    this.arrPrivilege = this.sharedService.privilegeList as Array<IPrivilege>;
  }

  /**
   * Handle assign to myself checkbox
   * @param event Checkbox change event
   */
  checkSelfAssign(event) {
    const value = event.target.checked ? this.userId : '';
    const index = this.usersList.findIndex((x) => {
      return +x.id === +this.userId;
    });
    if (value) {
      if (index > -1) {
        this.userTitle = [this.usersList[index]];
        this.filterOptions('usersList', [this.userId]);
      } else {
        this.userTitle = [];
      }
    } else {
      this.userTitle = [];
      if (index > -1) {
        this.usersList[index].checked = false;
      }
    }
  }

  /**
   * Handle convert single request to task
   */
  convertRequest = () => {
    if (!this.userTitle.length && !this.groupTitle.length) {
      return this.showErrorMessage(Messages.errors.assignTask);
    }

    const data = this.taskForm.value;
    if (this.taskDocuments && this.taskDocuments.length) {
      let count = 1;
      this.taskDocuments.forEach(file => {
        this.sharedService.uploadDocument(file).subscribe(res => {
          this.fileId.push(res.id);
          if (count === this.taskDocuments.length) {
            this.setParamNCreateTask(data);
          }
          count++;
        }, e => {
          const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.uploadFailed;
          return this.showErrorMessage(error);
        });
      });
    } else {
      this.setParamNCreateTask(data);
    }
  }

  /**
   * Set params and convert request into task
   * @param data Request data
   */
  setParamNCreateTask(data) {
    if (this.permisionList.task_create_edit_privilege_selector) {
      this.arrPrivilege.forEach((val: any) => {
        if (val.id !== '') {
          data[val.id] = val.checked;
        }
      });
    }
    data.is_private = this.isPrivate;
    data.due_date = data.due_date ? this.sharedService.formatDate(data.due_date) : null;
    data.start_date = data.start_date ? this.sharedService.formatDate(data.start_date) : null;
    data.task_tags = [];
    data.assigned_to_group = [];
    this.tagTitle.forEach((val) => {
      data.task_tags.push(val.tag);
    });
    this.groupTitle.forEach((val) => {
      data.assigned_to_group.push(val.id);
    });
    data.attachments = this.fileId;
    data.status = 6;
    data.assigned_to = this.userTitle && this.userTitle.length ? this.userTitle[0].id : null;
    data.workflow = this.workflowTitle && this.workflowTitle.length ? this.workflowTitle[0].id : null;
    data.importance = this.importance;
    data.prior_task = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.prior_task ? this.taskPrior.priorData.prior_task : null;
    data.after_task = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.after_task ? this.taskPrior.priorData.after_task : null;
    const params = {
      data: [data],
      tickets: [this.requestId.toString()]
    };

    this.requestsService.bulkTaskCreate(params).subscribe((res) => {
      const mssage: IMessage = {
        message: res && res.detail ? res.detail : 'The Request was successfully converted into a task!'
      };
      this.messageService.recordCreatedUpdated(mssage);
      this.router.navigate(['main/services']);
    }, (e) => {
      if (e && e.error && e.error.detail && typeof e.error.detail === 'string') {
        this.showErrorMessage(e.error.detail);
      } else if (e && e.error && e.error.detail && e.error.detail.length) {
        this.showErrorMessage(e.error.detail[0]);
      }
    });
  }

  /**
   * Navigate to requests listing
   */
  cancel = () => {
    this.router.navigate(['main/services']);
  }

  /**
   * Hanlder for next and cancel button in multiple conversions
   * @param nextTrigger [boolean] True if next trigger
   */
  handleConversion = (nextTrigger?: boolean) => {
    const arr = nextTrigger ? 'arrResolveBulkArray' : 'arrRejectBulkArray';
    const idx = this[arr].findIndex(x => x.id === this.requestId);
    if (idx > -1) {
      this[arr].splice(idx, 1);
    }

    if (!this.userTitle.length && !this.groupTitle.length && nextTrigger) {
      return this.showErrorMessage(Messages.errors.assignTask);
    }

    const data = this.taskForm.value;
    let totalRecords = (this.arrResolveBulkArray.length + this.arrRejectBulkArray.length);
    const tempData = this.getCookie(this.convertIDsCookie) ? JSON.parse(this.getCookie(this.convertIDsCookie)) : [];

    if (totalRecords < tempData.length) {
      if (this.permisionList.task_create_edit_privilege_selector) {
        this.arrPrivilege.forEach((val: any) => {
          if (val.id !== '') {
            data[val.id] = val.checked;
          }
        });
      }

      data.id = this.requestId;
      data.due_date = data.due_date ? this.sharedService.formatDate(data.due_date) : null;
      data.start_date = data.start_date ? this.sharedService.formatDate(data.start_date) : null;
      data.task_tags = [];
      data.assigned_to_group = [];
      this.tagTitle.forEach((val) => {
        data.task_tags.push(val.tag);
      });
      this.groupTitle.forEach((val) => {
        data.assigned_to_group.push(val.id);
      });
      data.attachments = this.fileId;
      data.files = this.taskDocuments;
      data.status = 6;
      data.assigned_to = this.userTitle && this.userTitle.length ? this.userTitle[0].id : null;
      data.workflow = this.workflowTitle && this.workflowTitle.length ? this.workflowTitle[0].id : null;
      data.importance = this.importance;
      data.prior_task = this.taskPrior && this.taskPrior.priorData &&
        this.taskPrior.priorData.prior_task ? this.taskPrior.priorData.prior_task : null;
      data.after_task = this.taskPrior && this.taskPrior.priorData &&
        this.taskPrior.priorData.after_task ? this.taskPrior.priorData.after_task : null;

      data.prior_task_data = this.taskPrior && this.taskPrior.selected ? this.taskPrior.selected : null;
      data.after_task_data = this.taskPrior && this.taskPrior.selected2 ? this.taskPrior.selected2 : null;

      const newRef = _.clone(data);
      this[arr].push(newRef);
      totalRecords = (this.arrResolveBulkArray.length + this.arrRejectBulkArray.length);

      if (totalRecords >= tempData.length) {
        this.showModal.isConvert = true;
      } else {
        this.fileId = [];
        this.taskDocuments = [];
        this.tagTitle = [];
        this.userTitle = [];
        this.groupTitle = [];
        this.workflowTitle = [];
        this.arrPrivilege.map((obj: any) => {
          obj.checked = false;
        });
        this.workFlowList.map((x: any) => {
          x.checked = false;
        });
        this.usersList.map((x: any) => {
          x.checked = false;
        });
        this.workGroupList.map((x: any) => {
          x.checked = false;
        });
        this.isSelfAssign = false;
        this.setToday = false;
        if (this.currentRequest < tempData.length) {
          this.currentRequest = this.currentRequest + 1;
        }
        this.requestId = this.requestIds[this.currentRequest] ? this.requestIds[this.currentRequest] : 0;
        if (this.requestId) {
          this.getRequestDetails(this.requestId);
        } else {
          this.showErrorMessage(Messages.errors.invalidToken);
          this.cancel();
        }
      }
    } else {
      this.showModal.isConvert = true;
    }
  }

  /**
   * Populate reuquest data when user want to edit/convert any request
   * @param task Request payload
   * @param index Request index
   * @param nextTrigger Check if edit or convert clicked
   */
  editRequest = (task: any, index: number, nextTrigger?: boolean) => {
    const tempData = this.getCookie(this.convertIDsCookie) ? JSON.parse(this.getCookie(this.convertIDsCookie)) : [];
    this.currentRequest = tempData.indexOf(task.id);
    this.requestId = task.id;
    this.arrPrivilege.map((val: any) => {
      if (val.id !== '') {
        val.checked = task[val.id];
      }
    });
    this.taskDocuments = task.files;
    this.importance = task.importance;
    this.taskForm.controls.due_date.setValue(new Date(task.due_date));
    if (task.start_date) {
      this.taskForm.controls.start_date.setValue(new Date(task.start_date));
    } else {
      this.taskForm.controls.start_date.setValue(null);
    }
    this.taskForm.controls.name.setValue(task.name);

    if (task.task_tags && task.task_tags.length) {
      this.tagsList.map(obj => {
        if (task.task_tags.indexOf(obj.tag) >= 0) {
          this.tagTitle.push(obj);
        }
      });
    }

    if (task.assigned_to) {
      this.userTitle = this.usersList.filter(x => x.id === task.assigned_to);
    }

    if (task.assigned_to_group && task.assigned_to_group.length) {
      this.workGroupList.map(obj => {
        if (task.assigned_to_group.indexOf(obj.id) >= 0) {
          this.groupTitle.push(obj);
        }
      });
    }

    if (task.workflow) {
      this.workflowTitle = this.workFlowList.filter(x => x.id === task.workflow);
    }
    if (task.prior_task_data) {
      this.taskPrior.selected = task.prior_task_data;
      this.taskPrior.priorData.prior_task = task.prior_task;
    }
    if (task.after_task_data) {
      this.taskPrior.selected2 = task.after_task_data;
      this.taskPrior.priorData.after_task = task.after_task;
    }
    this.showModal.isConvert = false;
    if (nextTrigger) {
      this.arrResolveBulkArray.splice(index, 1);
    } else {
      this.arrRejectBulkArray.splice(index, 1);
    }
  }

  /**
   * Resolve when all attachments for all requests uploaded and append to request's attachment
   */
  uploadDocs() {
    return new Promise((resolve) => {
      const ob: any = [];
      this.arrResolveBulkArray.forEach(x => {
        if (x.files && x.files.length) {
          ob.push({ id: x.id, file: x.files[0] });
        }
      });
      let count = 1;
      if (ob.length) {
        ob.forEach(y => {
          this.sharedService.uploadDocument(y.file).subscribe(t => {
            const idx = this.arrResolveBulkArray.findIndex(x => +x.id === +y.id);
            if (idx > -1) {
              this.arrResolveBulkArray[idx].attachments.push(t.id);
            }
            if (count === ob.length) {
              resolve();
            }
            count++;
          });
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Resolve the final payload for multiple conversion of requests
   */
  getAcceptedArray() {
    return new Promise((resolve) => {
      const tempTicketArray = [];
      let count = 1;
      this.uploadDocs().then(() => {
        this.arrResolveBulkArray.forEach((element, index) => {
          tempTicketArray.push(element.id);
          delete this.arrResolveBulkArray[index].id;
          delete this.arrResolveBulkArray[index].prior_task_data;
          delete this.arrResolveBulkArray[index].after_task_data;
          delete this.arrResolveBulkArray[index].files;
          if (count === this.arrResolveBulkArray.length) {
            const params = {
              data: this.arrResolveBulkArray,
              tickets: tempTicketArray
            };
            resolve(params);
          }
          count++;
        });
      });
    });
  }

  /**
   * Final submission for multiple requests conversion to task
   */
  submitMultipleRequest = () => {
    this.getAcceptedArray().then((params: any) => {
      this.requestsService.bulkTaskCreate(params).subscribe(result => {
        if (result) {
          this.arrResolveBulkArray = [];
          this.arrRejectBulkArray = [];
          this.deleteCookie(this.convertIDsCookie);
          const mssage: IMessage = {
            message: Messages.success.reqConvert
          };
          this.messageService.recordCreatedUpdated(mssage);
          this.router.navigate(['main/services']);
        }
      }, (error) => {
        if (error) {
          if (error.error && typeof error.error.detail === 'string') {
            this.showErrorMessage(error.error.detail);
          } else {
            if (error.error && error.error.detail) {
              this.showErrorMessage(error.error.detail[0]);
            }
          }
        }
      });
    });
  }

  /**
   * Delete cookie
   * @param name Cookie name
   */
  deleteCookie = (name) => {
    this.setCookie(name, '', -1);
  }

  /**
   * Clear cookie by expiring it
   */
  setCookie = (name: string, value: string, expireDays: number) => {
    const d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}`;
  }

  /**
   * Remove conversion ids cookie when leaving
   */
  ngOnDestroy() {
    this.deleteCookie(this.convertIDsCookie);
  }

  /**
   * Show error message
   * @param msg Message
   */
  showErrorMessage(msg: string) {
    window.scroll(0, 0);
    this.notifier.displayErrorMsg(msg);
  }
}
