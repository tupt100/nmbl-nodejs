import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IGroups } from '../../user-management.interface';
import { MessageService, IMessage } from '../../../../services/message.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  public errorMessage = '';
  public editForm: FormGroup;
  public userId = 0;
  public groupId = null;
  public name = '';
  public arrGroups: Array<IGroups> = [];
  public submitted = false;
  public showModal = {
    isRemoveUser: false
  };

  constructor(
    private fb: FormBuilder, private activatedRoute: ActivatedRoute,
    private router: Router, private userService: UserService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.initForm();
    this.activatedRoute.params.subscribe( params => {
      this.userId = params.userId || '';
      if (this.userId) {
        this.getCompanyUserDetails(this.userId);
      }
    });
  }

  /**
   * Initialize creation view
   */
  initForm = (): void => {
    this.editForm = this.fb.group({
      email: '',
      firstName: ['', Validators.required, Validators.maxLength(50)],
      lastName: ['', Validators.required, Validators.maxLength(50)],
      title: ['', Validators.maxLength(50)],
      permissionGroup: ['', Validators.required],
    });
  }

  /**
   * @param userId userId
   * Function to return specific user's details by userId
   */
  getCompanyUserDetails = (userId: number): void => {
    this.userService.getCompanyUserDetails(userId).subscribe((res: any) => {
      if (res) {
        this.editForm = this.fb.group({
          email: res.email || '',
          firstName: res.first_name || '',
          lastName: res.last_name || '',
          title: res.title || '',
        });
        this.name = `${res.first_name} ${res.last_name}`;
        this.groupId = +`${res.group}`;
      }
    });
  }

  /**
   * @param response response
   * Function to display confirmation popup to remove user
   */
  removeUserConfirm = (response): void => {
    if (response) {
      this.removeUser(this.userId);
    } else {
      this.showModal.isRemoveUser = false;
    }
  }

  /**
   * @param userId userId
   * Function to remove user from list
   */
  removeUser = (userId: number): void => {
    this.showModal.isRemoveUser = false;
    this.userService.removeUser(userId).subscribe( res => {
      const mssage: IMessage = {
        message: 'User Updated Successfully!'
      };
      this.messageService.recordCreatedUpdated(mssage);
      this.router.navigate(['main/users-and-permissions']);
    });
  }

  /**
   * Function to cancel user edit
   */
  cancelEdit = (): void => {
    this.router.navigate(['main/users-and-permissions']);
  }

  /**
   * @param groupId groupId
   * Function to set groupId globally through out the page
   */
  getGroup = (groupId: number): void => {
    this.groupId = groupId ? groupId : null;
  }

  /**
   * Function to update user details
   */
  updateUser = (): void => {
    if (this.editForm.valid) {
      const params = {
        first_name: this.editForm.value.firstName,
        last_name: this.editForm.value.lastName,
        group: this.groupId,
        title: this.editForm.value.title
      };
      this.userService.updateUser(this.userId, params).subscribe( res => {
        const mssage: IMessage = {
          message: `${this.editForm.value.firstName} ${this.editForm.value.lastName} has been updated`
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['main/users-and-permissions']);
      });
    } else {
      this.submitted = true;
    }
  }
}
