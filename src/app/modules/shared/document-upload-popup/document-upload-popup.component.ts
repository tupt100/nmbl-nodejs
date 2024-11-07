import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

export interface IDocument {
  name: string;
  display: boolean;
}

@Component({
  selector: 'app-document-upload-popup',
  templateUrl: './document-upload-popup.component.html',
  styleUrls: ['./document-upload-popup.component.scss']
})
export class DocumentUploadPopupComponent implements OnChanges {

  /**
   * Bindings
   */
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() upload: EventEmitter<any> = new EventEmitter<any>();
  @Input() file: File;
  public myFileArray: File[] = [];
  public arrTempFile: Array<IDocument> = [];
  public percentageComplete = 0;

  constructor(
    public sharedService: SharedService
  ) { }

  /**
   * Check file changes
   */
  ngOnChanges(): void {
    if (this.file) {
      const file: File = this.file;
      this.storeFileLocally(file);
      this.file = null;
    }
  }

  /**
   * Trigger for upload and cancel click
   * @param upload [boolean]
   */
  handleUpload(upload?) {
    if (upload) {
      this.upload.emit(this.myFileArray);
    } else {
      this.arrTempFile = [];
      this.myFileArray = [];
      this.cancel.emit(true);
    }
  }

  /**
   * Select file
   */
  uploadFile = (e) => {
    const file: File = e.target.files[0];
    this.storeFileLocally(file);
  }

  /**
   * Validate file and show progress animation
   */
  storeFileLocally = (file: File) => {
    const format = file.name.substr(file.name.lastIndexOf('.')).toLowerCase();
    const index = this.sharedService.allowedFileFormats.indexOf(format);
    if (index >= 0) {
      setTimeout(() => {
        this.percentageComplete = 10;
      }, 100);

      setTimeout(() => {
        this.percentageComplete = 25;
      }, 250);

      setTimeout(() => {
        this.percentageComplete = 40;
      }, 400);

      setTimeout(() => {
        this.percentageComplete = 60;
      }, 600);

      setTimeout(() => {
        this.percentageComplete = 85;
      }, 850);

      setTimeout(() => {
        this.percentageComplete = 100;
      }, 1200);

      const obj: IDocument = {
        name: file.name,
        display: true
      };
      this.arrTempFile.push(obj);
      setTimeout(() => {
        this.arrTempFile[this.arrTempFile.length - 1].display = false;
      }, 1500);
      this.myFileArray.push(file);
    }
  }

  /**
   * Remove file from local array
   */
  removeLocalDocument = (index: number) => {
    this.myFileArray.splice(index, 1);
    this.arrTempFile.splice(index, 1);
  }

  /**
   * Progress bar
   */
  hideLoader = () => {
    if (this.arrTempFile.length) {
      return this.arrTempFile[this.arrTempFile.length - 1].display;
    }
  }
}
