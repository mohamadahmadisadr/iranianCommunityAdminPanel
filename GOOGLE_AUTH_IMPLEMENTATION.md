# 🔐 Google Authentication Implementation

This document outlines the Google Sign-In implementation for the Iranian Community Admin Panel.

## 🎯 Overview

The admin panel now uses **Google Sign-In** exclusively for authentication, providing a secure and user-friendly login experience. This implementation includes:

- **Email-based access control** - Only authorized emails can access the admin panel
- **Automatic user provisioning** - New admin users are created automatically on first login
- **Role-based permissions** - Different access levels for different admin roles
- **Google profile integration** - User profile information is synced from Google

## 🔧 Implementation Details

### Authentication Flow

1. **User clicks "Sign in with Google"**
2. **Google OAuth popup opens**
3. **User authenticates with Google**
4. **Email validation** - Check if email is in allowed list
5. **User provisioning** - Create or update user in Firestore
6. **Role verification** - Ensure user has admin privileges
7. **Redirect to dashboard** - User is logged in successfully

### Access Control Configuration

#### Allowed Emails (`src/services/auth.js`)

```javascript
// Specific email addresses
const ALLOWED_ADMIN_EMAILS = [
  'admin@iraniancommunitycanda.ca',
  'mohamad@iraniancommunitycanda.ca',
  // Add more admin emails here
];

// Entire domains
const ALLOWED_ADMIN_DOMAINS = [
  'iraniancommunitycanda.ca',
  // Add more admin domains here
];
```

#### User Roles

- **super_admin** - Full system access, can manage all users and settings
- **admin** - Content and user management, system configuration
- **moderator** - Content approval, user reports, basic management
- **content_manager** - Content CRUD operations only

### Automatic User Provisioning

When an authorized email signs in for the first time:

```javascript
// New user document created in Firestore
{
  email: "user@domain.com",
  firstName: "John", // From Google displayName
  lastName: "Doe",   // From Google displayName
  role: "admin",     // Default role for new users
  status: "active",
  profileImage: "https://...", // Google profile photo
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

## 🚀 Setup Instructions

### 1. Firebase Configuration

1. **Enable Google Authentication** in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

2. **Configure OAuth consent screen** in Google Cloud Console:
   - Set application name
   - Add authorized domains
   - Configure scopes (email, profile)

### 2. Update Allowed Emails

Edit `src/services/auth.js` to add your admin emails:

```javascript
const ALLOWED_ADMIN_EMAILS = [
  'your-email@gmail.com',        // Add your Google email
  'admin@yourdomain.com',        // Add organization emails
  // Add more emails as needed
];

const ALLOWED_ADMIN_DOMAINS = [
  'yourdomain.com',              // Add your organization domain
  // Add more domains as needed
];
```

### 3. Test Authentication

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google"
4. Authenticate with an authorized email
5. Verify you can access the dashboard

## 🔒 Security Features

### Email Validation

- Only emails in `ALLOWED_ADMIN_EMAILS` or domains in `ALLOWED_ADMIN_DOMAINS` can sign in
- Unauthorized emails are immediately signed out with an error message

### Role-Based Access

- Users must have an admin role (`admin`, `super_admin`, `moderator`, `content_manager`)
- Role is checked on every authentication attempt
- Users without admin roles are denied access

### Session Management

- Firebase handles secure session management
- Sessions are automatically refreshed
- Users are signed out when closing the browser (configurable)

### Profile Synchronization

- User profile information is updated from Google on each login
- Profile photos are automatically synced
- Last login timestamp is recorded

## 🎨 UI Components

### Login Page (`src/pages/Login.jsx`)

- Clean Google Sign-In button with Google branding
- Loading states and error handling
- Demo mode support for development
- Clear messaging about admin-only access

### User Profile Display

- **Header**: Shows Google profile photo and name
- **Sidebar**: Displays user name and role
- **Dashboard**: Personalized welcome message

## 🧪 Demo Mode

For development without Firebase configuration:

- Click "Sign in with Google" button
- Automatically logs in as demo admin user
- All features work in simulation mode
- Demo notification explains setup process

## 🔧 Customization

### Adding New Admin Emails

1. Edit `ALLOWED_ADMIN_EMAILS` array in `src/services/auth.js`
2. Restart the development server
3. New emails can now sign in

### Changing Default Role

Edit the user creation logic in `signInWithGoogle()`:

```javascript
// Change default role for new users
userData = {
  // ... other fields
  role: 'moderator', // Change from 'admin' to desired default
  // ... other fields
};
```

### Custom Domain Configuration

1. Add domain to `ALLOWED_ADMIN_DOMAINS`
2. Configure domain in Firebase Console
3. Update OAuth consent screen in Google Cloud Console

## 🚨 Troubleshooting

### Common Issues

**"Access denied" error**
- Check if email is in `ALLOWED_ADMIN_EMAILS` or domain is in `ALLOWED_ADMIN_DOMAINS`
- Verify email spelling and case sensitivity

**"Pop-up blocked" error**
- Enable pop-ups for your domain
- Try using incognito/private browsing mode

**"Unauthorized domain" error**
- Add domain to Firebase authorized domains
- Update OAuth consent screen configuration

**User created but can't access**
- Check user role in Firestore
- Ensure role is one of: `admin`, `super_admin`, `moderator`, `content_manager`

### Debug Mode

Enable debug logging by adding to console:

```javascript
// In browser console
localStorage.setItem('debug', 'firebase:auth');
```

## 📝 Migration Notes

### From Email/Password to Google Auth

If migrating from email/password authentication:

1. **Export existing users** from Firebase Authentication
2. **Update user documents** in Firestore with Google email addresses
3. **Inform users** about the new Google Sign-In requirement
4. **Test thoroughly** with all admin user accounts

### Maintaining User Data

- Existing user roles and permissions are preserved
- User documents are updated, not replaced
- Historical data remains intact

## 🎉 Benefits

### For Users
- **No passwords to remember** - Use existing Google account
- **Faster login** - One-click authentication
- **Profile sync** - Automatic profile photo and name updates
- **Better security** - Google's robust security measures

### For Administrators
- **Easier user management** - No password resets needed
- **Better security** - Leverage Google's security infrastructure
- **Audit trail** - Clear login tracking and user identification
- **Scalable access control** - Easy to add/remove admin access

---

🔐 **Security Note**: Always keep the allowed emails list up to date and regularly review admin access permissions.
