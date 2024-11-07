import { Component, OnInit, Input, Output, EventEmitter, HostListener, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { CommonService } from '../common.service';
import { SharedService } from 'src/app/services/sharedService';
import { Messages } from 'src/app/services/messages';
import { NRUService } from '../../nru/nru.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../store';
import * as moment from 'moment';

@Component({
  selector: 'app-discussions',
  templateUrl: './discussions.component.html',
  styleUrls: ['./discussions.component.scss']
})
export class DiscussionsComponent implements OnInit, OnDestroy {

  constructor(
    private service: CommonService,
    public sharedService: SharedService,
    private nruService: NRUService,
    private ngZone: NgZone,
    private store: Store<fromRoot.AppState>,
  ) { }

  /**
   * Bindings
   */
  @Input() modalType = '';
  @Input() modalId = '';
  @Input() token = '';
  @Output() refresh = new EventEmitter();
  @Output() softRefresh = new EventEmitter();
  @Input() detail: any;
  @ViewChild(PerfectScrollbarComponent) scrollBar: PerfectScrollbarComponent;
  messages = [];
  loader = false;
  messagesParams = {
    limit: 10,
    offset: 0,
    count: 0
  };
  newContact = {
    trigger: false,
    name: '',
    email: ''
  };
  messageData = {
    msg: '',
    attachments: [],
    is_internal_message: true,
    is_external_message: false
  };
  momentObj = moment;
  showModal = {
    deleteDoc: false,
    uploadDoc: false,
    uploadDocMessage: false,
    newContactMessage: false
  };
  files = [];
  deleteObj = {
    message1: '',
    message2: '',
    buttonText: 'Delete',
    docToDelete: null
  };
  messageTypeText = 'Internal Team';
  showMessageType = false;
  userId = null;
  objUser$: any;
  @Input() message_inbound_email: string = '';
  @Output() onSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
  public iscc: boolean = false;
  public service_desk_request: number = 0;
  public ccemail: string = '';

  /**
   * Set message type
   * @param type Message type
   */
  selected_users: Array<string> = [];

  /**
   * Handler to close message type dropdown on outside click
   * @param event Mouse Click Event
   */
  @HostListener('document:click', ['$event'])
  hideMessageType(event) {
    if (['sender-list-wrap', 'selected-sender'].indexOf(event.target.className) === -1) {
      this.showMessageType = false;
    }
  }

  ngOnInit() {
    // Getting user ID and messages
    this.objUser$ = this.store.select('userDetails').subscribe((res: any) => {
      if (res.loaded) {
        this.userId = res.datas.id;
      }
    });
    this.getMessages();
  }

  /**
   * Unsubscribing observables
   */
  ngOnDestroy() {
    if (this.objUser$) {
      this.objUser$.unsubscribe();
    }
  }

  /**
   * Getting messages for Project, Workflows, Tasks and Submitted Requests
   */
  getMessages(): void {
    if (this.modalType === 'submitrequest') {
      const params = {
        auth: this.token,
        request_id: this.modalId,
        limit: this.messagesParams.limit,
        offset: this.messagesParams.offset
      };
      this.service.getSubmitRequestMessages(params).subscribe(res => {
        this.setMessages(res);
        this.loader = false;
      });
    } else {
      this.getPWTMessages();
    }
  }

  /**
   * Set messages and scroll chat area
   * @param res Messages API response
   */
  setMessages(res: any): void {
    const reverseMessages = res && res.results && res.results.length ? res.results.reverse() : [];
    if (reverseMessages && reverseMessages.length) {
      this.messages = this.messages.concat(reverseMessages);
    }
    if (res.count) {
      this.messagesParams.count = res.count;
    }
    this.scrollChatMessageArea();
  }

  /**
   * Get messages from Project, Workflow and Task
   */
  getPWTMessages(): void {
    const params = {
      model_type: this.modalType,
      model_id: this.modalId,
      limit: this.messagesParams.limit,
      offset: this.messagesParams.offset
    };
    this.loader = true;
    this.service.getMessages(params).subscribe(res => {
      this.setMessages(res);
      this.loader = false;
    });
  }

  /**
   * Scroll Chat Area
   * @param timeOut Timeout
   */
  scrollChatMessageArea(timeOut?: number): void {
    const timer = timeOut || 500;
    setTimeout(() => {
      const chatDiv = this.scrollBar.directiveRef.elementRef.nativeElement;
      if (chatDiv) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
      }
    }, timer);
  }

  /**
   * Return boolean by comparing date with previous date for different day
   * @param messageIndex Message index
   */
  isDifferentDay(messageIndex: number): boolean {
    if (messageIndex === 0) {
      return true;
    }

    const d1 = new Date(this.messages[messageIndex - 1].created_at);
    const d2 = new Date(this.messages[messageIndex].created_at);

    return (
      d1.getFullYear() !== d2.getFullYear() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getDate() !== d2.getDate()
    );
  }

  /**
   * Return timline date for messages
   * @param messageIndex Message index
   */
  getMessageDate(messageIndex: number): string {
    const dateToday = new Date().toDateString();
    const today = dateToday.slice(0, dateToday.length - 5);

    const wholeDate = new Date(
      this.messages[messageIndex].created_at
    ).toDateString();

    const day = moment(this.messages[messageIndex].created_at).format('dddd');

    const messageDateString = wholeDate.slice(0, wholeDate.length - 5);

    if (
      new Date(this.messages[messageIndex].created_at).getFullYear() ===
      new Date().getFullYear()
    ) {
      if (messageDateString === today) {
        return 'Today, ' + moment(this.messages[messageIndex].created_at).format('hh:mm A');
      } else {
        return day + ', ' + moment(messageDateString, 'ddd MMM DD').format('MM-DD-YYYY');
      }
    } else {
      return day + ', ' + moment(wholeDate, 'ddd MMM DD YYYY').format('MM-DD-YYYY');
    }
  }

  /**
   * Handle chat area scroll to get previous messages
   */
  onScroll = (event) => {
    const chatDiv = this.scrollBar.directiveRef.elementRef.nativeElement;
    const initialHeight = chatDiv.scrollHeight;
    const scrollTop = event.target.scrollTop;
    if (scrollTop <= 0) {
      if (this.messagesParams.count > this.messages.length) {
        const offset = this.messagesParams.offset += 10;
        if (this.modalType === 'submitrequest') {
          this.getPrevSubmitRequestMessages(offset, initialHeight, chatDiv);
        } else {
          this.getPrevPWTMessages(offset, initialHeight, chatDiv);
        }
      }
    }
  }

  /**
   * Return previous messages for Project, Workflow and Tasks
   * @param offset Offset
   * @param initialHeight Initial Height
   * @param chatDiv Chat Div
   */
  getPrevPWTMessages(offset, initialHeight, chatDiv) {
    const params = {
      model_type: this.modalType,
      model_id: this.modalId,
      limit: this.messagesParams.limit,
      offset
    };
    this.service.getMessages(params).subscribe(res => {
      this.ngZone.run(() => {
        if (res.count) {
          this.messagesParams.count = res.count;
        }
        const reverseMessages = res && res.results && res.results.length ? res.results.reverse() : [];
        if (reverseMessages && reverseMessages.length) {
          const temp = [...this.messages];
          this.messages = reverseMessages.concat(temp);
        }
        setTimeout(() => {
          const diff = chatDiv.scrollHeight - initialHeight;
          chatDiv.scrollTop += diff;
        }, 5);
      });
    });
  }

  /**
   * Return previous messages for submitted requests
   * @param offset Offset
   * @param initialHeight Initial Height
   * @param chatDiv Chat Div
   */
  getPrevSubmitRequestMessages(offset, initialHeight, chatDiv) {
    const params = {
      auth: this.token,
      request_id: this.modalId,
      limit: this.messagesParams.limit,
      offset
    };
    this.service.getSubmitRequestMessages(params).subscribe(res => {
      this.ngZone.run(() => {
        if (res.count) {
          this.messagesParams.count = res.count;
        }
        const reverseMessages = res && res.results && res.results.length ? res.results.reverse() : [];
        if (reverseMessages && reverseMessages.length) {
          const temp = [...this.messages];
          this.messages = reverseMessages.concat(temp);
        }
        setTimeout(() => {
          const diff = chatDiv.scrollHeight - initialHeight;
          chatDiv.scrollTop += diff;
        }, 5);
      });
    });
  }


  /**
   * Download file
   * @param file File
   */
  downloadFile(file: any) {
    if (this.sharedService.isExternalDocument(file.document_url || file.attachment_url)) {
      window.open(file.document_url, "_blank")
      return;
    }
    const fileObj = Object.assign(file);
    fileObj.name = file.document_name || file.attachment_name;
    this.sharedService
      .getFileBlob(fileObj.document_url || fileObj.attachment_url)
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
   * Open delete popup
   * @param id Message ID
   */
  openDeletePopup(id: string): void {
    const message1 = Messages.popups.deletedMsg.title;
    const message2 = Messages.popups.deletedMsg.message;
    const buttonText = 'Delete';
    this.deleteObj = {
      message1,
      message2,
      buttonText,
      docToDelete: id
    };
    this.showModal.deleteDoc = true;
  }

  /**
   * Call delete message API
   * @param resp Confirmation for deletion
   */
  deleteMessage(resp: boolean): void {
    if (resp) {
      this.deleteMessages();
    } else {
      this.hidePopup();
    }
  }

  /**
   * Delete message handler
   */
  deleteMessages() {
    this.service.deleteMessage(this.modalId, this.modalType, { message_id: this.deleteObj.docToDelete }).subscribe(res => {
      const idx = this.messages.findIndex(x => +x.id === +this.deleteObj.docToDelete);
      if (idx > -1) {
        this.messages.splice(idx, 1);
        this.messagesParams.count -= 1;
      }
      this.hidePopup();
    });
  }

  /**
   * Hide popups
   */
  hidePopup() {
    this.deleteObj = {
      message1: '',
      message2: '',
      buttonText: 'Delete',
      docToDelete: null
    };
    this.showModal.deleteDoc = false;
  }

  /**
   * Open disussion uploader modal
   * @param key Uploader key
   */
  openUploader(key: string): void {
    this.showModal[key] = true;
  }

  /**
   * Handler for document upload component response
   * @param res Response from document upload component
   */
  updateTaskDocs(res: any) {
    if (res && res.fileError) {
      return this.sharedService.errorMessage.next(res.fileError);
    } else if (res && res.files && res.files.length) {
      this.files = res.files;
      this.showModal.uploadDocMessage = false;
    } else {
      this.showModal.uploadDoc = false;
      this.showModal.uploadDocMessage = false;
    }
  }

  /**
   * Send Message handler for Project, Workflows, Tasks and Submitted Requests
   */
  sendMessage() {
    if ((this.messageData.msg && this.messageData.msg.trim() !== '') || this.files.length) {
      if (this.modalType === 'submitrequest') {
        if (this.files.length) {
          this.uploadNSetAttachments(this.modalType);
        } else {
          this.messageData.attachments = [];
          this.sendSubmitRequestMessages();
        }
      } else {
        if (this.newContact.trigger) {
          //&& this.newContact.visibleemail
          this.openSentMessagePopup();
        } else {
          this.sendInternalExternalMsg();
        }
      }
    } else {
      this.sharedService.errorMessage.next(Messages.errors.inputMessage);
    }
  }

  /**
   * Send submit request messages
   * @param refresh For trigger refresh (optional)
   */
  sendSubmitRequestMessages(refresh?: boolean) {
    const message = this.messageData.msg.replace(/(?:\r\n|\r|\n)/g, '\n');
    const data = {
      message,
      request_id: this.modalId,
      auth: this.token,
      attachments: this.messageData.attachments
    };
    this.service.sendSubmitRequestsMsg(data).subscribe(res => {
      if (refresh) {
        this.refresh.emit();
      } else {
        this.messages.push(res);
        this.messagesParams.count += 1;
        this.messagesParams.offset += 1;
        this.messageData.msg = '';
        this.messageData.attachments = [];
        this.files = [];
        this.scrollChatMessageArea();
      }
    });
  }

  /**
   * Show messages with html encoding
   * @param msg Message text
   */
  displayMessage(msg): string {
    if (msg) {
      let message = msg;
      message = message.replace(/(?:\r\n|\r|\n)/g, '<br />');
      return message;
    }
  }

  /**
   * Toggle message type dropdown
   */
  showMessageTypePopup() {
    this.showMessageType = !this.showMessageType;
  }

  /**
   * Open send new contact message popup
   */
  openSentMessagePopup(): void {
    if (!this.newContact.name.trim() || !this.newContact.email.trim()) {
      return this.sharedService.errorMessage.next(Messages.errors.requiredNameAndEmail);
    }

    const emailRegEx = this.sharedService.emailRegEx;
    if (!emailRegEx.test(this.newContact.email)) {
      return this.sharedService.errorMessage.next(Messages.errors.validReceipientEmail);
    }

    if (this.ccemail) {
      const data: Array<string> = this.ccemail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
      if (data && data.length > 0) {
        let count: number = 0;
        data.map(o => {
          if (!emailRegEx.test(o)) {
            return this.sharedService.errorMessage.next(Messages.errors.validCCEmail);
          } else {
            count = count + 1;
          }
        });
        if (data.length === count) {
          this.showModal.newContactMessage = true;
        }
      }
    } else {
      this.showModal.newContactMessage = true;
    }
  }

  /**
   * Handler send new contact message popup response
   */
  sendNewContactMessage = (resp) => {
    if (resp) {
      if (this.messageData.msg && this.messageData.msg.trim() !== '') {
        if (this.files.length) {
          this.uploadNSetAttachments('newContact');
        } else {
          this.messageData.attachments = [];
          this.sendNewDiscussionMsg();
        }
      } else {
        this.showModal.newContactMessage = false;
        this.sharedService.errorMessage.next(Messages.errors.inputMessage);
      }
    } else {
      this.showModal.newContactMessage = false;
    }
  }

  /**
   * Send new contact message
   */
  sendNewDiscussionMsg() {
    const message = this.messageData.msg.replace(/(?:\r\n|\r|\n)/g, '\n');
    const params = {
      user_name: this.newContact.name,
      user_email: this.newContact.email,
      description: message,
      attachments: this.messageData.attachments
    };
    if (this.ccemail) {
      params['cc'] = this.ccemail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    }
    this.service.requestAssociateUser(this.modalId, this.modalType, params).subscribe(res => {
      this.messageData.attachments = [];
      this.files = [];
      this.refresh.emit();
    });
  }

  /**
   * Handler Internal/External Messages
   */
  sendInternalExternalMsg(): void {
    if (this.files.length) {
      this.uploadNSetAttachments();
    } else {
      this.messageData.attachments = [];
      this.sendDiscussionMessages();
    }
  }

  /**
   * Upload and set attachment as per modal type
   * @param modalType Modal type
   */
  uploadNSetAttachments(modalType?: string) {
    this.messageData.attachments = [];
    if (modalType === 'submitrequest') {
      const formData: FormData = new FormData();
      this.files.map(obj => {
        formData.append('document', obj);
      });
      formData.append('auth', this.token);
      this.nruService.uploadDocument(formData).subscribe(res => {
        this.messageData.attachments = res.doc_id && res.doc_id.length ? res.doc_id : [];
        this.sendSubmitRequestMessages(true);
      }, e => {
        const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.uploadFailed;
        return this.sharedService.errorMessage.next(error);
      });
    } else {
      const arr = [];
      let count = 1;
      this.files.forEach(file => {
        this.sharedService.uploadDocument(file).subscribe(res => {
          arr.push(res.id);
          if (count === this.files.length) {
            this.messageData.attachments = arr;
            switch (modalType) {
              case 'newContact':
                this.sendNewDiscussionMsg();
                break;

              default:
                this.sendDiscussionMessages();
                break;
            }
            this.softRefresh.emit(true);
          }
          count++;
        }, e => {
          const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.uploadFailed;
          return this.sharedService.errorMessage.next(error);
        });
      });
    }
  }

  /**
   * Send Internal/External Messages
   */
  sendDiscussionMessages() {
    if (this.messageTypeText === 'Internal Team') {
      this.sendmsg(this.service_desk_request, 0);
    } else {
      if (this.detail[this.modalType].servicedeskrequest_details && this.detail[this.modalType].servicedeskrequest_details.length > 0) {
        this.detail[this.modalType].servicedeskrequest_details.map((o, i) => {
          if (o.hasOwnProperty('checked') && o.checked) {
            this.sendmsg(o.service_desk_request, i)
          }
        });
      }
    }
  }

  /**
   * @param service_desk_request Id of service desk request
   * @param index
   * Function to send messages to external or internal user
   */
  sendmsg(service_desk_request: number, index?: number) {
    const message = this.messageData.msg.replace(/(?:\r\n|\r|\n)/g, '\n');
    const data = {
      message,
      attachments: this.messageData.attachments,
      is_internal_message: this.messageData.is_internal_message,
      is_external_message: this.messageData.is_external_message
    };
    if (this.ccemail) {
      data['cc'] = this.ccemail.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    }
    data[this.modalType] = this.modalId;
    if (this.messageTypeText !== 'Internal Team') {
      data['request_id'] = service_desk_request;
    }
    this.service.sendMessage(this.modalType, data).subscribe(res => {
      this.messages.push(res);
      this.messagesParams.count += 1;
      this.messagesParams.offset += 1;
      this.messageData.msg = '';
      this.scrollChatMessageArea();
      this.iscc = false;
      this.ccemail = '';
      this.files = [];
      this.messageData.attachments = [];
      if (this.modalType === 'task') {
        if (this.detail[this.modalType].servicedeskrequest_details && this.detail[this.modalType].servicedeskrequest_details.length > 0) {
          this.detail[this.modalType].servicedeskrequest_details[index]['checked'] = false;
          const totalRecords = this.detail[this.modalType].servicedeskrequest_details.filter(x => x['checked'] === true);
          if (totalRecords.length === 0) {
            this.messageData.is_internal_message = true;
            this.messageData.is_external_message = false;
          }
        }
      }
      this.messageTypeText = `Internal Team`;
    });
  }
  setMessageType(type?: string, user_id?: number, user_name?: string, index?: number, checked?: boolean) {
    this.selected_users = [];
    if (!type) {
      this.messageData.is_external_message = false;
      this.messageData.is_internal_message = true;
      this.newContact = {
        trigger: false,
        name: '',
        email: ''
      };
      this.messageTypeText = 'Internal Team';
      if (this.detail[this.modalType].servicedeskrequest_details && this.detail[this.modalType].servicedeskrequest_details.length > 0) {
        this.detail[this.modalType].servicedeskrequest_details.map(o => {
          o.checked = false;
        });
      }
    } else if (type === 'user') {
      if (this.detail[this.modalType].servicedeskrequest_details && this.detail[this.modalType].servicedeskrequest_details.length > 0) {
        this.detail[this.modalType].servicedeskrequest_details[index]['checked'] = checked ? !checked : true;
        this.detail[this.modalType].servicedeskrequest_details.map(o => {
          if (o.hasOwnProperty('checked') && o.checked) {
            this.selected_users.push(o.servicedeskuser.user_name);
          }
        });
      }
      this.messageData.is_external_message = true;
      this.messageData.is_internal_message = false;
      this.messageTypeText = this.selected_users.length === 1 ? this.selected_users.join() : `(${this.selected_users.length}) People`;
      this.service_desk_request = user_id;
      this.newContact = {
        trigger: false,
        name: this.messageTypeText,
        email: ''
      };
    } else if (type === 'new') {
      this.newContact = {
        trigger: true,
        name: '',
        email: ''
      };
      this.messageData.is_external_message = true;
      this.messageData.is_internal_message = false;
      this.messageTypeText = 'New Contact';
      if (this.detail[this.modalType].servicedeskrequest_details && this.detail[this.modalType].servicedeskrequest_details.length > 0) {
        this.detail[this.modalType].servicedeskrequest_details.map(o => {
          o.checked = false;
        });
      }
    }
    this.showMessageType = false;
  }

  /**
   * Return code for completed and rejected statuses
   * @param status Status title
   */
  getStatus(status: string): number {
    switch (status) {
      case 'completed':
        return this.modalType === 'task' ? 3 : 2;

      case 'archived':
        return this.modalType === 'task' ? 4 : 3;
    }
  }

  /**
   * Delete doc from local array
   * @param idx Index
   */
  deleteDocument(idx) {
    this.files.splice(idx, 1);
  }

  /**
   * Check for message document uploading permission
   */
  isMsgUploadingAllowed = (): boolean => {
    switch (this.modalType) {
      case 'submitrequest':
        return this.detail && this.detail.task &&
          +this.detail.task.status !== 3 && +this.detail.task.status !== 4 ? true : false;
      case 'project':
      case 'workflow':
      case 'task':
        return this.detail && this.detail[this.modalType] &&
          +this.detail[this.modalType].status !== this.getStatus('completed') &&
          +this.detail[this.modalType].status !== this.getStatus('archived') ? true : false;
    }
  }

  /**
   * Function to emit success value if copied to clipboard
   */
  onCopySuccess = () => {
    this.onSuccess.emit(true);
  }

  /**
   * Function to emit failure value if error occured while copy to clipboard
   */
  onCopyFailure = () => {
    this.onSuccess.emit(false);
  }
}
