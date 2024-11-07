import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'utcTime'
})
export class UtcTimePipe implements PipeTransform {
  /**
   * Return MM/DD/YYYY date format after converting to local timezone
   * @param value Date
   */
  transform(value: string): any {
    return value ? moment.utc(value).local().format('MM/DD/YYYY') : '';
  }
}
