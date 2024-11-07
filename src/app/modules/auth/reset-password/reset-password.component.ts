import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../auth.service';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  /**
   * Bindings
   */
  token = '';
  errorMessage = '';
  resetPwdForm: FormGroup;
  private unsubscribeAll: Subject<any>;
  showPwd = false;
  requestLoader = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.initForm();
  }

  /**
   * Getting form controls in HTML
   */
  get f() {
    return this.resetPwdForm.controls;
  }

  /**
   * Life cycle hook trigger when component leaves
   */
  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  /**
   * Initialize form and validations
   */
  initForm() {
    this.resetPwdForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.authService.regexValidator(this.sharedService.camelCaseRegEx, { camelCase: '' }),
        this.authService.regexValidator(this.sharedService.specialCharRegEx, { specialCharacter: '' })
      ]],
      confirm_password: ['', [
        Validators.required,
        this.authService.confirmPasswordValidator
      ]]
    });

    /**
     * Update value and validity of confirm password on changing password
     */
    this.resetPwdForm.get('password').valueChanges
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        this.resetPwdForm.get('confirm_password').updateValueAndValidity();
      });
  }

  /**
   * Reset password handler
   */
  reset() {
    this.requestLoader = true;
    this.errorMessage = '';
    if (this.resetPwdForm.invalid) {
      return this.requestLoader = false;
    }

    this.authService.resetPassword(this.token, this.resetPwdForm.value).subscribe(res => {
      this.router.navigate(['/auth/login']);
      this.requestLoader = false;
    }, error => {
      this.resetPwdForm.reset();
      this.requestLoader = false;
      this.showMessage(error.error.detail);
    });
  }

  /**
   * Show and hide message
   * @param msg Message
   */
  showMessage(msg) {
    this.errorMessage = msg;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

}
