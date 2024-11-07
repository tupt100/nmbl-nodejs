import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTemplateListComponent } from './custom-template-list.component';

describe('CustomTemplateListComponent', () => {
  let component: CustomTemplateListComponent;
  let fixture: ComponentFixture<CustomTemplateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTemplateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTemplateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
