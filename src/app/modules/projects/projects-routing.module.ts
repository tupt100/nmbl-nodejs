import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent } from './project/project/project.component';
import { ProjectsMainComponent } from './project/projects-main/projects-main.component';
import { ProjectsDetailComponent } from './project/projects-detail/projects-detail.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectsMainComponent,
    data: {
      title: 'Projects'
    }
  },
  {
    path: 'create',
    component: ProjectComponent,
    children: [
      {
        path: 'project',
        component: CreateComponent,
        data: {
          title: 'Create Project'
        },
        pathMatch: 'full'
      },
      {
        path: 'task',
        component: CreateComponent,
        pathMatch: 'full',
        data: {
          title: 'Create Task'
        }
      },
      {
        path: 'workflow',
        component: CreateComponent,
        pathMatch: 'full',
        data: {
          title: 'Create Workflow'
        }
      },
    ]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./task/task.module').then(mod => mod.TaskModule),
  },
  {
    path: '',
    loadChildren: () => import('./workflow/workflow.module').then(mod => mod.WorkflowModule)
  },
  {
    path: ':id',
    component: ProjectsDetailComponent,
    data: {
      title: 'Project'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
