import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewCustomFieldComponent } from './create-new-custom-field.component';

describe('CreateNewCustomFieldComponent', () => {
  let component: CreateNewCustomFieldComponent;
  let fixture: ComponentFixture<CreateNewCustomFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewCustomFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewCustomFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
