import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewWorkflowTemplateComponent } from './create-new-workflow-template.component';

describe('CreateNewWorkflowTemplateComponent', () => {
  let component: CreateNewWorkflowTemplateComponent;
  let fixture: ComponentFixture<CreateNewWorkflowTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewWorkflowTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewWorkflowTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
