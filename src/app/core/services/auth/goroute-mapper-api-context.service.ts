import { isPlatformBrowser } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const STORAGE_KEY = 'goroute_x_mapper_api';

/**
 * Persists the `x-mapper-api` hash returned on login/MFA (response header) for subsequent goroute-api calls.
 */
@Injectable({ providedIn: 'root' })
export class GorouteMapperApiContextService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly hash = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.hash.set(stored);
      }
    }
  }

  captureFromHeaders(headers: HttpHeaders): void {
    const v = headers.get('x-mapper-api');
    if (!v || !isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, v);
    this.hash.set(v);
  }

  value(): string | null {
    return this.hash();
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.hash.set(null);
  }
}
