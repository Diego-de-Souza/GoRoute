import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type LanguageId = 'pt-BR' | 'en' | 'es' | 'de';

const STORAGE_KEY = 'goroute.lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  private readonly translate = inject(TranslateService);

  readonly supported: readonly LanguageId[] = ['pt-BR', 'en', 'es', 'de'] as const;
  readonly language = signal<LanguageId>('pt-BR');

  constructor() {
    const initial = this.resolveInitialLanguage();

    this.translate.addLangs([...this.supported]);
    this.translate.setFallbackLang('pt-BR');
    this.setLanguage(initial);

    this.translate.stream('APP.TITLE').subscribe((t) => {
      if (typeof t === 'string' && t.trim()) {
        this.doc.title = t;
      }
    });
  }

  setLanguage(lang: LanguageId): void {
    this.language.set(lang);
    this.translate.use(lang);
    this.doc.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  private resolveInitialLanguage(): LanguageId {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (this.supported as readonly string[]).includes(stored)) {
        return stored as LanguageId;
      }
    } catch {
      // ignore
    }

    const nav = typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';
    const normalized = (nav || '').toLowerCase();

    if (normalized.startsWith('pt')) return 'pt-BR';
    if (normalized.startsWith('es')) return 'es';
    if (normalized.startsWith('de')) return 'de';
    return 'en';
  }
}

