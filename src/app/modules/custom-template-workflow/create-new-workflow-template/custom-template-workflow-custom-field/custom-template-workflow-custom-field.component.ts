import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow.service';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-template-workflow-custom-field',
  templateUrl: './custom-template-workflow-custom-field.component.html',
  styleUrls: ['./custom-template-workflow-custom-field.component.scss']
})
export class CustomTemplateWorkflowCustomFieldComponent implements OnInit {
  form: FormGroup;
  formFieldsArray: FormArray;
  taskFields;
  templateId: number;
  customFields$ = this.customTemplateFacade.getTemplateCustomFields$;
  customTemplate$ = this.customTemplateFacade.getCustomTemplate$;

  get fields(): FormArray {
    return this.form.get('fields') as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customTemplateFacade: CustomTemplateFacade,
    private customTemplateWorkflowService: CustomTemplateWorkflowService
  ) {
  }

  ngOnInit(): void {
    this.templateId = this.activatedRoute.snapshot.params.id;
    this.createForm(this.formBuilder);
    this.customFields$.pipe(take(1)).subscribe(data => {
      this.patchFields({ fields: data });
      if (!this.templateId && (!data || data.length === 0)) {
        this.addItem()
      }
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
      deleted: false
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
        deleted: item.deleted ? item.deleted : false
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
      this.customTemplateFacade.createCustomFields(value.fields);
      this.customTemplateWorkflowService.changeWizardStep('tasks', 'custom-field');
    }
  }


  stepBack() {
    this.customTemplateFacade.createCustomFields(this.form.value.fields);
    this.customTemplateWorkflowService.changeWizardStep('workflow-fields', 'custom-field');
  }

}
