import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTemplateTaskService } from '../custom-template-task.service';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';
import { SharedService } from '../../../services/sharedService';
import { TaskService } from '../../projects/task/task.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-custom-template-list',
  templateUrl: './custom-template-list.component.html',
  styleUrls: ['./custom-template-list.component.scss']
})
export class CustomTemplateListComponent implements OnInit {
  templates;
  pages: number;
  loading: boolean;
  public tasksCount = 0;
  private filterLimit = 100;
  public reverse = false;
  public userTitle = [];
  public usersList: Array<any> = [];
  next: string;
  prev: string;
  timer: any;
  public showUserAssignedFilter = false;
  public searchText = '';
  public permisionList: any = {};
  private projectSubscribe: any;
  public defaultParam = {
    fields: '',
    ordering: 'title',
    offset: 0,
    limit: 10,
    search: ''
  };
  private default = {
    fields: '',
    ordering: 'title',
    limit: 10,
    offset: 0,
    search: ''
  };
  showModal: boolean;
  private ngDestroy$ = new Subject();
  tasktemplateIdToDelete: any;

  constructor(
    private router: Router,
    private taskService: TaskService,
    public sharedService: SharedService,
    private route: ActivatedRoute,
    private store: Store<fromRoot.AppState>,
    private customTemplateTaskService: CustomTemplateTaskService
  ) {
  }

