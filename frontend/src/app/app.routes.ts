import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/auth/pages/login/login.page';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { TaskListPageComponent } from './features/tasks/pages/task-list/task-list.page';
import { AuthGuard } from './core/auth/auth.guard';
import { RegisterPageComponent } from './features/auth/pages/register/register.page';
import { DocsPageComponent } from './features/docs/pages/docs/docs.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'docs',
    component: DocsPageComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'tasks',
        component: TaskListPageComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
