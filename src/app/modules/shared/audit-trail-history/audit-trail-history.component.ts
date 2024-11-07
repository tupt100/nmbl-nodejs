import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-audit-trail-history',
  templateUrl: './audit-trail-history.component.html',
  styleUrls: ['./audit-trail-history.component.scss']
})
export class AuditTrailHistoryComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  @Input() modalType = '';
  @Input() modalId = '';
  @Input() list: any[] = [];
  auditTrail = [];
  loader = false;

  constructor(
    private service: CommonService
  ) { }

  ngOnInit() {
    if (this.modalType) {
      this.listAuditTrail();
    }
  }

  /**
   * OnChanges Life cycle hook for documents
   */
  ngOnChanges() {
    if (!this.modalType) {
      this.auditTrail = this.list;
    }
  }

  /**
   * Audit Trails History for Project, Workflow, Tasks and Documents
   */
  listAuditTrail(): void {
    this.loader = true;
    this.auditTrail = [];
    this.service.listAuditTrail(this.modalType, this.modalId).subscribe(response => {
      const list: any[] = response && response.results && response.results.length ? response.results : [];

      // Add <b> tags
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
      this.auditTrail = list;
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

}
