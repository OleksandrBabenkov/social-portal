// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // This is the magic. We check the user$ observable.
  return auth.user$.pipe(
    take(1), // Take the current value and complete
    map(user => {
      // If user exists, they can proceed
      if (user) {
        return true;
      }

      // If user is null, redirect to login
      router.navigate(['/login']);
      return false;
    })
  );
};