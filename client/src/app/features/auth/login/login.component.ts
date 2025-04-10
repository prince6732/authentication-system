import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ValidateAllFormFields } from '../../../core/utils/CustomValidator';
import { environment } from '../../../../environments/environment';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';
import { ProcessingComponent } from '../../../shared/components/processing.component';
import { SweetalertComponent } from '../../../shared/components/sweetalert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ForgotPasswordComponent,
    ProcessingComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  rForm!: FormGroup;
  isLoggedIn = false;
  isLoginFailed = false;
  loginError = '';
  showForgotPasswordModal = false;
  isProcessing = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sweetalertComponent: SweetalertComponent
  ) {}

  ngOnInit(): void {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.router.navigate(['/']);
    }

    this.rForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      const token = params['token'];
      const id = params['id'];
      const username = params['username'];
      const email = params['email'];
      const user = { id, username, email };
      if (token) {
        // Store token in localStorage
        this.tokenStorageService.saveToken(token);
        // Store user in localStorage
        this.tokenStorageService.saveUser(user);
        // Show success toast
        this.sweetalertComponent.showToast(
          'Welcome to Universal Farmer',
          'success',
          3000
        );
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit(): void {
    if (this.rForm.valid) {
      this.authService.login(this.rForm.value).subscribe({
        next: (data) => {
          if (data.accessToken) {
            this.tokenStorageService.saveToken(data.accessToken);
            this.tokenStorageService.saveUser(data.user);
            this.isLoginFailed = false;
            this.isProcessing = true;
            setTimeout(() => {
              this.isProcessing = false;
              this.isLoggedIn = true;
              this.router.navigate(['/']);
              this.sweetalertComponent.showToast(
                'Welcome to Universal Farmer',
                'success',
                3000
              );
            }, Math.floor(Math.random() * 1000) + 1000);
          }
        },
        error: (error) => {
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.isLoginFailed = true;
            this.rForm.markAsUntouched();
            this.handleError(error);
          }, Math.floor(Math.random() * 1000) + 1000);
        },
      });
    } else {
      ValidateAllFormFields.validateAllFormFields(this.rForm);
    }
  }

  //social login
  public loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl}/auth/google`; //google
  }
  public loginWithFacebook(): void {
    window.location.href = `${environment.apiUrl}/auth/facebook`; //facebook
  }

  // open modal for send request for forgot-password
  openModal(): void {
    this.showForgotPasswordModal = true;
  }

  // close modal
  closeModal(e: boolean): void {
    this.showForgotPasswordModal = false;
  }

  //error handler
  private handleError(err: any): void {
    if (err.error && err.error.message) {
      this.loginError = err.error.message;
    } else {
      this.loginError = 'An error occurred during login.';
    }
    this.isLoginFailed = true;
  }
}
