import { Component, OnInit, HostListener, Input, Output, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'edit-user-popup',
  templateUrl: './edit-user-popup.component.html',
  styleUrls: ['./edit-user-popup.component.scss']
})
export class EditUserPopupComponent implements OnInit {
  constructor(private router: Router) { }

  @Input() userId = 0;
  @Output() deleteUser: EventEmitter<number> = new EventEmitter<number>();
  public isEditVisible = false;

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (event && event.target && event.target.className !== '' && event.target.className !== 'fitem-ck-txt') {
      this.isEditVisible = false;
    }
  }

  ngOnInit() {

  }

  /**
   * Function to navigate edit user page
   */
  edit = (): void => {
    this.router.navigate(['main/edit-user', this.userId]);
  }

  /**
   * Function to navigate to notification setting page
   */
  notifications = (): void => {
    this.router.navigate(['main/notification-settings', this.userId]);
  }

  /**
   * Function to emit delete user's id in component
   */
  deleteUserConfirm = (): void => {
    this.deleteUser.emit(this.userId);
  }
}
