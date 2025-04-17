import { auth, trackUserActivity, trackPageView } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Active users tracking service
class FirebaseAnalyticsService {
  constructor() {
    this.activeUsers = [];
    this.initAuthListener();
  }

  // Initialize auth state listener to track user login/logout
  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.trackSignIn(user);
      }
    });
  }

  // Track when user signs in
  trackSignIn(user) {
    trackUserActivity(user.uid, user.displayName || user.email);
    this.addActiveUser(user);
  }

  // Track page navigation
  trackNavigation(pageName) {
    trackPageView(pageName, window.location.pathname);
    
    // Update active user's last activity if they exist
    const user = auth.currentUser;
    if (user) {
      this.updateUserActivity(user.uid);
    }
  }

  // Add user to active users list
  addActiveUser(user) {
    const existingUserIndex = this.activeUsers.findIndex(u => u.id === user.uid);
    
    if (existingUserIndex >= 0) {
      // Update existing user
      this.activeUsers[existingUserIndex] = {
        ...this.activeUsers[existingUserIndex],
        lastActive: new Date(),
        isOnline: true
      };
    } else {
      // Add new user
      this.activeUsers.push({
        id: user.uid,
        name: user.displayName || 'Anonymous User',
        email: user.email || 'No email',
        lastActive: new Date(),
        isOnline: true,
        sessionStart: new Date()
      });
    }
    
    return [...this.activeUsers];
  }

  // Update user's last activity timestamp
  updateUserActivity(userId) {
    const userIndex = this.activeUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      this.activeUsers[userIndex].lastActive = new Date();
      this.activeUsers[userIndex].isOnline = true;
    }
    
    return [...this.activeUsers];
  }

  // Get current active users (client-side only)
  getActiveUsers() {
    // Remove users who haven't been active in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    this.activeUsers = this.activeUsers.filter(user => 
      new Date(user.lastActive) > fifteenMinutesAgo
    );
    
    return [...this.activeUsers];
  }
}

// Create and export a singleton instance
const analyticsService = new FirebaseAnalyticsService();
export default analyticsService; 