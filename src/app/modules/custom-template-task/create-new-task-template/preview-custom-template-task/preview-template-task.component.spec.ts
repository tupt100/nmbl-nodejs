import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewTemplateTaskComponent } from './preview-template-task.component';

describe('PreviewTemplateTaskComponent', () => {
  let component: PreviewTemplateTaskComponent;
  let fixture: ComponentFixture<PreviewTemplateTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewTemplateTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewTemplateTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
