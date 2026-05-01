import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly platformId = inject(PLATFORM_ID);

  readonly year = new Date().getFullYear();

  /** URLs espelhadas do menu lateral — substitua pelos perfis reais do projeto quando existirem. */
  readonly socialLinks = [
    { id: 'github' as const, href: 'https://github.com/', labelKey: 'FOOTER.SOCIAL.GITHUB' },
    { id: 'linkedin' as const, href: 'https://www.linkedin.com/', labelKey: 'FOOTER.SOCIAL.LINKEDIN' },
    { id: 'instagram' as const, href: 'https://www.instagram.com/', labelKey: 'FOOTER.SOCIAL.INSTAGRAM' },
    { id: 'x' as const, href: 'https://x.com/', labelKey: 'FOOTER.SOCIAL.X' },
  ];

  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
