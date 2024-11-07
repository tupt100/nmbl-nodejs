import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { IRequest } from '../nru.interface';
import { NRUService } from '../nru.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  private userSubscribe: Subscription;
  public userToken = '';
  public userEmail = '';
  public submittedtList: Array<IRequest> = [];
  public currentList: Array<IRequest> = [];
  public completedList: Array<IRequest> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private nruService: NRUService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const token = params.token;
      if (token) {
        this.userToken = token;
        this.verifyToken(token);
      }
    });

    this.isRecordCreatedUpdated();
  }

  /**
   * Verify token from URL
   */
  verifyToken = (token: string) => {
    this.nruService.verifyToken(token).subscribe(result => {
      if (result) {
        this.userEmail = result.detail;
        this.listRequestSubmitted(token);
        this.listRequestCurrent(token);
        this.listRequestCompleted(token);
      }
    }, (error) => {
      localStorage.setItem('linkExpired', 'true');
      this.router.navigate(['/requests']);
    });
  }

  /**
   * Get submitted requests
   * @param token Token
   */
  listRequestSubmitted = (token: string) => {
    this.nruService.listRequestSubmitted(token).subscribe(res => {
      if (res && res.results) {
        this.submittedtList = res.results as Array<IRequest>;
      }
    });
  }

  /**
   * Get current requests
   * @param token Token
   */
  listRequestCurrent = (token: string) => {
    this.nruService.listRequestCurrent(token).subscribe(res => {
      if (res && res.results) {
        this.currentList = res.results as Array<IRequest>;
      }
    });
  }

  /**
   * Get completed requests
   * @param token Token
   */
  listRequestCompleted = (token: string) => {
    this.nruService.listRequestCompleted(token).subscribe(res => {
      if (res && res.results) {
        this.completedList = res.results as Array<IRequest>;
      }
    });
  }

  /**
   * Navigate to request detail page
   */
  viewRequestDetail = (id: number) => {
    this.router.navigate(['view-request/', id, this.userToken]);
  }

  /**
   * Subscribe messages for record creating/updating events
   */
  isRecordCreatedUpdated = () => {
    this.userSubscribe = this.messageService.$isRecordCreatesUpdated.subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.message);
      }
    });
  }

  /**
   * Navigate to add new requests
   */
  submitRequest = () => {
    this.router.navigate(['add-requests', this.userToken]);
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.userSubscribe) {
      this.userSubscribe.unsubscribe();
    }
  }
}
