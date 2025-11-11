// src/app/guards/public.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user$.pipe(
    take(1),
    map(user => {
      // If user exists, they are logged in.
      // Redirect them to the main wall.
      if (user) {
        router.navigate(['/wall']); // <-- Redirect to our new wall page
        return false;
      }

      // If user is null, they can see the login page
      return true;
    })
  );
};