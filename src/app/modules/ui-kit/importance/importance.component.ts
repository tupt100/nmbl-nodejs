import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ElementRef, HostListener } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-importance',
  templateUrl: './importance.component.html',
  styleUrls: ['./importance.component.scss']
})
export class ImportanceComponent implements OnInit, OnChanges {

  /**
   * Bindings
   */
  public arrImportance: Array<any> = [];
  public showDropdown = false;
  public importance: any;
  public displayName = '';
  @Input() checkedImportance: any;
  @Input() isDisabled = false;
  @Output() selectedImportance = new EventEmitter();

  /**
   * Handler to close dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event) {
    if (event && event.target && !this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  constructor(
    private sharedService: SharedService,
    private elementRef: ElementRef
  ) { }

  /**
   * Initialize importance values and set the selected one
   */
  ngOnChanges() {
    this.initDefaultValues();
  }

  /**
   * Initialize importance values and set the selected one
   */
  ngOnInit() {
    this.initDefaultValues();
  }

  /**
   * Initialize values and checked selected one
   */
  initDefaultValues() {
    const importanceList = [...this.sharedService.importanceList];
    this.arrImportance = importanceList.map(obj => ({ ...obj, checked: false }));
    this.arrImportance.map(obj => {
      if (this.checkedImportance && +this.checkedImportance === +obj.id) {
        this.importance = obj;
        this.displayName = obj.title;
        obj.checked = true;
      } else {
        obj.checked = false;
      }
    });
  }

  /**
   * Emit selected importance ID
   */
  select = (importance: any): void => {
    this.displayName = importance.title;
    this.arrImportance.map(obj => {
      if (obj.id === importance.id) {
        obj.checked = true;
      } else {
        obj.checked = false;
      }
    });

    this.selectedImportance.emit(importance.id);
    this.showDropdown = false;
  }

  /**
   * Toggle importance dropdown
   */
  public show() {
    this.showDropdown = !this.showDropdown;
  }
}
