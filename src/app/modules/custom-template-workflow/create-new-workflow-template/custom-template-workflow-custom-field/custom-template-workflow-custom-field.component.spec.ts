import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateWorkflowCustomFieldComponent } from './custom-template-workflow-custom-field.component';

describe('CustomTemplateWorkflowCustomFieldComponent', () => {
  let component: CustomTemplateWorkflowCustomFieldComponent;
  let fixture: ComponentFixture<CustomTemplateWorkflowCustomFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateWorkflowCustomFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateWorkflowCustomFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
