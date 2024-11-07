import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { NotifierModule } from 'angular-notifier';
import { StoreModule } from '@ngrx/store';
import { reducers } from './store';
import { AppComponent } from './app.component';
import { MainModule } from './modules/main/main.module';
import { Interceptor } from './core/interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from './modules/user-management/user.service';
import { LoaderComponent } from './modules/ui-kit/loader/loader.component';
import { NetworkComponent } from './modules/ui-kit/network/network.component';
import { HttpCancelService } from './services/httpcancel.service';

@NgModule({
  declarations: [AppComponent, LoaderComponent, NetworkComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot([], { preloadingStrategy: PreloadAllModules }),
    MainModule,
    NotifierModule.withConfig({
      position: {
        horizontal: {
          position: 'right',
          distance: 12
        }
      },
      theme: 'material',
      behaviour: {
        autoHide: 3000,
        onClick: 'hide',
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 3
      }
    }),
    StoreModule.forRoot(reducers)
  ],
  providers: [
    UserService,
    HttpCancelService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
