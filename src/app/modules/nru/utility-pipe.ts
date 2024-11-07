import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'requestName', pure: false })
export class RequestName implements PipeTransform {
  /**
   * Return P/W/T name according to request
   * @param value Request object
   */
  transform(value: any): any {
    if (value.hasOwnProperty('task')) {
      const name = value.task.name || 'Not Provided';
      return name;
    } else if (value.hasOwnProperty('workflow')) {
      const name = value.workflow.name || 'Not Provided';
      return name;
    } else if (value.hasOwnProperty('project')) {
      const name = value.project.name || 'Not Provided';
      return name;
    }
  }
}

@Pipe({ name: 'assignedTo', pure: false })
export class AssignedTo implements PipeTransform {
  /**
   * Return assigned members for P/W/T according to request
   * @param value Request object
   */
  transform(value: any): any {
    if (value && value.hasOwnProperty('task')) {
      const assignedTo = value.task.assigned_to || 'Not Provided';
      return assignedTo;
    } else if (value && value.hasOwnProperty('workflow')) {
      const assignedTo = value.workflow.assigned_to_users || 'Not Provided';
      return assignedTo;
    } else if (value && value.hasOwnProperty('project')) {
      const assignedTo = value.project.assigned_to_users || 'Not Provided';
      return assignedTo;
    }
  }
}

@Pipe({ name: 'assignedToGroup', pure: false })
export class AssignedToGroup implements PipeTransform {
  /**
   * Return P/W/T assigned to group value according to request
   * @param value Request object
   */
  transform(value: any): any {
    if (value && value.hasOwnProperty('task')) {
      const assignedTo = value.task.assigned_to_group || 'Not Provided';
      return assignedTo;
    } else if (value && value.hasOwnProperty('workflow')) {
      let assignedTo = value.workflow.assigned_to_group || 'Not Provided';
      if (assignedTo.length === 0) {
        assignedTo = 'Not Provided';
      }
      return assignedTo;
    } else if (value && value.hasOwnProperty('project')) {
      let assignedTo = value.project.assigned_to_group || 'Not Provided';
      if (assignedTo.length === 0) {
        assignedTo = 'Not Provided';
      }
      return assignedTo;
    }
  }
}

@Pipe({ name: 'status', pure: false })
export class Status implements PipeTransform {
  /**
   * Return P/W/T status according to request
   * @param value Request object
   */
  transform(value: any): any {
    if (value.hasOwnProperty('task')) {
      return value.task.status;
    } else if (value.hasOwnProperty('workflow')) {
      return value.workflow.status;
    } else if (value.hasOwnProperty('project')) {
      return value.project.status;
    }
  }
}

@Pipe({ name: 'importance', pure: false })
export class Importance implements PipeTransform {
  /**
   * Return P/W/T importance value according to request
   * @param value Request object
   */
  transform(value: any): any {
    if (value.hasOwnProperty('task')) {
      return value.task.importance;
    } else if (value.hasOwnProperty('workflow')) {
      return value.workflow.importance;
    } else if (value.hasOwnProperty('project')) {
      return value.project.importance;
    }
  }
}

