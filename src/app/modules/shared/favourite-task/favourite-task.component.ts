import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { TaskService } from '../../projects/task/task.service';

export interface IFavorite {
  id: number;
  name: string;
}

@Component({
  selector: 'app-favourite-task',
  templateUrl: './favourite-task.component.html',
  styleUrls: ['./favourite-task.component.scss']
})
export class FavouriteTaskComponent implements OnInit {

  /**
   * Bindings
   */
  @Input() taskName = '';
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onClose = new EventEmitter();
  public taskId = 0;
  public arrTask: Array<IFavorite> = [];
  public defaultParam = {
    limit: 25,
    offset: 0,
    // status: '1,2,5,6',
    ordering: 'rank',
    favorite_task: true,
    type: 'active'
  };

  /**
   * Handle keyboard Esc keydown event to close the popup.
   * @param event Keyboard Event
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDownHandler(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.onClose.emit(false);
    }
  }

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    this.listFavoriteTask();
  }

  /**
   * Get favourite tasks listing
   */
  listFavoriteTask = () => {
    this.taskService.getTasks(this.defaultParam).subscribe(res => {
      if (res && res.results && res.results.length > 0) {
        res.results.map(obj => {
          const task = {
            id: obj.id,
            name: obj.task.name || ''
          };
          this.arrTask.push(task);
        });
      }
    });
  }

  /**
   * Emit selected task ID to drop
   */
  onSubmit() {
    this.onClose.emit(this.taskId);
  }

  /**
   * Close popup
   */
  cancel(): void {
    this.onClose.emit(0);
  }
}
