import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomWorkflowTemplateTaskFormComponent } from './custom-workflow-template-task-form.component';

describe('CustomWorkflowTemplateTaskFormComponent', () => {
  let component: CustomWorkflowTemplateTaskFormComponent;
  let fixture: ComponentFixture<CustomWorkflowTemplateTaskFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomWorkflowTemplateTaskFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomWorkflowTemplateTaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
