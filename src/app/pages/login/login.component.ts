import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule,CommonModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

 constructor(private fb: FormBuilder, private auth: AuthService,  private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

 async onSubmit(): Promise<void> {
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  const { username, password } = this.loginForm.value;

  try {
    await this.auth.login({ username, password }).toPromise();
    this.router.navigate(['/']); // הפניה לדשבורד
  } catch (error) {
    console.error('Login failed:', error);
    // תוכל גם להוסיף כאן הודעת שגיאה למשתמש
  } finally {
    this.isLoading = false;
  }
}
}
