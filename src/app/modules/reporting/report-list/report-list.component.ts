import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss']
})
export class ReportListComponent {

  constructor(private router: Router) { }

  /**
   * Naviagate to report management for the selected report type
   * @param reportType Report type
   */
  next = (reportType: string) => {
    this.router.navigate(['main/report-mgmt'], { queryParams : { type: reportType } });
  }

}
