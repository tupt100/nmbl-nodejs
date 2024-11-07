import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IBulkInvite } from '../../user-management.interface';
import { MessageService, IMessage } from '../../../../services/message.service';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { UserService } from '../../user.service';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.scss']
})
export class AddNewUserComponent implements OnInit {

  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public arrNewUser: Array<IBulkInvite> = [];
  public arrTempNewUser: Array<IBulkInvite> = [];
  // tslint:disable-next-line:max-line-length
  public emailRegEx = this.sharedService.emailRegEx;

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.addNewUser();
  }

  /**
   * Function to add expty user's dynamically
   */
  addNewUser = (): void => {
    const objUser = {
      email: '',
      first_name: '',
      last_name: '',
      invited_by_group: 0
    };
    this.arrNewUser.push(objUser);
  }

  /**
   * @param index index
   * Delete user
   */
  removeUser = (index: number): void => {
    this.arrNewUser.splice(index, 1);
  }

  /**
   * @param invitedByGroup invitedByGroup
   * @param index index
   * Function to update group id in users list
   */
  invitedBy = (invitedByGroup: number, index: number) => {
    this.arrNewUser[index].invited_by_group = invitedByGroup;
  }

  /**
   * Function to send bulk invite to users
   */
  sendBulkInvite = () => {
    const tempArray: Array<IBulkInvite> = [];
    this.arrNewUser.splice(this.arrNewUser.length - 1, 1);
    if (this.arrNewUser && this.arrNewUser.length > 0) {
      this.arrNewUser.map( obj => {
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
        tempArray.push(obj);
      });

      if (tempArray && tempArray.length > 0) {
        this.userService.sendBulkInvite(tempArray).subscribe((result: any) => {
          if (result) {
            if (result && result.invalid_invitation && result.invalid_invitation.length > 0) {
              this.notifier.displayErrorMsg(Messages.notifier.emailExists);
              result.invalid_invitation.map( obj => {
                this.arrNewUser.map( (x, y) => {
                  if (x.email === obj) {
                    const params = {
                      email: obj,
                      title: '',
                      invited_by_group: 0
                    };
                    this.arrTempNewUser.push(params);
                  }
                });
              });
              this.arrNewUser = [];
              this.arrNewUser = this.arrTempNewUser;
            } else {
              this.arrNewUser = [];
              this.addNewUser();
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
            this.notifier.displayErrorMsg('Group- ' + e.error.detail.group);
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
   * Function to navigate to mass-invite page
   */
  massInvite = () => {
    this.router.navigate(['main/mass-invite']);
  }

  /**
   * Function to check weather submitted form is valid or not
   */
  isFormFilled = () => {
    const arr = this.arrNewUser.filter( x => x.email !== '' && x.invited_by_group !== 0 && x.first_name !== '' && x.last_name !== '');
    const tempArray: Array<IBulkInvite> = [...arr];
    if (tempArray && tempArray.length > 0) {
      const data = tempArray.filter( x => x.email !== '' && x.invited_by_group === 0 && x.first_name === '' && x.last_name === '');
      if (data && data.length > 0) {
        return false;
      } else {
        const lastObj = this.arrNewUser[this.arrNewUser.length - 1];
        if (lastObj.first_name !== '' && lastObj.last_name !== '' && lastObj.invited_by_group > 0 && lastObj.email !== '') {
          this.addNewUser();
        }
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
