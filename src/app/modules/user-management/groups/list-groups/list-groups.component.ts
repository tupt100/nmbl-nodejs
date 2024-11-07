import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GroupService } from '../../group.service';
import { IWorkGroup } from '../../user-management.interface';
import { IntroService } from '../../../intro-slides/intro-slides.service';
import { ISlides } from '../../../intro-slides/intro-slides.interface';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-list-groups',
  templateUrl: './list-groups.component.html',
  styleUrls: ['./list-groups.component.scss']
})
export class ListGroupsComponent implements OnInit {

  public totalCount = 0;
  public arrTaskNumbers: Array<number> = [];
  public arrWorkGroup: Array<IWorkGroup> = [];
  public defaultParams = {
    limit: 12,
    offset: 0,
  };
  public module = 'group';
  public slides: Array<ISlides> = [];
  public showModal = {
    isIntro: false
  };

  constructor(
    private router: Router,
    private groupService: GroupService,
    private introService: IntroService,
    public sharedService: SharedService
  ) { }

  ngOnInit() {
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 10 ? 12 : +perPage;
    }
    this.displayIntro();
    this.listGroups();
  }

  /**
   * Function to display group introduction
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
   * @param response response
   * Function to close into when it finished
   */
  onClose = (response) => {
    if (response) {
      this.showModal.isIntro = false;
    }
  }

  /**
   * Function to get groups
   */
  listGroups = (): void => {
    this.groupService.listUserWorkGroups(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalCount = res.count as number;
        this.arrWorkGroup = res.results as Array<IWorkGroup>;
        this.arrWorkGroup.map((obj: any) => {
          const arr = [];
          const notCompletedTasks = (obj.task.total_task - obj.task.completed_task);
          const tempPieGraph = {
            backgroundColor: obj.task.total_task > 0 ? ['#485CC7', '#D4D8F2', '#F73B22'] : ['#FFFFFF'],
            labels: obj.task.total_task > 0 ? ['Completed', 'Incompleted', 'Overdue'] : [''],
            data: obj.task.total_task > 0 ? [obj.task.completed_task, notCompletedTasks, obj.task.overdue_task] : [100],
            id: obj.id,
            isTooltip: obj.task.total_task > 0 ? true : false
          };
          arr.push(tempPieGraph);
          obj.chartProperties = [...arr];
          obj.isChartExist = obj.task.total_task > 0 ? true : false;
        });
      }
    });
  }

  /**
   * @param offset offset
   * Function to load more groups
   */
  loadMoreGroups = (offset: number): void => {
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listGroups();
  }

  /**
   * @param id id
   * Function to navigate to group details page
   */
  groupsDetail = (id: number) => {
    this.router.navigate(['main/groups', id]);
  }

  /**
   * @param completedTasks completedTasks
   * @param totalTasks totalTasks
   * Function to return completed percentage
   */
  completePercent(completedTasks, totalTasks): number {
    if (completedTasks && totalTasks) {
      return Math.ceil((completedTasks / totalTasks) * 100);
    } else {
      return 0;
    }
  }

  /**
   * Function to navigate to add-new-group
   */
  addNewGroup = () => {
    this.router.navigate(['main/add-new-group']);
  }

  /**
   * @param perPage perPage
   * Function to set per page record
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listGroups();
  }
}
