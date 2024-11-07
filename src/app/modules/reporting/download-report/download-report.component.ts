import { Component, HostListener, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-download-report',
  templateUrl: './download-report.component.html',
  styleUrls: ['./download-report.component.scss']
})
export class DownloadReportComponent implements OnChanges {
  /**
   * Bindings
   */
  @Input() items: Array<any> = [];
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDownload: EventEmitter<any> = new EventEmitter<any>();
  @Output() mode: EventEmitter<string> = new EventEmitter<string>();
  public reportType = 'Portrait';
  public reportFormat = 'PDF';

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.onClose.emit(false);
    }
  }

  constructor() { }

  /**
   * Check for items changes
   * @param changes Simple Changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('items')) {
      this.items = changes.items.currentValue;
    }
  }

  /**
   * Emit user selected document format option to download report
   */
  download = () => {
    const params: any = {
      type: this.reportFormat
    };

    if (this.reportFormat === 'PDF') {
      params.mode = this.reportType;
    }
    this.onDownload.emit(params);
  }

  /**
   * Close popup
   */
  close() {
    this.onClose.emit(false);
  }

  /**
   * Emit user selected document orientation option to download report
   */
  onTypeSelect = (type) => {
    this.mode.emit(type);
  }
}
