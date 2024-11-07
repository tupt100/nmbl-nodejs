import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TagsService } from '../tags-manager.service';
import { Messages } from 'src/app/services/messages';
import { HttpErrorResponse } from '@angular/common/http';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss']
})
export class TagDetailComponent implements OnInit {
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  tag: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tagService: TagsService,
  ) { }

  ngOnInit() {
    // Check for tag ID in params
    const id = this.route.snapshot.paramMap.get('id') || null;
    if (id && !isNaN(+id)) {
      this.getTagDetails(id);
    } else {
      this.showErrorAndRedirect(Messages.errors.noTagFound);
    }
  }

  /**
   * Get tag details
   * @param id Tag ID
   */
  getTagDetails(id) {
    this.tagService.getTagDetail(id).subscribe(res => {
      if (res.attached_to) {
        delete res.attached_to;
      }
      this.tag = res;
    }, (e: HttpErrorResponse) => {
      const msg = e && e.error && e.error.detail && typeof e.error.detail === 'string' ? e.error.detail : Messages.errors.noTagFound;
      this.showErrorAndRedirect(msg);
    });
  }

  /**
   * Show error message and redirect to tags manager
   * @param msg Message
   */
  showErrorAndRedirect(msg): void {
    this.notifier.displayErrorMsg(msg);
    this.router.navigate(['/main/tags-manager']);
  }
}
