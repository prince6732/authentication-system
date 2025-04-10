import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../models/category.model';
import { User } from '../../models/user.model';
import { FormsModule } from '@angular/forms';
import { ProcessingComponent } from '../processing.component';
import { SweetalertComponent } from '../sweetalert.component';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { PostService } from '../../../core/services/post.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProcessingComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  user!: User;
  isProfileDropdownOpen = false;
  topCategories: Category[] = [];
  mostUsedCategories: Category[] = [];
  searchQuery!: string;
  isProcessing = false;
  isDropdownOpen = false;
  currentUserId!: number;
  unreadMessages!: number;
  currentPlaceholder: string = 'Find in Cars, Mobile Phones and More...';
  placeholderInterval: any;
  searchLocationSuggetions: any[] = [];
  isLocationDropdownOpen = false;
  suggestions: any[] = [];
  postsSuggetions: any[] = [];
  private searchTerms = new Subject<string>();
  suggetionDropdown = false;

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private postService: PostService,
    private sweetalertComponent: SweetalertComponent,
    private el: ElementRef,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.startPlaceholderRotation();
    this.topUsedCategories();
    if (this.tokenStorageService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.user = this.tokenStorageService.getUser();
      this.currentUserId = Number(this.user.id);
    }
    this.countUnreadMessages();
    document.addEventListener(
      'click',
      this.closeDropdownOnOutsideClick.bind(this)
    );
    this.route.queryParams.subscribe((params) => {
      const query = params['query']; // get query from params
      const category = params['category']; // get category from params
      if (query) {
        this.searchQuery = query;
      }
      if (category) {
        this.searchQuery = '';
      }
    });
    this.searchTerms
      .pipe(
        debounceTime(300), // Wait 300ms after the user stops typing
        distinctUntilChanged(),
        switchMap((term: string) =>
          term ? this.postService.searchSuggestions(term) : []
        )
      )
      .subscribe({
        next: (data) => {
          this.suggestions = data.categories;
          this.postsSuggetions = data.posts;
          this.suggetionDropdown = true;
        },
        error: (error) => {
          console.error('Error fetching suggestions:', error);
        },
      });
  }

  ngOnDestroy(): void {
    document.removeEventListener(
      'click',
      this.closeDropdownOnOutsideClick.bind(this)
    );
    if (this.placeholderInterval) {
      clearInterval(this.placeholderInterval);
    }
    this.searchTerms.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.initAutocomplete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Check if the clicked element is inside the dropdown or the input
    const isInsideDropdown = targetElement.closest('.location') !== null;

    if (!isInsideDropdown) {
      this.isLocationDropdownOpen = false;
    }

    const isInsideSuggetionDropdown =
      targetElement.closest('.dropdown') !== null;
    if (!isInsideSuggetionDropdown) {
      this.suggetionDropdown = false;
    }
  }

  toggleProfileDropdown(event: Event): void {
    event.stopPropagation();
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    if (this.isLocationDropdownOpen) {
      this.isLocationDropdownOpen = false;
    }
  }

  closeDropdownOnOutsideClick(event: MouseEvent): void {
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    const dropdownToggle = document.getElementById('profile-trigger');
    const target = event.target as HTMLElement;

    if (
      dropdownMenu &&
      dropdownToggle &&
      !dropdownMenu.contains(target) &&
      !dropdownToggle.contains(target)
    ) {
      this.isProfileDropdownOpen = false;
    }
  }

  // logout
  logout(event: Event): void {
    event.stopPropagation();
    this.isProfileDropdownOpen = false;
    this.sweetalertComponent
      .confirmDelete('Are you sure you want to Logout?', 'Yes')
      .then((result) => {
        if (result.isConfirmed) {
          this.isProcessing = true;
          setTimeout(() => {
            this.tokenStorageService.signOut();
            this.router.navigate(['/']);
            this.isProcessing = false;
            // Show success toast
            this.sweetalertComponent.showToast(
              'you have been logged out',
              'success',
              2000
            );
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }, 2000);
        }
      });
  }

  // top used categories
  topUsedCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.topCategories = data;
        this.mostUsedCategories = data.slice(0, 8);
      },
      error: (e) => console.error(e),
    });
  }

  onCategorySelect(categoryName: string): void {
    if (categoryName) {
      this.isProcessing = true;
      setTimeout(() => {
        this.router.navigate(['/search'], {
          queryParams: { category: categoryName.toLowerCase() },
        });
        this.suggetionDropdown = false;
        this.isProcessing = false;
      }, Math.floor(Math.random() * 2000));
    }
  }

  // search post
  onSearchSubmit(query: string): void {
    if (query) {
      this.isProcessing = true;
      setTimeout(() => {
        this.isProcessing = false;
        this.suggetionDropdown = false;
        this.router.navigate(['/search'], {
          queryParams: { query: query.toLowerCase() },
        });
      }, Math.floor(Math.random() * 1000));
    }
  }

  userPosts(event: Event): void {
    event.stopPropagation();
    this.isProcessing = true;
    setTimeout(() => {
      this.isProfileDropdownOpen = false;
      this.router.navigate(['/myposts']);
      this.isProcessing = false;
    }, Math.random() * 2000);
  }

  // favorite posts
  favoritePosts(event: Event): void {
    event.stopPropagation();
    this.isProcessing = true;
    setTimeout(() => {
      this.isProfileDropdownOpen = false;
      this.router.navigate(['/favorites']);
      this.isProcessing = false;
    }, Math.random() * 2000);
  }

  messages(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.router.navigate(['/chat-inbox']);
    }, Math.random() * 2000);
    if (this.isLocationDropdownOpen) {
      this.isLocationDropdownOpen = false;
    }
  }

  // search placeholder interval
  startPlaceholderRotation() {
    let index = 0;
    this.placeholderInterval = setInterval(() => {
      if (this.topCategories.length > 0) {
        this.currentPlaceholder = `Find in "${this.topCategories[index].name}"`;
        index = (index + 1) % this.topCategories.length;
      }
    }, 2000); // update placeholder in every 2 seconds
  }

  onSearchInput(term: string): void {
    if (term.trim() === '') {
      this.suggetionDropdown = false;
    }
    this.searchTerms.next(term);
  }

  onLocationSelect(location: string): void {
    if (location) {
      this.isProcessing = true;
      setTimeout(() => {
        this.router.navigate(['/search'], {
          queryParams: { location: location.toLowerCase() },
        });
        this.suggetionDropdown = false;
        this.isProcessing = false;
      }, Math.floor(Math.random() * 2000));
    }
  }

  private initAutocomplete(): void {
    const input = this.el.nativeElement.querySelector(
      '#search-input'
    ) as HTMLInputElement;

    // Initialize Google Places Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['geometry', 'name', 'formatted_address'], // Specify the fields you want
      componentRestrictions: { country: 'IN' }, // Restrict search to India
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (place && place.name) {
        // Call the search submit method with the name
        this.onLocationSelect(place.name);
      } else {
        console.error('Place name not found in the response.');
      }
    });
  }

  // count unread messages for logged in user
  countUnreadMessages(): void {
    const userId = this.currentUserId; // Example userId for the logged-in user
    this.chatService.getUnreadMessages(userId).subscribe((count) => {
      this.unreadMessages = count;
    });
  }
}
