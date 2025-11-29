import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  template: '<p>Logging out...</p>',
})
export class Logout implements OnInit {
  authService = inject(AuthService);

  ngOnInit() {
    this.authService.logout();
  }
}
