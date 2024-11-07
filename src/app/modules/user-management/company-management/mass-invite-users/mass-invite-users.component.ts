import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IBulkInvite, IGroups } from '../../user-management.interface';
import { MessageService, IMessage } from '../../../../services/message.service';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { UserService } from '../../user.service';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-mass-invite-users',
  templateUrl: './mass-invite-users.component.html',
  styleUrls: ['./mass-invite-users.component.scss']
})
export class MassInviteUsersComponent {

  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public emails = '';
  public arrEmail: Array<string> = [];
  public arrBulkInvitation: Array<IBulkInvite> = [];
  public isFirstStepComplete = false;
  public arrGroups: Array<IGroups> = [];


  // tslint:disable-next-line:variable-name
  public in_app_notification: Array<number> = [];
  // tslint:disable-next-line:variable-name
  public email_notification: Array<number> = [];
  public arrTempBatchInvitation: Array<IBulkInvite> = [];
  public arrBulkSend: Array<IBulkInvite> = [];
  public arrTempBulkSend: Array<IBulkInvite> = [];
  public emailRegEx = this.sharedService.emailRegEx;

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private sharedService: SharedService
  ) { }

  /**
   * Function to check weather role is selected or not
   */
  onRoleSelection = (invitedByGroup: number, index: number): void => {
    this.arrBulkInvitation[index].invited_by_group = invitedByGroup;
  }

  /**
   * Function to validate user's email and save locally
   */
  onSubmitNext = (): void => {
    this.arrEmail = this.getEmail(this.emails);
    if (this.arrEmail && this.arrEmail.length > 0) {
      this.arrEmail.map (obj => {
        const params = {
          email: obj,
          invited_by_group: 0,
          first_name: '',
          last_name: '',
          email_notification: [],
          in_app_notification: []
        };
        this.arrBulkInvitation.push(params);
      });
      this.emails = '';
      this.isFirstStepComplete = true;
    }
  }

  /**
   * Function to return validated user's
   */
  getEmail = (text) => {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
  }

  /**
   * Function to check valid form fields
   */
  isValidFields = (): boolean => {
    if (this.emails && this.emails.trim().length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Function to send bulk invite to user's
   */
  sendBulkInvite = () => {
    const tempArray: Array<IBulkInvite> = [];
    if (this.arrBulkSend && this.arrBulkSend.length > 0) {
      this.arrBulkSend.map( obj => {
        if (obj.email !== '') {
          this.arrBulkInvitation.push(obj);
        }
      });
    }

    if (this.arrBulkInvitation && this.arrBulkInvitation.length > 0) {
      this.arrBulkInvitation.map((obj: any) => {
        if (!this.emailRegEx.test(obj.email)) {
          const msg = obj.email + Messages.notifier.notValidEmail;
          this.notifier.displayErrorMsg(msg);
          return false;
        }
        if (!obj.hasOwnProperty('email') || obj.email.trim() === '') {
          this.notifier.displayErrorMsg(Messages.notifier.emailReq);
          return false;
        } else if (!obj.hasOwnProperty('first_name') || obj.first_name.trim() === '') {
          this.notifier.displayErrorMsg(Messages.notifier.firstNameReq);
          return;
        } else if (!obj.hasOwnProperty('last_name') || obj.last_name.trim() === '') {
          this.notifier.displayErrorMsg(Messages.notifier.lastNameReq);
          return;
        } else if (!obj.hasOwnProperty('invited_by_group') || obj.invited_by_group === 0) {
          this.notifier.displayErrorMsg(Messages.notifier.selectGroup);
          return;
        }
        if (this.in_app_notification.length > 0) {
          obj.in_app_notification = this.in_app_notification;
        }
        if (this.email_notification.length > 0) {
          obj.email_notification = this.email_notification;
        }
        tempArray.push(obj);
      });

      if (tempArray && tempArray.length > 0) {
        this.userService.sendBulkInvite(tempArray).subscribe((result: any) => {
          if (result) {
            this.in_app_notification = [];
            this.email_notification = [];
            this.arrTempBulkSend = [];
            this.arrTempBatchInvitation = [];

            if (result && result.invalid_invitation && result.invalid_invitation.length > 0) {
              this.notifier.displayErrorMsg(Messages.notifier.emailExists);
              result.invalid_invitation.map( obj => {

                this.arrBulkSend.map( (x, y) => {
                  if (x.email === obj) {
                    const params = {
                      email: obj,
                      title: '',
                      invited_by_group: 0
                    };
                    this.arrTempBulkSend.push(params);
                  }
                });

                this.arrBulkInvitation.map( (x, y) => {
                  if (x.email === obj) {
                    const params = {
                      email: obj,
                      title: '',
                      invited_by_group: 0
                    };
                    this.arrTempBatchInvitation.push(params);
                  }
                });
              });
              this.arrBulkSend = [];
              this.arrBulkSend = this.arrTempBulkSend;

              this.arrBulkInvitation = [];
              this.arrBulkInvitation = this.arrTempBatchInvitation;
            } else {
              this.arrBulkSend = [];
            }
            const mssage: IMessage = {
              message: result.detail
            };
            this.messageService.recordCreatedUpdated(mssage);
            this.router.navigate(['main/users-and-permissions']);
          }
        }, (e) => {
          if (e && e.error && typeof e.error.detail === 'string') {
            this.notifier.displayErrorMsg(e.error.detail);
          } else if (e && e.error && e.error.detail && e.error.detail.group) {
            this.notifier.displayErrorMsg(e.error.detail.group);
          } else if (e && e.error && e.error.detail && e.error.detail.email && e.error.detail.email.length) {
            this.notifier.displayErrorMsg(e.error.detail.email[0]);
          } else {
            this.notifier.displayErrorMsg(Messages.errors.serverErr);
          }
        });
      }
    }
  }

  /**
   * Function to remove invited user's from list
   */
  removeInvitedUser = (index: number): void => {
    this.arrBulkInvitation.splice(index, 1);
    if (this.arrBulkInvitation.length === 0) {
      this.isFirstStepComplete = false;
    }
  }

  /**
   * Function to check valid form field
   */
  isFormFilled = () => {
    if (this.arrBulkSend && this.arrBulkSend.length > 0) {
      const data = this.arrBulkInvitation.filter(
        x => x.email === '' || x.invited_by_group === 0 || x.first_name === '' || x.last_name === ''
      );
      if (data && data.length > 0) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  /**
   * Function to navigate to users-and-permissions page
   */
  cancel = () => {
    this.router.navigate(['main/users-and-permissions']);
  }
}
