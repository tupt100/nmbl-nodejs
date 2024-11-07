import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DaterangePickerComponent } from './daterange-picker.component';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateRangePickerPipe } from './daterange-picker.pipe';

@NgModule({
  declarations: [
    DaterangePickerComponent,
    DateRangePickerPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DaterangePickerComponent,
    DateRangePickerPipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DaterangePickerComponent),
      multi: true
    }
  ]
})
export class DaterangePickerModule { }
