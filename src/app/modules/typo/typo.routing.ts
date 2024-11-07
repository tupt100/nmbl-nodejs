import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TypoComponent } from './typo.component';

const routes: Routes = [
  {
    path: '',
    component: TypoComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TypoRoutingModule {
  constructor() { }
}
