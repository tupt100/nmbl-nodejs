import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RequestsService } from '../requests.service';
import { MessageService } from '../../../services/message.service';
import { IRequest } from '../requests.interface';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Store } from '@ngrx/store';
import { SharedService } from 'src/app/services/sharedService';
import * as fromRoot from '../../../store';
import { Messages } from 'src/app/services/messages';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  private requestSubscribe: Subscription;
  public arrRequests: Array<IRequest> = [];
  public totalCount = 0;
  public reverse = true;
  public requestId = 0;
  public arrRequestIds: Array<number> = [];
  public defaultParams = {
    limit: 10,
    offset: 0,
    ordering: 'id'
  };
  public showModal = {
    isDelete: false,
    isDeleteMultiple: false
  };
  public objPermission$: any;
  permisionList: any = {};

  constructor(
    private router: Router,
    private requestsService: RequestsService,
    private messageService: MessageService,
    private store: Store<fromRoot.AppState>,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    // Set user selected limit
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }

    // Check user permission to view requests
    this.objPermission$ = this.store.select('permissionlist').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.permission) {
          this.permisionList = obj.datas.permission;
          if (this.permisionList.request_request_view) {
            this.listRequests();
            this.isRecordCreatedUpdated();
          }
        }
      }
    });
  }

  /**
   * Get requests listing
   */
  listRequests = () => {
    let params: any = Object.assign({}, this.defaultParams);
    params.ordering = this.reverse ? '-' + params.ordering : params.ordering;
    params = this.sharedService.filterParams(params);
    this.requestsService.listRequests(params).subscribe(res => {
      if (res) {
        this.totalCount = res.count as number;
        this.arrRequests = res.results as Array<IRequest>;
      }
    });
  }

  /**
   * Pagination handler
   */
  loadMoreRequests = (offset: number) => {
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listRequests();
  }

  /**
   * Sorting handler
   * @param orderBy Ordering key
   */
  orderByChange(orderBy: string): void {
    if (this.defaultParams.ordering === orderBy) {
      this.reverse = !this.reverse;
    } else {
      this.defaultParams.ordering = orderBy;
    }
    this.listRequests();
  }

  /**
   * Navigate to request details page
   * @param id Request ID
   */
  convertRequest = (id: number) => {
    this.router.navigate(['main/convert-request', id]);
  }

  /**
   * Handler for removing single request popup
   * @param response Popup response [boolean]
   */
  removeRequestConfirm = (response): void => {
    if (response) {
      this.removeRequest(this.requestId);
    } else {
      this.showModal.isDelete = false;
    }
  }

  /**
   * Handler for removing multiple requests popup
   * @param response Popup response [boolean]
   */
  removeMultiRequestConfirm = (response): void => {
    if (response) {
      const ids: string = this.arrRequestIds.join();
      this.removeRequest(ids);
    } else {
      this.showModal.isDeleteMultiple = false;
    }
  }

  /**
   * Remove request
   * @param id Request ID
   */
  removeRequest = (id): void => {
    this.showModal.isDelete = false;
    this.showModal.isDeleteMultiple = false;
    this.requestsService.removeRequest(id).subscribe(res => {
      this.arrRequestIds = [];
      this.notifier.displaySuccessMsg(Messages.notifier.reqRemove);
      this.listRequests();
    });
  }

  /**
   * Select requests
   * @param id Request ID
   */
  selectRequestToRemove = (id: number) => {
    const index = this.arrRequestIds.indexOf(id);
    if (index === -1) {
      this.arrRequestIds.push(id);
    } else {
      this.arrRequestIds.splice(index, 1);
    }
  }

  /**
   * Return true if any request selected else false
   */
  isValidRequest = () => {
    return this.arrRequestIds && this.arrRequestIds.length ? true : false;
  }

  /**
   * Subscribing to record created/updated event
   */
  isRecordCreatedUpdated = () => {
    this.requestSubscribe = this.messageService.$isRecordCreatesUpdated.subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.message);
      }
    });
  }

  /**
   * Navigate to view request detail
   * @param id Request ID
   */
  viewRequest = (id: number) => {
    this.router.navigate(['main/services/', id]);
  }

  /**
   * Navigate to request converion page for multiple requests
   */
  convertMultipleRequest = () => {
    this.setCookie('ConvertIds', JSON.stringify(this.arrRequestIds), 1);
    this.router.navigate(['main/convert-multiple-request']);
  }

  /**
   * Set browser cookie
   * @param name Cookie name
   * @param value Cookie value
   * @param expireDays Expiry time for cookie
   */
  setCookie = (name: string, value: string, expireDays: number) => {
    const d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}`;
  }

  /**
   * Handler for view by changes
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listRequests();
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.requestSubscribe) {
      this.requestSubscribe.unsubscribe();
    }
  }
}
