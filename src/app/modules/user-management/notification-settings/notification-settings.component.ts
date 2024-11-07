import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { INotifications } from '../user-management.interface';
import { MessageService, IMessage } from '../../../services/message.service';
import { UserService } from '../user.service';
import { Messages } from 'src/app/services/messages';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent implements OnInit {

  /**
   * Bindings
   */
  public userId = null;
  public userName = '';
  public modelType = 'task';
  public arrTaskNotifications: Array<INotifications> = [];
  public arrProjectNotifications: Array<INotifications> = [];
  public arrWorkflowNotifications: Array<INotifications> = [];
  public arrAccountNotifications: Array<INotifications> = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Getting user id from params
    const id = this.activatedRoute.snapshot.paramMap.get('id') || null;
    if (id && !isNaN(+id)) {
      this.userId = id;

      // Getting user notification settings
      this.getCompanyUserDetails();
      this.listTaskNotifications('task');
      this.listTaskNotifications('project');
      this.listTaskNotifications('workflow');
      this.listTaskNotifications('account');
    } else {
      // Redirect to company setup
      this.router.navigate(['/main/users-and-permissions']);
    }
  }

  /**
   * Get notifications data for the selected user
   * @param modelType Model Type
   */
  listTaskNotifications = (modelType: string): void => {
    this.userService.listCompanyUserNotifications(this.userId, modelType).subscribe(res => {
      if (res) {
        switch (modelType) {
          case 'task':
            this.arrTaskNotifications = res as Array<INotifications>;
            break;
          case 'project':
            this.arrProjectNotifications = res as Array<INotifications>;
            break;
          case 'workflow':
            this.arrWorkflowNotifications = res as Array<INotifications>;
            break;
          case 'account':
            this.arrAccountNotifications = res as Array<INotifications>;
            break;
        }
      }
    });
  }

  /**
   * Get selected user details
   */
  getCompanyUserDetails = () => {
    this.userService.getCompanyUserDetails(this.userId).subscribe((res: any) => {
      if (res) {
        this.userName = `${res.first_name} ${res.last_name}`;
      }
    });
  }

  /**
   * Handle when notification checkbox changes
   * @param event Checkbox change event
   * @param notification Notification object
   * @param type Notification type
   */
  changeSettings = (event, notication: INotifications, type: string): void => {
    notication[type] = event.target.checked ? true : false;
  }

  /**
   * Trigger when task select-all checkbox changes
   * @param event Checkbox change event
   * @param type Notification type
   */
  selectAllTaskNotification = (event: any, type: string): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrTaskNotifications.map(obj => obj[type] = event.target.checked) as Array<INotifications>;
  }

  /**
   * Trigger when project select-all checkbox changes
   * @param event Checkbox change event
   * @param type Notification type
   */
  selectAllProjectNotification = (event: any, type: string): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrProjectNotifications.map(obj => obj[type] = event.target.checked) as Array<INotifications>;
  }

  /**
   * Trigger when workflow select-all checkbox changes
   * @param event Checkbox change event
   * @param type Notification type
   */
  selectAllWorkflowNotification = (event: any, type: string): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrWorkflowNotifications.map(obj => obj[type] = event.target.checked) as Array<INotifications>;
  }

  /**
   * Trigger when account select-all checkbox changes
   * @param event Checkbox change event
   * @param type Notification type
   */
  selectAllAccountNotification = (event: any, type: string): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrAccountNotifications.map(obj => obj[type] = event.target.checked) as Array<INotifications>;
  }

  /**
   * Update user notification settings
   */
  saveUserNotifications = () => {
    // Get Task notifications
    const arrTasksApp: Array<INotifications> = this.arrTaskNotifications.filter(x => x.in_app_notification === true);
    const arrTasksEmail: Array<INotifications> = this.arrTaskNotifications.filter(x => x.email_notification === true);

    // Get Project notifications
    const arrProjectApp: Array<INotifications> = this.arrProjectNotifications.filter(x => x.in_app_notification === true);
    const arrProjectEmail: Array<INotifications> = this.arrProjectNotifications.filter(x => x.email_notification === true);

    // Get Workflow notifications
    const arrWorkflowApp: Array<INotifications> = this.arrWorkflowNotifications.filter(x => x.in_app_notification === true);
    const arrWorkflowEmail: Array<INotifications> = this.arrWorkflowNotifications.filter(x => x.email_notification === true);

    // Get Account notifications
    const arrAccountApp: Array<INotifications> = this.arrAccountNotifications.filter(x => x.in_app_notification === true);
    const arrAccountEmail: Array<INotifications> = this.arrAccountNotifications.filter(x => x.email_notification === true);

    const arrAppNotifications = arrTasksApp.concat(arrProjectApp).concat(arrWorkflowApp).concat(arrAccountApp);
    const arrEmailNotifications = arrTasksEmail.concat(arrProjectEmail).concat(arrWorkflowEmail).concat(arrAccountEmail);

    const arrApp: Array<number> = arrAppNotifications.map(({ id }) => id);
    const arrEmail: Array<number> = arrEmailNotifications.map(({ id }) => id);
    const params = {
      in_app_notification: arrApp,
      email_notification: arrEmail
    };

    this.userService.updateCompanyUsersNotificationSettings(this.userId, params).subscribe(res => {
      if (res) {
        const mssage: IMessage = {
          message: Messages.notifier.notificationUpdated
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['main/users-and-permissions']);
      }
    });
  }

  /**
   * Navigate to company setup
   */
  cancel = (): void => {
    this.messageService.recordCreatedUpdated(null);
    this.router.navigate(['main/users-and-permissions']);
  }
}
