// src/app/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (user?.token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
