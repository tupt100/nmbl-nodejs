import { Component, OnInit, Input, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { SearchService } from './search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/services/sharedService';
import { TaskService } from '../projects/task/task.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges, AfterViewInit {
  /**
   * Bindings
   */
  @Input() tagSearch = false;
  @Input() tag = {};
  @ViewChild('searchInput') searchInput: any;
  loading = false;
  private timer: any;
  public searchData: any;
  public chartProperties = [];
  public arrWorkflow = [];
  public openFilter = false;
  public tabs = {
    projects: true,
    workflows: true,
    task: true,
    document: true
  };
  sortByTitle: Array<any> = [{
    id: '1',
    name: 'A-Z'
  }];
  sortByList: Array<any> = [];
  typeTitle: Array<any> = [{
    id: '5',
    name: 'Show All'
  }];
  typeList: Array<any> = [];
  importanceTitle: Array<any> = [{
    id: '4',
    name: 'Show All'
  }];
  importanceList: Array<any> = [];
  tagsList: any[] = [];
  searchParam: any = {
    search: '',
    sort_by: '',
    model_type: '',
    importance: '',
    tags: ''
  };
  tagTitle = [];
  globalSearchFilter = this.sharedService.globalSearchFilter;

  constructor(
    private searchService: SearchService,
    public sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.sortByList = this.globalSearchFilter.sortBy;
    this.typeList = this.globalSearchFilter.type;
    this.importanceList = this.globalSearchFilter.importance;
    this.getLists('tag');
    this.refineSearch('sortBy');
  }

  /**
   * trigger search using url query params
   */
  searchUsingQuery() {
    this.route.queryParams.subscribe((params: any) => {
      this.searchParam.search = params.q;
      const p = Object.assign({}, this.searchParam, params);
      const keys = Object.keys(this.searchParam);
      Object.keys(p).forEach(x => {
        if (keys.indexOf(x) === -1) {
          delete p[x];
        }
      });
      this.searchParam = Object.assign({}, p);
      for (const x in this.searchParam) {
        if (this.searchParam[x]) {
          const values = this.searchParam[x].split(',');
          if (x === 'sort_by' || x === 'model_type' || x === 'importance') {
            const arrKey: any = this.getListArray(x);
            const titleKey = this.getTitleArray(x);
            const final = arrKey.filter((y: any) => {
              if (values.includes(y.id)) {
                return y;
              }
            });
            this[titleKey] = final;
          } else if (x === 'tags') {
            const arr = [... this.tagsList];
            const final = arr.filter((y: any) => {
              if (values.includes(y.id.toString())) {
                return y;
              }
            });
            this.tagTitle = final;
          }
        }
      }
      this.search();
    });
  }

  /**
   * Return filter selections array
   * @param x Key
   */
  getTitleArray(x: string): string {
    switch (x) {
      case 'sort_by':
        return 'sortByTitle';

      case 'model_type':
        return 'typeTitle';

      case 'importance':
        return 'importanceTitle';
    }
  }

  /**
   * Return listing for filters
   * @param x Key
   */
  getListArray(x: string): Array<any> {
    switch (x) {
      case 'sort_by':
        return [...this.sharedService.globalSearchFilter.sortBy];

      case 'model_type':
        return [...this.sharedService.globalSearchFilter.type];

      case 'importance':
        return [...this.sharedService.globalSearchFilter.importance];
    }
  }

  /**
   * Focus search input automatically when navigate to search component
   */
  ngAfterViewInit() {
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
      window.scrollTo(0, 0);
    }
  }

  /**
   * Life cycle hook trigger when tag [input] changes
   */
  ngOnChanges(): void {
    (this.tag as any).name = (this.tag as any).tag;
    if (this.tag && Object.keys(this.tag).length) {
      this.tagTitle = [this.tag];
      this.refineSearch('tag');
      this.search();
    }
  }

  /**
   * Tags listing
   */
  getLists = (search: any) => {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : ''
    };
    const filteredParams: any = this.sharedService.filterParams(params);
    if (search && search.keyCode === 13) {
      delete filteredParams.search;
    }
    this.getTags(filteredParams);
  }

  /**
   * Return tags listing
   */
  getTags = (filteredParams) => {
    this.taskService.getTags(filteredParams).subscribe(res => {
      if (res) {
        this.setTagsList(res);
      }
    });
  }

  /**
   * Modify Tags response
   * @param res Tags response
   */
  setTagsList(res: any): void {
    this.tagsList = res.results.map((elem) => {
      elem.name = elem.tag;
      return elem;
    });
    const q: any = this.route.snapshot.queryParamMap.get('q') || null;
    if (q) {
      this.searchUsingQuery();
    }
  }

  /**
   * Search bar handler
   * @param event Keyboard event
   */
  onSearch(event?: any): void {
    if (
      event.keyCode === 13 &&
      this.searchParam.search &&
      this.searchParam.search.trim() !== ''
    ) {
      this.search();
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        if (this.searchParam.search && this.searchParam.search.trim() !== '') {
          this.search();
        } else {
          this.searchData = null;
        }
      }, 1000);
    }
  }

  /**
   * Handle Search API
   */
  search() {
    if (this.tagSearch && (!this.searchParam.tags || this.searchParam.tags.trim() === '')) {
      return;
    }
    this.searchData = null;
    this.loading = true;
    this.chartProperties = [];
    this.arrWorkflow = [];
    const filteredParams: any = this.sharedService.filterParams(this.searchParam);

    if (!this.tagSearch) {
      const queryParams = Object.assign({}, filteredParams);
      queryParams.q = queryParams.search;
      delete queryParams.search;
      this.router.navigate(['.'], { relativeTo: this.route, queryParams });
    }

    this.searchService.globalSearch(filteredParams).subscribe(res => {
      if (res) {
        this.searchData = res;
        if (res.project && res.project.length) {
          this.setChartProperties();
        }
        if (res.workflow && res.workflow.length) {
          this.setWorkFlows();
        }
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
    });
  }

  /**
   * Set pie chart properties
   */
  setChartProperties(): void {
    this.searchData.project.forEach((elem: any, index) => {
      const totalTask = elem.task ? elem.task.total_task : 0;
      const completed = elem.task ? elem.task.completed_task : 0;
      const passedDue = elem.task ? elem.task.passed_due : 0;
      const incompleted = (totalTask - completed);
      const tempPieGraph = [{
        backgroundColor: totalTask > 0 ? ['#F73B22', '#485CC7', '#D4D8F2'] : ['#FFFFFF'],
        labels: totalTask > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
        data: totalTask > 0 ? [completed, incompleted, passedDue] : [100],
        id: 'project-task' + index,
        isTooltip: elem.task ? true : false
      }];
      this.chartProperties[index] = [...tempPieGraph];
    });
  }

  /**
   * Set and modify workflow responses
   */
  setWorkFlows(): void {
    this.arrWorkflow = this.searchData.workflow.map((obj: any) => {
      obj.width = this.getCompleted(obj.total_task, obj.completed_task);
      return obj;
    });
  }

  /**
   * Return complete percentage
   * @param totalTasks Total Tasks
   * @param completedTasks Completed Tasks
   */
  getCompleted(totalTasks, completedTasks): number {
    return Math.ceil((completedTasks / totalTasks) * 100);
  }

  /**
   * Navigate to Task detail page
   * @param id Task ID
   */
  goToTaskDetail(id: number): void {
    this.router.navigate(['/main/projects/tasks/' + id]);
  }

  /**
   * Navigate to project detail page
   * @param id Project ID
   */
  goToProjectDetail(id: number): void {
    this.router.navigate(['/main/projects/' + id]);
  }

  /**
   * Navigate to document detail page
   * @param docId Document ID
   */
  goToDocument(docId: number): void {
    const data = [{
      id: docId
    }];
    this.sharedService.moduleCarrier.next({ type: 'document', data });
    this.router.navigate(['/main/documents']);
  }

  /**
   * Handle single and multiselect filters
   * @param groupObj Selections
   * @param filterType Filter
   */
  onFilterSelected(groupObj, filterType): void {
    switch (filterType) {
      case 'sortBy':
        if (this.sortByTitle && this.sortByTitle.length) {
          this.onSingleFilterSelected('sortByList', 'sortByTitle', groupObj);
        }
        this.setFilterTitle('sortByList', 'sortByTitle', groupObj);
        break;
      case 'type':
        groupObj = this.showAllFilter('typeList', 'typeTitle', groupObj);
        this.setFilterTitle('typeList', 'typeTitle', groupObj);
        break;
      case 'importance':
        groupObj = this.showAllFilter('importanceList', 'importanceTitle', groupObj, '4');
        this.setFilterTitle('importanceList', 'importanceTitle', groupObj);
        break;
      case 'tag':
        this.setFilterTitle('tagsList', 'tagTitle', groupObj);
        break;
    }

    this.refineSearch(filterType);
  }

  /**
   * Set selected filters in search param
   * @param filter Key
   */
  refineSearch(filter) {
    let ids;
    switch (filter) {
      case 'sortBy':
        this.searchParam.sort_by = this.sortByTitle && this.sortByTitle.length ? this.sortByTitle[0].id : '';
        break;
      case 'type':
        ids = this.handleShowAllSeleted('typeTitle', 'typeList');
        this.searchParam.model_type = ids.join();
        break;
      case 'importance':
        ids = this.handleShowAllSeleted('importanceTitle', 'importanceList', '4');
        this.searchParam.importance = ids.join();
        break;
      case 'tag':
        ids = this.tagTitle.map(x => x.id);
        this.searchParam.tags = ids.join();
        break;
    }
  }

  /**
   * Handle filter selections
   * @param data Filter list
   * @param title Filter selection list
   * @param groupObj selected filters
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
   * Handle single selection
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
   * Return filter selections with Show All option
   * @param data Filter list
   * @param title Filter selection list
   * @param groupObj selected filters from listing
   * @param id Show All id (optional)
   */
  showAllFilter(data, title, groupObj, id?) {
    const allItem = id ? id : '5';
    if (groupObj.length > 1) {
      const lastItem = groupObj[groupObj.length - 1];
      if (lastItem === allItem) {
        groupObj = [];
        this[title] = [];
        this[data].forEach((ele) => {
          ele.checked = false;
        });
      } else {
        groupObj = groupObj;
      }
    }

    return groupObj;
  }

  /**
   * Return selected filters ids having Show All option
   * @param title Filter selections
   * @param data Filter lists
   * @param id Show ALL ID (optional)
   */
  handleShowAllSeleted(title, data, id?) {
    const allIds = id ? id : '5';
    if (!this[title].length) {
      this[title] = [{ id: allIds, name: 'Show All' }];
    } else if (this[title].length > 1) {
      const idx = this[title].findIndex(x => +x.id === +allIds);
      const indx = this[data].findIndex(x => +x.id === +allIds);
      if (idx > -1) {
        this[title].splice(idx, 1);
      }
      if (indx > -1) {
        this[data][indx].checked = false;
      }
    }
    const ids = this[title].map(x => x.id);
    return ids;
  }

  /**
   * Clear filter and show previous search
   */
  clearFilters(): void {
    this.sortByTitle = [{
      id: '1',
      name: 'A-Z'
    }];
    this.typeList.map(x => x.checked = false);
    this.importanceList.map(x => x.checked = false);
    this.sortByList.map(x => x.checked = false);
    this.typeTitle = [{
      id: '5',
      name: 'Show All'
    }];
    this.importanceTitle = [{
      id: '4',
      name: 'Show All'
    }];
    this.tagTitle = [];
    this.searchParam.sort_by = '';
    this.searchParam.model_type = '';
    this.searchParam.importance = '';
    this.searchParam.tags = '';
    this.search();
  }

  /**
   * Navigate to workflow detail page
   */
  workflowDetail = (id: number) => {
    this.router.navigate(['main/projects/workflow', id]);
  }

  /**
   * Navigate to tags manager
   */
  backToTagsManager = () => {
    this.router.navigate(['/main/tags-manager']);
  }
}
