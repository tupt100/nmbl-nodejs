import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { Messages } from 'src/app/services/messages';
import * as fromRoot from '../../../store';
import { AuthService } from '../auth.service';
import { SharedService } from 'src/app/services/sharedService';
import { UserService } from '../../user-management/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

export class SignupComponent implements OnInit, OnDestroy {
  /**
   * Bindings
   */
  token = '';
  signupForm: FormGroup;
  errorMessage = '';
  showPwd = false;
  requestLoader = false;
  private unsubscribeAll: Subject<any>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private userService: UserService,
    private store: Store<fromRoot.AppState>
  ) {
    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    this.initForm();
    this.verifyToken();
  }

  /**
   * Handle token verification
   */
  verifyToken() {
    this.authService.verifyInvite(this.token).subscribe((res: any) => {
      this.signupForm.patchValue(res);
    }, e => {
      const error = e && e.error && e.error.detail ? e.error.detail : Messages.errors.invalidLink;
      this.sharedService.loginPageMessage.next({ msg: error, success: false});
      this.router.navigate(['/auth/login']);
    });
  }

  /**
   * Getting form controls in HTML
   */
  get f() {
    return this.signupForm.controls;
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
    this.signupForm = this.fb.group({
      email: [{ value: '', disabled: true}, Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.authService.regexValidator(this.sharedService.camelCaseRegEx, { camelCase: '' }),
        this.authService.regexValidator(this.sharedService.specialCharRegEx, { specialCharacter: '' })
      ]],
      confirmPassword: ['', [
        Validators.required,
        this.authService.confirmPasswordValidator
      ]]
    });

    /**
     * Update value and validity of confirm password on changing password
     */
    this.signupForm.get('password').valueChanges
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(() => {
        this.signupForm.get('confirmPassword').updateValueAndValidity();
      });
  }

  /**
   * Activate member signup and redirect to dashboard
   */
  signUp() {
    this.requestLoader = true;
    this.errorMessage = '';
    if (this.signupForm.invalid) {
      return this.requestLoader = false;
    }

    this.authService.signup(this.token, this.signupForm.value).subscribe((res: any) => {
      if (res && res.token) {
        localStorage.setItem('token', res.token);

        // Getting Logged In User Details
        this.userService.getLoggedInUserDetails().subscribe(resp => {
          this.store.dispatch(new fromRoot.SaveDataSuccessAction(resp));
        });

        // Getting Logged In User Permissions and navigate to dashboard
        this.userService.userPermission().subscribe(resp => {
          this.store.dispatch(new fromRoot.SavePermissionSuccessAction(resp));
          this.router.navigate(['/main/dashboard']);
        });
      }
      this.requestLoader = false;
    }, error => {
      this.requestLoader = false;
      const msg = error && error.error && error.error.detail ? error.error.detail : Messages.errors.registerErr;
      this.showMessage(msg);
    });
  }

  /**
   * Allow only alphanumeric for first and last name
   * @param event Keyboard Event
   */
  allowAlphaNumeric(event: any): boolean {
    const key = (event.which) ? event.which : event.charCode;
    if (key >= 48 && key <= 57) {
      return true;
    } else if (key >= 65 && key <= 90) {
      return true;
    } else if (key >= 97 && key <= 122) {
      return true;
    } else {
      return false;
    }
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
