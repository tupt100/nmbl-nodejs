import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateTaskFieldsComponent } from './custom-template-task-fields.component';

describe('CustomTemplateTaskFieldsComponent', () => {
  let component: CustomTemplateTaskFieldsComponent;
  let fixture: ComponentFixture<CustomTemplateTaskFieldsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateTaskFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateTaskFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
