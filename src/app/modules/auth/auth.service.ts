import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILogin, ISignUp, IUser } from './auth.interface';
import { IBaseResponse } from '../../apiBaseModel/baseResponse';
import { API_BASE_URL } from '../../config/web.config';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) { }

  /**
   * Login API
   * @param login login data: [ILogin]
   */
  login(login: ILogin): Observable<IBaseResponse<IUser>> {
    return this.http.post<IBaseResponse<IUser>>(`${API_BASE_URL}api/login/`, login);
  }

  /**
   * Activate user
   * @param token Token
   * @param signup Activation data
   */
  signup(token: string, signup: ISignUp): Observable<IBaseResponse<any>> {
    const url = `${ API_BASE_URL }api/member-signup/${ token }/`;
    return this.http.post<IBaseResponse<IUser>>(url, signup);
  }

  /**
   * API to send password reset link to user email
   * @param email Email
   */
  sendResetPassword(email: string): Observable < IBaseResponse < any >> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}api/send-password-reset/${email}/`, {});
  }

  /**
   * Reset password API
   * @param token Token
   * @param data Password reset data
   */
  resetPassword(token: string, data): Observable < IBaseResponse < any >> {
    return this.http.post<IBaseResponse<any>>(`${API_BASE_URL}api/resetpassword/${token}/`, data);
  }

  /**
   * Verify invitation link
   * @param token Token
   */
  verifyInvite(token: string): Observable < IBaseResponse < any >> {
    return this.http.get<IBaseResponse<any>>(`${API_BASE_URL}api/invitation_verification/${token}`);
  }

  /**
   * Validator for password and confirm password inputs
   */
  confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
      return null;
    }

    const password = control.parent.get('password');
    const confirmPassword = control.parent.get('confirmPassword') || control.parent.get('confirm_password');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.value === '') {
      return null;
    }

    if (password.value === confirmPassword.value) {
      return null;
    }

    return { passwordsNotMatching: true };
  }

  /**
   * Commom function to test string against regex
   * @param regex Regex
   * @param error Validation error
   */
  regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {

      if (!control.value) {
        return null;
      }
      const valid = regex.test(control.value);

      return valid ? null : error;
    };
  }
}
