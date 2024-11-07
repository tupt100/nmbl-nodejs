import {Injectable} from '@angular/core';

import {Actions, createEffect, ofType} from '@ngrx/effects';
import {CustomTemplateWorkflowService} from '../custom-template-workflow.service';
import * as customTemplateActions from './custom-template.actions';
import {catchError, mergeMap, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {CustomTemplate} from '../custom-template-model';

@Injectable()
export class CustomTemplateEffects {
  constructor(
    private action$: Actions,
    private customTemplateWorkflowService: CustomTemplateWorkflowService
  ) {
  }

  customTemplateInfo$ = createEffect(() => this.action$.pipe(
    ofType(customTemplateActions.getTemplateWorkflowInfo),
    mergeMap((action) => this.customTemplateWorkflowService.getCustomWorkflowTemplateDetails(action.id)))
    .pipe(
      map(template => {
        const customTemplate = new CustomTemplate(template);
        return customTemplateActions.getTemplateWorkflowInfoSuccessfully({customTemplate})
      }),
      catchError(error => of(customTemplateActions.getTemplateInfoFailed(error)))
    )
  );
}
