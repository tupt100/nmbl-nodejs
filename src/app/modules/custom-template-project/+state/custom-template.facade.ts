import {Injectable} from '@angular/core';
import {Action, select, Store} from '@ngrx/store';

import * as customTemplateSelector from './custom-template.selector';
import * as customTemplateActions from './custom-template.actions';
import {CustomField, Task} from '../custom-template-model';
import {Observable} from 'rxjs';

@Injectable()
export class CustomTemplateFacade {
  public get getTemplateLabel$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getTemplateName))
  }

  public get getWorkflowField$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getWorkflow))
  }

  public get getTemplateCustomFields$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getCustomField))
  }

  public get getTemplateTasks$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getTask))
  }

  public get getCustomTemplate$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getCustomTemplate))
  }

  constructor(private store: Store<any>) {
  }

  createCustomTemplateLabel(title: string) {
    this.dispatch(customTemplateActions.createLabel({title}))
  }

  createWorkflowField(workflow) {
    this.dispatch(customTemplateActions.createWorkflowField({workflow}))
  }

  createCustomFields(fields: CustomField[]) {
    let customFields;
    if (fields) {
      customFields = fields.map(c => new CustomField(c))
    }
    this.dispatch(customTemplateActions.createCustomFields({customFields}))
  }

  createTasks(tasks: Task[]) {
    let tasksArray;
    if (tasks) {
      tasksArray = tasks.map(c => new Task(c))
    }
    this.dispatch(customTemplateActions.createTasks({tasks: tasksArray}))
  }

  getTemplateInfo(id: number) {
    this.dispatch(customTemplateActions.getTemplateWorkflowInfo({id}));
  }

  resetTemplateInfo() {
    this.dispatch(customTemplateActions.resetTemplateInfo({}));
  }

  private dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
