import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initial', pure: false })
export class Initial implements PipeTransform {
  /**
   * Return initials for user object
   * @param object User object with first and last name
   */
  transform(object: any): any {
    if (object && Object.keys(object).length > 0) {
      const firstname = object.first_name.charAt(0);
      const lastName = object.last_name.charAt(0);
      return `${firstname}${lastName}`;
    }
  }
}
