import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-personal',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <main class="dash">
      <h1>{{ 'DASHBOARD.PERSONAL_TITLE' | translate }}</h1>
      <p>{{ 'DASHBOARD.PERSONAL_DEK' | translate }}</p>
      <p><a routerLink="/">{{ 'DASHBOARD.BACK' | translate }}</a></p>
    </main>
  `,
  styles: [
    `
      .dash {
        max-width: 40rem;
        margin: 0 auto;
        padding: 1.5rem 1rem;
      }
    `,
  ],
})
export class DashboardPersonal {}
