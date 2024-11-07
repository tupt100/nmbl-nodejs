import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtcTimePipe } from './utc-time.pipe';
import { KeysPipe, ValuesPipe } from '../pipes/key-value.pipe';
import { ImagePipe } from '../pipes/image.pipe';
import { SplitText } from '../pipes/split-text.pipe';
import { DocName, DocExt } from './name-ext.pipe';
import { IsTrue, IsFalse } from './true-false.pipe';
import { Initial } from './initial.pipe';
import { FormatDate } from './date-pipe';
import { OrderByPipe } from './orderBy.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    UtcTimePipe,
    KeysPipe,
    ValuesPipe,
    ImagePipe,
    SplitText,
    DocName,
    DocExt,
    IsTrue,
    IsFalse,
    Initial,
    FormatDate,
    OrderByPipe
  ],
  exports: [
    UtcTimePipe,
    KeysPipe,
    ValuesPipe,
    ImagePipe,
    SplitText,
    DocName,
    DocExt,
    IsTrue,
    IsFalse,
    Initial,
    FormatDate,
    OrderByPipe
  ]
})

export class CustomPipes { }
