import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private USER_KEY = 'beepay_users';
  private SESSION_KEY = 'beepay_session';

  //signal to manage user state
  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(private router: Router) {
    this.loadSession(); 
  }

  // Register a new user if email is not already taken
  register(user: User) {
    const users = this.getUsers();
    if (users.some(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    users.push(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));
  }

  // Login user if credentials are valid, otherwise return false
  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

  if (!user) return false;

  //for security reasons, remove password before storing session
  localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  this.currentUser.set(user);
  this.isLoggedIn.set(true);
  return true;
}

// Logout user and clear session
logout() {
  localStorage.removeItem(this.SESSION_KEY);
  this.currentUser.set(null);
  this.isLoggedIn.set(false);
  this.router.navigate(['/login']);
}

// Load user session from localStorage if it exists
private loadSession() {
  const session = localStorage.getItem(this.SESSION_KEY);

  if (session) {
    const user: User = JSON.parse(session);
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }
}

// Helper method to get all registered users from localStorage
private getUsers(): User[] {
  return JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
}
}