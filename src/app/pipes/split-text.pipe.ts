import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splitText' })
export class SplitText implements PipeTransform {

  /**
   * Split text if length greater than 50 and add elipsis after 50 characters
   * @param textContent Text string
   */
  transform(textContent: any): any {
    if (textContent) {
      if (textContent.length > 50) {
        textContent = textContent.substring(0, 50) + '...';
      }
      return textContent;
    } else {
      return '';
    }
  }
}
