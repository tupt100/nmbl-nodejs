import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';
import { TaskService } from '../../projects/task/task.service';
import { Messages } from 'src/app/services/messages';
import * as  _ from 'lodash';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
  providers: [TaskService]
})
export class DocumentUploadComponent implements OnInit {
  /**
   * Bindings
   */
  @Output() afterUpload = new EventEmitter();
  @Input() isStandAloneTag = false;
  @Input() isDiscussion = false;
  @Input() submitRequest = false;
  tagsList = [];
  tagTitle: any[] = [];
  allTags = [];
  tagSearchPlaceholder = 'Search Tags';
  uploadedFile: Array<any> = [];
  files: Array<any> = [];
  file: Array<any> = [];
  allowedFormats = this.sharedService.allowedFileFormats.join();
  urlRegex = this.sharedService.getExternalUrlPattern();
  external_document_form = new FormGroup({
    external_document_url: new FormControl('', Validators.pattern(this.urlRegex)),
    external_url_name: new FormControl('')
  })
  projectSubscribe: any;
  public features: any = {};
  public externalDocumentIsEnabled = false;
  constructor(
    private sharedService: SharedService,
    private taskService: TaskService,
    private store: Store<fromRoot.AppState>,
  ) { }

  ngOnInit() {
    this.projectSubscribe = this.store.select('features').subscribe((obj) => {
      if (obj.loaded) {
        if (obj.datas && obj.datas.features) {
          this.features = obj.datas.features;
          this.externalDocumentIsEnabled = this.features.EXTERNAL_DOCS;
        }
      }
    });
  }

  /**
   * Set document name before uploading
   * @param event Keyboard keyup event
   * @param idx Document index
   */
  changeDocName(event, idx) {
    const value = event.target.value;
    if (value && value.trim()) {
      this.uploadedFile[idx].newName = value;
    } else {
      delete this.uploadedFile[idx].newName;
    }
  }

  /**
   * Dropzone drop event handler
   */
  dropped = (event: any) => {
    if (event && event.addedFiles.length) {
      const arr: Array<any> = [...event.addedFiles];
      const validFiles = [];
      arr.some((file) => {
        const filename = file.name;
        const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
        if (this.sharedService.allowedFileFormats.indexOf(format) > -1) {
          validFiles.push(file);
        }
      });

      if (!validFiles.length) {
        this.uploadedFile = [];
        return this.afterUpload.emit({
          fileError: 'Extensions of the allowed file types are ' + this.sharedService.allowedFileFormats.join(', ')
        });
      }

      if (this.uploadedFile && this.uploadedFile.length) {
        validFiles.forEach(x => {
          this.uploadedFile.push(x);
        });
      } else {
        this.uploadedFile = [...validFiles];
      }

      if (!this.isStandAloneTag && !this.submitRequest) {
        this.taskService.getTags({ limit: 1000 }).subscribe(res => {
          this.uploadedFile.forEach((x, i) => {
            this.setTagsList(res, i, true);
          });
        });
      }
    }
  }

