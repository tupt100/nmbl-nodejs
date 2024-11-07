import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewTaskTemplateComponent } from './create-new-task-template.component';

describe('CreateNewTaskTemplateComponent', () => {
  let component: CreateNewTaskTemplateComponent;
  let fixture: ComponentFixture<CreateNewTaskTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewTaskTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewTaskTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
