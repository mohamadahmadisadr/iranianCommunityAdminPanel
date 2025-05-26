# 🔥 Firebase User Data Structure

The Users page now fetches real user data from Firebase Firestore. Here's the expected data structure and how to set it up.

## 📊 **User Document Structure**

### **Firestore Collection: `users`**

Each user document should have the following structure:

```javascript
{
  // Document ID: user's Firebase Auth UID
  id: "firebase_auth_uid_123",
  
  // Basic Information (from Google Auth)
  email: "user@example.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/...",
  
  // Optional: Manual name fields (if not using displayName)
  firstName: "John",
  lastName: "Doe",
  
  // User Role and Status
  role: "user", // user, moderator, admin, super_admin
  status: "active", // active, suspended, pending, banned
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  registrationDate: Timestamp, // Same as createdAt
  lastLogin: Timestamp,
  
  // Optional: Additional Profile Information
  phone: "+1234567890",
  address: {
    street: "123 Main St",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M1M 1M1",
    country: "Canada"
  },
  
  // User Preferences
  preferences: {
    language: "en",
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    theme: "light"
  },
  
  // Activity Tracking
  loginCount: 15,
  lastActivity: Timestamp,
  
  // Admin Notes (for moderation)
  adminNotes: "User verified through community referral",
  
  // Account Verification
  emailVerified: true,
  phoneVerified: false,
  
  // Social Links (optional)
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    instagram: "@johndoe",
    website: "https://johndoe.com"
  }
}
```

## 🔧 **How Users Are Created**

### **Automatic User Creation (Recommended)**

When users sign in with Google for the first time, you can automatically create their user document:

```javascript
// In your authentication service
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

const createUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new user document
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: 'user', // Default role
      status: 'active', // Default status
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      registrationDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
      emailVerified: user.emailVerified,
      loginCount: 1,
    });
  } else {
    // Update last login
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      loginCount: increment(1),
    });
  }
};
```

### **Manual User Creation**

Admins can also manually create users through the admin panel (future feature).

## 🎯 **Current Features Working**

### **User Management Actions**
- ✅ **View all users** from Firestore
- ✅ **Search users** by name, email
- ✅ **Filter users** by role and status
- ✅ **Suspend users** (updates status to 'suspended')
- ✅ **Activate users** (updates status to 'active')
- ✅ **Delete users** (removes from Firestore)

### **Data Display**
- ✅ **User avatars** from Google profile photos
- ✅ **Names** from displayName or firstName/lastName
- ✅ **Email addresses** from authentication
- ✅ **Roles** with color-coded chips
- ✅ **Status** with color-coded chips
- ✅ **Registration dates** formatted properly
- ✅ **Last login** dates (or "Never" if null)

## 🔒 **Security Rules**

Make sure your Firestore security rules allow admins to read/write user data:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read/write all user data
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
      
      // Allow user creation on first login
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile (limited fields)
      allow update: if request.auth != null && 
        request.auth.uid == userId &&
        !('role' in request.resource.data) &&
        !('status' in request.resource.data);
    }
  }
}
```

## 📝 **Sample Data for Testing**

You can add sample users to your Firestore for testing:

```javascript
// Sample user documents to add to Firestore
const sampleUsers = [
  {
    id: "user_1", // Use actual Firebase Auth UID
    email: "admin@iraniancommunitycanda.ca",
    displayName: "Admin User",
    photoURL: null,
    role: "admin",
    status: "active",
    createdAt: new Date(),
    registrationDate: new Date(),
    lastLogin: new Date(),
    loginCount: 25,
  },
  {
    id: "user_2",
    email: "moderator@iraniancommunitycanda.ca", 
    displayName: "Moderator User",
    photoURL: null,
    role: "moderator",
    status: "active",
    createdAt: new Date('2024-01-15'),
    registrationDate: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20'),
    loginCount: 12,
  },
  {
    id: "user_3",
    email: "user@example.com",
    displayName: "Regular User",
    photoURL: null,
    role: "user", 
    status: "suspended",
    createdAt: new Date('2024-01-10'),
    registrationDate: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-18'),
    loginCount: 8,
  }
];
```

## 🚀 **Testing the Users Page**

1. **Navigate to**: http://localhost:3002/users
2. **View users**: See all users from your Firestore `users` collection
3. **Search**: Type in the search box to filter by name/email
4. **Filter**: Use role and status dropdowns to filter users
5. **Actions**: Click menu (⋮) to suspend, activate, or delete users
6. **Real-time updates**: Changes are immediately reflected in Firebase

## 🔄 **Next Steps**

1. **Set up automatic user creation** when users first sign in
2. **Add user profile editing** functionality
3. **Implement role-based permissions** throughout the app
4. **Add user activity tracking** and analytics
5. **Create user onboarding** flow for new registrations

The Users page now provides complete user management with real Firebase integration! 🎉
