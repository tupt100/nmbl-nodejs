import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotifierState } from './notifier.model';

@Injectable({
    providedIn: 'root'
})
export class NotifierService {

    /**
     * Observables for display message
     */
    private notifierSubject = new Subject<NotifierState>();
    notifierState = this.notifierSubject.asObservable();

    constructor() { }

    /**
     * Service call to display message
     */
    show = (message: string) => {
        this.notifierSubject.next({ show: true, message } as NotifierState);
    }
    
    /**
     * Service call to hide message
     */
    hide = () => {
        this.notifierSubject.next({ show: false } as NotifierState);
    }
}


