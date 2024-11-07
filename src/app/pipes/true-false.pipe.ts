import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isTrue', pure: false })
export class IsTrue implements PipeTransform {
  /**
   * Return array with checked values only
   * @param arrCategory Array
   */
  transform(arrCategory: Array<any>): any {
    return arrCategory.filter(x => x.checked === true);
  }
}

@Pipe({ name: 'isFalse', pure: false })
export class IsFalse implements PipeTransform {
  /**
   * Return array with unchecked values only
   * @param arrCategory Array
   */
  transform(arrCategory: Array<any>): any {
    return arrCategory.filter(x => x.checked === false);
  }
}
