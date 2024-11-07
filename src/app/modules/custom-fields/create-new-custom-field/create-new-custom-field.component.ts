import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalCustomFieldService } from '../custom-field.service';
import { Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';
@Component({
  selector: 'app-create-new-custom-field',
  templateUrl: './create-new-custom-field.component.html',
  styleUrls: ['./create-new-custom-field.component.scss']
})
export class CreateNewCustomFieldComponent implements OnInit, OnDestroy {
  stepSubs: Subscription;
  step = 'custom-field';
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
    private globalCustomFieldService: GlobalCustomFieldService
  ) {
    GlobalCustomFieldService.prevStep = 'new';
  }

  ngOnInit() {
    this.templateId = this.activatedRoute.snapshot.params.id;
    const stepParam = this.activatedRoute.snapshot.queryParams.step;


    this.stepSubs = GlobalCustomFieldService.changeStep.subscribe(data => {
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
                  this.globalCustomFieldService.changeWizardStep('preview', 'readOnly');
                } else if (stepParam) {
                  this.globalCustomFieldService.changeWizardStep(stepParam, 'new');
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
      this.globalCustomFieldService.removeCustomField(this.templateId).pipe(takeUntil(this.ngDestroy$))
        .subscribe(data => {
          this.deleteToggle = false;
          this.router.navigateByUrl('main/custom-fields');
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
