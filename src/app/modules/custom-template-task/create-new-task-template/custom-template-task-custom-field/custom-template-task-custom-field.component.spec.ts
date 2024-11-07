import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateTaskCustomFieldComponent } from './custom-template-task-custom-field.component';

describe('CustomTemplateTaskCustomFieldComponent', () => {
  let component: CustomTemplateTaskCustomFieldComponent;
  let fixture: ComponentFixture<CustomTemplateTaskCustomFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateTaskCustomFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateTaskCustomFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
