import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IPermissionManager } from '../../user-management.interface';
import { PermissionService } from '../../permission.service';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
import { MessageService } from '../../../../services/message.service';
import * as fromRoot from '../../../../store';
import { Store } from '@ngrx/store';


export const userFilter = {
  name: 'name'
};

@Component({
  selector: 'app-permission-manager',
  templateUrl: './permission-manager.component.html',
  styleUrls: ['./permission-manager.component.scss']
})
export class PermissionManagerComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  private groupSubscribe: Subscription;
  public arrPermissionManager: Array<IPermissionManager> = [];
  public totalRecords = 0;
  public permissionId = 0;
  private featureSubscribe: any;
  public templateFeatureIsOn = false;
  public defaultParams = {
    limit: 10,
    offset: 0,
    ordering: '',
  };
  public showModal = {
    isRemovePermission: false
  };

  constructor(
    private router: Router,
    private permissionService: PermissionService,
    private messageService: MessageService,
    private store: Store<fromRoot.AppState>,
  ) { }

  ngOnInit() {
    // Set user set limit
    const perPage = localStorage.getItem('perPage');
    if (perPage) {
      this.defaultParams.limit = +perPage === 12 ? 10 : +perPage;
    }
    this.listPermission();
    this.featureSubscribe = this.store.select('features').subscribe((features) => {
      if (features.loaded && features.datas && features.datas.features) {
        this.templateFeatureIsOn = features.datas.features.TASKTEMPLATE;
      }
    });

    this.isRecordCreatedUpdated();
  }

  /**
   * List permissions roles
   */
  listPermission = (): void => {
    this.permissionService.listPermission(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.totalRecords = res.count as number;
        this.arrPermissionManager = res.results as Array<IPermissionManager>;
      }
    });
  }

  /**
   * Paginator handler
   * @param offset Offset for listing
   */
  loadMorePermission = (offset: number) => {
    this.defaultParams.offset = offset;
    window.scroll(0, 0);
    this.listPermission();
  }

  /**
   * Sorting handler for roles
   */
  sortUsersBy = (fieldName: string): void => {
    if (fieldName === 'name') {
      this.defaultParams.ordering = userFilter.name = (userFilter.name === 'name') ? '-name' : 'name';
    }
    this.listPermission();
  }

  /**
   * Navigate to add new permission
   */
  addNewPermission = (): void => {
    this.router.navigate(['main/add-new-permission']);
  }

  /**
   * Navigate to edit permission
   */
  editPermission = (id: number): void => {
    this.router.navigate(['main/edit-permission', id]);
  }

  /**
   * Handle remove permission
   * @param permission Permission
   */
  removePermissionNavigate = (permission: IPermissionManager): void => {
    if (permission.users_count > 0) {
      this.router.navigate(['main/remove-permission', permission.id]);
    } else {
      this.permissionId = permission.id;
      this.showModal.isRemovePermission = true;
    }
  }

  /**
   * Handle remove permission confirmation popup
   * @param response Popup response [boolean]
   */
  removePermissionConfirm = (response) => {
    if (response) {
      this.removePermission(this.permissionId);
    } else {
      this.showModal.isRemovePermission = false;
    }
  }

  /**
   * Remove permission
   * @param id Permission ID
   */
  removePermission = (id: number) => {
    this.showModal.isRemovePermission = false;
    const params = {
      users_updated_roles: []
    };
    this.permissionService.removePermissionWithUser(id, params).subscribe(res => {
      if (res) {
        this.notifier.displaySuccessMsg(res.detail);
        this.listPermission();
      }
    });
  }

  /**
   * Show notification for any update/remove event.
   */
  isRecordCreatedUpdated = () => {
    this.groupSubscribe = this.messageService.$isRecordCreatesUpdated.subscribe(res => {
      if (res) {
        if (res.error) {
          this.notifier.displayErrorMsg(res.message);
        } else {
          this.notifier.displaySuccessMsg(res.message);
        }
      }
    });
  }

  /**
   * Handler for view by changes
   * @param perPage Limit per page
   */
  setPerPage = (perPage) => {
    window.scroll(0, 0);
    this.defaultParams.limit = perPage;
    this.defaultParams.offset = 0;
    this.listPermission();
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.groupSubscribe) {
      this.messageService.recordCreatedUpdated(null);
      this.groupSubscribe.unsubscribe();
    }
    if (this.featureSubscribe) {
      this.featureSubscribe.unsubscribe();
    }
  }
}
