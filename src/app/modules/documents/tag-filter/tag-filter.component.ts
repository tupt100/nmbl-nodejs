import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { TagsService } from '../../tags-manager/tags-manager.service';

@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
  styleUrls: ['./tag-filter.component.scss']
})
export class TagFilterComponent {

  /**
   * Bindings
   */
  @ViewChild('tagInput', { static: true}) tagInput: ElementRef<HTMLInputElement>;
  public newTagValue = '';
  public searchedTags: Array<any> = [];
  public tags: Array<string> = [];
  public mySelectedTags: Array<object> = [];
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter();

  constructor(private tagsService: TagsService) { }

  /**
   * Method to search tags by name.
   * @param object is used to search tags by name.
   */
  searchTags = () => {
    this.tagsService.listTags({ search: this.newTagValue }).subscribe(res => {
      this.searchedTags = res.results;
    });
  }

  /**
   * Method to return selected tag in main component.
   * @param tag the object with name and id.
   */
  selectTag = (tag) => {
    this.tags.push(tag);
    this.tags = Array.from(new Set(this.tags));
    this.newTagValue = '';
    this.tagInput.nativeElement.value = '';
    if (this.searchedTags && this.searchedTags.length > 0) {
      const data = this.searchedTags.filter( (x) => {
        return x.tag === tag;
      });
      if (data && data.length > 0) {
        const objTag = data[0];
        this.mySelectedTags.push(objTag.id);
        this.selectionChanged.emit(this.mySelectedTags);
      }
    }
  }

  /**
   * Method to remove selected tag from local array.
   * @param tag to remove tag from local array.
   */
  removeTag = (tag) => {
    const index = this.tags.indexOf(tag);
    this.tags.splice(index, 1);
    this.mySelectedTags.splice(index, 1);
    this.selectionChanged.emit(this.mySelectedTags);
  }
}
