import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Messages } from '../services/messages';
import { SharedService } from '../services/sharedService';
import { LoaderService } from '../modules/ui-kit/loader/loader.service';
import { NotifierService } from '../modules/ui-kit/notifier/notifier.service';
import { Router, ActivationEnd } from '@angular/router';

@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(
    private sharedService: SharedService,
    private loaderService: LoaderService,
    private router: Router,
    private notifierService: NotifierService,
  ) {
    this.router.events.subscribe(event => {
      // An event triggered at the end of the activation part of the Resolve phase of routing.
      if (event instanceof ActivationEnd) {
        // Cancel pending calls
        // this.httpCancelService.cancelPendingRequests();
      }
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.showLoader();
    // Get the auth token from the service.
    const token = localStorage.getItem('token');
    let authToken = '';
    if (token) {
      authToken = 'token ' + token;
    }

    /*
    * The verbose way:
    // Clone the request and replace the original headers with
    // cloned headers, updated with the authorization.
    */
    let authReq;
    if (
      req.url.match(/s3.amazonaws.com/g)
    ) {
      authReq = req.clone({ setHeaders: { 'x-auth': 'new' } });
    } else if (
      this.publicUrls(req.url)
    ) {
      authReq = req.clone({ setHeaders: { Authorization: 'ber' } });
    } else {
      authReq = req.clone({ setHeaders: { Authorization: authToken } });
    }
    // send cloned request with header to the next handler.
    return next.handle(authReq)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.onEnd();
          }
        }, (error: any) => {
          if (error instanceof HttpErrorResponse) {
            this.onEnd();
            if (
              req.url.match(/permission/g)
            ) {
              console.error('no permission');
            } else {
              this.errorHandler(req.url, error);
            }
          }
        })
      );
  }

  // Customize the default error handler here if needed
  private errorHandler(url: string, response: HttpErrorResponse): Observable<HttpEvent<any>> {
    if (!this.publicUrls(url)) {
      if (response.status === 401) {
        this.sharedService.dismissAllMessages();
        this.sharedService.clearStorageAndRedirectToLogin(true);
      } else if (response.status === 403) {
        const error = (response && response.error && response.error.detail) || Messages.errors.permissionErr;
        // this.sharedService.showError(error);
        this.showNotification(error);
      } else if (response.status === 400) {
        const error = (response && response.error && response.error.detail) || Messages.errors.badRequest;
        const fieldValidationErrorMessage = this.getFieldValidationErrorMessage(response);
        if (fieldValidationErrorMessage) {
          this.showNotification(fieldValidationErrorMessage);
        }
        else if (error !== Messages.errors.failedToAddGroup) {
          // this.sharedService.showError(error);
          this.showNotification(error);
        }
      } else if (response.status === 422) {
        // this.sharedService.showError(Messages.errors.validationErr);
        this.showNotification(Messages.errors.validationErr);
      } else if (response.status >= 500) {
        // this.sharedService.showError(Messages.errors.serverErr);
        this.showNotification(Messages.errors.serverErr);
      }
    }
    throw response;
  }

  private getFieldValidationErrorMessage(response) {
    let isFieldValidation = false;
    if (response && response.error) {
      const fieldValidationErrorCount = Object.keys(response.error).filter(a => a !== "detail").length;
      isFieldValidation = fieldValidationErrorCount > 0;
    }
    if (isFieldValidation) {
      const message = response.error[Object.keys(response.error)[0]][0];
      return message;
    }
    return null;
  }

  /**
   * Check urls for which we don't want to trigger errorHandler function
   */
  private publicUrls(url: string): RegExpMatchArray {
    return url.match(/member-signup/g) ||
      url.match(/send-password-reset/g) ||
      url.match(/resetpassword/g) ||
      url.match(/company_information/g) ||
      url.match(/doc_request_portal/g) ||
      url.match(/request_portal/g) ||
      url.match(/servicedesk-varification/g) ||
      url.match(/pending_request_desk/g) ||
      url.match(/user_information/g) ||
      url.match(/resend-requestpage-link/g) ||
      url.match(/invitation_verification/g) ||
      url.match(/login/g);
  }

  /**
   * Call hide loader
   */
  private onEnd(): void {
    this.hideLoader();
  }

  /**
   * Show loader
   */
  private showLoader(): void {
    this.loaderService.show();
  }

  /**
   * Hide loader
   */
  private hideLoader(): void {
    this.loaderService.hide();
  }

  /**
   * Show Notification
   */
  private showNotification(message: string): void {
    this.notifierService.show(message);
  }
}
