import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUsers } from '../../user-management.interface';
import { GroupService } from '../../group.service';
import { MessageService, IMessage } from '../../../../services/message.service';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';

@Component({
  selector: 'app-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public editForm: FormGroup;
  public arrUsers: Array<IUsers> = [];
  public arrUserIds: Array<number> = [];
  public submitted = false;
  public groupId = null;
  public memberId = 0;
  public showModal = {
    isRemoveMember: false
  };

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Init form
    this.initForm();

    // Getting group ids
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.groupId = id;
      this.getGroupDetails();
    } else {
      this.router.navigate(['/main/mygroupslist']);
    }
  }

  /**
   * Group search change event handler
   */
  initForm = (): void => {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  /**
   * Get group details
   */
  getGroupDetails = () => {
    this.groupService.work_group_by_id(this.groupId).subscribe(res => {
      if (res) {
        this.editForm = this.fb.group({
          name: res.name || '',
        });
        this.arrUsers = res.group_members;
        this.returnSelectedMemeber(this.arrUsers);
      }
    });
  }

  /**
   * Update group name
   */
  upddateGroupName = () => {
    this.submitted = false;
    if (this.editForm.invalid || !this.arrUsers.length) {
      this.submitted = true;
      return;
    }

    const params = {
      name: this.editForm.value.name
    };
    this.groupService.upddateGroupName(this.groupId, params).subscribe(res => {
      if (res) {
        this.updateGroupMember();
      }
    });
  }

  /**
   * Update group members
   */
  updateGroupMember = () => {
    const params = {
      group_members: this.arrUserIds
    };
    this.groupService.updateGroupMember(this.groupId, params).subscribe(res => {
      if (res) {
        const message: IMessage = {
          message: `${this.editForm.value.name} group updated successfully.`
        };
        this.messageService.recordCreatedUpdated(message);
        this.router.navigate(['main/mygroupslist']);
      }
    });
  }

  /**
   * Remove member confirm popup handler
   * @param response Popup confirmation response [boolean]
   */
  removeMemberConfirm = (response) => {
    if (response) {
      this.removeMember(this.memberId);
    } else {
      this.showModal.isRemoveMember = false;
    }
  }

  /**
   * Remove user from group
   * @param id User ID
   */
  removeMember = (id: number) => {
    this.showModal.isRemoveMember = false;
    const params = {
      group_member: id
    };
    this.groupService.removeUserFromGroups(this.groupId, params).subscribe(res => {
      if (res) {
        this.arrUsers = this.arrUsers.filter(user => user.id !== id);
        this.returnSelectedMemeber(this.arrUsers);
        this.notifier.displaySuccessMsg(res.detail);
      }
    }, (error) => {
      this.arrUsers.splice(1, 1);
    });
  }

  /**
   * Navigate to group listing
   */
  cancelAdd = (): void => {
    this.router.navigate(['main/mygroupslist']);
  }

  /**
   * Set selected users
   * @param arrUsers Users array
   */
  returnSelectedMemeber = (arrUsers: Array<IUsers>): void => {
    this.arrUserIds = [];
    this.arrUsers = arrUsers;
    if (this.arrUsers && this.arrUsers.length > 0) {
      this.arrUsers.map(obj => {
        this.arrUserIds.push(obj.id);
      });
    }
  }
}