  /**
   * Remove file from document array
   * @param index Document index
   */
  removeFile(index: number) {
    const temp = this.uploadedFile;
    temp.splice(index, 1);
    this.tagTitle.splice(index, 1);
    this.uploadedFile = [...temp];
  }
  resetExternalDocumentForm() {
    this.external_document_form.setValue({
      external_document_url: '',
      external_url_name: ''
    })
  }
  /**
   * Upload document hander
   */
  upload() {
    const { external_document_url, external_url_name } = this.external_document_form.value;
    if (external_url_name && external_document_url) {
      this.uploadedFile.push({
        name: external_url_name,
        external_url: external_document_url,
        document_url: external_document_url
      });
      this.resetExternalDocumentForm();
    }


    if (this.uploadedFile && !this.uploadedFile.length) {
      return this.afterUpload.emit({ fileError: Messages.errors.noDocToUpload });
    }

    if (!this.isDiscussion) {
      this.files = [];
      let count = 1;
      const arr = [];

      this.uploadedFile.forEach(file => {
        this.sharedService.uploadDocument(file).subscribe(res => {
          arr.push(res);
          this.file.push(res);
          this.files.push(res.id);
          if (count === this.uploadedFile.length) {
            this.doAfterUpload();
          }
          count++;
        }, e => {
          const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.uploadFailed;
          const externalDocError = e && e.error.external_url && e.error.external_url.length > 0 ? e.error.external_url[0] : "";
          if (count === this.uploadedFile.length) {
            this.doAfterUpload();
          }
          return this.afterUpload.emit({ fileError: externalDocError ?? error });
        });
      });


    } else {
      this.afterUpload.emit({ files: this.uploadedFile });
      this.files = [];
      this.uploadedFile = [];
      this.resetExternalDocumentForm();
    }
  }

  /**
   * Emit uploaded files to parent component
   */
  doAfterUpload() {
    this.afterUpload.emit({
      files: this.files, file: this.file, uploadedFiles: this.uploadedFile
    });
    this.files = [];
    this.uploadedFile = [];
    this.resetExternalDocumentForm();
  }

  /**
   * Handle cancel button trigger
   */
  cancel() {
    this.afterUpload.emit();
    this.files = [];
    this.uploadedFile = [];
    this.tagTitle = [];
    this.tagsList = [];
  }

  /**
   * Get tags listing for documents
   * @param search Search input Keyboard event
   * @param idx Document index
   */
  getTagList(search?: any, idx?: number) {
    const params = {
      search: search && search.target && search.target.value ? search.target.value : '',
      limit: 1000
    };
    const filteredParams = this.sharedService.filterParams(params);
    this.taskService.getTags(filteredParams).subscribe(res => {
      this.setTagsList(res, idx);
    });
  }

  /**
   * Set tags array with documents
   * @param res Tags response
   * @param idx Document index
   * @param all All tags (optional)
   */
  setTagsList(res: any, idx, all?: boolean): void {
    const newArr = res && res.results && res.results.length ? JSON.parse(JSON.stringify(res.results)) : [];

    if (!this.allTags[idx]) {
      this.allTags[idx] = [];
    }

    if (!this.tagsList[idx]) {
      this.tagsList[idx] = [];
    }

    if (!this.tagTitle[idx]) {
      this.tagTitle[idx] = [];
    }

    if (all) {
      this.allTags[idx] = JSON.parse(JSON.stringify(newArr));
    }
    this.tagsList[idx] = JSON.parse(JSON.stringify(newArr));
  }

  /**
   * Handle tags selection changes
   * @param response Selected tags
   * @param index Document index
   */
  onFilterSelected(response, index): void {
    const selections: any[] = [];
    if (!selections[index]) {
      selections[index] = [];
    }

    const allTags = [...this.allTags[index]];
    if (response && response.length) {
      response.forEach(element => {
        const idx = allTags.findIndex(x => +x.id === +element);
        if (idx > -1) {
          selections[index].push(allTags[idx]);
        } else {
          selections[index].push({ id: element, tag: element });
        }
      });
    }

    if (!this.tagTitle[index]) {
      this.tagTitle[index] = [];
    }

    const array = _.uniqBy([...selections[index], ...this.tagTitle[index]], 'id');
    let tagsList = array.map((el) => el.tag);
    this.tagTitle[index] = array;
    this.uploadedFile[index].document_tag_save = tagsList.join();

    if (response.length !== this.tagTitle[index].length) {
      this.tagTitle[index] = _.remove(this.tagTitle[index], obj => response.indexOf(obj.id) > -1);
      tagsList = [];
      this.tagTitle[index].forEach(title => {
        tagsList.push(title.tag);
      });

      this.uploadedFile[index].document_tag_save = tagsList.join();
    }
  }
}