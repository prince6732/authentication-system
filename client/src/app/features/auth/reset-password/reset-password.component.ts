import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { SweetalertComponent } from '../../../shared/components/sweetalert.component';
import { ValidateAllFormFields } from '../../../core/utils/CustomValidator';
import { ProcessingComponent } from '../../../shared/components/processing.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ProcessingComponent,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  rForm: FormGroup;
  tokenVerifiedFailed = false;
  isLoggedIn = false;
  tokenVerifyError = '';
  token: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isProcessing = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private sweetalertComponent: SweetalertComponent,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.rForm = this.formBuilder.group(
      {
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ]),
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.router.navigate([this.location.back()]);
    }
    // take snapshot of token from params
    this.token = this.activatedRoute.snapshot.paramMap.get('token') || '';
  }

  // Password Match
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Submit
  onSubmit(): void {
    if (this.rForm.valid) {
      this.authService.resetPassword(this.token, this.rForm.value).subscribe({
        next: () => {
          this.tokenVerifiedFailed = false;
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.router.navigate(['/login']);
            // Show success toast
            this.sweetalertComponent.showToast(
              'password reset successfully',
              'success',
              2000
            );
          }, Math.floor(Math.random() * 1000) + 1000);
        },
        error: (error) => {
          this.isProcessing = true;
          setTimeout(() => {
            console.log(error);
            this.isProcessing = false;
            this.tokenVerifiedFailed = true;
            this.rForm.markAsUntouched();
            this.router.navigate([`/reset-password/${this.token}`]);
            this.handleError(error);
          }, Math.floor(Math.random() * 1000) + 1000);
        },
      });
    } else {
      ValidateAllFormFields.validateAllFormFields(this.rForm);
    }
  }

  // Error Handler
  private handleError(err: any): void {
    if (err.error && err.error.message) {
      this.tokenVerifyError = err.error.message;
    } else {
      this.tokenVerifyError = 'something went wrong !';
    }
    this.tokenVerifiedFailed = true;
  }
}
