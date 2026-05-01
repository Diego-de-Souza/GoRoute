import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Footer } from '../../components/footer/footer';
import { SideMenu } from '../../components/side-menu/side-menu';

@Component({
  selector: 'app-about',
  imports: [Footer, SideMenu, TranslateModule, RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {}
