import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomTemplateTaskService } from '../../custom-template-task.service';
import { CustomTaskTemplateOutputModel } from '../../custom-template-model';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-template-task-custom-field',
  templateUrl: './custom-template-task-custom-field.component.html',
  styleUrls: ['./custom-template-task-custom-field.component.scss']
})
export class CustomTemplateTaskCustomFieldComponent implements OnInit {
  form: FormGroup;
  formFieldsArray: FormArray;
  taskFields;
  task: CustomTaskTemplateOutputModel;
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
    private customTemplateTaskService: CustomTemplateTaskService
  ) {
  }

  ngOnInit(): void {
    this.templateId = this.activatedRoute.snapshot.params.id;
    this.createForm(this.formBuilder);
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
      this.customTemplateTaskService.changeWizardStep('preview', 'custom-field');
    }
  }


  stepBack() {
    this.customTemplateFacade.createCustomFields(this.form.value.fields);
    this.customTemplateTaskService.changeWizardStep('task-fields', 'custom-field');
  }

}
