import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow.service';
import { take, mergeMap, switchMap, takeUntil, filter, catchError } from 'rxjs/operators';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';
import { CustomTemplate, Task, CustomField, Workflow, TaskOutputModel } from '../../custom-template-model';
import { forkJoin, of, Subject } from 'rxjs';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../store';
import { TaskService } from 'src/app/modules/projects/task/task.service';
import { Messages } from 'src/app/services/messages';
import { NotifierComponent } from '../../../ui-kit/notifier/notifier.component';
@Component({
  selector: 'app-preview-template-workflow',
  templateUrl: './preview-template-workflow.component.html',
  styleUrls: ['./preview-template-workflow.component.scss']
})
export class PreviewTemplateWorkflowComponent implements OnInit, OnDestroy {
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  form: FormGroup;
  templateLabel$ = this.customTemplateFacade.getTemplateLabel$;
  templateWorkflow$ = this.customTemplateFacade.getWorkflowField$;
  customFields$ = this.customTemplateFacade.getTemplateCustomFields$;
  tasks$ = this.customTemplateFacade.getTemplateTasks$;
  customTemplate$ = this.customTemplateFacade.getCustomTemplate$;
  workflow: Workflow;
  templateLabel: { title: string };
  templateId: number;
  customFields: CustomField[];
  tasks: Task[];
  customTemplate: CustomTemplate;
  public permisionList: any = {};
  private projectSubscribe: any;
  childViews: any = {};
  saving: boolean = false;

