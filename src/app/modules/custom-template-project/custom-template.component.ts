import { Component, OnDestroy, OnInit } from '@angular/core';
import { CustomTemplateWorkflowService } from './custom-template-workflow.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-custom-template',
  templateUrl: './custom-template.component.html',
  styleUrls: ['./custom-template.component.scss']
})
export class CustomTemplateComponent implements OnInit, OnDestroy {
  stepSubs: Subscription;
  step = 'name';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.stepSubs = CustomTemplateWorkflowService.changeStep.subscribe(data => {
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

