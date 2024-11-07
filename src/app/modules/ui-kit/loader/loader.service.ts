import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoaderState } from './loader.model';

@Injectable({
  providedIn: 'root'
})

export class LoaderService {

  /**
   * Observables for loading
   */
  private loaderSubject = new Subject<LoaderState>();
  loaderState = this.loaderSubject.asObservable();

  constructor() { }

  /**
   * Service call to show loader
   */
  show = () => {
    this.loaderSubject.next({ show: true } as LoaderState);
  }

  /**
   * Service call to hide loader
   */
  hide = () => {
    this.loaderSubject.next({ show: false } as LoaderState);
  }
}

