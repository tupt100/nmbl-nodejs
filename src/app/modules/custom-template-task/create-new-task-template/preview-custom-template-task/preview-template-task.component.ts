import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTemplateTaskService } from '../../custom-template-task.service';
import { take, mergeMap, switchMap, takeUntil, filter, catchError } from 'rxjs/operators';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';
import { CustomTemplate, Task } from '../../custom-template-model';
import { CustomField } from '../../custom-template-model';
import { forkJoin, of, Subject } from 'rxjs';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../store';
import { TaskService } from 'src/app/modules/projects/task/task.service';
import { Messages } from 'src/app/services/messages';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
@Component({
  selector: 'app-preview-template-task',
  templateUrl: './preview-template-task.component.html',
  styleUrls: ['./preview-template-task.component.scss']
})
export class PreviewTemplateTaskComponent implements OnInit, OnDestroy {
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  form: FormGroup;
  templateLabel$ = this.customTemplateFacade.getTemplateLabel$;
  templateTask$ = this.customTemplateFacade.getTaskField$;
  customFields$ = this.customTemplateFacade.getTemplateCustomFields$;
  customTemplate$ = this.customTemplateFacade.getCustomTemplate$;
  task: Task;
  templateLabel: { title: string };
  templateId: number;
  customFields: CustomField[];
  customTemplate: CustomTemplate;
  public permisionList: any = {};
  private projectSubscribe: any;

