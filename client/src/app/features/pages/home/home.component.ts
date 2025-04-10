import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private tokenStorageService: TokenStorageService) {}

  ngOnInit(): void {
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }
}
