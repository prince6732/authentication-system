import { Component, OnInit } from '@angular/core';
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
import { CommonModule, Location } from '@angular/common';
import { ValidateAllFormFields } from '../../../core/utils/CustomValidator';
import { ProcessingComponent } from '../../../shared/components/processing.component';
import { SweetalertComponent } from '../../../shared/components/sweetalert.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProcessingComponent],
  templateUrl: './verify-email.component.html',
})
export class VerifyEmailComponent implements OnInit {
  email: string = '';
  rForm!: FormGroup;
  isLoggedIn = false;
  isVerified = false;
  isVerifiedFailed = false;
  verifyError = '';
  isProcessing = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tokenStorageService: TokenStorageService,
    private location: Location,
    private sweetalertComponent: SweetalertComponent
  ) {}

  ngOnInit(): void {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.router.navigate([this.location.back()]);
    }
    // get email from params
    this.activatedRoute.queryParams.subscribe((params) => {
      this.email = params['email'];
    });

    this.rForm = this.formBuilder.group({
      verificationCode: ['', Validators.compose([Validators.required])],
      email: this.email,
    });
  }

  // Submit
  onSubmit(): void {
    if (this.rForm.valid) {
      this.authService.verifyEmail(this.rForm.value).subscribe({
        next: () => {
          this.isVerifiedFailed = false;
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.router.navigate(['/login']);
            this.isVerified = true;
            // Show success toast
            this.sweetalertComponent.showToast(
              'email verified successfully',
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
            this.isVerifiedFailed = true;
            this.rForm.markAsUntouched();
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
      this.verifyError = err.error.message;
    } else {
      this.verifyError = 'something went wrong !';
    }
    this.isVerifiedFailed = true;
  }
}
