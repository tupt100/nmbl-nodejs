import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../permission.service';
import { IUserDetails } from '../../user-management.interface';
import { MessageService, IMessage } from '../../../../services/message.service';

@Component({
  selector: 'app-remove-permission',
  templateUrl: './remove-permission.component.html',
  styleUrls: ['./remove-permission.component.scss']
})
export class RemovePermissionComponent implements OnInit {
  /**
   * Bindings
   */
  public groupName = '';
  public groupId = 0;
  public arrUserDetails: Array<IUserDetails> = [];
  public showModal = {
    isRemovePermission: false
  };
  private arrUserRole: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Getting role id from params
    this.activatedRoute.params.subscribe(params => {
      this.groupId = params.id || '';
      if (this.groupId) {
        this.getPermissionDetails(this.groupId);
      }
    });
  }

  /**
   * Get permission role details
   * @param id Permission ID
   */
  getPermissionDetails = (id: number) => {
    this.permissionService.getPermissionById(id).subscribe(res => {
      if (res) {
        this.groupName = res.name as string;
        this.arrUserDetails = res.user_details as Array<IUserDetails>;
      }
    });
  }

  /**
   * Set new permission role for selected user
   * @param groupId Permission ID
   * @param userId User ID
   */
  getGroup = (groupId: number, userId: number) => {
    const params = {
      user: userId,
      role: groupId
    };
    if (this.arrUserRole && this.arrUserRole.length) {
      const idx = this.arrUserRole.findIndex(x => x.user === userId);
      if (idx > -1) {
        this.arrUserRole.splice(idx, 1);
      }
      if (groupId !== 0) {
        this.arrUserRole.push(params);
      }
    } else {
      if (groupId === 0) {
        this.arrUserRole = [];
      } else {
        this.arrUserRole.push(params);
      }
    }
  }

  /**
   * Handler for remove permission popup
   * @param response Popup confirmation [boolean]
   */
  removePermissionConfirm = (response) => {
    if (response) {
      this.removePermission(this.groupId);
    } else {
      this.showModal.isRemovePermission = false;
    }
  }

  /**
   * Remove permission role
   * @param id Permission ID
   */
  removePermission = (id: number) => {
    this.showModal.isRemovePermission = false;
    const params = {
      users_updated_roles: this.arrUserRole
    };
    this.permissionService.removePermissionWithUser(id, params).subscribe(res => {
      if (res) {
        const mssage: IMessage = {
          message: 'Role removed Successfully!'
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['main/permission-manager']);
      }
    });
  }

  /**
   * Navigate to permission manager
   */
  cancel = () => {
    this.router.navigate(['main/permission-manager']);
  }
}
