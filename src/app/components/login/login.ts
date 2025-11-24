import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  // State to toggle between Login and Sign Up
  isLoginMode = true;
  authError: string | null = null;

  // Login Form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Sign Up Form
  signUpForm = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Toggle Mode
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authError = null; // Clear error on toggle
  }

  // Handle Google Login
  loginWithGoogle() {
    this.auth.googleLogin();
  }

  // Handle Email/Pass Submission
  async onSubmit() {
    this.authError = null; // Clear previous error
    if (this.isLoginMode) {
      // ### LOGIN ###
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;
        this.authError = (await this.auth.emailLogin(email!, password!)) || null;
      }
    } else {
      // ### SIGN UP ###
    if (this.signUpForm.valid) {
        const { displayName, email, password } = this.signUpForm.value;
        // This is also 100% correct.
        this.authError = (await this.auth.emailSignUp(displayName!, email!, password!)) || null;
      }
    }
  }

  // Handle Forgot Password
  forgotPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.authError = 'Please enter your email in the login form first.';
      return;
    }
    this.auth.sendPasswordReset(email);
    this.authError = null;
  }
}
