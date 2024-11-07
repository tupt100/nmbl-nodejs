import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'docName', pure: false })
export class DocName implements PipeTransform {
  /**
   * Return doc name without extension
   * @param value Document
   */
  transform(value: any): any {
    if (value) {
      const docName = value.split('.').slice(0, -1).join('.');
      return docName;
    } else {
      return '';
    }
  }
}

@Pipe({ name: 'docExt', pure: false })
export class DocExt implements PipeTransform {
  /**
   * Return doc extension only
   * @param value Document
   */
  transform(value: any): any {
    if (value) {
      const docExt = value.substr((value.lastIndexOf('.') + 1));
      return docExt;
    } else {
      return '';
    }
  }
}
