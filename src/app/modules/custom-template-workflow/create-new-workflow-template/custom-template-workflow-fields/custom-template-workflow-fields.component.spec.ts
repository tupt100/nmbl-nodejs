import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateWorkflowFieldsComponent } from './custom-template-workflow-fields.component';

describe('CustomTemplateWorkflowFieldsComponent', () => {
  let component: CustomTemplateWorkflowFieldsComponent;
  let fixture: ComponentFixture<CustomTemplateWorkflowFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateWorkflowFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateWorkflowFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
