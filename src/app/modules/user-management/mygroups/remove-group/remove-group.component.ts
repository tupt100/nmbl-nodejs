import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';
import { ProjectService } from '../../../projects/project/project.service';
import { WorkflowService } from '../../../projects/workflow/workflow.service';
import { TaskService } from '../../../projects/task/task.service';

@Component({
  selector: 'app-remove-group',
  templateUrl: './remove-group.component.html',
  styleUrls: ['./remove-group.component.scss']
})
export class RemoveGroupComponent implements OnInit {
  /**
   * Bindings
   */
  public workGroupId = null;
  public arrProject: Array<any> = [];
  public arrWorkflow: Array<any> = [];
  public arrTask: Array<any> = [];
  public taskMembers: Array<number> = [];
  public taskGroup: Array<number> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private projectService: ProjectService,
    private workflowService: WorkflowService,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    // Get workgroup ID from params
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.workGroupId = id;
      this.getWorkgroupGroupDetail();
    } else {
      this.router.navigate(['/main/mygroupslist']);
    }
  }

  /**
   * Get workgroup details
   */
  getWorkgroupGroupDetail = () => {
    this.userService.getWorkGroupDetailsById(this.workGroupId).subscribe(res => {
      if (res) {
        this.arrProject = res.project;
        this.arrWorkflow = res.workflow;
        this.arrTask = res.task;
      }
    });
  }

  /**
   * Select user for task assigning
   */
  onTaskMemberSelect = (response, task) => {
    task.assigned_to = response && response.length ? response[0].id : null;
  }

  /**
   * Select group for task assigning
   */
  onTaskGroupSelect = (response, task) => {
    if (response && response.length > 0) {
      response.map(obj => {
        const index = task.assigned_to_group.indexOf(obj.id);
        if (index === -1) {
          task.assigned_to_group.push(obj.id);
        }
      });
    } else {
      task.assigned_to_group = null;
    }
  }

  /**
   * Select user for workflow assigning
   */
  onWorkflowMemberSelect = (response, workflow) => {
    if (response && response.length > 0) {
      response.map(obj => {
        const index = workflow.assigned_to_users.indexOf(obj.id);
        if (index === -1) {
          workflow.assigned_to_users.push(obj.id);
        }
      });
    } else {
      workflow.assigned_to_users = null;
    }
  }

  /**
   * Select group for workflow assigning
   */
  onWorkflowGroupSelect = (response, workflow) => {
    if (response && response.length > 0) {
      response.map(obj => {
        const index = workflow.assigned_to_group.indexOf(obj.id);
        if (index === -1) {
          workflow.assigned_to_group.push(obj.id);
        }
      });
    } else {
      workflow.assigned_to_group = null;
    }
  }

  /**
   * Select user for project assigning
   */
  onProjectMemberSelect = (response, project) => {
    if (response && response.length > 0) {
      response.map(obj => {
        const index = project.assigned_to_users.indexOf(obj.id);
        if (index === -1) {
          project.assigned_to_users.push(obj.id);
        }
      });
    } else {
      project.assigned_to_users = null;
    }
  }

  /**
   * Select group for project assigning
   */
  onProjectGroupSelect = (response, project) => {
    if (response && response.length > 0) {
      response.map(obj => {
        const index = project.assigned_to_group.indexOf(obj.id);
        if (index === -1) {
          project.assigned_to_group.push(obj.id);
        }
      });
    } else {
      project.assigned_to_group = null;
    }
  }

  /**
   * Update P/W/T assigned user and groups
   */
  removeReassign = () => {
    // Updating projects
    if (this.arrProject && this.arrProject.length > 0) {
      this.arrProject.map(obj => {
        const au: Array<string> = [];
        const ag: Array<string> = [];
        const assignedToUsers = [...obj.assigned_to_users];
        const assignedTogroup = [...obj.assigned_to_group];
        obj.assigned_to_users = [];
        obj.assigned_to_group = [];

        assignedToUsers.map(x => {
          au.push(x.toString());
        });
        assignedTogroup.map(x => {
          ag.push(x.toString());
        });
        const params = {
          assigned_to_users: au,
          assigned_to_group: ag
        };
        this.projectService.updateProject(obj.id, params).subscribe();
      });
    }

    // Updating workflows
    if (this.arrWorkflow && this.arrWorkflow.length > 0) {
      this.arrWorkflow.map(obj => {

        const au: Array<string> = [];
        const ag: Array<string> = [];
        const assignedToUsers = [...obj.assigned_to_users];
        const assignedToGroup = [...obj.assigned_to_group];
        obj.assigned_to_users = [];
        obj.assigned_to_group = [];

        assignedToUsers.map(x => {
          au.push(x.toString());
        });
        assignedToGroup.map(x => {
          ag.push(x.toString());
        });
        const params = {
          assigned_to_users: au,
          assigned_to_group: ag
        };
        this.workflowService.updateWorkflow(obj.id, params).subscribe();
      });
    }

    // Updating Tasks
    if (this.arrTask && this.arrTask.length > 0) {
      this.arrTask.map(obj => {
        const params: any = new Object();
        if (obj.assigned_to) {
          params.assigned_to = obj.assigned_to;
        }
        const ag: Array<string> = [];
        const assignedTogroup = [...obj.assigned_to_group];
        obj.assigned_to_group = [];
        assignedTogroup.map(x => {
          ag.push(x.toString());
        });

        if (assignedTogroup && assignedTogroup.length > 0) {
          params.assigned_to_group = ag;
        }
        this.taskService.updateTask(obj.id, params).subscribe();
      });
    }

    setTimeout(() => {
      this.removeGroup(this.workGroupId);
    }, 3000);
  }

  /**
   * Remove group
   * @param groupId Group ID
   */
  removeGroup = (groupId: number): void => {
    this.userService.removeUserWorkGroup(groupId).subscribe(res => {
      this.router.navigate(['main/mygroupslist']);
    });
  }

  /**
   * Navigate to permission groups listing
   */
  cancel = () => {
    this.router.navigate(['main/mygroupslist']);
  }

}
