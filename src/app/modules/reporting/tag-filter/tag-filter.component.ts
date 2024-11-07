import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { TaskService } from '../../projects/task/task.service';
import { TagFilter } from './tag-filter.interface';

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss']
})
export class TagFilterComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  @Input() isReset = false;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSelectTag: EventEmitter<string> = new EventEmitter<string>();
  public isLoading = false;
  public isTagOpen = false;
  public usersForm: FormGroup;
  public arrTags: Array<TagFilter> = [];
  public arrSelectedTags: Array<TagFilter> = [];
  public selectedTagIds: Array<number> = [];
  public selectedTagNames: Array<string> = [];

  /**
   * Handle mouse outside click event to close dropdown.
   * @param event Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside = (event) => {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.isTagOpen = false;
    }
  }

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private taskService: TaskService
  ) { }

  /**
   * Check for reset changes
   * @param changes SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('isReset')) {
      this.isReset = changes.isReset.currentValue;
      if (this.isReset) {
        this.arrSelectedTags = [];
        this.selectedTagIds = [];
        this.selectedTagNames = [];
        this.listTags();
        this.onSelectTag.emit(null);
      }
    }
  }

  ngOnInit() {
    this.initForm();
    this.listTags();

    /**
     * Trigger for searching tags
     */
    this.usersForm.get('assignToSearch').valueChanges.pipe(debounceTime(300), tap(() => this.isLoading = true),
      switchMap(value => this.taskService.getTags({ search: value })
        .pipe(
          finalize(() => this.isLoading = false),
        )
      )
    ).subscribe(res => {
      if (res && res.results) {
        this.arrTags = res.results as Array<TagFilter>;
        this.arrTags.map(obj => {
          if (this.selectedTagIds.indexOf(obj.id) > -1) {
            obj.checked = true;
          } else {
            obj.checked = false;
          }
        });
      }
    });
  }

  /**
   * Initialize search form
   */
  initForm = () => {
    this.usersForm = this.fb.group({
      assignToSearch: null
    });
  }

  /**
   * Get tags listing
   */
  listTags = () => {
    this.taskService.getTags({ limit: 100 }).subscribe(res => {
      this.arrTags = res.results.map(obj => ({ ...obj, checked: false })) as Array<TagFilter>;
    });
  }

  /**
   * Method to select specific tag to filter the data
   * @param tag object
   */
  selectTag = (tag: TagFilter) => {
    this.usersForm.get('assignToSearch').setValue('');
    tag.checked = true;
    if (this.arrSelectedTags && this.arrSelectedTags.length === 0) {
      this.arrSelectedTags.push(tag);
      this.selectedTagIds.push(tag.id);
      this.selectedTagNames.push(tag.tag);
    } else {
      const index: number = this.arrSelectedTags.indexOf(tag);
      if (index === -1) {
        this.arrSelectedTags.push(tag);
        this.selectedTagIds.push(tag.id);
        this.selectedTagNames.push(tag.tag);
      }
    }
    this.onSelectTag.emit(this.selectedTagIds.join());
  }

  /**
   * Method to remove tag from local array.
   * @param tag object
   */
  removeTag = (tag: TagFilter) => {
    tag.checked = false;
    const index: number = this.arrSelectedTags.indexOf(tag);
    this.arrSelectedTags.splice(index, 1);
    this.selectedTagIds.splice(index, 1);
    this.selectedTagNames.splice(index, 1);
    this.onSelectTag.emit(this.selectedTagIds.join());
  }
}
