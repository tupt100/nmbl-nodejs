import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task.service';
import { GlobalCustomFieldService } from '../../../custom-fields/custom-field.service';
import { SharedService } from 'src/app/services/sharedService';
import { Store } from '@ngrx/store';
import { Messages } from 'src/app/services/messages';
import { Options, ChangeContext } from 'ng5-slider';
import { AuditTrailHistoryComponent } from 'src/app/modules/shared/audit-trail-history/audit-trail-history.component';
import { TaskPriorComponent } from '../../../shared/task-prior/task-prior.component';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import { Location } from '@angular/common';
import * as moment from 'moment';
import * as fromRoot from '../../../../store';
import * as  _ from 'lodash';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private globalCustomFieldService: GlobalCustomFieldService,
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>,
    private router: Router,
    private location: Location
  ) { }
  /**
   * Bindings
   */
  @ViewChild(AuditTrailHistoryComponent) auditTrail: AuditTrailHistoryComponent;
  @ViewChild(TaskPriorComponent) taskPrior: TaskPriorComponent;
  @ViewChild(NotifierComponent) notifier: NotifierComponent;

  public startDate: any;
  public dueDate: any;
  public taskId = null;
  public task: any = {};
  public tagsList: Array<any> = [];
  public usersList: Array<any> = [];
  public workFlowList: Array<any> = [];
  public workGroupList: Array<any> = [];
  public momentObj = moment;
  public filterLimit = 100;
  public groupTitle: any[] = [];
  public tagTitle: any[] = [];
  public statusTitle: Array<any> = [];
  public workflowTitle: any[] = [];
  public tags: any;
  public privilege: any = [''];
  public taskName = '';
  public importance = '';
  public privilegeList = this.sharedService.privilegeList;
  public statusList = this.sharedService.statusList;
  public isPrivate = false;
  // tslint:disable-next-line:variable-name
  public permisionList: any = {};
  public userInfo: any = {};
  public projectSubscribe: any;
  public assignedTo: any;
  public projectStatisticData: any;
  public openFilter = false;
  public openMetrics = true;
  public showModal = {
    deleteDoc: false,
    uploadDoc: false,
    taskPrior: false,
    reAssignUser: false,
    uploadDocMessage: false,
    newContactMessage: false,
    isBePrivate: false,
    isFavorite: false
  };
  public starTask = true;
  public showUserAssignedFilter = false;
  public showCalendar = [];
  public assignToUser = null;
  public percentage = 0;
  public sliderOptions: Options = {
    floor: 0,
    ceil: 100,
    showSelectionBar: true,
    getSelectionBarColor: (value: number): string => {
      return '#33C12E';
    },
    disabled: false,
    translate: (value): string => {
      return value + '%';
    }
  };
  public modelType = 'task';
  public deleteObj = {
    action: '',
    message1: '',
    message2: '',
    buttonText: 'Delete',
    docToDelete: null
  };
  public deleteToggle = false;
  public showHeaderFilters = true;
  public previousWorkFlow: any;
  public showTaskNameEdit = false;
  public afterTask = {};
  public priorTask = {};
  public errorMsgSubs: any;
  public message = '';
  public buttonText = '';
  objUser$: any;
  public activeTab = 'discussions';
  public rankid = 0;
  currentUserID = null;
  isMobile = false;

  /**
   * @param isOpen
   * Function to check weather dropdownlist is open or not
   */
  public isDropdownOpened: boolean = false;


  /**
   * Handle mouse outside click event to close the popups, inputs, filters, calendars etc.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className !== '' &&
      typeof event.target.className !== 'object' &&
      event.target.className !== 'sm-span' &&
      !event.target.className.includes('add-user-btn') &&
      event.target.className !== 'date-btn' &&
      event.target.className !== 'search_input' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-check' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'btn fbtn' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'search_input ng-pristine ng-valid ng-touched' &&
      event.target.className !== 'check-list' &&
      !event.target.className.includes('reNameInput') &&
      !event.target.className.includes('editCustomFieldInput') &&
      event.target.className !== 'test-class' &&
      event.target.className !== 'btn-box text-left'
    ) {
      this.showUserAssignedFilter = false;
      this.showCalendar = [];
      this.showTaskNameEdit = false;
      this.deleteToggle = false;
      if (this.task && this.task.task && this.task.task.name) {
        this.taskName = this.task.task.name;
      }

      this.resetCustomFieldsShowEdit();
      this.resetGlobalCustomFieldsShowEdit();
    }
  }

  resetCustomFieldsShowEdit() {
    if(this.task.custom_fields?.length) {
      this.task.custom_fields.forEach(custom_field => {
        custom_field.showEdit = false;
        custom_field.valueToEdit = custom_field.value;
      });
    }
  }

  ngOnInit() {
    // Get and check permissions for viewing task(s)
    this.taskId = this.route.snapshot.paramMap.get('id') || null;
    if (this.taskId && !isNaN(this.taskId)) {
      window.scroll(0, 0);
      this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
        if (obj.loaded) {
          if (obj.datas && obj.datas.permission) {
            this.permisionList = obj.datas.permission;
            if (
              this.permisionList.task_task_view ||
              this.permisionList.task_task_view_all
            ) {
              this.initAllAsyncCall();
              this.subscriptionsCalls();
            }
          }
        }
      });

      this.objUser$ = this.store.select('userDetails').subscribe((obj: any) => {
        if (obj.loaded) {
          this.currentUserID = obj.datas.id;
        }
      });

      // Check for mobile devices
      this.isMobile = this.sharedService.mainDetectMOB();
    } else {
      this.router.navigate(['/main/projects/tasks']);
    }
  }

  /**
   * Subscribing error message observable to show error message
   */
  subscriptionsCalls() {
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(msg => {
      if (msg) {
        this.notifier.displayErrorMsg(msg);
        window.scroll(0, 0);
        this.showModal = {
          deleteDoc: false,
          uploadDoc: false,
          taskPrior: false,
          reAssignUser: false,
          uploadDocMessage: false,
          newContactMessage: false,
          isBePrivate: false,
          isFavorite: false
        };
      }
    });
  }

  /**
   * Life cycle hook when component unmount (unsubscribing observabels)
   */
  ngOnDestroy() {
    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }

    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }

  /**
   * Handle complete slider changes
   * @param obj Slider ChangeContext
   */
  updateCompletition(obj: ChangeContext) {
    this.updateTask('percentage', obj.value);
    if (obj.value === 100) {
      this.updateTask('status', 3);
    }
  }

  /**
   * Show input for renaming task
   */
  showTaskNameInput() {
    this.showTaskNameEdit = true;
  }

  /**
   * Open re-assign user to task popup
   * @param event Checkbox change event
   * @param item User
   */
  changeAssignUser(event, item) {
    const checked = event.target.checked;
    if (+item.id !== this.task && this.task.task && this.task.task.assigned_to && this.task.task.assigned_to.id && checked) {
      this.assignToUser = item;
      this.showModal.reAssignUser = true;
    } else if (this.task && this.task.task && !this.task.task.assigned_to && checked) {
      this.assignToUser = item;
      this.showModal.reAssignUser = true;
    } else {
      this.assignToUser = null;
      this.showModal.reAssignUser = false;
    }
  }

  /**
   * Handler for confrimtaion of reassign popup
   * @param event Confiramtion response [boolean]
   */
  reAssignUser(event) {
    if (event) {
      this.updateTask('user', this.assignToUser.id);
    } else {
      this.assignToUser = null;
      this.showModal.reAssignUser = false;
      this.showUserAssignedFilter = false;
    }
  }

  /**
   * API Calls when task detail component initialize
   */
  initAllAsyncCall = () => {
    Promise.all([
      this.getLists('group'),
      this.getLists('tag'),
      this.getLists('user'),
      this.getTasksDetail()
    ]);
  }

  /**
   * Set workgroup listing
   * @param res Workgroup response
   */
  setCompanyWorkGroup(res: any): void {
    this.workGroupList = res.results;
  }

  /**
   * Set tags listing
   * @param res Tags response
   */
  setTagsList(res: any): void {
    this.tagsList = res.results.map((elem) => {
      elem.name = elem.tag;
      return elem;
    });
  }

  /**
   * Set users listing
   * @param res Users response
   */
  setUsersList(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.first_name + ' ' + elem.last_name;
      return elem;
    });
    this.usersList = [...data];
  }

  /**
   * Return listing for assignee dropdowns
   */
  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : this.filterLimit
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
   * Get users listing
   */
  getUsers = (filteredParams) => {
    const ajax = this.taskService.getUsers(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setUsersList(res);
      }
    });
  }

  /**
   * Get workgroups listing
   */
  getWorkGroups = (filteredParams) => {
    const ajax = this.taskService.getWorkGroups(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setCompanyWorkGroup(res);
      }
    });
  }

  /**
   * Get tags listing
   */
  getTags = (filteredParams) => {
    const ajax = this.taskService.getTags(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setTagsList(res);
      }
    });
  }

  /**
   * Get workflows listings
   */
  getWorkFlows = (filteredParams) => {
    if (this.projectStatisticData && this.projectStatisticData.project_id) {
      filteredParams.project = this.projectStatisticData.project_id;
    }
    const ajax = this.taskService.getWorkFlows(filteredParams).toPromise();
    ajax.then(res => {
      if (res) {
        this.setWorkFlows(res);
      }
    });
  }

  /**
   * Set workflows listing
   * @param res Workflows response
   */
  setWorkFlows(res: any): void {
    const data = res.results.map((elem: any) => {
      return {
        id: elem.workflow.id,
        name: elem.workflow.name
      };
    });
    this.workFlowList = [...data];
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
   * Trigger when assignee dropdown selection changed
   * @param groupObj Assignments array
   * @param filterType Assignee dropdown type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'group':
        this.setFilterTitle('workGroupList', 'groupTitle', groupObj);
        break;
      case 'status':
        if (this.statusTitle && this.statusTitle.length) {
          this.onSingleFilterSelected('statusList', 'statusTitle', groupObj);
        }
        this.setFilterTitle('statusList', 'statusTitle', groupObj);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj, filterType);
        break;
      case 'workflows':
        this.previousWorkFlow = [...this.workflowTitle];
        if (this.workflowTitle && this.workflowTitle.length) {
          this.onSingleFilterSelected('workFlowList', 'workflowTitle', groupObj);
        }
        this.setFilterTitle('workFlowList', 'workflowTitle', groupObj);
        return this.openDeletePopup('reAssignWorkflow', null);
    }
    this.updateTask(filterType, groupObj);
  }

  /**
   * Clear project and workflow selections
   * @param workflow Workflow dropdown trigger
   */
  clearPW(workflow): void {
    this.previousWorkFlow = [...this.workflowTitle];

    const title = workflow ? 'workflowTitle' : 'projectTitle';
    const list = workflow ? 'workFlowList' : 'projectsList';

    this[title] = [];
    this[list].map(x => x.checked = false);

    this.openDeletePopup('reAssignWorkflow', null);
  }

  /**
   * Handler for renaming task
   */
  reNameTaskTitle() {
    if (!this.permisionList.task_task_edit_name) {
      this.showTaskNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.permissionErr);
    }

    if (!this.taskName || this.taskName.trim() === '') {
      this.showTaskNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.taskNameRequired);
    }

    if (this.taskName && this.taskName.length > 254) {
      this.showTaskNameEdit = false;
      return this.notifier.displayErrorMsg(Messages.errors.taskNameLength);
    }
    this.taskService.reNameTaskTitle(this.taskId, { name: this.taskName }).subscribe(() => {
      this.refreshPage();
    }, error => {
      this.updateTaskProperties();
    });
  }


  updateCustomField() {
    const body: any = {};

    body.custom_fields_value = {
    };

    this.task.custom_fields.forEach(customField => {
      body.custom_fields_value[customField.pk] = customField.valueToEdit;
    });

    this.taskService.updateTask(this.taskId, body).subscribe(resp => {
      this.refreshPage();
    });
  }
  /**
   * Handle single selection for workflows and status
   * @param filterType Filter type
   * @param title Filter selection list
   * @param groupObj selections
   */
  onSingleFilterSelected(filterType, title, groupObj): void {
    const index = groupObj.indexOf(this[title][0].id);
    if (index > -1) {
      groupObj.splice(index, 1);
    }
    this.filterOptions(filterType, groupObj);
  }

  /**
   * Set checked for single selection
   * @param filterType Filter type
   * @param groupObj Selections
   */
  filterOptions(filterType, groupObj) {
    this[filterType].map((elem: any) => {
      elem.checked = (+elem.id === +groupObj) ? true : false;
    });
  }

  /**
   * Return task details
   */
  getTasksDetail = () => {
    const ajax = this.taskService.getTask(this.taskId).toPromise();
    ajax.then(task => {
      this.task = task;
      if (this.task && this.task.task && this.task.task.workflow) {
        this.projectStatistic();
      } else {
        this.getWorkFlows({ limit: this.filterLimit });
      }
      this.updateTaskProperties();
    }, (e) => {
      this.router.navigate(['/main/projects/tasks']);
    });
  }

  /**
   * Update task bindings
   */
  updateTaskProperties() {
    if (!this.task) {
      return;
    }

    this.afterTask = this.task.task.after_task;
    this.priorTask = this.task.task.prior_task;
    this.taskName = this.task && this.task.task && this.task.task.name ? this.task.task.name : '';
    this.groupTitle = this.task && this.task.task && this.task.task.assigned_to_group && this.task.task.assigned_to_group.length ?
      this.task.task.assigned_to_group : [];
    this.tagTitle = this.task && this.task.task && this.task.task.task_tags &&
      this.task.task.task_tags.length ? this.task.task.task_tags : [];
    if (this.task && this.task.task && this.task.task.status) {
      const idx = this.sharedService.statusList.findIndex(x => x.id === +this.task.task.status);
      if (idx > -1) {
        this.statusTitle = [this.sharedService.statusList[idx]];
      }
      if (this.task.task.status === 3 || this.task.task.status === 4) {
        this.statusList = [{
          id: 1,
          title: 'Reopen'
        },
        {
          id: 3,
          title: 'Completed'
        },
        {
          id: 4,
          title: 'Archived'
        }];
      } else {
        this.statusList = [...this.sharedService.statusList];
      }
    }
    if (!this.permisionList.task_mark_as_completed) {
      const indx = this.statusList.findIndex(x => x.id === 3);
      if (indx > -1) {
        this.statusList.splice(indx, 1);
      }
    }
    if (!this.permisionList.task_task_delete) {
      const indx = this.statusList.findIndex(x => x.id === 4);
      if (indx > -1) {
        this.statusList.splice(indx, 1);
      }
    }
    if (this.task && this.task.task && this.task.task.servicedeskrequest_details) {
      if (this.task.task.servicedeskrequest_details.servicedeskuser) {
        if (
          this.task.task.servicedeskrequest_details.servicedeskuser.user_email === '' &&
          this.task.task.servicedeskrequest_details.servicedeskuser.user_name === ''
        ) {
          const indx1 = this.statusList.findIndex(x => x.id === 5);
          if (indx1 > -1) {
            this.statusList.splice(indx1, 1);
          }

          const indx2 = this.statusList.findIndex(x => x.id === 6);
          if (indx2 > -1) {
            this.statusList.splice(indx2, 1);
          }
        }
      }
    }
    this.isPrivate = this.task && this.task.task && this.task.task.is_private ? true : false;
    this.importance = this.task && this.task.task && this.task.task.importance ? this.task.task.importance : '';
    this.dueDate = this.task && this.task.task && this.task.task.due_date ? moment(this.task.task.due_date).toDate() : null;
    this.startDate = this.task && this.task.task && this.task.task.start_date ? moment(this.task.task.start_date).toDate() : null;
    this.assignedTo = (this.task && this.task.task && this.task.task.assigned_to && this.task.task.assigned_to.first_name) ?
      this.task.task.assigned_to : null;
    this.percentage = (this.task && this.task.task && this.task.task.completed_percentage) ?
      this.task.task.completed_percentage : 0;
    let arr: any = [];
    this.privilegeList.forEach(x => {
      if (x.id && this.task && this.task.task && this.task.task[x.id]) {
        arr.push(x);
      }
    });
    arr = arr.length ? arr : [{ id: '', title: 'None' }];
    this.privilege = [...arr];

    if (this.task && this.task.task && (+this.task.task.status === 3 || +this.task.task.status === 4)) {
      this.sliderOptions = Object.assign({}, this.sliderOptions, { disabled: true });
    } else {
      this.sliderOptions = Object.assign({}, this.sliderOptions, { disabled: false });
    }
    this.mapCustomfields();
    this.mapGlobalCustomFields();
  }

  mapGlobalCustomFields() {
    const ajaxResult = this.globalCustomFieldService.getCustomFieldValues('task').toPromise();
    this.task.global_custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(res => {
      const fields = res.results.filter(i => i.object_id.toString() === this.taskId.toString())
      fields.forEach(customField => {
        this.task.global_custom_fields.push({
          pk: customField.pk,
          label: customField.global_custom_field.label,
          value: customField.value,
          fieldId: customField.global_custom_field.pk,
          valueToEdit: customField.value,
          controlType: getControlType(customField.global_custom_field.field_type)
        });
      });
      console.log(this.task.global_custom_fields);
    })
  }

  showEditForGlobalCustomField(custom_field) {
    this.resetGlobalCustomFieldsShowEdit();
    custom_field.showEdit = true;
  }

  resetGlobalCustomFieldsShowEdit() {
    if (this.task.global_custom_fields?.length) {
      this.task.global_custom_fields.forEach(custom_field => {
        custom_field.showEdit = false;
        custom_field.valueToEdit = custom_field.value;
      });
    }
  }

  updateGlobalCustomField(custom_field) {
    const payload = [
      {
        id: custom_field.pk,
        global_custom_field_id: custom_field.fieldId,
        value: custom_field.valueToEdit,
        object_id: this.taskId,
        content_type: "task" 
      }
    ]

    this.globalCustomFieldService.updateCustomFieldValues(payload).subscribe(resp => {
      this.refreshPage();
    });
  }

  mapCustomfields() {
    const taskTemplateId = this.task.task.task_template_id;
    if (!taskTemplateId) return;
    const customFieldsValue = this.task.task.custom_fields_value;
    const ajaxResult = this.taskService.getTaskTemplate(taskTemplateId).toPromise();
    this.task.custom_fields = [];
    const getControlType = (fieldType) => {
      if (fieldType === "Number") {
        return "number";
      }

      return "text";
    }
    ajaxResult.then(taskTemplate => {
      Object.keys(customFieldsValue).forEach(key => {
        const customField = taskTemplate.customfield_set.find(a => a.pk === parseInt(key));
        this.task.custom_fields.push({
          pk: customField.pk,
          label: customField.label,
          value: customFieldsValue[key],
          valueToEdit: customFieldsValue[key],
          controlType: getControlType(customField.field_type)
        });
      });
      console.log(this.task.custom_fields);
    })
  }

  showEditForCustomField(custom_field) {
    this.resetCustomFieldsShowEdit();
    custom_field.showEdit = true;
  }

  /**
   * Open popups based on key
   * @param key Popup key
   */
  openUploader(key: string) {
    this.showModal[key] = true;
  }

  /**
   * Handler for confirm modal component
   * @param resp Confiramtion response
   */
  confirmationDone(resp: boolean) {
    if (resp) {
      switch (this.deleteObj.action) {
        case 'reAssignWorkflow':
          if (this.workflowTitle && this.workflowTitle.length) {
            this.updateTask('reAssignWorkflow', this.workflowTitle[0].id);
          } else {
            this.updateTask('reAssignWorkflow', null);
          }
          break;
      }
    } else {
      switch (this.deleteObj.action) {
        case 'reAssignWorkflow':
          this.workflowTitle = this.previousWorkFlow;
          this.filterOptions('workFlowList', this.previousWorkFlow.id);
          this.handleConfirmationResponse();
          break;
        default:
          this.handleConfirmationResponse();
          break;
      }
    }
  }

  /**
   * Download document
   */
  downloadFile(file: any) {
    const fileObj = Object.assign(file);
    fileObj.name = file.document_name;
    this.sharedService
      .getFileBlob(fileObj.document_url)
      .subscribe(
        res => {
          const blob = new Blob([res]);
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileObj.name);
          } else {
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
   * Send ping notification
   */
  sendNotification() {
    this.sharedService.sendNotifications(this.taskId).subscribe(() => {
      this.notifier.displaySuccessMsg(Messages.success.task.notification);
      this.updateTrails();
    });
  }

  /**
   * Call audit trail component function for history lisitng
   */
  updateTrails(): void {
    this.auditTrail.listAuditTrail();
  }

  /**
   * Open confirmation popup for public/private task toggle
   */
  taskConfirmation = (isChecked) => {
    const privateText = isChecked ? 'private' : 'public';
    const firstLine = `You are about to make this task ${privateText}. `;
    const buttonText = `Yes, make ${privateText}`;
    this.message = isChecked ?
      `${firstLine}This means that only users who assigned to this task, can view all data.` :
      `${firstLine}This means that all users will be able to see this task and all it\'s data.`;
    this.buttonText = buttonText;
    this.showModal.isBePrivate = true;
  }

  /**
   * Handle confirmation popup for public/private task
   */
  privateConfirm = (response) => {
    if (response) {
      this.updateTask('private');
    } else {
      this.isPrivate = this.task && this.task.task && this.task.task.is_private ? true : false;
      this.showModal.isBePrivate = false;
    }
  }

  /**
   * Handler for updating task details
   * @param filter Task assingment key
   * @param value Task assingment value (optional)
   */
  updateTask = (filter: string, value?: any) => {
    this.isDropdownOpened = false;
    const body: any = {};
    switch (filter) {
      case 'group':
        body.assigned_to_group = value;
        break;

      case 'tag':
        const tagNames = this.tagTitle && this.tagTitle.length ? this.tagTitle.map(x => x.tag) : [];
        body.task_tags = tagNames;
        break;

      case 'privilege':
        value.map((x: any) => {
          if (x.id) {
            body[x.id] = x.checked;
          }
        });
        break;

      case 'status':
        body.status = value && value.length ? value[0] : value;
        break;

      case 'private':
        body.is_private = this.isPrivate;
        break;

      case 'importance':
        this.importance = value;
        body.importance = value;
        break;

      case 'startDate':
        if (
          !this.task || !this.startDate ||
          this.startDate && this.task && this.task.task &&
          this.task.task.start_date && moment(this.task.task.start_date).isSame(moment(this.startDate))
        ) {
          return;
        }
        body.start_date = this.sharedService.formatDate(this.startDate);
        break;

      case 'dueDate':
        if (
          !this.task || !this.dueDate ||
          this.dueDate && this.task && this.task.task &&
          this.task.task.due_date && moment(this.task.task.due_date).isSame(moment(this.dueDate))
        ) {
          return;
        }
        body.due_date = this.sharedService.formatDate(this.dueDate);
        break;

      case 'documents':
        body.attachments = value.fileIds;
        break;

      case 'user':
        body.assigned_to = value;
        break;

      case 'percentage':
        body.completed_percentage = value;
        break;
      case 'reAssignWorkflow':
        body.workflow = value;
        break;
      case 'taskdependency':
        body.prior_task = value.priorTask;
        body.after_task = value.afterTask;
        break;
    }
    this.taskService.updateTask(this.taskId, body).subscribe(resp => {
      if (filter === 'reAssignWorkflow') {
        this.refreshPage();
      } else if (
        filter === 'private' && this.isPrivate &&
        this.assignedTo && this.assignedTo.id &&
        +this.assignedTo.id !== +this.currentUserID
      ) {
        this.router.navigate(['/main/projects/tasks']);
      } else {
        if (this.task && this.task.task) {
          this.task.task = resp;
        }
        this.updateTrails();
        this.updateTaskProperties();
        this.hideFilter();
        this.handleConfirmationResponse();
      }
    }, (error) => {
      if (filter === 'taskdependency') {
        if (this.taskPrior && this.taskPrior.selected2 && this.taskPrior.selected2.task) {
          this.taskPrior.selected2.task = this.task.task.after_task;
        }
        if (this.taskPrior && this.taskPrior.selected && this.taskPrior.selected.task) {
          this.taskPrior.selected.task = this.task.task.prior_task;
        }
      }
      this.updateTaskProperties();
      this.hideFilter();
      this.handleConfirmationResponse();
    });
  }

  /**
   * Hide popups/dropdowns
   */
  hideFilter() {
    this.showModal = {
      reAssignUser: false,
      deleteDoc: false,
      taskPrior: false,
      uploadDoc: false,
      uploadDocMessage: false,
      newContactMessage: false,
      isBePrivate: false,
      isFavorite: false
    };
    this.showUserAssignedFilter = false;
    this.showCalendar = [];
  }

  /**
   * Refresh current route
   */
  refreshPage(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([
      '/main/projects/tasks/' +
      this.taskId
    ]);
  }

  /**
   * Soft refresh current route (Getting task details)
   */
  softRefresh = () => {
    setTimeout(() => {
      this.getTasksDetail();
    }, 500);
  }

  /**
   * Open task reassign workflow popup
   * @param action Task reassign workflow
   * @param id Task ID
   */
  openDeletePopup(action: string, id: string): void {
    let message1 = '';
    let message2 = '';
    let buttonText = 'Delete';
    switch (action) {
      case 'reAssignWorkflow':
        if (this.workflowTitle[0]?.name) {
          message1 = this.projectStatisticData && this.projectStatisticData.workflow ? 'Re-Associate Task' : 'Associate Task';
          message2 = 'Assigning this task to ' + this.workflowTitle[0].name;

          if (this.projectStatisticData && this.projectStatisticData.workflow) {
            message2 = message2 + ' will remove all association with ' + this.projectStatisticData.workflow + '.';
          }
          buttonText = this.projectStatisticData && this.projectStatisticData.workflow ? 'Re-Assign' : 'Assign';
        } else {
          message1 = 'Unassign Task';
          message2 = 'Unassigning this task will remove all association with ' + this.previousWorkFlow[0].name + '.';
          buttonText = 'Unassign';
        }
        break;
    }
    this.deleteObj = {
      action,
      message1,
      message2,
      buttonText,
      docToDelete: id
    };
    this.showModal.deleteDoc = true;
  }

  /**
   * Close reassign popup and reset messages and button texts
   */
  handleConfirmationResponse(): void {
    this.showModal.deleteDoc = false;
    this.deleteObj = { action: '', message1: '', message2: '', docToDelete: null, buttonText: 'Delete' };
  }

  /**
   * Get task statistics (project/workflow detail)
   */
  projectStatistic = () => {
    this.taskService.projectStatistic(this.taskId).subscribe(res => {
      if (res && res.detail && Object.keys(res.detail).length) {
        this.projectStatisticData = res.detail;
        if (res.detail.workflow_id && res.detail.workflow) {
          this.workflowTitle = [
            { id: res.detail.workflow_id, name: res.detail.workflow + ' (' + res.detail.workflow_total_task + ' Tasks)' }
          ];
        }
        this.getWorkFlows({ limit: this.filterLimit });
      }
    });
  }

  /**
   * Update task dependencies (prior and after task)
   */
  getTaskPrior() {
    const priorTask = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.prior_task ? this.taskPrior.priorData.prior_task : null;
    const afterTask = this.taskPrior && this.taskPrior.priorData &&
      this.taskPrior.priorData.after_task ? this.taskPrior.priorData.after_task : null;

    const data = {
      priorTask,
      afterTask
    };
    this.updateTask('taskdependency', data);
  }

  /**
   * Naviagte to project details
   * @param id Project ID
   */
  goToProjectDetails(id: number): void {
    this.router.navigate(['/main/projects/' + id]);
  }

  /**
   * Use window history so that back link act as browser back button
   */
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/main/projects/tasks']);
    }
  }

  /**
   * Open mark task as favoutite popup
   */
  makeTaskFavourite = (
    totalFavouriteTasks: number,
    rankid: number,
    isFavourite: boolean
  ) => {
    if (totalFavouriteTasks < 25 || !isFavourite) {
      const params = {
        is_favorite: isFavourite
      };
      this.taskService.taskRank(rankid, params).subscribe(res => {
        if (res) {
          const taskmsg = isFavourite ? 'star' : 'unstar';
          this.notifier.displaySuccessMsg(`Task marked as ${taskmsg}`);
          this.getTasksDetail();
        }
      }, (error) => {
        if (error) {
          if (error.error && typeof error.error.detail === 'string') {
            this.notifier.displayErrorMsg(error.error.detail);
          } else {
            if (error.error && error.error.detail) {
              this.notifier.displayErrorMsg(error.error.detail[0]);
            }
          }
        }
      });
    } else {
      this.rankid = rankid;
      this.showModal.isFavorite = true;
    }
  }

  /**
   * Close task favoutite popup
   */
  closeFavorite = (response) => {
    this.showModal.isFavorite = false;
    if (response) {
      const params = {
        is_favorite: false
      };
      this.taskService.taskRank(response, params).subscribe(res => {
        if (res) {
          this.makeTaskFavourite(0, this.rankid, true);
        }
      });
    } else {
      this.showModal.isFavorite = false;
    }
  }
  isOpened = (isOpen: boolean) => {
    this.isDropdownOpened = isOpen;
  }

  /**
   * @param isSuccess
   * Function to display success message if copied to clipboard
   */
  onSuccess = (isSuccess) => {
    if (isSuccess) {
      this.notifier.displaySuccessMsg('Copied to clipboard!');
    } else {
      this.notifier.displayErrorMsg('Error occured while copy to clipboard!');
    }
  }
}
