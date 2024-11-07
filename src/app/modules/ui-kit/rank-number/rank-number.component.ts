import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SharedService } from 'src/app/services/sharedService';

@Component({
  selector: 'app-rank-number',
  templateUrl: './rank-number.component.html',
  styleUrls: ['./rank-number.component.scss']
})
export class RankNumberComponent {
  /**
   * Bindings
   */
  @Input() oldRank = '';
  @Input() tempOldRank = '';
  @Input() rankId = 0;
  @Input() resourceType = '';
  @Input() isDisabled = false;
  @Output() rankUpdated = new EventEmitter();

  constructor(
    private sharedService: SharedService
  ) { }

  /**
   * Handler for task rank updation
   */
  updateRank = (event) => {
    const regex = this.sharedService.digitsRegEx;
    const newRankValue = event.target.value;

    // Check new value for rank
    if (newRankValue === '' || !newRankValue || (newRankValue && newRankValue.trim() === '')) {
      const type = this.resourceType === 'my-project' ? 'project' :
        this.resourceType === 'my-workflow' ? 'workflow' : 'task';
      const msg = `Sorry! Please enter a number to update your ${type}'s ranking!`;
      this.sharedService.errorMessage.next(msg);
      return this.unClear();
    }

    // Validate new value for rank
    if (!regex.test(newRankValue.trim())) {
      const type = this.resourceType === 'my-project' ? 'project' :
        this.resourceType === 'my-workflow' ? 'workflow' : 'task';
      const msg = `Sorry! Please enter a number to update your ${type}'s ranking!`;
      this.sharedService.errorMessage.next(msg);
      return this.unClear();
    }

    // Check the new value against old value
    if (+this.tempOldRank === +newRankValue) {
      const type = this.resourceType === 'my-project' ? 'project' :
        this.resourceType === 'my-workflow' ? 'workflow' : 'task';
      const msg = `Sorry! But this ${type} is already ranked that number! Please try again.`;
      this.sharedService.errorMessage.next(msg);
      return this.unClear();
    }

    // Emit rank ID with new value
    const newRankValueInt = parseInt(newRankValue, 10);
    const data = {
      rankId: this.rankId,
      rank: newRankValueInt
    };
    this.rankUpdated.emit(data);
  }

  /**
   * Clear rank text input when focus
   */
  clear = () => {
    if (!this.isDisabled) {
      this.oldRank = '';
    }
  }

  /**
   * Revert rank to old one
   */
  unClear = () => {
    if (!this.isDisabled) {
      this.oldRank = this.tempOldRank;
    }
  }
}
