import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(private router: Router) { }

  /**
   * This guard is for public routes.
   * This means when a logged in user try to navigate to these routes,
   * it will redirected user to dashboard.
   */
  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/main/dashboard']);
      return false;
    } else {
      return true;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router) { }

  /**
   * This guard is for private/restricted routes.
   * This means when a logged out user try to navigate to these routes,
   * it will redirected user to login.
   */
  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
