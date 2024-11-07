import { Pipe, PipeTransform } from '@angular/core';
import * as dateFns from 'date-fns';
import { locales } from './constants';

@Pipe({
  name: 'dateRangePicker'
})

export class DateRangePickerPipe implements PipeTransform {
  /**
   * Return month and year text like (March 2020)
   * @param value Date
   * @param args Param for locale
   */
  transform(value: Date, ...args: Array<any>): any {
    const options: any = {};
    if (args && args[1] && locales.hasOwnProperty(args[1])) {
      options.locale = locales[args[1]];
    }
    return dateFns.format(value, args[0] || 'DD-MM-YYYY', options);
  }
}
