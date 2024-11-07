import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import * as moment from 'moment';

import { environment } from 'src/environments/environment';
import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';
import { NRUService } from '../nru.service';
import { MessageService, IMessage } from '../../../services/message.service';

@Component({
  selector: 'app-add-request',
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.scss']
})
export class AddRequestComponent implements OnInit {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  catpachaKey = environment.catpachaKey;
  public stepTwoForm: FormGroup;
  public importance = 2;
  public userToken = '';
  public isCaptchaAccepted = false;
  public fileList = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private nruService: NRUService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initStepTwo();
    this.activatedRoute.params.subscribe(params => {
      const token = params.token;
      if (token) {
        this.userToken = token;
      }
    });
  }

  /**
   * Initialize form and validations
   */
  initStepTwo = () => {
    this.stepTwoForm = this.fb.group({
      subject: ['', Validators.required],
      detail: ['', Validators.required],
      due_date: moment().add(2, 'weeks').format('MM/DD/YYYY'),
      teammember: null
    });
  }

  /**
   * Set importance
   * @param event Selected importance
   */
  updateImportance = event => {
    this.importance = event;
  }

  /**
   * Remove local file from array
   * @param idx File index
   */
  removeFile(idx) {
    this.fileList.splice(idx, 1);
  }

  /**
   * Set files array to upload
   * @param event Dropzone drop event
   */
  uploadFile = (event: any) => {
    const file = event.target.files[0];
    const format = file.name.substr(file.name.lastIndexOf('.')).toLowerCase();
    const index = this.sharedService.allowedFileFormats.indexOf(format);
    if (index >= 0) {
      this.fileList.push(file);
    } else {
      this.notifier.displayErrorMsg(Messages.notifier.fileNotSupported);
    }
  }

  /**
   * Handle captcha response
   * @param event Captcha response
   */
  onCaptchaComplete = (response: any) => {
    if (response) {
      this.isCaptchaAccepted = true;
    }
  }

  /**
   * Handle form submission
   */
  submitRequest = () => {
    // Check subject
    if (
      this.stepTwoForm.value.subject === '' || !this.stepTwoForm.value.subject.trim().length
    ) {
      this.notifier.displayErrorMsg(Messages.notifier.enterSubject);
      window.scroll(0, 0);
      return;
    }

    // Check details
    if (
      this.stepTwoForm.value.detail === '' || !this.stepTwoForm.value.detail.trim().length
    ) {
      this.notifier.displayErrorMsg(Messages.notifier.enterDescription);
      window.scroll(0, 0);
      return;
    }

    // Check captcha
    if (!this.isCaptchaAccepted) {
      this.notifier.displayErrorMsg(Messages.notifier.enterCaptcha);
      window.scroll(0, 0);
      return;
    }

    const params: any = {
      subject: this.stepTwoForm.value.subject || '',
      request_priority: this.importance,
      description: this.stepTwoForm.value.detail || '',
      requested_due_date: this.stepTwoForm.value.due_date ?
        this.sharedService.formatDate(
          moment(this.stepTwoForm.value.due_date, 'MM/DD/YYYY').toDate()
        ) : null,
      auth: this.userToken,
    };

    if (this.stepTwoForm.value.teammember && this.stepTwoForm.value.teammember.length > 0) {
      params.assigned_to = this.stepTwoForm.value.teammember || '';
    }

    if (this.fileList && this.fileList.length) {
      const formData: FormData = new FormData();
      this.fileList.map(obj => {
        formData.append('document', obj);
      });
      formData.append('auth', this.userToken);
      this.nruService.uploadDocument(formData).subscribe(res => {
        params.attachments = res && res.doc_id ? res.doc_id : [];
        this.addRequest(params);
      });
    } else {
      params.attachments = [];
      this.addRequest(params);
    }
  }

  /**
   * Add new request
   * @param params Payload
   */
  addRequest(params) {
    this.nruService.submitRequest(params).subscribe(res => {
      if (res) {
        const mssage: IMessage = {
          message: res.detail
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['/pending-requests', this.userToken]);
      }
    }, (error) => {
      if (error.error && typeof error.error.detail === 'string') {
        this.notifier.displayErrorMsg(error.error.detail);
      } else {
        if (error.error && error.error.detail) {
          this.notifier.displayErrorMsg(error.error.detail[0]);
        }
      }
    });
  }

  /**
   * Navigate to pending requests
   */
  backToPendingRequest = () => {
    this.router.navigate(['requests/pending-requests', this.userToken]);
  }
}
