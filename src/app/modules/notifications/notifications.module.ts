import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsRoutingModule } from './notifications.routing';
import { CustomPipes } from '../../pipes/pipes.module';
import { CommonMenu } from '../common-menus/menu.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { NotificationsComponent } from './notifications.component';
import { SelectionComponent } from './selection/selection.component';
import { WebsocketService } from './websocket.service';
import { NotificationsService } from './notifications.service';

@NgModule({
  declarations: [
    NotificationsComponent,
    SelectionComponent
  ],
  imports: [
    CommonModule,
    UIKitModule,
    NotificationsRoutingModule,
    CustomPipes,
    CommonMenu
  ],
  providers: [
    NotificationsService,
    WebsocketService
  ],
  bootstrap: []
})
export class NotificationsModule { }
