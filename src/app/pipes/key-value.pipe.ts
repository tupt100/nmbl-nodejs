import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys', pure: false })
export class KeysPipe implements PipeTransform {
  /**
   * Return keys of object
   * @param value Object
   */
  transform(value: any): any {
    return Object.keys(value);
  }
}

@Pipe({ name: 'values', pure: false })
export class ValuesPipe implements PipeTransform {
  /**
   * Return value for first key of object
   * @param value Object
   */
  transform(value: any): any {
    const key = Object.keys(value)[0];
    return value[key];
  }
}
