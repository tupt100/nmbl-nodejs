import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypoRoutingModule } from './typo.routing';
import { TypoComponent } from './typo.component';

@NgModule({
  declarations: [
    TypoComponent
  ],

  imports: [
    CommonModule,
    TypoRoutingModule
  ],

  providers: [],
  bootstrap: []
})
export class TypoModule {
  constructor() { }
}
