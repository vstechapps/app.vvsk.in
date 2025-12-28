import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppUser } from '../../app.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { filter, take } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';




@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  user$ = this.authService.user$;
  formData: Partial<AppUser> = {};

  ngOnInit() {
    this.user$.pipe(
      filter(u => !!u),
      take(1)
    ).subscribe(user => {
      console.log('User loaded for profile editing:', user);
      if (user) {
        this.formData = { ...user };
        if (this.formData.dateOfBirth) {
          try {
            this.formData.dateOfBirth = new Date(this.formData.dateOfBirth) as any;
          } catch (e) {
            console.error('Error parsing date', e);
          }
        }
      }
    });
  }

  isProfileIncomplete(user: AppUser | null | undefined): boolean {
    if (!user) return false;
    return !user.gender || !user.dateOfBirth;
  }

  async saveProfile() {
    console.log('Saving profile...', this.formData);
    if (this.formData.uid) {
      try {
        const dataToSave = { ...this.formData };
        if (dataToSave.dateOfBirth) {
          const d = new Date(dataToSave.dateOfBirth);
          if (!isNaN(d.getTime())) {
            dataToSave.dateOfBirth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
        }
        await this.authService.updateUser(this.formData.uid, dataToSave);
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Error updating profile:', error);
        this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 3000 });
      }
    } else {
      console.error('No UID found in formData');
    }
  }
}
