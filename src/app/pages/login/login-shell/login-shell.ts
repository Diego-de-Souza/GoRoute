import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SideMenu } from '../../../components/side-menu/side-menu';

@Component({
  selector: 'app-login-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, SideMenu],
  templateUrl: './login-shell.html',
  styleUrl: './login-shell.scss',
})
export class LoginShell {}
