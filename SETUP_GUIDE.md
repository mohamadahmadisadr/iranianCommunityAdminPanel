# 🚀 Firebase Setup Guide

This guide will help you set up Firebase for the Iranian Community Admin Panel.

## 📋 Prerequisites

- Google account
- Node.js 18+ installed
- Admin panel project cloned and dependencies installed

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter project name: `iranian-community-admin`
4. Choose whether to enable Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Click "Create project"

### Step 2: Enable Google Authentication

1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Click on **Google**
5. Enable **Google** provider
6. Enter your project support email
7. Click "Save"

**Important:** Make sure to add your domain to the authorized domains list in Authentication settings.

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll deploy custom rules)
4. Select a location (choose closest to your users)
5. Click "Done"

### Step 4: Enable Storage

1. Go to **Storage**
2. Click "Get started"
3. Review security rules (we'll deploy custom rules later)
4. Choose same location as Firestore
5. Click "Done"

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register app with name: `Iranian Community Admin`
5. Copy the configuration object

## ⚙️ Environment Configuration

### Step 1: Create Environment File

1. In your project root, copy the example file:
```bash
cp .env.example .env
```

2. Open `.env` file and replace the values with your Firebase config:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# App Configuration (optional to modify)
VITE_APP_NAME=Iranian Community Admin
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# API Configuration (update with your domain)
VITE_API_BASE_URL=https://api.iraniancommunitycanda.ca
VITE_ADMIN_EMAIL=admin@iraniancommunitycanda.ca

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REPORTS=true

# External Services (optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### Step 2: Restart Development Server

```bash
npm run dev
```

## 🔒 Deploy Security Rules

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase in Project

```bash
firebase init
```

Select:
- Firestore
- Storage
- Hosting (optional)

Choose your existing project when prompted.

### Step 4: Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy everything
firebase deploy
```

## 👤 Configure Admin Access

### Admin Email Configuration

The admin panel uses Google Sign-In with email-based access control. You need to configure which emails can access the admin panel.

1. **Edit the allowed emails** in `src/services/auth.js`:

```javascript
// Allowed admin email domains or specific emails
const ALLOWED_ADMIN_EMAILS = [
  'admin@iraniancommunitycanda.ca',
  'mohamad@iraniancommunitycanda.ca',
  'your-email@gmail.com', // Add your Google email here
  // Add more admin emails here
];

const ALLOWED_ADMIN_DOMAINS = [
  'iraniancommunitycanda.ca',
  'yourdomain.com', // Add your organization domain
  // Add more admin domains here
];
```

### How Admin Access Works

1. **First-time Login**: When an authorized email signs in with Google for the first time:
   - A new user document is automatically created in Firestore
   - Default role is set to `admin`
   - User profile information is populated from Google account

2. **Subsequent Logins**:
   - User data is updated with latest Google profile info
   - Last login timestamp is recorded
   - Existing role and permissions are preserved

3. **Access Control**:
   - Only emails in `ALLOWED_ADMIN_EMAILS` or domains in `ALLOWED_ADMIN_DOMAINS` can sign in
   - Users must have role: `admin`, `super_admin`, `moderator`, or `content_manager`

### Manual User Management (Optional)

If you need to manually create or modify admin users:

1. Go to **Firestore Database** in Firebase Console
2. Navigate to `users` collection
3. Find the user document (ID matches the Google Auth UID)
4. Edit the `role` field to change permissions:
   - `super_admin` - Full access
   - `admin` - Content and user management
   - `moderator` - Content approval and reports
   - `content_manager` - Content CRUD operations

## 🧪 Testing the Setup

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3001

3. You should see the login page without demo warnings

4. Login with your admin credentials

5. Verify you can access the dashboard

## 🚀 Deployment

### Deploy to Firebase Hosting

1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
npm run deploy
```

### Custom Domain (Optional)

1. Go to **Hosting** in Firebase Console
2. Click "Add custom domain"
3. Follow the instructions to verify domain ownership
4. Update DNS records as instructed

## 🔧 Troubleshooting

### Common Issues

**1. "Firebase: Error (auth/invalid-api-key)"**
- Check that your API key is correct in `.env`
- Ensure you've restarted the development server

**2. "Firebase: Error (auth/project-not-found)"**
- Verify your project ID is correct
- Make sure the project exists in Firebase Console

**3. "Permission denied" errors**
- Check that security rules are deployed
- Verify user has correct role in Firestore

**4. "Module not found" errors**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed

### Getting Help

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review the project's README.md
- Check browser console for detailed error messages

## 📚 Next Steps

After successful setup:

1. **Customize the admin panel** - Add your specific features
2. **Set up monitoring** - Configure error tracking and analytics
3. **Create backup strategy** - Set up regular database backups
4. **Configure CI/CD** - Automate deployment process
5. **Add team members** - Invite other admins to the Firebase project

## 🔐 Security Best Practices

1. **Use strong passwords** for admin accounts
2. **Enable 2FA** on your Google account
3. **Regularly review** Firebase security rules
4. **Monitor authentication** logs for suspicious activity
5. **Keep dependencies updated** regularly
6. **Use environment variables** for sensitive data
7. **Implement proper logging** for admin actions

---

🎉 **Congratulations!** Your Iranian Community Admin Panel is now ready for production use.
