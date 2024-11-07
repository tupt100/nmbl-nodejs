import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateWorkflowTasks } from './custom-template-workflow-tasks.component';

describe('CustomTemplateWorkflowTasks', () => {
  let component: CustomTemplateWorkflowTasks;
  let fixture: ComponentFixture<CustomTemplateWorkflowTasks>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateWorkflowTasks ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateWorkflowTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
