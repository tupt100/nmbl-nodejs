import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import * as moment from 'moment';

import { NotifierComponent } from '../../ui-kit/notifier/notifier.component';
import { environment } from 'src/environments/environment';
import { Messages } from 'src/app/services/messages';
import { SharedService } from 'src/app/services/sharedService';
import { NRUService } from '../nru.service';
import { MessageService, IMessage } from '../../../services/message.service';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit {

  /**
   * Bindings
   */
  @ViewChild(NotifierComponent, { static: true }) notifier: NotifierComponent;
  catpachaKey = environment.catpachaKey;
  public firstStep = true;
  public stepOneForm: FormGroup;
  public stepTwoForm: FormGroup;
  public importance = 2;
  public googleToken = '';
  public userToken = '';
  public isCaptchaAccepted = false;
  public totalLength = 14;
  public fileList = [];
  public emailRegEx = this.sharedService.emailRegEx;
  public showModal = {
    viewMyRequest: false
  };
  public companyName = '';
  public isInvalidEmail = false;
  public emailNotExist = false;
  public userEmail = '';
  submitted = false;

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.showModal.viewMyRequest = false;
    }
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private nruService: NRUService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.initStepOne();
    this.initStepTwo();
    this.getCompanyInformation();
    const linkExpired = localStorage.getItem('linkExpired');
    if (linkExpired && linkExpired === 'true') {
      localStorage.setItem('linkExpired', null);
      this.showModal.viewMyRequest = true;
    }
  }

  /**
   * Get company information
   */
  getCompanyInformation = () => {
    this.nruService.getCompanyInfo().subscribe(result => {
      if (result && result.results && result.results.length) {
        this.companyName = result.results[0].company;
      }
    });
  }

  /**
   * Initialize first form and validations
   */
  initStepOne = () => {
    this.stepOneForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.minLength(10)]
    });
  }

  /**
   * Initialize second form and validations
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
   * Filter keypress and return digits only
   */
  numberOnly = (event: any): boolean => {
    const charCode = (event.which) ? event.which : event.charCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }

    if (event.target && event.target.value && event.target.value.length > 14) {
      return false;
    }
    return true;
  }

  /**
   * Filter keypress and return alphabets only
   */
  allowOnlyText = (event) => {
    const charCode = (event.which) ? event.which : event.charCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 32 || charCode === 39) {
      return true;
    }
    return false;
  }

  /**
   * Validate form one and move to step two
   */
  stepOneComplete = () => {
    this.submitted = true;

    // Check name
    if (
      this.stepOneForm.value.name === '' ||
      !this.stepOneForm.value.name.trim().length
    ) {
      return this.showErrorMessage(Messages.notifier.nameReq);
    }

    // Check name length not more than 50 characters
    if (this.stepOneForm.value.name.trim().length > 50) {
      return this.showErrorMessage(Messages.notifier.nameNotMoreThan50);
    }

    // Check email
    if (
      this.stepOneForm.value.email === '' ||
      !this.stepOneForm.value.email.trim().length
    ) {
      return this.showErrorMessage(Messages.notifier.emailReq);
    }

    // Check email against regex
    if (!this.emailRegEx.test(this.stepOneForm.value.email)) {
      return this.showErrorMessage(Messages.notifier.validEmail);
    }

    // Check phone for not more than 10 characters
    if (
      this.stepOneForm.value.phone && this.stepOneForm.value.phone.trim().length < 10
    ) {
      return this.showErrorMessage(Messages.notifier.phoneMust10);
    }

    // Check form validation
    if (this.stepOneForm.invalid) {
      return;
    }

    this.firstStep = false;
  }

  /**
   * Set importance
   * @param event Selected importance
   */
  updateImportance = (event) => {
    this.importance = event;
  }

  /**
   * Handle Google captcha
   */
  onCaptchaComplete = (response: any) => {
    if (response) {
      this.googleToken = response;
      this.isCaptchaAccepted = true;
    }
  }

  /**
   * Navigate to step one
   */
  backToStepOne = () => {
    this.firstStep = true;
  }

  /**
   * Submit step one
   */
  submitStepOne = () => {
    // Check subject
    if (
      this.stepTwoForm.value.subject === '' ||
      !this.stepTwoForm.value.subject.trim().length
    ) {
      return this.showErrorMessage(Messages.notifier.enterSubject);
    }

    // Check detail
    if (
      this.stepTwoForm.value.detail === '' ||
      !this.stepTwoForm.value.detail.trim().length
    ) {
      return this.showErrorMessage(Messages.notifier.enterDescription);
    }

    // Check captcha
    if (!this.isCaptchaAccepted) {
      return this.showErrorMessage(Messages.notifier.enterCaptcha);
    }

    const params: any = {
      user_name: this.stepOneForm.value.name || '',
      user_email: this.stepOneForm.value.email || '',
      captch: this.googleToken
    };
    if (this.stepOneForm.value.phone !== '' && this.stepOneForm.value.phone.trim().length > 0) {
      params.user_phone_number = this.stepOneForm.value.phone.replace(/\-/g, '').replace(/\ /g, '');
    }
    this.nruService.getTokenForStep2(params).subscribe(res => {
      if (res) {
        this.userToken = res.user_id;
        this.submitStepTwo();
      }
    }, (error) => {
      if (error.error && error.error.detail && typeof error.error.detail === 'string') {
        this.showErrorMessage(error.error.detail);
      } else {
        if (error.error && error.error.detail &&  error.error.detail.length) {
          this.showErrorMessage(error.error.detail[0]);
        }
      }
    });
  }

  /**
   * Submit step two
   */
  submitStepTwo = () => {
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
    if (
      this.stepTwoForm.value.teammember &&
      this.stepTwoForm.value.teammember.length
    ) {
      params.assigned_to = this.stepTwoForm.value.teammember || '';
    }

    // UPLOAD DOCUMENT IF WE HAVE
    if (this.fileList && this.fileList.length) {
      const formData: FormData = new FormData();
      this.fileList.map(obj => {
        formData.append('document', obj);
      });
      formData.append('auth', this.userToken);
      this.nruService.uploadDocument(formData).subscribe(res => {
        params.attachments = res && res.doc_id ? res.doc_id : [];
        this.submitRequest(params);
      });
    } else {
      params.attachments = [];
      this.submitRequest(params);
    }
  }

  /**
   * Submit request data
   * @param params Payload
   */
  submitRequest(params) {
    this.nruService.submitRequest(params).subscribe(res => {
      if (res) {
        const mssage: IMessage = {
          message: res.detail
        };
        this.messageService.recordCreatedUpdated(mssage);
        this.router.navigate(['/pending-requests', this.userToken]);
      }
    }, (error) => {
      if (error.error && error.error.detail && typeof error.error.detail === 'string') {
        this.showErrorMessage(error.error.detail);
      } else {
        if (error.error && error.error.detail &&  error.error.detail.length) {
          this.showErrorMessage(error.error.detail[0]);
        }
      }
    });
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
      this.showErrorMessage(Messages.notifier.fileNotSupported);
    }
  }

  /**
   * Remove local file from array
   * @param idx File index
   */
  removeFile(idx) {
    this.fileList.splice(idx, 1);
  }

  /**
   * Submit form to get link for pending requests
   */
  onSubmit = () => {
    this.isInvalidEmail = false;
    if (this.userEmail === '' || !this.emailRegEx.test(this.userEmail)) {
      this.isInvalidEmail = true;
      return false;
    } else {
      this.sendEmail(this.userEmail);
    }
  }

  /**
   * Send link for pending requests to email
   * @param email Email
   */
  sendEmail = (email: string) => {
    this.nruService.accessForPendingRequest(email).subscribe(result => {
      if (result) {
        this.notifier.displaySuccessMsg(Messages.notifier.emailSent);
        this.showModal.viewMyRequest = false;
        this.userEmail = '';
      }
    }, (error: HttpErrorResponse) => {
      this.userEmail = '';
      if (error.status === 404) {
        this.emailNotExist = true;
        setTimeout(() => {
          this.emailNotExist = false;
        }, 5000);
      } else {
        this.showErrorMessage(error.error.detail);
      }
    });
  }

  /**
   * Show error message
   * @param message Message
   */
  showErrorMessage(message: string) {
    this.notifier.displayErrorMsg(message);
    window.scroll(0, 0);
  }
}
