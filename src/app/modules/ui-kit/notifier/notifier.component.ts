import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotifierService } from './notifier.service';
import { NotifierState } from './notifier.model';

@Component({
  selector: 'app-notifier',
  templateUrl: './notifier.component.html',
  styleUrls: ['./notifier.component.scss']
})
export class NotifierComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  public messages = '';
  public type = 'info';
  public visibleMessage = false;
  private timeout: any;
  private subscription: Subscription;

  constructor(private notifierService: NotifierService) { }

  /**
   * Subscribing for loader events
   */
  ngOnInit() {
    this.subscription = this.notifierService.notifierState
      .subscribe((state: NotifierState) => {
        this.displayErrorMsg(state.message);
      });
  }

  /**
   * Display success message
   */
  displaySuccessMsg = (message: string): void => {
    this.type = 'info';
    this.visibleMessage = true;
    this.messages = message;
    this.hideMsg();
  }

  /**
   * Display error message
   */
  displayErrorMsg = (message: string): void => {
    this.type = 'error';
    this.visibleMessage = true;
    this.messages = message;
    this.hideMsg();
  }

  /**
   * Hide message with after 5 seconds
   */
  hideMsg = (): void => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.timeout = setTimeout(() => {
      this.visibleMessage = false;
      this.messages = '';
    }, 5000);
  }

  /**
   * Unsubscribing loader events
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
