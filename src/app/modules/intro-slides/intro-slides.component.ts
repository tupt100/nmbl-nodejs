import { Component, Output, EventEmitter, Input } from '@angular/core';
import { IntroService } from '../intro-slides/intro-slides.service';
import { ISlides } from './intro-slides.interface';

@Component({
  selector: 'app-intro-slides',
  templateUrl: './intro-slides.component.html',
  styleUrls: ['./intro-slides.component.scss']
})
export class IntroSlidesComponent {

  /**
   * Bindings
   */
  @Input() slides: Array<ISlides> = [];
  @Input() module = 'project';
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();
  public slideIndex = 0;

  constructor(private introService: IntroService) { }

  /**
   * Slide the intoduction slider
   */
  slide = (indexDirection: number): void => {
    this.slides.map(obj => {
      obj.slide.selected = false;
    });
    this.slides[this.slideIndex].slide.selected = false;
    this.slideIndex += indexDirection;
    if (this.slideIndex < 0) {
      this.slideIndex = this.slides.length - 1;
    }
    this.slideIndex = this.slideIndex % this.slides.length;
    if (this.slideIndex === this.slide.length - 1) {
      this.updateIntro();
      this.onClose.emit(true);
    } else {
      this.slides[this.slideIndex].slide.selected = true;
    }
  }

  /**
   * Updated selected slide to true
   */
  selectSlide = (index: number): void => {
    this.slideIndex = index;
    this.slides.map(obj => {
      obj.slide.selected = false;
    });
    this.slides[index].slide.selected = true;
  }

  /**
   * Update intro service for the selected module
   */
  updateIntro = () => {
    this.introService.updateIntro(this.module).subscribe();
  }
}
