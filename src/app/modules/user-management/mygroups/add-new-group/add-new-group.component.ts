import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUsers } from '../../user-management.interface';
import { GroupService } from '../../group.service';
import { MessageService, IMessage } from '../../../../services/message.service';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';

@Component({
  selector: 'app-add-new-group',
  templateUrl: './add-new-group.component.html',
  styleUrls: ['./add-new-group.component.scss']
})
export class AddNewGroupComponent implements OnInit {
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public editForm: FormGroup;
  public arrUsers: Array<IUsers> = [];
  public arrUserIds: Array<number> = [];
  public submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private groupService: GroupService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  /**
   * Initialize form
   */
  initForm = (): void => {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  /**
   * Navigate to my groups
   */
  cancelAdd = () => {
    this.router.navigate(['main/mygroupslist']);
  }

  /**
   * Validate form and create Group
   */
  addGroup = () => {
    this.submitted = false;
    if (this.editForm.invalid || !this.arrUsers.length) {
      this.submitted = true;
      return;
    }

    const params = {
      name: this.editForm.value.name,
      group_members: this.arrUserIds
    };
    this.groupService.createGroup(params).subscribe(res => {
      if (res) {
        const message: IMessage = {
          message: Messages.success.groupCreated
        };
        this.messageService.recordCreatedUpdated(message);
        this.router.navigate(['main/mygroupslist']);
      }
    }, (error) => {
      const errorMsg = error && error.error && error.error.detail && typeof error.error.detail === 'string' ?
        error.error.detail : Messages.errors.serverErr;
      this.notifier.displayErrorMsg(errorMsg);
    });
  }

  /**
   * Splicing user from array
   * @param index Array index
   */
  removeUser = (index: number): void => {
    this.arrUsers.splice(index, 1);
    this.arrUserIds.splice(index, 1);
  }

  /**
   * Set selected users
   * @param arrUsers Users array
   */
  returnSelectedMemeber = (arrUsers: Array<IUsers>) => {
    this.arrUserIds = [];
    this.arrUsers = arrUsers;
    if (this.arrUsers && this.arrUsers.length) {
      this.arrUsers.map(obj => {
        this.arrUserIds.push(obj.id);
      });
    }
  }

  /**
   * Check form validation and enable/disable submit button
   */
  isFormFilled = () => {
    if (this.editForm.valid && this.arrUserIds.length) {
      return true;
    } else {
      return false;
    }
  }
}
