import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';

@Component({
  selector: 'app-workflow-template-add-dropdown',
  templateUrl: './template-add-dropdown.component.html',
  styleUrls: ['./template-add-dropdown.component.scss']
})
export class WorkflowTemplateAddDropdownComponent implements OnInit, OnDestroy {
  templates = [];
  loading: boolean;
  searchText: String;
  timer: any;
  public permisionList: any = {};
  private projectSubscribe;
  private objFeatures$;
  @Output() addNewWorkflowTemplate: EventEmitter<void> = new EventEmitter();
  constructor(
    public sharedService: SharedService,
    private store: Store<fromRoot.AppState>
  ) { }

  showAddTaskDropdown = false;
  ngOnInit(): void {
    this.objFeatures$ = this.store.select('features').subscribe((features) => {
      if (features.loaded && features.datas && features.datas.features) {
        if (features.datas.features.TASKTEMPLATE) {
          this.projectSubscribe = this.store.select('permissionlist').subscribe((obj) => {
            if (obj.loaded) {
              if (obj.datas && obj.datas.permission) {
                this.permisionList = obj.datas.permission;
              }
            }
          });
        }
      }
    })
  }








  goToAddTaskTemplate = () => {
    this.addNewWorkflowTemplate.emit();
  }
  toggleAddTaskDropdown = () => {
    this.showAddTaskDropdown = !this.showAddTaskDropdown;
  }

  /**
* Life cycle hook when component unmount (unsubscribing observabels)
*/
  ngOnDestroy() {
    if (this.projectSubscribe) {
      this.projectSubscribe.unsubscribe();
    }

    if (this.objFeatures$) {
      this.objFeatures$.unsubscribe();
    }
  }

}
