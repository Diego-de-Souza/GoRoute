import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nService, LanguageId } from '../../core/services/i18n.service';
import { ThemeService, ThemeId } from '../../core/services/theme.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [TranslateModule, RouterLink],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.scss',
})
export class SideMenu implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);

  private clockTimer?: number;
  private weatherTimer?: number;
  private langSub?: { unsubscribe(): void };

  menuPinned = false;
  menuHover = false;

  clockTime = '';
  clockDate = '';
  weatherLabel = '';

  get themeId(): ThemeId {
    return this.theme.theme();
  }

  get languageId(): LanguageId {
    return this.i18n.language();
  }

  get menuOpen(): boolean {
    return this.menuPinned || this.menuHover;
  }

  togglePin(): void {
    this.menuPinned = !this.menuPinned;
  }

  onMenuEnter(): void {
    this.menuHover = true;
  }

  onMenuLeave(): void {
    this.menuHover = false;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const updateClock = (): void => {
      const now = new Date();
      const locale = this.i18n.language();
      this.clockTime = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now);
      this.clockDate = new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }).format(now);
    };

    this.weatherLabel = this.translate.instant('WEATHER.LOADING');
    updateClock();
    this.clockTimer = window.setInterval(updateClock, 1000);

    const fetchWeather = async (lat: number, lon: number): Promise<void> => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(String(lat))}` +
          `&longitude=${encodeURIComponent(String(lon))}` +
          `&current=temperature_2m,weather_code,wind_speed_10m`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) {
          throw new Error(`weather http ${res.status}`);
        }
        const json = (await res.json()) as {
          current?: {
            temperature_2m?: number;
            wind_speed_10m?: number;
            weather_code?: number;
          };
        };
        const t = json.current?.temperature_2m;
        const w = json.current?.wind_speed_10m;
        const code = json.current?.weather_code;
        const tempUnit = this.translate.instant('WEATHER.TEMP_UNIT');
        const windUnit = this.translate.instant('WEATHER.WIND_UNIT');
        const temp = typeof t === 'number' ? `${Math.round(t)}${tempUnit}` : '—';
        const wind = typeof w === 'number' ? `${Math.round(w)} ${windUnit}` : '—';
        const c = typeof code === 'number' ? String(code) : '—';
        this.weatherLabel = this.translate.instant('WEATHER.FORMAT', { temp, wind, code: c });
      } catch {
        this.weatherLabel = this.translate.instant('WEATHER.UNAVAILABLE');
      }
    };

    const fallbackLat = -23.5505; // São Paulo
    const fallbackLon = -46.6333;

    const resolveLocationAndFetch = (): void => {
      if (!('geolocation' in navigator)) {
        void fetchWeather(fallbackLat, fallbackLon);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          void fetchWeather(fallbackLat, fallbackLon);
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 2500 },
      );
    };

    resolveLocationAndFetch();
    this.weatherTimer = window.setInterval(resolveLocationAndFetch, 10 * 60 * 1000);

    this.langSub = this.translate.onLangChange.subscribe(() => {
      updateClock();
      this.weatherLabel = this.translate.instant('WEATHER.LOADING');
      resolveLocationAndFetch();
    });
  }

  ngOnDestroy(): void {
    if (this.clockTimer) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = undefined;
    }
    if (this.weatherTimer) {
      window.clearInterval(this.weatherTimer);
      this.weatherTimer = undefined;
    }
    this.langSub?.unsubscribe();
    this.langSub = undefined;
  }

  setTheme(theme: ThemeId): void {
    this.theme.setTheme(theme);
  }

  setLanguage(lang: LanguageId): void {
    this.i18n.setLanguage(lang);
  }
}

