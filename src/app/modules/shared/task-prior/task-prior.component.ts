import { Component, Input, OnChanges, HostListener } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';
import * as moment from 'moment';
import { TaskService } from '../../projects/task/task.service';

@Component({
  selector: 'app-task-prior',
  templateUrl: './task-prior.component.html'
})
export class TaskPriorComponent implements OnChanges {
  /**
   * Bindings
   */
  @Input() workflow: any = '';
  @Input() workflowChanged = false;
  @Input() afterTask: any;
  @Input() priorTask: any;
  @Input() mainTask: any = {};
  showDropdown = false;
  showDropdown2 = false;
  searchValue = '';
  searchValue2 = '';
  searchData = [];
  searchData2 = [];
  searchParam = {
    search: '',
    // status: '1,2,5,6',
    prior_task__isnull: 'True',
    after_task__isnull: 'True',
    type: 'active'
  };

  selected: any = {
    task: {}
  };
  selected2: any = {
    task: {}
  };
  priorData = {
    prior_task: '',
    after_task: ''
  };
  timer;
  momentObj = moment;

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event.target.className !== 'flex' &&
      typeof event.target.className !== 'object' &&
      event.target.className !== 'multiselect-text open' &&
      event.target.className !== 'search_input ng-pristine ng-untouched ng-valid' &&
      event.target.className !== 'fitem-ck-txt' &&
      event.target.className !== 'fitem-ck-input' &&
      event.target.className !== 'm-0' &&
      event.target.className !== 'task'
    ) {
      this.showDropdown = false;
      this.showDropdown2 = false;
    }
  }

  constructor(
    private sharedService: SharedService,
    private taskService: TaskService
  ) { }

  /**
   * Handle searching tasks
   * @param ev Event
   * @param type Dependency type
   */
  onSearchKeyup(ev: any, type): void {
    if (!this.workflow) {
      type === 'prior_task' ? this.searchData = [] : this.searchData2 = [];
      return;
    }

    const model =  type === 'prior_task' ? 'searchValue' : 'searchValue2';
    this.searchParam.search = this[model];
    (this.searchParam as any).workflow = this.workflow;
    if (ev &&  ev.keyCode === 13) {
      this.searchTasks(type);
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.searchTasks(type);
      }, 1000);
    }
  }

  /**
   * Search tasks
   * @param type Dependency type
   */
  searchTasks(type) {
    const filteredParams: any = this.sharedService.filterParams(this.searchParam);
    this.taskService.getTasks(filteredParams).subscribe(res => {
      const key = type === 'prior_task' ? 'searchData' : 'searchData2';
      this[key] = [];
      this[key] = res.results;
      if (this[key].length) {
        this[key].map(x => x.checked = false);
      }
      const selectedObj = type === 'prior_task' ? 'selected2' : 'selected';
      if (this[selectedObj] && Object.keys(this[selectedObj]).length && this[key].length) {
        const idx = this[key].findIndex(x => x.id === this[selectedObj].id);
        if ( idx > -1) {
          this[key].splice(idx, 1);
        }
      }

      if (this.mainTask && Object.keys(this.mainTask).length && this[key].length) {
        const idx2 = this[key].findIndex(x => x.task.id === this.mainTask.id);
        if ( idx2 > -1) {
          this[key].splice(idx2, 1);
        }
      }
    });
  }

  /**
   * Toogle dependency dropdowns
   * @param type Dependency type
   */
  show(type) {
    const dropKey = type === 'prior_task' ? 'showDropdown' : 'showDropdown2';
    const secDropKey = type === 'prior_task' ? 'showDropdown2' : 'showDropdown';
    const model =  type === 'prior_task' ? 'searchValue' : 'searchValue2';
    this[dropKey] = !this[dropKey];
    this[secDropKey] = false;
    if (this[dropKey]) {
      this.searchParam.search = '';
      this[model] = '';
      this.searchTasks(type);
    }
  }


  /**
   * Handle tasks checkbox change event
   * @param event Checkbox change event
   * @param item Task
   * @param type Dependency type
   */
  public changeSelection(event, item, type): void {
    const obj = type === 'prior_task' ? 'selected' : 'selected2';
    if (event.srcElement.checked) {
      const arr = type === 'prior_task' ? 'searchData' : 'searchData2';
      this[obj] = item;

      this[arr].map((x) => {
        if (x.id === item.id) {
          x.checked = event.srcElement.checked;
        } else {
          x.checked = false;
        }
      });
      this.priorData[type] = item.task.id;
      this.clearSearch(type);
      this.showDropdown = false;
      this.showDropdown2 = false;
    } else {
      delete this.priorData[type];
      this[obj] = {};
    }
  }

  /**
   * Checking inputs change event
   */
  ngOnChanges() {
    if (this.selected2 && this.selected2.task) {
      this.selected2.task = this.afterTask ? this.afterTask : {};
    }

    if (this.selected && this.selected.task) {
      this.selected.task = this.priorTask ? this.priorTask : {};
    }

    (this.searchParam as any).workflow = this.workflow;
    if (this.workflowChanged) {
      this.selected = {
        task: {}
      };
      this.selected2 = {
        task: {}
      };
    }

    this.priorData = {
      after_task: '',
      prior_task: ''
    };
    this.searchData = [];
    this.searchData2 = [];
    this.searchValue = '';
    this.searchValue2 = '';
  }

  /**
   * Clear search inputs
   * @param type Dependency type
   */
  clearSearch(type) {
    if (type === 'prior_task') {
      this.searchData2 =  [];
      this.searchValue2 = '';
    } else {
      this.searchData =  [];
      this.searchValue = '';
    }
  }
}
