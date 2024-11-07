import { Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalCustomFieldService } from './custom-field.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html',
  styleUrls: ['./custom-field.component.scss']
})
export class CustomFieldComponent implements OnInit, OnDestroy {
  stepSubs: Subscription;
  step = 'name';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.stepSubs = GlobalCustomFieldService.changeStep.subscribe(data => {
      this.step = data.step;
    });
  }

  createNew() {
    this.router.navigate(['create'], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy() {
    if (this.stepSubs) {
      this.stepSubs.unsubscribe();
    }
  }

}

