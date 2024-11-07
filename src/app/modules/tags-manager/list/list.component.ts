import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TagsService } from '../tags-manager.service';
import { ITags } from '../tags-manager.interface';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  public tagSearchForm: FormGroup;
  // tslint:disable-next-line:variable-name
  public tags_response: Array<ITags> = [];
  public recordExists = false;
  public isDataLoaded = false;
  public tagId = 0;
  public tagName = '';
  public tagRegex = this.sharedService.tagRegEx;
  public defaultParams = {
    limit: 10000,
    offset: 0
  };
  public showModal = {
    isAddTag: false,
    isDeleteTag: false,
    isEditTag: false,
    isEditTagConfirm: false
  };
  public tags = [
    { group: '#', tags: [], collasped: false },
    { group: 'A', tags: [], collasped: false },
    { group: 'B', tags: [], collasped: false },
    { group: 'C', tags: [], collasped: false },
    { group: 'D', tags: [], collasped: false },
    { group: 'E', tags: [], collasped: false },
    { group: 'F', tags: [], collasped: false },
    { group: 'G', tags: [], collasped: false },
    { group: 'H', tags: [], collasped: false },
    { group: 'I', tags: [], collasped: false },
    { group: 'J', tags: [], collasped: false },
    { group: 'K', tags: [], collasped: false },
    { group: 'L', tags: [], collasped: false },
    { group: 'M', tags: [], collasped: false },
    { group: 'N', tags: [], collasped: false },
    { group: 'O', tags: [], collasped: false },
    { group: 'P', tags: [], collasped: false },
    { group: 'Q', tags: [], collasped: false },
    { group: 'R', tags: [], collasped: false },
    { group: 'S', tags: [], collasped: false },
    { group: 'T', tags: [], collasped: false },
    { group: 'U', tags: [], collasped: false },
    { group: 'V', tags: [], collasped: false },
    { group: 'W', tags: [], collasped: false },
    { group: 'X', tags: [], collasped: false },
    { group: 'Y', tags: [], collasped: false },
    { group: 'Z', tags: [], collasped: false },
  ];
  searchText = '';

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.showModal.isEditTag = false;
      this.showModal.isAddTag = false;
    }
  }

  /**
   * Handle mouse click event to close dropdown.
   * @param event Mouse Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event.target.className !== 'tag') {
      this.tags.map(x => {
        x.tags.map(y => {
          y.isTagDisplay = false;
        });
      });
    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tagsService: TagsService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    // Initialize tag search form
    this.tagSearchForm = this.fb.group({
      assignToSearch: null
    });

    // Get tags listing
    this.listTags();

    // Tag search
    this.tagSearchForm.get('assignToSearch').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.tagsService.listTags({ search: value, limit: 100 }))
    ).subscribe(res => {
      if (res && res.results) {
        this.tags_response = res.results as Array<ITags>;
        if (this.tags_response.length > 0) {
          this.emptyTagsArray();
          this.groupTags();
        }
      }
    });
  }

  /**
   * Get tags listing
   */
  listTags = () => {
    this.tagsService.listTags(this.defaultParams).subscribe(res => {
      if (res && res.results) {
        this.tags_response = res.results as Array<ITags>;
        if (this.tags_response.length > 0) {
          this.emptyTagsArray();
          this.groupTags();
        }
      }
    });
  }

  /**
   * Tags grouping
   */
  groupTags = () => {
    this.tags_response.filter(obj => {
      if (obj.tag === '_' || (obj.tag.charCodeAt(0) >= 48 && obj.tag.charCodeAt(0) <= 57)) {
        obj.isTagDisplay = false;
        this.tags[0].tags.push(obj);
      } else {
        this.tags.filter(obj1 => {
          if (obj1.group === obj.tag.charAt(0)) {
            obj.isTagDisplay = false;
            obj1.tags.push(obj);
          }
        });
      }
    });
    this.isDataLoaded = true;
    this.recordExists = true;
  }

  /**
   * Emptying tags
   */
  emptyTagsArray = (): void => {
    this.tags.filter(obj => {
      obj.tags = [];
    });
  }

  /**
   * Navigate to tag deatil page
   */
  viewTag = () => {
    this.router.navigate(['main/tag-detail', this.tagId]);
  }

  /**
   * Handle remove tag popup
   * @param response [boolean] Popup confirmation response
   */
  removeTagConfirm = (response) => {
    if (response) {
      this.removeTag();
    } else {
      this.showModal.isDeleteTag = false;
    }
  }

  /**
   * Remove tag
   */
  removeTag = () => {
    this.showModal.isDeleteTag = false;
    this.tagsService.deleteTag(this.tagId).subscribe(res => {
      this.notifier.displaySuccessMsg(Messages.notifier.tagRemove);
      this.listTags();
    }, (error) => {
      if (error.error && error.error.detail && typeof error.error.detail === 'string') {
        this.notifier.displayErrorMsg(error.error.detail);
      } else {
        if (error.error && error.error.detail && error.error.detail.length) {
          this.notifier.displayErrorMsg(error.error.detail[0]);
        }
      }
    });
  }

  /**
   * Handle updating tag popup
   * @param response [boolean] Popup confirmation response
   */
  updateTagConfirm = (response) => {
    if (response) {
      this.updateTag();
    } else {
      this.showModal.isEditTagConfirm = false;
    }
  }

  /**
   * Update tag (rename)
   */
  updateTag = () => {
    if (this.tagName === '') {
      this.notifier.displayErrorMsg(Messages.notifier.nameTagFirst);
      return;
    }
    if (this.tagRegex.test(this.tagName)) {
      this.showModal.isEditTagConfirm = false;
      const params = {
        tag: this.tagName.toUpperCase()
      };
      this.tagsService.updateTag(this.tagId, params).subscribe(res => {
        if (res) {
          this.tagName = '';
          this.notifier.displaySuccessMsg(Messages.notifier.docTags);
          this.listTags();
        }
      }, (error) => {
        if (error.error && error.error.detail && typeof error.error.detail === 'string') {
          this.notifier.displayErrorMsg(error.error.detail);
        } else {
          if (error.error && error.error.detail && error.error.detail.length) {
            this.notifier.displayErrorMsg(error.error.detail[0]);
          }
        }
      });
    } else {
      this.tagName = '';
      this.notifier.displayErrorMsg(Messages.notifier.validTagName);
    }
  }

  /**
   * Open action popup for tag
   */
  openTagPopup = (groupTag: ITags) => {
    this.tagId = groupTag.id;
    this.tagName = groupTag.tag;
    this.tags.map(x => {
      x.tags.map(y => {
        y.isTagDisplay = groupTag.id === y.id ? true : false;
      });
    });
  }

  /**
   * Create new tag
   */
  addTag = () => {
    this.showModal.isAddTag = false;
    if (this.tagName === '') {
      return this.notifier.displayErrorMsg(Messages.notifier.inputTagName);
    }
    if (this.tagRegex.test(this.tagName)) {
      const params = {
        tag: this.tagName.toUpperCase()
      };
      this.tagsService.createTag(params).subscribe(res => {
        if (res) {
          this.tagName = '';
          this.notifier.displaySuccessMsg(Messages.notifier.tagCreated);
          this.listTags();
        }
      }, (e) => {
        this.tagName = '';
        // this.notifier.displayErrorMsg(e.error.detail);
      });
    } else {
      this.tagName = '';
      this.notifier.displayErrorMsg(Messages.notifier.validTagName);
    }
  }
}
