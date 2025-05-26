import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { map, take } from 'rxjs/operators'; // Import map and take

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.currentUser$.pipe(
    take(1), // Take only the first emitted value and then complete
    map((user) => {
      if (user) {
        return true;
      } else {
        router.navigate(['']);
        return false;
      }
    })
  );
};