  private ngDestroy$ = new Subject();
  inEditModeAndUserDoesNotHaveUpdatePermission = false;
  tempErrorFlag = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customTemplateFacade: CustomTemplateFacade,
    private store: Store<fromRoot.AppState>,
    private customTemplateWorkflowService: CustomTemplateWorkflowService,
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
    this.templateWorkflow$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
      this.workflow = data;
      this.form.patchValue(data);
      this.assignWorkflowDetails(data);
      this.createPrivilege(data);
    });
    this.customFields$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
      this.customFields = data;
      this.createField(data);
    });
    this.tasks$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {
      this.tasks = data;
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
        if (!data['workflow']) { return; }
        this.form.patchValue(data['workflow']);
        this.createField(data.fields);
        this.createPrivilege(data.workflow);
        this.assignWorkflowDetailsFromDb(data.workflow);
      });
    });
  }

  createForm(formBuilder) {
    this.form = formBuilder.group({
      title: [{ value: '', disabled: false, isRequired: true }],
      name: [{ value: '', disabled: true }],
      importance: [{ value: '', disabled: true }],
      project: [{ value: '', disabled: true }],
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

  assignWorkflowDetails(data) {
    if (!data['user']) return;
    data.user.map(u => this.form.patchValue({ user: u?.name }));
    data.group.map(g => this.form.patchValue({ group: g?.name }));
    data.project.map(w => this.form.patchValue({ project: w?.name }));
  }

  assignWorkflowDetailsFromDb(data) {
    if (data.user) {
      this.taskService.getUsers().subscribe(users => {
        const user = users.results.find(a => a.id === data.user);
        this.form.patchValue({ user: user ? user.first_name + ' ' + user.last_name : "" })
      })
    }
    if (data.project) {
      this.taskService.getProjects().subscribe(projects => {
        const project = projects.results.find(a => a.project.id === data.project);
        this.form.patchValue({ project: project?.project.name })
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
    this.customTemplateWorkflowService.changeWizardStep('tasks', 'preview');
  }

  findDifference(taskTemplate: CustomTemplate) {
    return _.differenceWith(this.customFields, taskTemplate.fields, _.isEqual);
  }

  findTasksDifference(taskTemplate: CustomTemplate) {
    return _.differenceWith(this.tasks, taskTemplate.tasks, _.isEqual);
  }

  saveCustomTemplate(valid, formValue) {
    try {
      this.saving = true;
      if(this.form.get("title").value.length>40){
        return this.notifier.displayErrorMsg(Messages.errors.taskTemplateNameLength);
      }
      if (this.workflow.user.length > 0) {
        this.workflow.user = this.workflow.user[0].id;
      }
      if (this.workflow.project.length > 0) {
        this.workflow.project = this.workflow.project[0].id;
      }
      if (this.workflow.group.length > 0) {
        this.workflow.group = this.workflow.group.map(g => g.id);
      }
      const differFields = this.findDifference(this.customTemplate);
      const differTasks = this.findTasksDifference(this.customTemplate);
      if (this.templateId) {
        if (this.templateLabel.title !== this.form.get('title').value ||
          JSON.stringify(this.workflow) !== JSON.stringify(this.customTemplate.workflow)) {
          const updateTemplate = { ...this.templateLabel, ...this.workflow };
          updateTemplate.title = this.form.get('title').value;
          this.customTemplateWorkflowService.updateWorkflowTemplate(updateTemplate, this.templateId).pipe(
            mergeMap(res => {
              let customFieldRequests = []
              let taskRequests = []
              if (differFields.length > 0) {
                customFieldRequests = differFields.map(field => {
                  if (!field.id) {
                    return this.customTemplateWorkflowService.createCustomField({ ...field, workflowTemplateId: this.templateId })
                  } else if (field.deleted) {
                    return this.customTemplateWorkflowService.removeCustomField(field, this.templateId);
                  } else {
                    return this.customTemplateWorkflowService.updateCustomField({
                      ...field,
                      workflowTemplateId: this.templateId
                    }, field.id)
                  }
                })
              }
              if (differTasks.length > 0) {
                taskRequests = differTasks.map(task => {
                  if (!task.id) {
                    return this.customTemplateWorkflowService.createTask(new TaskOutputModel({ ...task, workflow_template_id: this.templateId, attachments: [] }))
                  } else if (task.deleted) {
                    return this.customTemplateWorkflowService.removeTask(task.id);
                  } else {
                    return this.customTemplateWorkflowService.updateTask(new TaskOutputModel({ ...task, workflow_template_id: this.templateId, attachments: [] }), task.id)
                  }
                })
              }
  
              const requests = [...customFieldRequests, ...taskRequests]
              if (requests.length > 0) {
                return forkJoin(requests)
              } else {
                return of([]);
              }
            })).subscribe(res => {
              this.goToDashboard();
            })
        } else if (differFields.length > 0 || differTasks.length > 0) {
          let customFieldRequests = []
          let taskRequests = []
          if (differFields.length > 0) {
            customFieldRequests = differFields.map(field => {
              if (!field.id) {
                return this.customTemplateWorkflowService.createCustomField({ ...field, workflowTemplateId: this.templateId })
              } else if (field.deleted) {
                return this.customTemplateWorkflowService.removeCustomField(field, this.templateId);
              } else {
                return this.customTemplateWorkflowService.updateCustomField({
                  ...field,
                  workflowTemplateId: this.templateId
                }, field.id)
              }
            })
          }
          if (differTasks.length > 0) {
            taskRequests = differTasks.map(task => {
              if (!task.id) {
                return this.customTemplateWorkflowService.createTask(new TaskOutputModel({ ...task, workflow_template_id: this.templateId, attachments: [] }))
              } else if (task.deleted) {
                return this.customTemplateWorkflowService.removeTask(task.id);
              } else {
                return this.customTemplateWorkflowService.updateTask(new TaskOutputModel({ ...task, workflow_template_id: this.templateId, attachments: [] }), task.id)
              }
            })
          }
  
          const requests = [...customFieldRequests, ...taskRequests]
          forkJoin(requests).subscribe(res => {
            this.goToDashboard();
          })
        } else {
          this.goToDashboard();
        }
      } else {
        const template = { ...this.templateLabel, ...this.workflow };
        template.title = this.form.get('title').value;
        this.customTemplateWorkflowService.createWorkflowTemplate(template)
          .pipe(
            mergeMap(res => {
              let customFieldRequests = []
              let taskRequests = []
              if (this.customFields.length > 0) {
                customFieldRequests = this.customFields.filter(field => field && !field.deleted).map(field => {
                  return this.customTemplateWorkflowService.createCustomField({ ...field, workflowTemplateId: res['pk'] })
                })
              }
              if (this.tasks?.length > 0) {
                taskRequests = this.tasks.filter(task => task && !task.deleted).map(task => {
                  return this.customTemplateWorkflowService.createTask(new TaskOutputModel({ ...task, workflow_template_id: res['pk'], attachments: [] }))
                })
              }
              const requests = [...customFieldRequests, ...taskRequests]
              if (requests.length > 0) {
                return forkJoin(requests).pipe(catchError((error) => {
                  this.tempErrorFlag = true
                  return this.customTemplateWorkflowService.removeWorkflowTemplate(res['pk'])
                }))
              } else {
                return of([]);
              }
            })).subscribe(data => {
              if (!this.tempErrorFlag) {
                this.goToDashboard();
              }
            })
      }
    } catch(e) {
      this.saving = false;
    }
  }

  goToDashboard() {
    this.router.navigateByUrl('main/custom-template-workflow');
  }

  toggleChild(index) {
    const views = this.childViews
    this.childViews = {
      ...views,
      [index]: !views[index]
    }
  }

  getTaskUserName(task) {
    return (task && task.user?.length) ? task.user[0].name : ''
  }

  getTaskGroupName(task) {
    return (task && task.group?.length) ? task.group.map(t => t.name).join(', ') : ''
  }

  ngOnDestroy() {
    this.ngDestroy$.next();

    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }
  }
}
