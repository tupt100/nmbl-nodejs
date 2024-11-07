import {Injectable} from '@angular/core';
import {Action, select, Store} from '@ngrx/store';

import * as customTemplateSelector from './custom-template.selector';
import * as customTemplateActions from './custom-template.actions';
import {CustomField} from '../custom-template-model';
import {Observable} from 'rxjs';

@Injectable()
export class CustomTemplateFacade {
  public get getTemplateLabel$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getTemplateName))
  }

  public get getTaskField$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getTask))
  }

  public get getTemplateCustomFields$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getCustomField))
  }

  public get getCustomTemplate$(): Observable<any> {
    return this.store.pipe(select(customTemplateSelector.getCustomTemplate))
  }

  constructor(private store: Store<any>) {
  }

  createCustomTemplateLabel(title: string) {
    this.dispatch(customTemplateActions.createLabel({title}))
  }

  createTaskField(task) {
    this.dispatch(customTemplateActions.createTaskField({task}))
  }

  createCustomFields(fields: CustomField[]) {
    let customFields;
    if (fields) {
      customFields = fields.map(c => new CustomField(c))
    }
    this.dispatch(customTemplateActions.createCustomFields({customFields}))
  }

  getTemplateInfo(id: number) {
    this.dispatch(customTemplateActions.getTemplateTaskInfo({id}));
  }

  resetTemplateInfo() {
    this.dispatch(customTemplateActions.resetTemplateInfo({}));
  }

  private dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
