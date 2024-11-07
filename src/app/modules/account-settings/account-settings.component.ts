import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

import { NotifierComponent } from '../ui-kit/notifier/notifier.component';
import { IUserNotifications } from './account-settings.interface';
import * as fromRoot from '../../store';
import * as fromSave from '../../store/reducers/save.reducer';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';
import { UserService } from '../user-management/user.service';
import { MessageService } from '../../services/message.service';
import { AccountSettingsService } from '../account-settings/account-settings.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  @ViewChild('fileUserAvatar', { static: true }) fileUserAvatar: ElementRef;
  public objUser$: Observable<fromSave.SaveDataState>;
  public settingsForm: FormGroup;
  public changepwdForm: FormGroup;
  public submitted = false;
  public userId = 0;
  public userAvatar = '';
  public arrTaskNotifications: Array<IUserNotifications> = [];
  public arrProjectNotifications: Array<IUserNotifications> = [];
  public arrWorkflowNotifications: Array<IUserNotifications> = [];
  public arrAccountNotifications: Array<IUserNotifications> = [];
  public nameInitial = '';
  public newPasswordType = 'password';
  public isNewPassword = false;
  public confirmPasswordType = 'password';
  public isConfirmPassword = false;
  public modelType = 'task';
  public showModal = {
    isRemoveAvatar: false,
    isFileUpload: false
  };
  imageChangedEvent: any = '';
  croppedImage: any = '';
  public avatarPhotobig = false;
  public invalidAvatarFormat = false;
  public isAvatarSelected = false;
  public fileObj: any;
  public isError = false;
  public isSuccess = false;
  private unsubscribeAll: Subject<any>;

  constructor(
    private fb: FormBuilder,
    private accountSettingsService: AccountSettingsService,
    private store: Store<fromRoot.AppState>,
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
    private sharedService: SharedService
  ) {
    this.objUser$ = this.store.select('userDetails');
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.initForm();
    Promise.all([
      this.getUsersNotifications('task'),
      this.getUsersNotifications('project'),
      this.getUsersNotifications('workflow'),
      this.getUsersNotifications('account'),
      this.loadUserAvatar()
    ]);
  }

  /**
   * Life cycle hook trigger when component leaves
   */
  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  /**
   * Initialize settings, change password form and validation
   */
  initForm = (): void => {
    this.settingsForm = this.fb.group({
      email: '',
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      title: [''],
      group: []
    });

    this.changepwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.authService.regexValidator(this.sharedService.camelCaseRegEx, { camelCase: '' }),
        this.authService.regexValidator(this.sharedService.specialCharRegEx, { specialCharacter: '' })
      ]],
      confirmPassword: ['', [
        Validators.required,
        this.authService.confirmPasswordValidator
      ]]
    });
    this.getUserDetails();

    this.changepwdForm.get('password').valueChanges
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        this.changepwdForm.get('confirmPassword').updateValueAndValidity();
      });
  }

  /**
   * Get user details
   */
  getUserDetails = (): void => {
    this.objUser$.subscribe((obj: any) => {
      if (obj.loaded) {
        this.userId = obj.datas.id;
        this.userAvatar = obj.datas.user_avatar || '';
        const firstName: string = obj.datas.first_name || '';
        const lastName: string = obj.datas.last_name || '';
        this.nameInitial = firstName.charAt(0) + lastName.charAt(0);
        this.settingsForm = this.fb.group({
          email: obj.datas.email,
          firstName: firstName || '',
          lastName: lastName || '',
          title: obj.datas.title || '',
          group: obj.datas.group.name ? obj.datas.group.name : '',
        });
      }
    });
  }

  /**
   * Handle updating user settings
   */
  updateSettings = () => {

    if (this.settingsForm.invalid) {
      return false;
    }
    const params = {
      first_name: this.settingsForm.value.firstName,
      last_name: this.settingsForm.value.lastName,
      title: this.settingsForm.value.title
    };
    this.accountSettingsService.updateUser(this.userId, params).subscribe(res => {
      if (res) {
        this.loadUserAvatar();
        this.notifier.displaySuccessMsg(Messages.notifier.settingsUpdated);
      }
    });
  }

  /**
   * Handle change password form submittion
   */
  changePassword = () => {
    this.submitted = false;

    if (this.changepwdForm.invalid) {
      this.submitted = true;
      return false;
    }

    const params = {
      current_password: this.changepwdForm.value.currentPassword,
      new_password: this.changepwdForm.value.newPassword
    };
    this.accountSettingsService.changePassword(params).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.pwdChanged);
    }, () => {
      this.notifier.displaySuccessMsg(Messages.notifier.pwdChangedFailed);
    });
  }

  /**
   * Get user notification settings
   */
  getUsersNotifications = (modelType: string): void => {
    this.accountSettingsService.getUsersNotifications(modelType).subscribe(res => {
      if (res) {
        if (modelType === 'task') {
          this.arrTaskNotifications = res as Array<IUserNotifications>;
        } else if (modelType === 'project') {
          this.arrProjectNotifications = res as Array<IUserNotifications>;
        } else if (modelType === 'workflow') {
          this.arrWorkflowNotifications = res as Array<IUserNotifications>;
        } else if (modelType === 'account') {
          this.arrAccountNotifications = res as Array<IUserNotifications>;
        }
      }
    });
  }

  /**
   * Handler for remove user avator confirmation
   */
  confirrmRemoveUserAvatar = (response: boolean) => {
    if (response) {
      this.showModal.isRemoveAvatar = true;
      this.removeUserAvatar();
    } else {
      this.showModal.isRemoveAvatar = false;
    }
  }

  /**
   * Remove user avator
   */
  removeUserAvatar = () => {
    this.showModal.isRemoveAvatar = false;
    this.accountSettingsService.removeUserAvatar().subscribe(res => {
      if (res) {
        this.loadUserAvatar();
        this.notifier.displaySuccessMsg(res.detail);
      }
    }, (error) => {
      this.showModal.isRemoveAvatar = false;
      this.notifier.displayErrorMsg(error.error.user_avatar.detail);
    });
  }

  /**
   * Handle image uploader
   */
  uploadFile = (e) => {
    const file = e.target.files[0];
    const filename: string = file.name;
    const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
    const imgsize = (file.size) / 1024;
    if (imgsize > 2048) {
      this.fileUserAvatar.nativeElement.value = null;
      this.avatarPhotobig = true;
      setTimeout(() => {
        this.avatarPhotobig = false;
      }, 2000);
      return;
    }

    if (format.match('.gif') || format.match('.png') || format.match('.jpg') || format.match('.jpeg')) {
      this.openUplaodModalBox(e);
    } else {
      this.fileUserAvatar.nativeElement.value = null;
      this.invalidAvatarFormat = true;
      setTimeout(() => {
        this.invalidAvatarFormat = false;
      }, 2000);
    }
  }

  /**
   * Open upload user avator component for cropping
   */
  openUplaodModalBox = (e) => {
    this.fileObj = e;
    this.showModal.isFileUpload = true;
  }

  /**
   * Upload user avator image
   */
  uploadUserAvatar = (avatarBase64String) => {
    if (avatarBase64String) {
      this.showModal.isFileUpload = false;
      const params = {
        user_avatar: avatarBase64String
      };
      this.accountSettingsService.uploadUserAvatar(params).subscribe(res => {
        if (res) {
          this.loadUserAvatar();
          this.notifier.displaySuccessMsg(res.detail);
        }
      }, (e) => {
        this.notifier.displayErrorMsg(e.error.user_avatar.detail);
      });
    } else {
      this.showModal.isFileUpload = false;
    }
  }

  /**
   * Get logged in user details and update avator image
   */
  loadUserAvatar = () => {
    this.userService.getLoggedInUserDetails().subscribe(res => {
      this.store.dispatch(new fromRoot.SaveDataSuccessAction(res));
      if (res) {
        this.userAvatar = res.user_avatar || '' as string;
        this.messageService.userImageUpdated(this.userAvatar);
      }
    });
  }

  /**
   * Change password input type
   */
  visibleNewPassword = (): void => {
    this.isNewPassword = !this.isNewPassword;
    this.newPasswordType = this.isNewPassword ? 'text' : 'password';
  }

  /**
   * Change confirm password input type
   */
  visibleConfirmPassword = (): void => {
    this.isConfirmPassword = !this.isConfirmPassword;
    if (this.isConfirmPassword) {
      this.confirmPasswordType = 'text';
    } else {
      this.confirmPasswordType = 'password';
    }
  }

  /**
   * Handle modal app notification settings
   */
  changeAppSettings = (event, notication: IUserNotifications): void => {
    if (event.target.checked) {
      notication.in_app_notification = true;
    } else {
      notication.in_app_notification = false;
    }
  }

  /**
   * Handle modal email notification settings
   */
  changeEmailSettings = (event, notication: IUserNotifications): void => {
    if (event.target.checked) {
      notication.email_notification = true;
    } else {
      notication.email_notification = false;
    }
  }

  /**
   * Handler for select all tasks app notification
   */
  selectAllTaskAppNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrTaskNotifications.map(obj => obj.in_app_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all tasks email notification
   */
  selectAllTaskEmailNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrTaskNotifications.map(obj => obj.email_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all projects app notification
   */
  selectAllProjectAppNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrProjectNotifications.map(obj => obj.in_app_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all projects email notification
   */
  selectAllProjectEmailNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrProjectNotifications.map(obj => obj.email_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all workflow app notification
   */
  selectAllWorkflowAppNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrWorkflowNotifications.map(obj => obj.in_app_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all workflow email notification
   */
  selectAllWorkfllowEmailNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrWorkflowNotifications.map(obj => obj.email_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all account app notification
   */
  selectAllAccountAppNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrAccountNotifications.map(obj => obj.in_app_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handler for select all account email notification
   */
  selectAllAccountEmailNotification = (event: any): void => {
    // tslint:disable-next-line:no-unused-expression
    this.arrAccountNotifications.map(obj => obj.email_notification = event.target.checked) as Array<IUserNotifications>;
  }

  /**
   * Handle updating user notification settings
   */
  upddateNotificationSettings = () => {
    const arrTasksApp: Array<IUserNotifications> = this.arrTaskNotifications.filter(x => x.in_app_notification === true);
    const arrTasksEmail: Array<IUserNotifications> = this.arrTaskNotifications.filter(x => x.email_notification === true);

    const arrProjectApp: Array<IUserNotifications> = this.arrProjectNotifications.filter(x => x.in_app_notification === true);
    const arrProjectEmail: Array<IUserNotifications> = this.arrProjectNotifications.filter(x => x.email_notification === true);

    const arrWorkflowApp: Array<IUserNotifications> = this.arrWorkflowNotifications.filter(x => x.in_app_notification === true);
    const arrWorkflowEmail: Array<IUserNotifications> = this.arrWorkflowNotifications.filter(x => x.email_notification === true);

    const arrAccountApp: Array<IUserNotifications> = this.arrAccountNotifications.filter(x => x.in_app_notification === true);
    const arrAccountEmail: Array<IUserNotifications> = this.arrAccountNotifications.filter(x => x.email_notification === true);

    const arrAppNotifications = arrTasksApp.concat(arrProjectApp).concat(arrWorkflowApp).concat(arrAccountApp);
    const arrEmailNotifications = arrTasksEmail.concat(arrProjectEmail).concat(arrWorkflowEmail).concat(arrAccountEmail);

    const arrApp: Array<number> = arrAppNotifications.map(({ id }) => id);
    const arrEmail: Array<number> = arrEmailNotifications.map(({ id }) => id);
    const params = {
      in_app_notification: arrApp,
      email_notification: arrEmail
    };
    this.accountSettingsService.updateUsersNotifications(params).subscribe(res => {
      if (res) {
        this.modelType = 'task';
        this.notifier.displaySuccessMsg(res.detail);
      }
    }, (error) => {
      const errorMsg = error && error.error && error.error.detail ? error.error.detail : Messages.errors.serverErr;
      this.notifier.displayErrorMsg(errorMsg);
    });
  }

  /**
   * Revert changes by user for notification settings
   */
  cancel = () => {
    this.getUsersNotifications('task');
    this.getUsersNotifications('project');
    this.getUsersNotifications('workflow');
    this.getUsersNotifications('account');
  }
}
