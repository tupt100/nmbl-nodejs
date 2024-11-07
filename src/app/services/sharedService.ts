import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { NotifierService } from 'angular-notifier';
import { Observable, BehaviorSubject } from 'rxjs';
import * as moment from 'moment';

import { IBaseResponse } from '../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../config/web.config';
import { Messages } from './messages';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  constructor(
    private messageService: NotifierService,
    private http: HttpClient,
    private router: Router
  ) { }

  // Message for Login page (Observable)
  loginPageMessage = new BehaviorSubject({ msg: '', success: false });

  // Observable for Projects and Workflows carrier (from detail to creation page)
  moduleCarrier = new BehaviorSubject({ type: '', data: [] });

  // Error messages (Observable)
  errorMessage = new BehaviorSubject('');

  // Project/Workflow statuses
  pWStatusList = [{
    id: 1,
    title: 'New'
  },
  {
    id: 2,
    title: 'Completed'
  },
  {
    id: 3,
    title: 'Archived'
  }];

  // Task statuses list
  statusList = [
    {
      id: 7,
      title: 'Advise'
    },
    {
      id: 8,
      title: 'Analyze'
    },
    {
      id: 9,
      title: 'Approve'
    },
    {
      id: 4,
      title: 'Archived'
    },
    {
      id: 10,
      title: 'Brief'
    },
    {
      id: 11,
      title: 'Closing'
    },
    {
      id: 12,
      title: 'Communicate'
    },
    {
      id: 3,
      title: 'Completed'
    },
    {
      id: 13,
      title: 'Coordinate'
    },
    {
      id: 14,
      title: 'Deposition'
    },
    {
      id: 15,
      title: 'Diligence'
    },
    {
      id: 16,
      title: 'Discovery'
    },
    {
      id: 17,
      title: 'Document'
    },
    {
      id: 18,
      title: 'Draft'
    },
    {
      id: 19,
      title: 'Execute'
    },
    {
      id: 5,
      title: 'External Request'
    },
    {
      id: 6,
      title: 'External Update'
    },
    {
      id: 20,
      title: 'Fact Gathering'
    },
    {
      id: 21,
      title: 'File'
    },
    {
      id: 22,
      title: 'File Management'
    },
    {
      id: 23,
      title: 'Hearing'
    },
    {
      id: 2,
      title: 'In-Progress'
    },
    {
      id: 24,
      title: 'Investigate'
    },
    {
      id: 25,
      title: 'Negotiate'
    },
    {
      id: 1,
      title: 'New'
    },
    {
      id: 26,
      title: 'On Hold'
    },
    {
      id: 27,
      title: 'Plan'
    },
    {
      id: 28,
      title: 'Pleading'
    },
    {
      id: 29,
      title: 'Prepare'
    },
    {
      id: 30,
      title: 'Research'
    },
    {
      id: 31,
      title: 'Review'
    },
    {
      id: 32,
      title: 'Revise'
    },
    {
      id: 33,
      title: 'Settle'
    },
    {
      id: 34,
      title: 'Structure'
    }
  ];

  // Importance list
  importanceList = [
    { id: 1, title: 'Low' },
    { id: 2, title: 'Medium' },
    { id: 3, title: 'High' }
  ];

  // Privilege list
  privilegeList = [{
    id: '',
    title: 'None'
  },
  {
    id: 'attorney_client_privilege',
    title: 'Attorney Client'
  },
  {
    id: 'work_product_privilege',
    title: 'Work Product'
  },
  {
    id: 'confidential_privilege',
    title: 'Confidential'
  }];

  // Allowed file formats to upload
  allowedFileFormats: Array<string> = [
    '.docx', '.doc', '.rtf', '.txt', '.docm', '.xml', '.xlsx', '.xls',
    '.pdf', '.png', '.tif', '.msg', '.jpg', '.pptx', '.gif', '.stl', '.csv'
  ];

  // Search filters object (sortBy, type and importance)
  globalSearchFilter = {
    sortBy: [
      {
        id: '1',
        name: 'A-Z'
      },
      {
        id: '2',
        name: 'Z-A'
      }
    ],
    type: [
      {
        id: '1',
        name: 'Projects'
      },
      {
        id: '2',
        name: 'Workflows'
      },
      {
        id: '3',
        name: 'Tasks'
      },
      {
        id: '4',
        name: 'Documents'
      },
      {
        id: '5',
        name: 'Show All'
      }
    ],
    importance: [
      {
        id: '3',
        name: 'High'
      },
      {
        id: '2',
        name: 'Medium'
      },
      {
        id: '1',
        name: 'Low'
      },
      {
        id: '4',
        name: 'Show All'
      }
    ],
  };

  // tslint:disable-next-line:max-line-length
  emailRegEx = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

  camelCaseRegEx = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])');

  specialCharRegEx = new RegExp('^(?=.*?[!@£$%^&*()])');

  digitsRegEx = new RegExp('^[0-9]*$');

  tagRegEx = new RegExp('^[a-zA-Z0-9_ -]*$');

  /**
   * Show Angular notifier error message popup (using in interceptor error handler only)
   * @param msg Message
   */
  public showError(msg: string): void {
    this.messageService.notify('error', msg);
  }

  /**
   * Remove all Angular notifier error message popups
   */
  public dismissAllMessages(): void {
    this.messageService.hideAll();
  }

  /**
   * Return blob response for the given document URL
   * @param fileUrl Document URL
   */
  public getFileBlob(fileUrl: string = ''): Observable<any> {
    return this.http.get(`${fileUrl}`, { responseType: 'blob' });
  }

  /**
   * Delete document
   * @param id Document ID
   */
  public deleteDocument(id: number): Observable<any> {
    return this.http.delete<IBaseResponse<any>>(`${API_BASE_URL}projects/api/documents/${id}/`);
  }

  /**
   * Clear storage and navigate to login
   * @param sessionExpired Is session expired [boolean]
   */
  public clearStorageAndRedirectToLogin(sessionExpired?: boolean): void {
    localStorage.clear();
    sessionStorage.clear();

    if (sessionExpired) {
      this.loginPageMessage.next({ success: false, msg: Messages.errors.sessionExpired });
    }

    this.router.navigate(['/auth/login']);
  }

  /**
   * Send task notification
   * @param id Task ID
   */
  public sendNotifications(id: string): Observable<any> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}notifications/api/taskupdate/`, { task_id: id });
  }

  /**
   * Logout API
   */
  public logOut(): Observable<IBaseResponse<any>> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/logout/`, {});
  }

  public getGoogleDocUrlPattern(): string {
    const urlRegex = "https://docs.google.com/.+";
    return urlRegex;
  }

  public getExternalUrlPattern(): string {
    const urlRegex = "https://docs.google.com/.+";
    return urlRegex;
  }

  public isExternalDocument(url: any): Boolean {
    let re = new RegExp(this.getExternalUrlPattern());
    return re.test(url);
  }
  /**
   * Upload document
   * @param file File
   */
  public uploadDocument(file: any): Observable<any> {
    const formData = new FormData();
    if (!file.external_url) {
      if (file.newName) {
        formData.append('document', file, file.newName);
      } else {
        formData.append('document', file);
      }
      formData.append('document_name', file.newName ? file.newName : file.name);
      if (file.document_tag_save) {
        formData.append('document_tag_save', file.document_tag_save);
      }
    } else {
      formData.append('document_name', file.name);
      formData.append('external_url', file.external_url);
    }


    return this.http.post(`${API_BASE_URL}projects/api/documents/`, formData);
  }

  /**
   * Removed keys from object with empty values (used for sending params)
   * @param params Object
   */
  public filterParams(params): object {
    return Object.entries(params).reduce((a, [k, v]) => (!v ? a : { ...a, [k]: v }), {});
  }

  /**
   * Return formatted date for creating P/W/T
   * @param date Date
   */
  public formatDate(date): string {
    const time = moment().format('HH:mm:ss');
    return moment(date).format(`YYYY-MM-DD[T]${time}Z`);
  }

  /**
   * Return Initials for user who don't have profile pic
   * @param firstName First name
   * @param lastName Last name
   */
  public displayInitial(firstName: string, lastName: string): string {
    let name = '';
    if (firstName) {
      name += `${firstName.charAt(0)}`;
    }
    if (lastName) {
      name += `${lastName.charAt(0)}`;
    }
    return name ? name : '--';
  }

  /**
   * Return Initials for user (with full name) who don't have profile pic
   * @param name User name
   */
  public displayInitialFull(name) {
    if (name) {
      const nameArr = name.split(' ');
      if (nameArr.length > 1) {
        return nameArr[0].charAt(0) + nameArr[1].charAt(0);
      } else {
        return nameArr[0].charAt(0);
      }
    }
  }

  /**
   * Detect for mobile devices
   */
  public mainDetectMOB() {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Return task status title using code
   * @param statusCode Task status code
   */
  public taskStatus(statusCode: number): string {
    switch (statusCode) {
      case 1:
        return 'New';
      case 2:
        return 'In-Progress';
      case 3:
        return 'Completed';
      case 4:
        return 'Archived';
      case 5:
        return 'External Request';
      case 6:
        return 'External Update';
      case 7:
        return 'Advise';
      case 8:
        return 'Analyze';
      case 9:
        return 'Approve';
      case 10:
        return 'Brief';
      case 11:
        return 'Closing';
      case 12:
        return 'Communicate';
      case 13:
        return 'Coordinate';
      case 14:
        return 'Deposition';
      case 15:
        return 'Diligence';
      case 16:
        return 'Discovery';
      case 17:
        return 'Document';
      case 18:
        return 'Draft';
      case 19:
        return 'Execute';
      case 20:
        return 'Fact Gathering';
      case 21:
        return 'File';
      case 22:
        return 'File Management';
      case 23:
        return 'Hearing';
      case 24:
        return 'Investigate';
      case 25:
        return 'Negotiate';
      case 26:
        return 'On Hold';
      case 27:
        return 'Plan';
      case 28:
        return 'Pleading';
      case 29:
        return 'Prepare';
      case 30:
        return 'Research';
      case 31:
        return 'Review';
      case 32:
        return 'Revise';
      case 33:
        return 'Settle';
      case 34:
        return 'Structure';
      default:
        return 'External Update';
    }
  }
}