  private ngDestroy$ = new Subject();
  inEditModeAndUserDoesNotHaveUpdatePermission = false;
  tempErrorFlag = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customTemplateFacade: CustomTemplateFacade,
    private store: Store<fromRoot.AppState>,
    private customTemplateTaskService: CustomTemplateTaskService,
    private taskService: TaskService,
  ) {
    this.createForm(formBuilder);
  }

  ngOnInit(): void {
    this.templateId = this.activatedRoute.snapshot.params.id;

    this.templateLabel$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {

      this.templateLabel = data;
      this.form.patchValue(data);
      this.form.get('title').setValue(data)
    });
    this.templateTask$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
      this.task = data;
      this.form.patchValue(data);
      this.assignTaskDetails(data);
      this.createPrivilege(data);
    });
    this.customFields$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
      this.customFields = data;
      this.createField(data);
    });
    this.customTemplate$.pipe(takeUntil(this.ngDestroy$)).subscribe(customTemplate => {
      this.customTemplate = customTemplate;
      if (customTemplate['title'] && this.templateId) {
        this.form.patchValue({ title: customTemplate['title'] });
      }
    });

    this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
      if (!obj.loaded) { return; }
      if (!obj.datas || !obj.datas.permission) { return; }
      this.permisionList = obj.datas.permission;
      if (!this.templateId) { return; }
      this.inEditModeAndUserDoesNotHaveUpdatePermission = this.templateId && !this.permisionList.tasktemplate_tasktemplate_update && !this.permisionList.tasktemplate_tasktemplate_updae_all;
      if (!this.inEditModeAndUserDoesNotHaveUpdatePermission) { return; }
      this.customTemplateFacade.getTemplateInfo(this.templateId);
      this.customTemplate$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
        if (data['title']) {
          this.form.patchValue(data);
        }
        if (!data['task']) { return; }
        this.form.patchValue(data['task']);
        this.createField(data.fields);
        this.createPrivilege(data.task);
        this.assignTaskDetailsFromDb(data.task);
      });
    });
  }

  createForm(formBuilder) {
    this.form = formBuilder.group({
      title: [{ value: '', disabled: false, isRequired: true }],
      taskName: [{ value: '', disabled: true }],
      importance: [{ value: '', disabled: true }],
      workFlow: [{ value: '', disabled: true }],
      user: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      group: [{ value: '', disabled: true }],
      dueDate: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      fields: formBuilder.array([]),
      privileges: formBuilder.array([]),
      isPrivate: [{ value: false, disabled: true }]
    });
  }

  assignTaskDetails(data) {
    if (!data['user']) return;
    data.user.map(u => this.form.patchValue({ user: u?.name }));
    data.group.map(g => this.form.patchValue({ group: g?.name }));
    data.workFlow.map(w => this.form.patchValue({ workFlow: w?.name }));
  }

  assignTaskDetailsFromDb(data) {
    if (data.user) {
      this.taskService.getUsers().subscribe(users => {
        const user = users.results.find(a => a.id === data.user);
        this.form.patchValue({ user: user ? user.first_name + ' ' + user.last_name : "" })
      })
    }
    if (data.workFlow) {
      this.taskService.getWorkFlows().subscribe(workflows => {
        const workFlow = workflows.results.find(a => a.workflow.id === data.workFlow);
        this.form.patchValue({ workFlow: workFlow?.workflow.name })
      })
    }
    if (data.group) {
      this.taskService.getWorkGroups().subscribe(workGroups => {
        data.group.forEach(gr => {
          const workGroup = workGroups.results.find(a => a.id === gr);
          this.form.patchValue({ group: workGroup?.name })
        });
      })
    }
  }

  createPrivilege(data) {
    const privileges = this.form.get('privileges') as FormArray;
    data.privileges.forEach(item => (privileges.push(this.formBuilder.group({
      title: item.title,
      checked: item.checked
    }))))
  }

  createField(data) {
    const fields = this.form.get('fields') as FormArray;
    data.forEach(item => (fields.push(this.formBuilder.group({
      label: [{ value: item.label, disabled: true }],
      defaultValue: [{ value: item.defaultValue, disabled: true }],
      fieldType: [{ value: item.fieldType, disabled: true }],
      description: [{ value: item.description, disabled: true }],
      isRequired: item.isRequired
    }))));
  }

  back() {
    this.customTemplateFacade.createCustomTemplateLabel(this.form.get("title").value);
    this.customTemplateTaskService.changeWizardStep('custom-field', 'preview');
  }

  findDifference(taskTemplate: CustomTemplate) {
    return _.differenceWith(this.customFields, taskTemplate.fields, _.isEqual);
  }

  saveCustomTemplate(valid, formValue) {
    if(this.form.get("title").value.length>40){
      return this.notifier.displayErrorMsg(Messages.errors.taskTemplateNameLength);
    }
    if (this.task.user.length > 0) {
      this.task.user = this.task.user[0].id;
    }
    if (this.task.workFlow.length > 0) {
      this.task.workFlow = this.task.workFlow[0].id;
    }
    if (this.task.group.length > 0) {
      this.task.group = this.task.group.map(g => g.id);
    }
    const differFields = this.findDifference(this.customTemplate);
    if (this.templateId) {
      if (this.templateLabel.title !== this.form.get('title').value ||
        JSON.stringify(this.task) !== JSON.stringify(this.customTemplate.task)) {
        const updateTemplate = { ...this.templateLabel, ...this.task };
        updateTemplate.title = this.form.get('title').value;
        this.customTemplateTaskService.updateTaskTemplate(updateTemplate, this.templateId).pipe(
          mergeMap(res => {
            if (differFields.length > 0) {
              return forkJoin(
                differFields.map(field => {
                  if (!field.id) {
                    return this.customTemplateTaskService.createCustomField({ ...field, taskTemplateId: this.templateId })
                  } else if (field.deleted) {
                    return this.customTemplateTaskService.removeCustomField(field, this.templateId);
                  } else {
                    return this.customTemplateTaskService.updateCustomField({
                      ...field,
                      taskTemplateId: res['pk']
                    }, field.id)
                  }
                }
                ))
            } else {
              return of([]);
            }
          })).subscribe(res => {
            this.goToDashboard();
          })
      } else if (differFields.length > 0) {
        forkJoin(differFields.map(field => {
          if (!field.id) {
            return this.customTemplateTaskService.createCustomField({ ...field, taskTemplateId: this.templateId })
          } else if (field.deleted) {
            return this.customTemplateTaskService.removeCustomField(field, this.templateId);
          } else {
            return this.customTemplateTaskService.updateCustomField({
              ...field,
              taskTemplateId: this.templateId
            }, field.id)
          }
        })).subscribe(res => {
          this.goToDashboard();
        })
      } else {
        this.goToDashboard();
      }
    } else {
      const template = { ...this.templateLabel, ...this.task };
      template.title = this.form.get('title').value;
      this.customTemplateTaskService.createTaskTemplate(template)
        .pipe(
          mergeMap(res => {
            if (this.customFields.length > 0) {
              return forkJoin(this.customFields.map(field => {
                if (field && !field.deleted) {
                  return this.customTemplateTaskService.createCustomField({ ...field, taskTemplateId: res['pk'] }).pipe(catchError((error) => {
                    this.tempErrorFlag = true
                    return this.customTemplateTaskService.removeTaskTemplate(res['pk'])
                  }))
                } else {
                  return of([]);
                }
              }
              ))
            } else {
              return of([]);
            }
          })).subscribe(data => {
            if (!this.tempErrorFlag) {
              this.goToDashboard();
            }
          })
    }
  }

  goToDashboard() {
    this.router.navigateByUrl('main/custom-template-task');
  }

  ngOnDestroy() {
    this.ngDestroy$.next();

    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }
  }
}
