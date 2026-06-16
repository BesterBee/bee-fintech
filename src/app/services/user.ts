import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private USER_KEY = 'beepay_users';
  
  // Helper method to get all registered users from localStorage
  getUsers(): any[] {
    return JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
  }

  saveUser(user: any[]) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
