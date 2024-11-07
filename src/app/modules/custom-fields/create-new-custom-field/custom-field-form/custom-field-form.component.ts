import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalCustomFieldService } from '../../custom-field.service';
import { CustomFieldFacade } from '../../+state/custom-field.facade';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-global-custom-field-form',
  templateUrl: './custom-field-form.component.html',
  styleUrls: ['./custom-field-form.component.scss']
})
export class CustomFieldFormComponent implements OnInit {
  @Input() preview = false;

  form: FormGroup;
  formFieldsArray: FormArray;
  taskFields;
  fieldId: number;
  customFields$ = this.customFieldFacade.getCustomFields$;  
  customField$ = this.customFieldFacade.getCustomField$;  
  private ngDestroy$ = new Subject();

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customFieldFacade: CustomFieldFacade,
    private globalCustomFieldService: GlobalCustomFieldService
  ) {
  }

  ngOnInit(): void {
    this.fieldId = this.activatedRoute.snapshot.params.id;

    this.createForm(this.formBuilder);

    if (this.fieldId) {
      this.customFieldFacade.getCustomFieldInfo(this.fieldId);
      this.customField$.pipe(takeUntil(this.ngDestroy$)).subscribe(data => {  
        if (Object.keys(data).length && data.id.toString() === this.fieldId) {
          this.patchFields({ fields: [{
            ...data,
            displayedOnProjects: data.allow_content_type ?.includes('project'),
            displayedOnWorkflows: data.allow_content_type?.includes('workflow'),
            displayedOnTasks: data.allow_content_type?.includes('task'),
          }] });
        }
      });
    } else {
      this.addItem()
    }

    this.customFields$.pipe(take(1)).subscribe(data => {
      this.patchFields({ fields: data });
    });
  }


  createForm(formBuilder) {
    this.form = formBuilder.group({
      fields: formBuilder.array([])
    });
  }

  createField() {
    return this.formBuilder.group({
      label: [null],
      defaultValue: [null],
      fieldType: ['Text'],
      description: [''],
      isRequired: false,
      id: '',
      taskTemplateId: '',
      deleted: false,
      displayedOnProjects: false,
      displayedOnWorkflows: false,
      displayedOnTasks: false,
    });
  }

  patchFields(data) {
    if (data.fields) {
      data.fields.forEach(item => (this.fields.push(this.formBuilder.group({
        label: item.label,
        defaultValue: item.defaultValue,
        fieldType: item.fieldType,
        description: item.description,
        isRequired: item.isRequired,
        id: item.id,
        taskTemplateId: item.taskTemplateId,
        deleted: item.deleted ? item.deleted : false,
        displayedOnProjects: item.displayedOnProjects,
        displayedOnWorkflows: item.displayedOnWorkflows,
        displayedOnTasks: item.displayedOnTasks,
      }))));
    }
  }

  addItem(): void {
    this.fields.push(this.createField());
  }

  removeItem(item): void {
    item.patchValue({ deleted: true });
  }

  next(_: boolean, value: any): void {
    if (value) {
      this.customFieldFacade.createCustomFields(value.fields);
      this.globalCustomFieldService.changeWizardStep('preview', 'custom-field');
    }
  }

  back() {
    this.globalCustomFieldService.changeWizardStep('custom-field', 'preview');
  }

  selectAllFields = (event, index) => {
    const fields = ['displayedOnProjects', 'displayedOnWorkflows', 'displayedOnTasks'];
    fields.forEach(field => {
      (this.fields.controls[index] as FormGroup).controls[field].setValue(event.target.checked);
    })
  }

  save() {
    forkJoin(this.fields.value.map(field => {
      if (!field.id) {
        return this.globalCustomFieldService.createCustomField(field)
      } else if (field.deleted) {
        return this.globalCustomFieldService.removeCustomField(this.fieldId);
      } else {
        return this.globalCustomFieldService.updateCustomField({
          ...field,
          pk: this.fieldId
        }, field.id)
      }
    })).subscribe(res => {
      this.router.navigateByUrl('main/custom-fields');
    })
  }

  ngOnDestroy() {
    this.customFieldFacade.resetCustomFieldInfo();
  }

}
