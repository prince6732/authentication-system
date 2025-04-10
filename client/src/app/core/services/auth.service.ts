import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const apiUrl = `${environment.apiUrl}/api/auth/`;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  // Login
  login(formData: FormData): Observable<{ user: User, accessToken: string }> {
    return this.http.post<{ user: User, accessToken: string }>(apiUrl + 'login', formData, httpOptions);
  }

  // Signup
  register(formData: FormData): Observable<User[]> {
    return this.http.post<User[]>(apiUrl + 'signup', formData);
  }

  // Verify-email
  verifyEmail(formData: FormData): Observable<User[]> {
    return this.http.post<User[]>(apiUrl + 'verify', formData)
  }

  // get forget password link on gmail
  forgotPassword(formData: FormData): Observable<{ user: User, accessToken: string }> {
    return this.http.post<{ user: User, accessToken: string }>(apiUrl + 'forgot-password', formData, httpOptions);
  }

  // Password Reset
  resetPassword(token: string, formData: FormData): Observable<User[]> {
    return this.http.post<User[]>(apiUrl + `reset-password/${token}`, formData, httpOptions);
  }
}
