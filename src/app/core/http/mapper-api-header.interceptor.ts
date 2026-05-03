import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { GOROUTE_ENV } from '../config/app-environment';
import { GorouteMapperApiContextService } from '../services/auth/goroute-mapper-api-context.service';

/** Attaches `x-mapper-api` to requests targeting goroute-api (`apiBaseUrl`). */
export const mapperApiHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(GOROUTE_ENV);
  const mapper = inject(GorouteMapperApiContextService);
  const url = req.url;
  if (!url.startsWith(env.apiBaseUrl)) {
    return next(req);
  }
  const hash = mapper.value();
  if (!hash) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'x-mapper-api': hash } }));
};
