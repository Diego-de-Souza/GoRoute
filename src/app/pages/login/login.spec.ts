import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService, TranslateNoOpLoader } from '@ngx-translate/core';

import { LoginShell } from './login-shell/login-shell';
import { loginRoutes } from './login.routes';

describe('LoginShell', () => {
  let fixture: ComponentFixture<LoginShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginShell],
      providers: [
        provideRouter(loginRoutes),
        ...provideTranslateService({
          loader: provideTranslateLoader(TranslateNoOpLoader),
          lang: 'pt-BR',
          fallbackLang: 'pt-BR',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginShell);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
