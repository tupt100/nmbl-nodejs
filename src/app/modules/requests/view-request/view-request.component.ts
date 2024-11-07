import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestsService } from '../requests.service';
import { SharedService } from '../../../services/sharedService';
import { IRequest } from '../requests.interface';
import * as moment from 'moment';

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.scss']
})
export class ViewRequestComponent implements OnInit {
  /**
   * Bindings
   */
  public objRequest: IRequest;
  public requestId = 0;
  momentObj = moment;
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private requestsService: RequestsService,
    public sharedService: SharedService
  ) {
    this.objRequest = new IRequest();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.requestId = params.id;
      if (this.requestId && !isNaN(this.requestId)) {
        this.getRequestDetails(this.requestId);
      } else {
        this.backToRequests();
      }
    });
  }

  /**
   * Get request details
   * @param id Request ID
   */
  getRequestDetails = (id: number) => {
    this.loading = true;
    this.requestsService.getRequestDetailsById(id).subscribe(res => {
      if (res) {
        this.objRequest = {
          assigned_to: res.assigned_to,
          attachments: res.attachments || [],
          description: res.description || '',
          id: res.id || 0,
          request_priority: res.request_priority || 0,
          requested_due_date: res.requested_due_date || '',
          subject: res.subject || '',
          user_information: {
            user_email: res.user_information.user_email || '',
            user_name: res.user_information.user_name || '',
            user_phone_number: res.user_information.user_phone_number || '',
            title: res.user_information.title || '',
          }
        };
      }
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.backToRequests();
    });
  }

  /**
   * Navigate to request converison view
   */
  convertRequest = () => {
    this.router.navigate(['main/convert-request', this.requestId]);
  }

  /**
   * Navigate to requests listing
   */
  backToRequests() {
    this.router.navigate(['/main/services']);
  }
}
