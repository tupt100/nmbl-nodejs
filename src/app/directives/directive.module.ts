import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from './DragDropDirective';

@NgModule({
  imports: [
    CommonModule,

  ],
  declarations: [
    DragDropDirective
  ],
  exports: [
    DragDropDirective
  ]
})

export class CustomDirectives { }
