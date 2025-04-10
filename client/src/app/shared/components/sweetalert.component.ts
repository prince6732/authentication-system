import { Component, Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Component({
  selector: 'app-sweetalert',
  template: '',
})
@Injectable({
  providedIn: 'root',
})
export class SweetalertComponent {
  showAlert(options: SweetAlertOptions): Promise<any> {
    return Swal.fire(options);
  }

  confirmDelete(text: string, cbtnText?: string): Promise<any> {
    return this.showAlert({
      title: 'Are you sure?',
      text: text,
      icon: 'warning',
      timer: 8000,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: cbtnText ? cbtnText : 'Yes, delete it!',
    });
  }

  successMessage(title: string, text: string): void {
    this.showAlert({
      title: title,
      text: text,
      timer: 2000,
      icon: 'success',
    });
  }

  errorMessage(title: string, text: string): void {
    this.showAlert({
      title: title,
      text: text,
      timer: 5000,
      icon: 'error',
    });
  }

  // Toast Message
  showToast(
    message: string,
    icon: 'success' | 'error' | 'warning' | 'info',
    timer?: number
  ): void {
    Swal.fire({
      icon: icon,
      title: message,
      showConfirmButton: false,
      timer: timer ? timer : 1000,
    });
  }
}
