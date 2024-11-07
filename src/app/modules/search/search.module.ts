import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchService } from './search.service';
import { SearchComponent } from './search.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { SearchRoutingModule } from './search-routing.module';
import { CustomPipes } from '../../pipes/pipes.module';
import { TaskService } from '../projects/task/task.service';
import { FormsModule } from '@angular/forms';
import { CommonMenu } from '../common-menus/menu.module';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    UIKitModule,
    SearchRoutingModule,
    CustomPipes,
    FormsModule,
    CommonMenu
  ],
  exports: [SearchComponent],
  providers: [SearchService, TaskService]
})
export class SearchModule { }
