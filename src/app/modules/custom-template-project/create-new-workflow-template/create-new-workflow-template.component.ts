import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTemplateWorkflowService } from '../custom-template-workflow.service';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';
@Component({
  selector: 'app-create-new-workflow-template',
  templateUrl: './create-new-workflow-template.component.html',
  styleUrls: ['./create-new-workflow-template.component.scss']
})
export class CreateNewWorkflowTemplateComponent implements OnInit, OnDestroy {
  stepSubs: Subscription;
  step = 'workflow-fields';
  templateId: number;
  public deleteToggle = false;
  public showModal = false;
  private ngDestroy$ = new Subject();
  public permisionList: any = {};
  private projectSubscribe: any;
  private featureSubscribe: any;
  public hasPagePermission = false;
  public inEditModeAndUserDoesNotHaveUpdatePermission = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<fromRoot.AppState>,
    private customTemplateWorkflowService: CustomTemplateWorkflowService
  ) {
    CustomTemplateWorkflowService.prevStep = 'new';
  }

  ngOnInit() {
    this.templateId = this.activatedRoute.snapshot.params.id;
    const stepParam = this.activatedRoute.snapshot.queryParams.step;

    this.stepSubs = CustomTemplateWorkflowService.changeStep.subscribe(data => {
      this.step = data.step;
    });

    // Get and check permissions for viewing task(s)
    this.featureSubscribe = this.store.select('features').subscribe((features) => {
      if (features.loaded && features.datas && features.datas.features) {
        if (features.datas.features.TASKTEMPLATE) {
          this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
            if (obj.loaded) {
              if (obj.datas && obj.datas.permission) {
                this.permisionList = obj.datas.permission;
                const hasViewPermission = !!(this.permisionList.tasktemplate_tasktemplate_view || this.permisionList.tasktemplate_tasktemplate_view_all);
                const inEditModeAndUserHasViewPermission = this.templateId && hasViewPermission;
                const inCreateModeAndUserHasCreatePermission = this.permisionList.tasktemplate_tasktemplate_create || this.permisionList.tasktemplate_tasktemplate_create_all;
                this.hasPagePermission = hasViewPermission && (inEditModeAndUserHasViewPermission || inCreateModeAndUserHasCreatePermission);

                this.inEditModeAndUserDoesNotHaveUpdatePermission = this.templateId &&
                  !this.permisionList.tasktemplate_tasktemplate_update && !this.permisionList.tasktemplate_tasktemplate_updae_all;
                if (this.inEditModeAndUserDoesNotHaveUpdatePermission) {
                  this.customTemplateWorkflowService.changeWizardStep('preview', 'readOnly');
                } else if (stepParam) {
                  this.customTemplateWorkflowService.changeWizardStep(stepParam, 'new');
                }
              }
            }
          });
        }
      }
    });
  }
  showConfirmModal() {
    this.showModal = true;
  }

  archiveTemplate(event) {
    const checked = event;
    if (checked) {
      this.customTemplateWorkflowService.removeWorkflowTemplate(this.templateId).pipe(takeUntil(this.ngDestroy$))
        .subscribe(data => {
          this.deleteToggle = false;
          this.router.navigateByUrl('main/custom-template-workflow');
        }, error => {
          // Todo: What should we do when request has error?
        });
    } else {
      this.showModal = false;
    }
  }


  ngOnDestroy() {
    if (this.stepSubs) {
      this.stepSubs.unsubscribe();
    }

    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }
    if (this.featureSubscribe) {
      this.featureSubscribe.unsubscribe();
    }
  }

}
