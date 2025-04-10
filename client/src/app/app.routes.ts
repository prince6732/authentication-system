import { Routes } from '@angular/router';

export const routes: Routes = [
  // home Page
  {
    path: '',
    loadComponent: () =>
      import('./features/pages/home/home.component').then(
        (c) => c.HomeComponent
      ),
  },

  // signup
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup.component').then(
        (c) => c.SignupComponent
      ),
  },

  // verify email
  {
    path: 'verify',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (c) => c.VerifyEmailComponent
      ),
  },

  // reset password
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent
      ),
  },

  // login
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (c) => c.LoginComponent
      ),
  },
];
