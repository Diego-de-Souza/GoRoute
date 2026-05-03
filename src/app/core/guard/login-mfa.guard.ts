import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { LoginFlowService } from '../services/login/login-flow.service';

export const loginMfaGuard: CanActivateFn = () => {
  const flow = inject(LoginFlowService);
  const router = inject(Router);
  return flow.pendingMfaTempToken() ? true : router.parseUrl(flow.afterMfaReturnPath());
};
