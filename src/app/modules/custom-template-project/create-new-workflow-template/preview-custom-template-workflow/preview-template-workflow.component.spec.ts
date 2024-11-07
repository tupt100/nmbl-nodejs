import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTemplateWorkflowComponent } from './preview-template-workflow.component';

describe('PreviewTemplateWorkflowComponent', () => {
  let component: PreviewTemplateWorkflowComponent;
  let fixture: ComponentFixture<PreviewTemplateWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewTemplateWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewTemplateWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
