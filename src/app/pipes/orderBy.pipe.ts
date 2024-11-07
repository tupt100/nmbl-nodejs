import { Pipe, PipeTransform } from '@angular/core';
import { orderBy, sortBy } from 'lodash';

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {

  /**
   * Sort array used in multiselect component
   * @param value Array
   * @param order Sorting order
   */
  transform(value: any[], order: any) {
    order = order ? order : 'asc';
    if (!value) { return value; }
    if (value.length <= 1) { return value; }
    const key = value[0].name ? 'name' : value[0].title ? 'title' : value[0].tag ? 'tag' : '';

    let temp: any = {};
    if (value[0] && value[0].id && value[0].id === -1) {
      temp = Object.assign({}, value[0]);
      value.splice(0, 1);
    }
    if (key) {
      const objSorter = obj => obj[key].toLowerCase();
      const arr = orderBy(value, objSorter, [order]);
      return Object.keys(temp).length ? [temp, ...arr] : arr;
    } else {
      return sortBy(value);
    }
  }
}
