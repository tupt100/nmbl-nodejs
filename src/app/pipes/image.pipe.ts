import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'image', pure: false })
export class ImagePipe implements PipeTransform {
  /**
   * Return extension image according to document
   * @param value Document
   */
  transform(value: any): any {
    const path = 'assets/images/file/';
    let filePath = '';
    if (value) {
      const ext = value.substr((value.lastIndexOf('.') + 1)).toLowerCase();
      switch (ext) {
        case 'docx' :
          filePath = `${path}f-docx.svg`;
          break;
        case 'doc' :
          filePath = `${path}f-doc.svg`;
          break;
        case 'rtf' :
          filePath = `${path}f-rtf.svg`;
          break;
        case 'txt' :
          filePath = `${path}f-txt.svg`;
          break;
        case 'xml' :
          filePath = `${path}f-xml.svg`;
          break;
        case 'xlsx' :
          filePath = `${path}f-xlsx.svg`;
          break;
        case 'xls' :
          filePath = `${path}f-xls.svg`;
          break;
        case 'pdf' :
          filePath = `${path}f-pdf.svg`;
          break;
        case 'png' :
          filePath = `${path}f-png.svg`;
          break;
        case 'tif' :
          filePath = `${path}f-tif.svg`;
          break;
        case 'csv' :
          filePath = `${path}f-csv.svg`;
          break;
        case 'stl' :
          filePath = `${path}f-stl.png`;
          break;
        case 'jpg' :
        case 'jpeg' :
          filePath = `${path}f-jpg.svg`;
          break;
        case 'svg' :
          filePath = `${path}f-svg.svg`;
          break;
        case 'docm':
          filePath = `${path}f-docm.png`;
          break;
        case 'msg':
          filePath = `${path}f-msg.png`;
          break;
        case 'pptx':
          filePath = `${path}f-pptx.png`;
          break;
        case 'gif':
          filePath = `${path}f-gif.svg`;
          break;
      }
      return filePath;
    } else {
      return `${path}file.png`;
    }
  }
}
