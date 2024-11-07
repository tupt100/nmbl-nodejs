import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing';
import { DashboardComponent } from './dashboard.component';
import { IntroModule } from '../intro-slides/intro-slides.module';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { CustomPipes } from '../../pipes/pipes.module';
import { CommonMenu } from '../common-menus/menu.module';
import { DashboardService } from './dashboard.service';
import { ProjectService } from '../projects/project/project.service';
import { UserService } from '../user-management/user.service';
import { TaskService } from '../projects/task/task.service';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    UIKitModule,
    CustomPipes,
    IntroModule,
    DashboardRoutingModule,
    DragDropModule,
    CommonMenu
  ],
  providers: [ProjectService, DashboardService, TaskService, UserService],
  bootstrap: []
})
export class DashboardModule {
  constructor() { }
}
