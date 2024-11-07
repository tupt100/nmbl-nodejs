import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { TagDetailComponent } from './tag-detail/tag-detail.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tags-manager'
  },
  {
    path: 'tags-manager',
    component: ListComponent,
    data: {
      title: 'View All'
    }
  },
  {
    path: 'tag-detail/:id',
    component: TagDetailComponent,
    data: {
      title: 'Tag Detail'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TagsManagerRoutingModule { }
