import {Injectable} from '@angular/core';

import {Actions, createEffect, ofType} from '@ngrx/effects';
import {GlobalCustomFieldService} from '../custom-field.service';
import * as customFieldActions from './custom-field.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {CustomField} from '../custom-field-model';

@Injectable()
export class CustomFieldEffects {
  constructor(
    private action$: Actions,
    private globalCustomFieldService: GlobalCustomFieldService
  ) {
  }

  customFieldInfo$ = createEffect(() => this.action$.pipe(
    ofType(customFieldActions.getCustomFieldInfo),
    mergeMap((action) => this.globalCustomFieldService.getCustomFieldDetails(action.id)))
    .pipe(
      map(field => {
        const customField = new CustomField(field);
        return customFieldActions.getCustomFieldInfoSuccessfully({customField})
      }),
      catchError(error => of(customFieldActions.getCustomFieldInfoFailed(error)))
    )
  );
}
