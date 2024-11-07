import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { CurrentRequest } from '../nru.interface';
import { Messages } from 'src/app/services/messages';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { SharedService } from 'src/app/services/sharedService';
import { NRUService } from '../nru.service';

@Component({
  selector: 'app-view-request',
  templateUrl: './view-request.component.html',
  styleUrls: ['./view-request.component.scss']
})
export class ViewRequestComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  @ViewChild(NotifierComponent) notifier: NotifierComponent;
  public userToken = '';
  public userId = 0;
  public response: CurrentRequest;
  public importance = 1;
  openUploadDoc = false;
  uploadedFile = [];
  momentObj = moment;
  allowedFormats = this.sharedService.allowedFileFormats.join();
  errorMsgSubs: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private nruService: NRUService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.response = new CurrentRequest();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.userToken = params.token;
      this.userId = params.id;
      this.verifyToken(this.userToken);
    });
  }

  /**
   * Verify token
   * @param token Token
   */
  verifyToken = (token: string) => {
    this.nruService.verifyToken(token).subscribe(result => {
      if (result) {
        this.viewCurrentRequest();
        this.initSubs();
      }
    }, (e) => {
      this.router.navigate(['/requests']);
    });
  }

  /**
   * Subscribing error messages
   */
  initSubs() {
    this.errorMsgSubs = this.sharedService.errorMessage.subscribe(msg => {
      if (msg) {
        this.showErrorMessage(msg);
      }
    });
  }

  /**
   * Get request details
   */
  viewCurrentRequest = () => {
    this.nruService.getCurrentRequestById(this.userId, this.userToken).subscribe(res => {
      if (res) {
        this.response = res;
      }
    });
  }

  /**
   * Dropzone drop event
   */
  dropped = (event: any) => {
    const arr = [...event.addedFiles];
    const validFiles = [];
    arr.forEach((file) => {
      const filename = file.name;
      const format = filename.substr(filename.lastIndexOf('.')).toLowerCase();
      if (this.sharedService.allowedFileFormats.indexOf(format) > -1) {
        validFiles.push(file);
      }
    });

    if (!validFiles.length) {
      this.uploadedFile = [];
      this.openUploadDoc = false;
      return this.showErrorMessage('Extensions of the allowed file types are ' + this.sharedService.allowedFileFormats.join(', '));
    }

    if (this.uploadedFile && this.uploadedFile.length) {
      validFiles.forEach(x => {
        this.uploadedFile.push(x);
      });
    } else {
      this.uploadedFile = [...validFiles];
    }
  }

  /**
   * Upload docs for submitted requests
   */
  upload() {
    if (this.uploadedFile && !this.uploadedFile.length) {
      this.openUploadDoc = false;
      return this.showErrorMessage(Messages.errors.noDocToUpload);
    }
    const formData: FormData = new FormData();
    this.uploadedFile.map(obj => {
      formData.append('document', obj);
    });
    formData.append('auth', this.userToken);
    this.nruService.uploadDocument(formData).subscribe(res => {
      this.nruService.uploadSubmitRequestDocs(
        this.userId,
        {
          attachments: res.doc_id,
          auth: this.userToken,
        }
      ).subscribe(() => {
        this.cancel();
        this.refreshPage();
      }, e => {
        this.openUploadDoc = false;
        this.cancel();
        const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.attachFailed;
        return this.showErrorMessage(error);
      });
    }, e => {
      this.openUploadDoc = false;
      const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.uploadFailed;
      return this.showErrorMessage(error);
    });
  }

  /**
   * Clear array and close popup
   */
  cancel() {
    this.uploadedFile = [];
    this.openUploadDoc = false;
  }

  /**
   * Remove local file from array
   * @param index File index
   */
  removeFile(index: number) {
    const temp = this.uploadedFile;
    temp.splice(index, 1);
    this.uploadedFile = [...temp];
  }

  /**
   * Reload current route
   */
  refreshPage(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([
      '/requests/view-request/' +
      this.userId + '/' +
      this.userToken
    ]);
  }

  /**
   * Download document
   * @param file File
   */
  downloadFile(file: any) {
    const fileObj = Object.assign(file);
    fileObj.name = file.document_name;
    this.sharedService
      .getFileBlob(fileObj.document_url)
      .subscribe(
        res => {
          const blob = new Blob([res]);
          if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, fileObj.name);
          } else {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.setAttribute('style', 'display: none');
            a.href = url;
            a.download = fileObj.name;
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
          }
        });
  }

  /**
   * Navigate to pending requests
   */
  goToPendingRequestsList() {
    this.router.navigate(['requests/pending-requests/' + this.userToken]);
  }

  /**
   * Show error message
   * @param msg Message
   */
  showErrorMessage(msg) {
    window.scroll(0, 0);
    this.notifier.displayErrorMsg(msg);
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.errorMsgSubs) {
      this.sharedService.errorMessage.next('');
      this.errorMsgSubs.unsubscribe();
    }
  }
}
