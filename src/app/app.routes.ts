import { Routes } from '@angular/router';

// Import our components and guards
import { Login } from './components/login/login';
import { Wall } from './components/wall/wall';
import { MainLayout } from './components/layout/main-layout/main-layout';

import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';


export const routes: Routes = [
{
    path: 'login',
    component: Login,
    canActivate: [publicGuard] // <-- Protects login page
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard], // <-- Protects all child routes
    children: [
      { path: 'wall', component: Wall },
      { path: '', redirectTo: 'wall', pathMatch: 'full' }
    ]
  },
  // A simple fallback for any other random URL
  { path: '**', redirectTo: 'wall', pathMatch: 'full' }
];
