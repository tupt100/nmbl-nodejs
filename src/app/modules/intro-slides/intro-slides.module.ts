import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntroSlidesComponent } from './intro-slides.component';
import { IntroService } from './intro-slides.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    IntroSlidesComponent
  ],
  exports: [
    IntroSlidesComponent
  ],
  providers: [
    IntroService
  ]
})

export class IntroModule { }
