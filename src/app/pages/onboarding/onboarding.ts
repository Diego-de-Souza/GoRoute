import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  GorouteOnboardingApiService,
  type OnboardingSchemaResponse,
} from '../../core/services/onboarding/goroute-onboarding-api.service';
import { GorouteRestApiService } from '../../core/services/auth/goroute-rest-api.service';
import { PostAuthNavigationService } from '../../core/services/login/post-auth-navigation.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly rest = inject(GorouteRestApiService);
  private readonly onboardingApi = inject(GorouteOnboardingApiService);
  private readonly postAuth = inject(PostAuthNavigationService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly role = signal<'professional' | 'company' | null>(null);
  protected readonly schema = signal<OnboardingSchemaResponse | null>(null);

  readonly skillLevels = ['beginner', 'intermediate', 'advanced'] as const;

  readonly profForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    headline: ['', Validators.required],
    location: ['', Validators.required],
    bio: ['', [Validators.required, Validators.minLength(8)]],
    areasRaw: ['', Validators.required],
    goal: ['', Validators.required],
    workPreference: ['', Validators.required],
    coursesRaw: [''],
    portfolioRaw: [''],
    skillRows: this.fb.array([
      this.fb.group({
        name: ['react', Validators.required],
        level: this.fb.nonNullable.control<(typeof this.skillLevels)[number]>('intermediate'),
      }),
    ]),
  });

  readonly companyForm = this.fb.group({
    companyName: ['', [Validators.required, Validators.minLength(2)]],
    cnpj: [''],
    website: [''],
    industry: ['', Validators.required],
    companySize: ['', Validators.required],
    contactName: ['', Validators.required],
    contactTitle: [''],
    hireTypesRaw: ['CLT, PJ', Validators.required],
    workPolicy: ['', Validators.required],
    officeLocations: ['', Validators.required],
    applicationChannel: ['', Validators.required],
    skillsRaw: ['react, angular', Validators.required],
  });

  get skillRows(): FormArray {
    return this.profForm.controls.skillRows;
  }

  ngOnInit(): void {
    this.rest.getMe().subscribe({
      next: (me) => {
        if (me.onboardingCompleted) {
          this.postAuth.navigateAfterSession(me.user.role, true);
          return;
        }
        this.role.set(me.user.role);
        this.onboardingApi.getSchema().subscribe({
          next: (s) => {
            this.schema.set(s);
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            void this.router.navigate(['/login']);
          },
        });
      },
      error: () => {
        this.loading.set(false);
        void this.router.navigate(['/login']);
      },
    });
  }

  addSkillRow(): void {
    this.skillRows.push(
      this.fb.group({
        name: ['', Validators.required],
        level: this.fb.nonNullable.control<(typeof this.skillLevels)[number]>('beginner'),
      }),
    );
  }

  removeSkillRow(i: number): void {
    if (this.skillRows.length <= 1) {
      return;
    }
    this.skillRows.removeAt(i);
  }

  protected skip(): void {
    this.saving.set(true);
    this.error.set(null);
    this.onboardingApi.skip().subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.ok) {
          void this.rest.getMe().subscribe({
            next: (m) =>
              this.postAuth.navigateAfterSession(m.user.role, m.onboardingCompleted),
            error: () => void this.router.navigate(['/']),
          });
        }
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.handleHttp(err);
      },
    });
  }

  protected submitProfessional(): void {
    this.profForm.markAllAsTouched();
    if (this.profForm.invalid) {
      return;
    }
    const v = this.profForm.getRawValue();
    const areasOfInterest = (v.areasRaw ?? '')
      .split(/[,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const skills = v.skillRows.map((r) => ({
      name: String(r.name ?? '')
        .trim()
        .toLowerCase(),
      level: r.level,
    }));
    const courses = v.coursesRaw
      ? String(v.coursesRaw)
          .split(/[,;\n]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const portfolioLinks = v.portfolioRaw
      ? String(v.portfolioRaw)
          .split(/[,;\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const body = {
      fullName: String(v.fullName ?? '').trim(),
      headline: String(v.headline ?? '').trim(),
      location: String(v.location ?? '').trim(),
      bio: String(v.bio ?? '').trim(),
      areasOfInterest,
      skills,
      goal: String(v.goal ?? '').trim(),
      workPreference: String(v.workPreference ?? '').trim(),
      courses: courses.length ? courses : undefined,
      portfolioLinks: portfolioLinks.length ? portfolioLinks : undefined,
    };
    this.saving.set(true);
    this.error.set(null);
    this.onboardingApi.completeProfessional(body).subscribe({
      next: () => {
        this.saving.set(false);
        void this.rest.getMe().subscribe({
          next: (m) =>
            this.postAuth.navigateAfterSession(m.user.role, m.onboardingCompleted),
          error: () => void this.router.navigate(['/']),
        });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.handleHttp(err);
      },
    });
  }

  protected submitCompany(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) {
      return;
    }
    const v = this.companyForm.getRawValue();
    const hireTypes = String(v.hireTypesRaw ?? '')
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const slugs = String(v.skillsRaw ?? '')
      .split(/[,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const prioritySkills = slugs.map((slug) => ({ slug }));
    const body = {
      companyName: String(v.companyName ?? '').trim(),
      cnpj: v.cnpj?.trim() || undefined,
      website: v.website?.trim() || undefined,
      industry: String(v.industry ?? '').trim(),
      companySize: String(v.companySize ?? '').trim(),
      contactName: String(v.contactName ?? '').trim(),
      contactTitle: v.contactTitle?.trim() || undefined,
      hireTypes,
      workPolicy: String(v.workPolicy ?? '').trim(),
      officeLocations: String(v.officeLocations ?? '').trim(),
      applicationChannel: String(v.applicationChannel ?? '').trim(),
      prioritySkills,
    };
    this.saving.set(true);
    this.error.set(null);
    this.onboardingApi.completeCompany(body).subscribe({
      next: () => {
        this.saving.set(false);
        void this.rest.getMe().subscribe({
          next: (m) =>
            this.postAuth.navigateAfterSession(m.user.role, m.onboardingCompleted),
          error: () => void this.router.navigate(['/']),
        });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.handleHttp(err);
      },
    });
  }

  private handleHttp(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      const code = (err.error as { code?: string } | null)?.code;
      if (err.status === 409 || code === 'ONBOARDING_ALREADY_COMPLETED') {
        void this.router.navigate(['/']);
        return;
      }
      if (code === 'INVALID_SKILL_REFERENCE') {
        this.error.set('ONBOARDING.ERR_INVALID_SKILLS');
        return;
      }
    }
    this.error.set('ONBOARDING.ERR_NETWORK');
  }
}
