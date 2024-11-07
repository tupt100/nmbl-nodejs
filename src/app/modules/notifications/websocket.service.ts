import { Injectable } from '@angular/core';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor() { }

  private subject: Rx.Subject<MessageEvent>;

  /**
   * Connect to websocket URL
   * @param url URL
   */
  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  /**
   * Create websocket connection for URL
   * @param url URL
   */
  private create(url): Rx.Subject<MessageEvent> {
    const token = localStorage.getItem('token');
    const websocketUrl = `${url}?token=${token}`;
    const ws = new WebSocket(websocketUrl);
    const observable = new Observable((obs: Rx.Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws);
    });
    const observer = {
      next: (data: object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    };
    return Rx.Subject.create(observer, observable);
  }
}
