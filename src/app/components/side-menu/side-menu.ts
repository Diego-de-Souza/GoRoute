import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.scss',
})
export class SideMenu implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  private clockTimer?: number;
  private weatherTimer?: number;

  menuPinned = false;
  menuHover = false;

  clockTime = '';
  clockDate = '';
  weatherLabel = 'Carregando clima…';

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
      this.clockTime = new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now);
      this.clockDate = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      }).format(now);
    };

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
        const temp = typeof t === 'number' ? `${Math.round(t)}°C` : '—';
        const wind = typeof w === 'number' ? `${Math.round(w)} km/h` : '—';
        const badge = typeof code === 'number' ? `código ${code}` : 'código —';
        this.weatherLabel = `${temp} · vento ${wind} · ${badge}`;
      } catch {
        this.weatherLabel = 'Clima indisponível';
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
  }
}

