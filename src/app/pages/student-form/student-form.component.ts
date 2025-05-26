import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent {
  @Output() studentAdded = new EventEmitter<void>();
  form: FormGroup;
  message = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.authService.currentUser$.pipe(take(1)).subscribe(wrapper => {
      const token = wrapper?.token;
      if (!token) {
        this.message = '❌ No token available';
        return;
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.post('/api/students', this.form.value, { headers }).subscribe({
        next: () => {
          this.message = '✅ Student added successfully';
          this.form.reset();
          this.studentAdded.emit();
        },
        error: () => {
          this.message = '❌ Failed to add student';
        }
      });
    });
  }
}
