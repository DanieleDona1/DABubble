import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { UserService } from '../../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  userService = inject(UserService);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  email = this.form.get('email');
  password = this.form.get('password');

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawForm = this.form.getRawValue();
    this.authService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        const mappedError = this.mapFirebaseError(err?.code);
        this.errorMessage = mappedError;
      },
    });
  }

  private mapFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Ungültiges E-Mail-Format.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-Mail oder Passwort ist falsch.';
      default:
        return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    }
  }

  async googleLogin() {
    try {
      const newUser = await this.authService.googleLogin();
      if (newUser) {
        this.userService.addUser(newUser);
      }
      this.router.navigate(['']);
    } catch (err) {
      console.error(err);
    }
  }
}
