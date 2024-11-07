import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../permission.service';
import { GroupService } from '../../group.service';
import { IPermissions } from '../../user-management.interface';
import { MessageService, IMessage } from '../../../../services/message.service';
import { Messages } from 'src/app/services/messages';
import { NotifierComponent } from 'src/app/modules/ui-kit/notifier/notifier.component';
import * as fromRoot from '../../../../store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-edit-permission',
  templateUrl: './edit-permission.component.html',
  styleUrls: ['./edit-permission.component.scss']
})
export class EditPermissionComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public arrRequestPermission: Array<IPermissions> = [];
  public arrFieldPermission: Array<IPermissions> = [];
  public arrProjectPermission: Array<IPermissions> = [];
  public arrWorkflowPermission: Array<IPermissions> = [];
  public arrTaskPermission: Array<IPermissions> = [];
  public arrTaskTemplatePermission: Array<IPermissions> = [];
  public arrProjectTemplatePermission: Array<IPermissions> = [];
  public arrWorkflowTemplatePermission: Array<IPermissions> = [];
  public permissionId = 0;
  private featureSubscribe: any;
  public groupName = '';
  public originalGroupName = '';
  public templateFeatureIsOn = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private groupService: GroupService,
    private messageService: MessageService,
    private store: Store<fromRoot.AppState>
  ) { }

  ngOnInit() {
    this.listPermissionTypes();
    this.activatedRoute.params.subscribe(params => {
      this.permissionId = params.id || '';
    });
    this.featureSubscribe = this.store.select('features').subscribe((features) => {
      if (features.loaded && features.datas && features.datas.features) {
        this.templateFeatureIsOn = features.datas.features.TASKTEMPLATE;
      }
    })
  }

  /**
   * Get permission details
   */
  getPermissionById = () => {
    this.groupService.group_list_by_id(this.permissionId).subscribe(res => {
      if (res) {
        this.groupName = res.name as string;
        this.originalGroupName = res.name as string;

        // REQUESTS PERMISSION
        const defaultRequestsPermissions: Array<IPermissions> = res.request_permission as Array<IPermissions>;
        this.arrRequestPermission.map((obj: any) => {
          const found = defaultRequestsPermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // GLOBAL CUSTOM FIELD PERMISSION
        const defaultFieldPermissions: Array<IPermissions> = res.globalcustomfield_permission as Array<IPermissions>;
        this.arrFieldPermission.map((obj: any) => {
          const found = defaultFieldPermissions?.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // TASK PERMISSION
        const defaultTaskPermissions: Array<IPermissions> = res.task_permission as Array<IPermissions>;
        this.arrTaskPermission.map((obj: any) => {
          const found = defaultTaskPermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // WORKFLOW PERMISSION
        const defaultWorkflowPermissions: Array<IPermissions> = res.workflow_permission as Array<IPermissions>;
        this.arrWorkflowPermission.map((obj: any) => {
          const found = defaultWorkflowPermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // PROJECT PERMISSION
        const defaultProjectpermissions: Array<IPermissions> = res.project_permission as Array<IPermissions>;
        this.arrProjectPermission.map((obj: any) => {
          const found = defaultProjectpermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });


        // TASK TEMPLATE PERMISSION
        const defaultTaskTemplatePermissions: Array<IPermissions> = res.tasktemplate_permission as Array<IPermissions>;
        this.arrTaskTemplatePermission.map((obj: any) => {
          const found = defaultTaskTemplatePermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // PROJECT TEMPLATE PERMISSION
        const defaultProjectTemplatePermissions: Array<IPermissions> = res.projecttemplate_permission as Array<IPermissions>;
        this.arrProjectTemplatePermission.map((obj: any) => {
          const found = defaultProjectTemplatePermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

        // WORKFLOW TEMPLATE PERMISSION
        const defaultWorkflowTemplatePermissions: Array<IPermissions> = res.workflowtemplate_permission as Array<IPermissions>;
        this.arrWorkflowTemplatePermission.map((obj: any) => {
          const found = defaultWorkflowTemplatePermissions.some(el => el.id === obj.id);
          if (found) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });

      }
    });
  }

  /**
   * Get permission types
   */
  listPermissionTypes = (): void => {
    this.permissionService.listPermissionTypes().subscribe(res => {
      if (res) {
        this.arrRequestPermission = res.request_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrFieldPermission = res.globalcustomfield_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrProjectPermission = res.project_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrProjectPermission.splice(5, 0, this.arrProjectPermission[13]);
        this.arrProjectPermission.splice(14, 1);
        this.arrProjectPermission.splice(1, 0, this.arrProjectPermission[13]);
        this.arrProjectPermission.splice(14, 1);

        this.arrWorkflowPermission = res.workflow_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrWorkflowPermission.splice(1, 0, this.arrWorkflowPermission[13]);
        this.arrWorkflowPermission.splice(14, 1);
        const index = this.arrWorkflowPermission.findIndex(x => x.name === 'Create Task');
        // this.arrWorkflowPermission.splice(index, 1);

        this.arrTaskPermission = res.task_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrTaskPermission.splice(6, 0, this.arrTaskPermission[16]);
        this.arrTaskPermission.splice(17, 1);
        this.arrTaskPermission.splice(1, 0, this.arrTaskPermission[16]);
        this.arrTaskPermission.splice(17, 1);

        this.arrTaskTemplatePermission = res.tasktemplate_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrProjectTemplatePermission = res.projecttemplate_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];
        this.arrWorkflowTemplatePermission = res.workflowtemplate_permissions?.map(obj => ({ ...obj, checked: false })) as Array<IPermissions> || [];

        this.getPermissionById();
      }
    });
  }

  /**
   * Handler for request permissions
   * @param event Checkbox change event
   * @param permission Permission
   */
  requestPermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
  }

  /**
   * Handler for task permissions
   * @param event Checkbox change event
   * @param permission Permission
   */
  taskPermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
    this.arrTaskPermission.map((obj: any) => {
      if (
        permission.id === 2 || permission.id === 3 ||
        permission.id === 13 || permission.id === 43
      ) {
        if (obj.id === 1) {
          obj.checked = event.target.checked;
        }
      } else if (
        permission.id === 4 || permission.id === 6 || permission.id === 7 ||
        permission.id === 8 || permission.id === 10 || permission.id === 11 ||
        permission.id === 12 || permission.id === 14 || permission.id === 15 ||
        permission.id === 50 || permission.id === 54
      ) {
        if (obj.id === 1 || obj.id === 3) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 9) {
        if (obj.id === 1) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 51) {
        if (obj.id === 1 || obj.id === 2 || obj.id === 3) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 1) {
        if (obj.id === 44) {
          obj.checked = !event.target.checked;
        }
      } else if (permission.id === 44) {
        if (obj.id === 1) {
          obj.checked = !event.target.checked;
        }
      }
    });
  }

  /**
   * Handler for workflow permissions
   * @param event Checkbox change event
   * @param permission Permission
   */
  workflowPermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
    this.arrWorkflowPermission.map((obj: any) => {
      if (
        permission.id === 19 || permission.id === 21 || permission.id === 22 ||
        permission.id === 24 || permission.id === 25 || permission.id === 27 ||
        permission.id === 29 || permission.id === 47 || permission.id === 49 ||
        permission.id === 55
      ) {
        if (obj.id === 16 || obj.id === 18) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 17 || permission.id === 18 || permission.id === 26 || permission.id === 28) {
        if (obj.id === 16) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 52) {
        if (obj.id === 16 || obj.id === 17 || obj.id === 18) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 16) {
        if (obj.id === 45) {
          obj.checked = !event.target.checked;
        }
      } else if (permission.id === 45) {
        if (obj.id === 16) {
          obj.checked = !event.target.checked;
        }
      }
    });
  }

  /**
   * Handler for project permissions
   * @param event Checkbox change event
   * @param permission Permission
   */
  projectPermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
    this.arrProjectPermission.map((obj: any) => {
      if (
        permission.id === 31 || permission.id === 32 ||
        permission.id === 40 || permission.id === 42
      ) {
        if (obj.id === 30) {
          obj.checked = event.target.checked;
        }
      } else if (
        permission.id === 33 || permission.id === 34 || permission.id === 35 ||
        permission.id === 36 || permission.id === 38 || permission.id === 39 ||
        permission.id === 41 || permission.id === 48 || permission.id === 56
      ) {
        if (obj.id === 30 || obj.id === 32) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 53) {
        if (obj.id === 30 || obj.id === 31 || obj.id === 32) {
          obj.checked = event.target.checked;
        }
      } else if (permission.id === 30) {
        if (obj.id === 46) {
          obj.checked = !event.target.checked;
        }
      } else if (permission.id === 46) {
        if (obj.id === 30) {
          obj.checked = !event.target.checked;
        }
      }
    });
  }

  /**
 * Handler for task permissions
 * @param event Checkbox change event
 * @param permission Permission
 */
   taskTemplatePermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
  }

  /**
 * Handler for project permissions
 * @param event Checkbox change event
 * @param permission Permission
 */
   projectTemplatePermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
  }

  /**
 * Handler for workflow permissions
 * @param event Checkbox change event
 * @param permission Permission
 */
   workflowTemplatePermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
  }

  /**
   * Handler for field permissions
   * @param event Checkbox change event
   * @param permission Permission
   */
  fieldPermissionSettings = (event, permission: IPermissions) => {
    (permission as any).checked = event.target.checked;
  }

  /**
   * Handle select-all task checkbox
   * @param event Checkbox change event
   */
  selectAllTask = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrTaskPermission = this.arrTaskPermission.map(obj => (obj.id !== 44 ? { ...obj, checked: event.target.checked } : { ...obj, checked: false })) as Array<IPermissions>;
  }

  /**
   * Handle select-all workflow checkbox
   * @param event Checkbox change event
   */
  selectAllWorkflow = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrWorkflowPermission = this.arrWorkflowPermission.map(obj => (obj.id !== 45 ? { ...obj, checked: event.target.checked } : { ...obj, checked: false })) as Array<IPermissions>;
  }

  /**
   * Handle select-all project checkbox
   * @param event Checkbox change event
   */
  selectAllProject = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrProjectPermission = this.arrProjectPermission.map(obj => (obj.id !== 46 ? { ...obj, checked: event.target.checked } : { ...obj, checked: false })) as Array<IPermissions>;
  }

  /**
  * Handle select-all task template checkbox
  * @param event Checkbox change event
  */
   selectAllTaskTemplate = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrTaskTemplatePermission = this.arrTaskTemplatePermission.map(obj => { return { ...obj, checked: event.target.checked } }) as Array<IPermissions>;
  }

  /**
  * Handle select-all project template checkbox
  * @param event Checkbox change event
  */
   selectAllProjectTemplate = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrProjectTemplatePermission = this.arrProjectTemplatePermission.map(obj => { return { ...obj, checked: event.target.checked } }) as Array<IPermissions>;
  }

  /**
  * Handle select-all workflow template checkbox
  * @param event Checkbox change event
  */
   selectAllWorkflowTemplate = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrWorkflowTemplatePermission = this.arrWorkflowTemplatePermission.map(obj => { return { ...obj, checked: event.target.checked } }) as Array<IPermissions>;
  }

  /**
   * Handle select-all field checkbox
   * @param event Checkbox change event
   */
  selectAllField = (event) => {
    // tslint:disable-next-line:max-line-length
    this.arrFieldPermission = this.arrFieldPermission.map(obj => ({ ...obj, checked: event.target.checked })) as Array<IPermissions>;
  }

  /**
   * Validate form and enable/disable submit button
   */
  isValidForm = (): boolean => {
    const arrPermission: Array<IPermissions> = this.arrRequestPermission.concat(
      this.arrTaskPermission).concat(this.arrWorkflowPermission).concat(this.arrProjectPermission)
      .concat(this.arrTaskTemplatePermission).concat(this.arrProjectTemplatePermission).concat(this.arrWorkflowTemplatePermission);
    const data: Array<IPermissions> = arrPermission.filter((x: any) => x.checked === true);

    return data && data.length ? true : false;
  }

  /**
   * Update permission
   */
  updatePermission = () => {
    if (!this.groupName || !this.groupName.trim().length) {
      this.groupName = '';
      window.scroll(0, 0);
      return this.notifier.displayErrorMsg(Messages.notifier.groupNameRequired);
    }

    const arrRequestsPermission: Array<IPermissions> = this.arrRequestPermission.filter((x: any) => x.checked === true);
    const arrTasksPermission: Array<IPermissions> = this.arrTaskPermission.filter((x: any) => x.checked === true);
    const arrTaskTemplatesPermission: Array<IPermissions> = this.arrTaskTemplatePermission.filter((x: any) => x.checked === true);
    const arrProjectTemplatesPermission: Array<IPermissions> = this.arrProjectTemplatePermission.filter((x: any) => x.checked === true);
    const arrWorkflowTemplatesPermission: Array<IPermissions> = this.arrWorkflowTemplatePermission.filter((x: any) => x.checked === true);
    const arrWorkflowPermission: Array<IPermissions> = this.arrWorkflowPermission.filter((x: any) => x.checked === true);
    const arrProjectPermission: Array<IPermissions> = this.arrProjectPermission.filter((x: any) => x.checked === true);
    const arrFieldPermission: Array<IPermissions> = this.arrFieldPermission.filter((x: any) => x.checked === true);

    const arrPermission: Array<IPermissions> = arrRequestsPermission.concat(
      arrTasksPermission).concat(arrWorkflowPermission).concat(arrProjectPermission).concat(arrFieldPermission)
      .concat(arrTaskTemplatesPermission).concat(arrProjectTemplatesPermission).concat(arrWorkflowTemplatesPermission);
    const defaultPermissions: Array<number> = arrPermission.map(({ id }) => id);

    if (defaultPermissions && defaultPermissions.length) {
      const params = {
        default_permissions: defaultPermissions,
      };
      this.permissionService.updatePermission(this.permissionId, params).subscribe(res => {
        if (this.originalGroupName !== this.groupName) {
          this.updateGroupName();
        } else {
          const mssage: IMessage = {
            message: Messages.notifier.updatedRole
          };
          this.messageService.recordCreatedUpdated(mssage);
          this.router.navigate(['main/permission-manager']);
        }

      }, (error) => {
        const errorMsg = error && error.error && error.error.detail &&
          typeof error.error.detail === 'string' ? error.error.detail : Messages.errors.serverErr;
        const mssage: IMessage = {
          message: errorMsg,
          error: true
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['main/permission-manager']);
      });
    }
  }

  /**
   * Update permission group name
   */
  updateGroupName = () => {
    const params = {
      name: this.groupName,
    };
    this.permissionService.updatePermissionGroup(this.permissionId, params).subscribe(res => {
      const mssage: IMessage = {
        message: Messages.notifier.updatedRole
      };
      this.messageService.recordCreatedUpdated(mssage);
      this.router.navigate(['main/permission-manager']);
    }, (error) => {
      const errorMsg = error && error.error && error.error.detail &&
        typeof error.error.detail === 'string' ? error.error.detail : Messages.errors.serverErr;
      const mssage: IMessage = {
        message: errorMsg,
        error: true
      };
      this.messageService.recordCreatedUpdated(mssage);
      this.router.navigate(['main/permission-manager']);
    });
  }

  /**
   * Navigate to permission manager
   */
  cancel = () => {
    this.messageService.recordCreatedUpdated(null);
    this.router.navigate(['main/permission-manager']);
  }

  /**
 * Unsubscribing observables
 */
  ngOnDestroy() {
    if (this.featureSubscribe) {
      this.featureSubscribe.unsubscribe();
    }
  }
}
