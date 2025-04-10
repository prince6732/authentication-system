import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ValidateAllFormFields } from '../../../core/utils/CustomValidator';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { ProcessingComponent } from "../../../shared/components/processing.component";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, ProcessingComponent],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  rForm!: FormGroup;
  isSignUp = false;
  isSignUpFailed = false;
  signupError = '';
  email: string = '';
  isProcessing = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private tokenStorageService: TokenStorageService,
    private location: Location
  ) {}

  ngOnInit() {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isSignUp = true;
      this.router.navigate([this.location.back()]);
    }
    this.rForm = this.formBuilder.group(
      {
        username: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(20),
          ]),
        ],
        email: [
          '',
          Validators.compose([Validators.required, Validators.email]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ]),
        ],
        confirmPassword: ['', Validators.compose([Validators.required])],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Password Match
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // Submit
  onSubmit(): void {
    if (this.rForm.valid) {
      this.authService.register(this.rForm.value).subscribe({
        next: (data) => {
          this.isSignUpFailed = false;
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.router.navigate([`/verify`], { queryParams: { email: data } });
            this.isSignUp = true;
          }, Math.floor(Math.random() * 1000) + 1000);
        },
        error: (error) => {
          this.isProcessing = true;
          setTimeout(() => {
            this.isProcessing = false;
            this.isSignUpFailed = true;
            this.isSignUp = false;
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
      this.signupError = err.error.message;
    } else {
      this.signupError = 'An error occurred during login.';
    }
    this.isSignUpFailed = true;
  }
}
