import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from './store';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from './modules/user-management/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  /**
   * Bindings
   */
  title = 'Proxy';

  constructor(
    private titleService: Title,
    private router: Router,
    private userService: UserService,
    private store: Store<fromRoot.AppState>,
  ) { }

  ngOnInit() {
    localStorage.removeItem('title');
    const arr: Array<string> = [];
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
        if (title === 'Tasks') {
          arr.push(title);
          localStorage.setItem('title', JSON.stringify(arr));
        }
        this.titleService.setTitle(title);
      }
    });
    Promise.all([
      this.loadUserDetails(),
      this.loadUserPermission(),
      this.loadAppFeatures(),
    ]);
  }

  /**
   * Set app title
   * @param state Router state
   * @param parent Root route
   */
  getTitle(state, parent) {
    const data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(...this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

  /**
 * Get and save user permissions into store
 */
  loadAppFeatures = () => {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.userFeatures().subscribe(res => {
        this.store.dispatch(new fromRoot.SaveFeaturesSuccessAction(res));
      });
    }
  }

  /**
   * Get and save user detail into store
   */
  loadUserDetails = () => {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.getLoggedInUserDetails().subscribe(res => {
        this.store.dispatch(new fromRoot.SaveDataSuccessAction(res));
      });
    }
  }

  /**
   * Get and save user permissions into store
   */
  loadUserPermission = () => {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.userPermission().subscribe(res => {
        this.store.dispatch(new fromRoot.SavePermissionSuccessAction(res));
      });
    }
  }
}