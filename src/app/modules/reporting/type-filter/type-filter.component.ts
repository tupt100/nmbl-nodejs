import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TypeFilter } from './type-filter.interface';

@Component({
  selector: 'app-type-filter',
  templateUrl: './type-filter.component.html',
  styleUrls: ['./type-filter.component.scss']
})
export class TypeFilterComponent implements OnInit {

  /**
   * Bindings
   */
  @Input() reportName = '';
  @Input() originamReportName = '';
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectReport: EventEmitter<string> = new EventEmitter<string>();
  public arrReportType: Array<TypeFilter> = [];
  public isReportTypeOpen = false;

  constructor() { }

  ngOnInit() {
    this.listDefaultReportType();
    this.removeDuplicate();
  }

  /**
   * Method to load default report type
   */
  listDefaultReportType = () => {
    this.arrReportType = [
      {
        id: 1,
        name: 'Productivity',
        checked: false
      },
      {
        id: 2,
        name: 'Efficiency',
        checked: false
      },
      {
        id: 3,
        name: 'Workload',
        checked: false
      },
      {
        id: 4,
        name: 'Group Workload',
        checked: false
      },
      {
        id: 5,
        name: 'Privilege Log',
        checked: false
      },
      {
        id: 6,
        name: 'Tags Report',
        checked: false
      }
    ];
  }

  /**
   * Method to select report type.
   * @param id report type id.
   */
  selectReport = (id: number) => {
    this.listDefaultReportType();
    this.arrReportType.map((obj, index) => {
      obj.checked = false;
      if (obj.id === id) {
        obj.checked = true;
        this.reportName = obj.name;
        setTimeout(() => {
          this.isReportTypeOpen = false;
        }, 500);
        this.arrReportType.splice(index, 1);
        this.onSelectReport.emit(this.reportName);
      }
    });
  }

  /**
   * Remove duplicates
   */
  removeDuplicate = () => {
    this.arrReportType.map((obj, index) => {
      if (obj.name === this.reportName) {
        this.arrReportType.splice(index, 1);
      }
    });
  }
}
