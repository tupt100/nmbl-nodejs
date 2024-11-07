import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export interface IMessage {
  message: string;
  error?: boolean;
}

@Injectable()
export class MessageService {

  // Record created/updated observable
  private isRecordCreatesUpdated = new BehaviorSubject<IMessage>(null);
  $isRecordCreatesUpdated = this.isRecordCreatesUpdated.asObservable();

  // User image update observable
  private isUserImageUpdated = new BehaviorSubject<string>(null);
  $isUserImageUpdated = this.isUserImageUpdated.asObservable();

  // Notification posted observable
  private isNotificationPosted = new BehaviorSubject<boolean>(false);
  $isNotificationPosted = this.isNotificationPosted.asObservable();

  /**
   * Set record created/updated observable
   * @param data boolean
   */
  recordCreatedUpdated(data) {
    this.isRecordCreatesUpdated.next(data);
  }

  /**
   * Set user image update observable
   * @param data Image
   */
  userImageUpdated(data) {
    this.isUserImageUpdated.next(data);
  }

  /**
   * Set notification posted observable
   * @param data boolean
   */
  notificationPosted(data) {
    this.isNotificationPosted.next(data);
  }

}
