import {
  HttpRequest,
  HttpEvent,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';
const TOKEN_HEADER_KEY = 'Authorization';

export function AuthInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const tokenService: TokenStorageService = new TokenStorageService();
  const token = tokenService.getToken();

  if (token != null) {
    req = req.clone({
      headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token),
    });
  }
  return next(req);
}
