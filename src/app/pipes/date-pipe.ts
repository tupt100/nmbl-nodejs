import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'formatDate', pure: false })
export class FormatDate implements PipeTransform {
  /**
   * Return formatted date
   * @param createdDate Date
   */
  transform(createdDate: string): any {
    if (createdDate) {
      const today = moment().startOf('day');
      if (moment(createdDate).isSame(today, 'd')) {
        return moment(createdDate).format('hh:mm A');
      } else {
        return moment(createdDate).format('MM/DD/YYYY hh:mm A');
      }
    }
  }
}
