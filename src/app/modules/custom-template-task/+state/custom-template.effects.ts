import {Injectable} from '@angular/core';

import {Actions, createEffect, ofType} from '@ngrx/effects';
import {CustomTemplateTaskService} from '../custom-template-task.service';
import * as customTemplateActions from './custom-template.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {CustomTemplate} from '../custom-template-model';

@Injectable()
export class CustomTemplateEffects {
  constructor(
    private action$: Actions,
    private customTemplateTaskService: CustomTemplateTaskService
  ) {
  }

  customTemplateInfo$ = createEffect(() => this.action$.pipe(
    ofType(customTemplateActions.getTemplateTaskInfo),
    mergeMap((action) => this.customTemplateTaskService.getCustomTaskTemplateDetails(action.id)))
    .pipe(
      map(template => {
        const customTemplate = new CustomTemplate(template);
        return customTemplateActions.getTemplateTaskInfoSuccessfully({customTemplate})
      }),
      catchError(error => of(customTemplateActions.getTemplateInfoFailed(error)))
    )
  );
}
