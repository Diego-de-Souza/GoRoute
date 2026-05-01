import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Force early initialization for global side-effects (html attrs, persistence).
  private readonly _theme = inject(ThemeService);
  private readonly _i18n = inject(I18nService);

  protected readonly title = signal('goroute-frontend');
}
