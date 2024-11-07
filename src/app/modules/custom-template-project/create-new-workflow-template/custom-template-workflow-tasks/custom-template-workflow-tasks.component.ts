import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomTemplateWorkflowService } from '../../custom-template-workflow.service';
import { CustomTemplateFacade } from '../../+state/custom-template.facade';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-custom-template-workflow-tasks',
  templateUrl: './custom-template-workflow-tasks.component.html',
  styleUrls: ['./custom-template-workflow-tasks.component.scss']
})
export class CustomTemplateWorkflowTasks implements OnInit {
  templateId: number;
  tasks$ = this.customTemplateFacade.getTemplateTasks$;

  tasks = []

  constructor(
    private activatedRoute: ActivatedRoute,
    private customTemplateFacade: CustomTemplateFacade,
    private customTemplateWorkflowService: CustomTemplateWorkflowService
  ) {
  }

  ngOnInit(): void {
    this.templateId = this.activatedRoute.snapshot.params.id;
    this.tasks$.pipe(take(1)).subscribe(data => {
      this.patchTasks({ tasks: data });
      if (!this.templateId && (!data || data.length === 0)) {
        this.addItem()
      }
    });
  }

  createTask() {
    return {
      workflowName: null,
      importance: 'low',
      description: null,
      user: [],
      group: [],
      isPrivate: false,
      startDate: null,
      dueDate: null,
      privileges: [],

      id: '',
      projectTemplateId: '',
      deleted: false
    };
  }

  patchTasks(data) {
    if (data.tasks) {
      data.tasks.forEach(item => (this.tasks.push(
        {
          workflowName: item.workflowName || '',
          importance: item.importance || 'low',
          description: item.description || '',
          user: item.user || [],
          group: item.group || [],
          isPrivate: !!item.isPrivate,
          startDate: item.startDate,
          dueDate: item.dueDate,
          privileges: item.privileges || [],
  
  
          id: item.id,
          projectTemplateId: item.projectTemplateId,
          deleted: item.deleted ? item.deleted : false
        }
      )));
    }
  }

  addItem(): void {
    this.tasks.push(this.createTask());
  }

  removeItem(item): void {
    item.deleted = true
  }

  updateTask(val, index) {
    Object.keys(val).forEach(k => {
      this.tasks[index][k] = val[k]
    })
  }

  next(): void {
    this.customTemplateFacade.createTasks(this.tasks);
    this.customTemplateWorkflowService.changeWizardStep('preview', 'tasks');
  }


  stepBack() {
    this.customTemplateFacade.createTasks(this.tasks);
    this.customTemplateWorkflowService.changeWizardStep('custom-field', 'tasks');
  }

}
