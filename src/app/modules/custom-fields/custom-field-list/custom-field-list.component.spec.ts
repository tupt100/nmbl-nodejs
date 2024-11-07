import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFieldListComponent } from './custom-field-list.component';

describe('CustomFieldListComponent', () => {
  let component: CustomFieldListComponent;
  let fixture: ComponentFixture<CustomFieldListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFieldListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
