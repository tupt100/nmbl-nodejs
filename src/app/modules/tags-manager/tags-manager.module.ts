import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { TagsManagerRoutingModule } from './tags-manager.routing';
import { TagsService } from './tags-manager.service';
import { TagPopupComponent } from './tag-popup/tag-popup.component';
import { UIKitModule } from '../ui-kit/ui-kit.module';
import { TagDetailComponent } from './tag-detail/tag-detail.component';
import { SearchModule } from '../search/search.module';

@NgModule({
  declarations: [ListComponent, TagPopupComponent, TagDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TagsManagerRoutingModule,
    UIKitModule,
    SearchModule
  ],
  providers: [
    TagsService
  ]
})
export class TagsManagerModule { }
