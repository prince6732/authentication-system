import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ValidateAllFormFields } from '../../../core/utils/CustomValidator';
import { SweetalertComponent } from '../../../shared/components/sweetalert.component';
import { ProcessingComponent } from '../../../shared/components/processing.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    FormsModule,
    ProcessingComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  rForm!: FormGroup;
  emailVerified = false;
  isLoggedIn = false;
  emailVerifiedFailed = false;
  emailVerifyError = '';
  @Output() panelClosed = new EventEmitter<boolean>();
  isProcessing = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenStorageService: TokenStorageService,
    private sweetalertComponent: SweetalertComponent
  ) {}

  ngOnInit(): void {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
    }
    this.rForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  // Close Modal
  closeModal(action: boolean): void {
    this.panelClosed.emit(action);
  }

  // Submit
  onSubmit(): void {
    if (this.rForm.valid) {
      this.authService.forgotPassword(this.rForm.value).subscribe({
        next: () => {
          this.emailVerifiedFailed = false;
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.emailVerified = true;
            this.closeModal(true);
            // Show success toast
            this.sweetalertComponent.showToast(
              'forget password link has been send to your email address!',
              'success',
              3000
            );
          }, Math.floor(Math.random() * 1000) + 1000);
        },
        error: (error) => {
          this.isProcessing = true;
          setTimeout(() => {
            console.log(error);
            this.isProcessing = false;
            this.emailVerifiedFailed = true;
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
      this.emailVerifyError = err.error.message;
    } else {
      this.emailVerifyError = 'something went wrong !';
    }
    this.emailVerifiedFailed = true;
  }
}
