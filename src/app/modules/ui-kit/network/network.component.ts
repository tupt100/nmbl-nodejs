import { Component } from '@angular/core';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent {

  public online$: Observable<boolean>;
  public networkStatus: string = '';
  public isOnlie: boolean;

  constructor() { 
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    );
    this.checkNetworkStatus();
  }

  checkNetworkStatus = () => {
    this.online$.subscribe(value => {
      this.isOnlie = value;
      this.networkStatus = value ? `Online` : `You aren't connected to the internet!`;
    });
  }
}
