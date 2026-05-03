import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

/**
 * Sends session cookies to same-origin proxied paths (`/api`, `/goroute-auth`) and to absolute URLs on the current origin.
 */
export const withCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  if (url.startsWith('/api') || url.startsWith('/goroute-auth')) {
    return next(req.clone({ withCredentials: true }));
  }
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    try {
      const origin = window.location.origin;
      if (url.startsWith(origin)) {
        return next(req.clone({ withCredentials: true }));
      }
    } catch {
      /* ignore */
    }
  }
  return next(req);
};