  ngOnInit(): void {
    Promise.all([
      this.getLists('user'),
    ]);


    // Get and check permissions for viewing task(s)
    this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (
            this.permisionList.tasktemplate_tasktemplate_view ||
            this.permisionList.tasktemplate_tasktemplate_view_all
          ) {
            this.getTaskTemplates();
          }
        }
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
  }

  createNew() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  updateTemplate(item) {
    this.router.navigate([item.pk], { relativeTo: this.route });
  }

  /**
   * Functions to append queryString values and refresh url
   */
  appendQueryString = () => {
    const params = Object.assign({}, this.defaultParam);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    this.getTaskTemplates();
  }

  /**
   * Handler for ordering tasks
   * @param orderBy Ordering key
   */
  orderByChange(orderBy: string): void {
    if (this.defaultParam.ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this.defaultParam.ordering = orderBy;
    }
    // this.getTasks();
    this.appendQueryString();
  }

  getLists = (filter: string, search?: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: search && search.target && search.target.value ? '' : this.filterLimit
    };
    const filteredParams = this.sharedService.filterParams(params);
    switch (filter) {
      case 'user':
        this.getUsers(filteredParams);
        break;
    }
  }


  /**
   * Get users
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
   * Pagination control for listing
   */
  getData(res) {
    this.defaultParam.offset = res;
    window.scroll(0, 0);
    this.getTaskTemplates();
  }

  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParam.limit = perPage;
    this.defaultParam.offset = 0;
    if (this.searchText.trim().length) {
      this.defaultParam.search = this.searchText;
    }
    this.appendQueryString();
  }

  /**
   * Trigger when user click ALL option from filters
   * @param filter Filter type
   * @param filterTitle Selected filters array
   */
  clearSelections(filter, filterTitle): void {
    this[filterTitle] = [];
    this.getLists(filter);
    this.defaultParam[filter] = '';
    delete (this.defaultParam as any).assigned_to;
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Handler for task searching
   */
  onSearch = (event) => {
    if (
      event.keyCode === 13 &&
      this.searchText &&
      this.searchText.trim() !== ''
    ) {
      this.searchTasks();
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        if (this.searchText && this.searchText.trim() !== '') {
          this.searchTasks();
        } else {
          this.clearSearch();
        }
      }, 1000);
    }
  }


  clearSearch = () => {
    this.searchText = '';
    this.defaultParam.search = '';
    // this.getTasks();
    this.appendQueryString();
  }


  searchTasks() {
    const params: any = {
      search: this.searchText,
      limit: this.defaultParam.limit,
      offset: 0
    };
    this.defaultParam.search = this.searchText;
    const ajax = this.customTemplateTaskService.getCustomTaskTemplates(params).toPromise();
    ajax.then(res => {
      if (res && res.results) {
        this.templates = res.results;
        this.tasksCount = res.count ? res.count : 0;
      }
    });
  }

  /**
   * Trigger when filter selection changed
   * @param groupObj Selected filters
   * @param filterType Filter type
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'created_by':
        this.setFilterTitle('usersList', 'userTitle', groupObj);
        break;
    }
    this.defaultParam[filterType] = (groupObj && groupObj.length) ? this.setDefaultFilterVal(groupObj, filterType) : '';
    this.defaultParam.offset = 0;
    this.tasksCount = 0;
    // this.getTasks();
    this.appendQueryString();
  }

  /**
   * Set filter in Listing API params
   * @param groupObj Selected filters list
   * @param filterType Filter type
   */
  setDefaultFilterVal(groupObj, filterType) {
    const data = this.defaultParam[filterType] = groupObj.join();
    return data;
  }


  /**
   * Handle filter selections
   * @param data Filter list
   * @param title Filter selection list
   * @param groupObj selected filters from listing
   */
  setFilterTitle(data, title, groupObj) {
    const ad = [];
    this[data].forEach(x => {
      if (groupObj.indexOf(x.id) > -1) {
        ad.push(x);
      }
    });
    const array = _.uniqBy([...ad, ...this[title]], 'id');
    this[title] = array;

    if (this[title].length !== groupObj.length) {
      this[title] = _.remove(this[title], obj => groupObj.indexOf(obj.id) > -1);
    }
  }

  /**
   * Set users lisitng
   * @param res Users response
   */
  setUsersList(res: any): void {
    const data = res.results.map((elem) => {
      elem.name = elem.first_name + ' ' + elem.last_name;
      return elem;
    });
    this.usersList = [...data];
    this.setTitle('user');
  }


  /**
   * Function to set searched values when we navigate between pages.
   */
  setTitle = (type) => {
    this.route.queryParams.subscribe((params: any) => {
      const param = Object.assign({}, params);
      for (const x in param) {
        if (param[x]) {
          const values = param[x].split(',');
          if (type === 'created_by' && x === 'assigned_to') {
            const arr = [...this.usersList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.userTitle = final;
          }
        }
      }
    });
  }

  getCustomPage(url: string) {
    this.loading = false;
    this.customTemplateTaskService.getCustomTaskTemplatesPage(url).subscribe(res => {
      if (res) {
        this.loading = true;
        this.templates = res['results'];
        this.next = res.next;
        this.prev = res.previous;
      }
    })
  }

  /**
   * Display one filter dropdown at a time
   * @param filter1 Any filter dropdown
   * @param filter2 Any filter dropdown
   */
  handleFilterShow(filter1, filter2): void {
    this[filter1] = !this[filter1];
    this[filter2] = false;
  }

  getTaskTemplates() {
    this.loading = false;
    const params = Object.assign({}, this.defaultParam);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    const filteredParams: any = this.sharedService.filterParams(params);
    this.customTemplateTaskService.getCustomTaskTemplates(filteredParams).subscribe(res => {
      if (res) {
        this.loading = true;
        this.templates = res['results'];
        this.next = res.next;
        this.prev = res.previous;
        this.pages = Math.ceil(res.count / 30);
        this.tasksCount = res.count ? res.count : 0;
      }
    })
  }

  showConfirmModal(taskTemplateId) {
    this.showModal = true;
    this.tasktemplateIdToDelete = taskTemplateId;
  }

  archiveTemplate($event) {
    if ($event && this.tasktemplateIdToDelete) {
      this.customTemplateTaskService.removeTaskTemplate(this.tasktemplateIdToDelete).pipe(takeUntil(this.ngDestroy$))
        .subscribe(data => {
          this.showModal = false;

          this.getTaskTemplates();
        }, error => {
          // Todo: What should we do when request has error?
        });
    } else {
      this.showModal = false;
    }
    this.tasktemplateIdToDelete = null;
  }
}
