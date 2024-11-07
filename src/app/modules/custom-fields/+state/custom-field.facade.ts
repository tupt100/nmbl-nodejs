import {Injectable} from '@angular/core';
import {Action, select, Store} from '@ngrx/store';

import * as customFieldSelector from './custom-field.selector';
import * as customFieldActions from './custom-field.actions';
import {CustomField} from '../custom-field-model';
import {Observable} from 'rxjs';

@Injectable()
export class CustomFieldFacade {

  public get getCustomFields$(): Observable<any> {
    return this.store.pipe(select(customFieldSelector.getCustomFields))
  }

  public get getCustomField$(): Observable<any> {
    return this.store.pipe(select(customFieldSelector.getCustomField))
  }

  constructor(private store: Store<any>) {
  }

  createCustomFields(fields: CustomField[]) {
    let customFields;
    if (fields) {
      customFields = fields.map(c => new CustomField(c))
    }
    this.dispatch(customFieldActions.createCustomFields({customFields}))
  }

  getCustomFieldInfo(id: number) {
    this.dispatch(customFieldActions.getCustomFieldInfo({id}));
  }

  resetCustomFieldInfo() {
    this.dispatch(customFieldActions.resetCustomFieldInfo({}));
  }

  private dispatch(action: Action) {
    this.store.dispatch(action);
  }
}
