# Admin Panel Configuration Files

## 📄 Essential Configuration Files

### 1. **package.json**
```json
{
  "name": "iranian-community-admin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy",
    "deploy:hosting": "npm run build && firebase deploy --only hosting",
    "deploy:functions": "firebase deploy --only functions",
    "deploy:rules": "firebase deploy --only firestore:rules,storage"
  },
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@hookform/resolvers": "^3.3.2",
    "@monaco-editor/react": "^4.6.0",
    "@mui/icons-material": "^5.14.19",
    "@mui/material": "^5.14.20",
    "@mui/x-data-grid": "^6.18.2",
    "@mui/x-date-pickers": "^6.18.2",
    "@reduxjs/toolkit": "^2.0.1",
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "dayjs": "^1.11.10",
    "firebase": "^10.7.1",
    "lucide-react": "^0.294.0",
    "monaco-editor": "^0.45.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.48.2",
    "react-hot-toast": "^2.4.1",
    "react-redux": "^9.0.4",
    "react-router-dom": "^6.20.1",
    "yup": "^1.3.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "eslint": "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "vite": "^5.0.0"
  }
}
```

### 2. **vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
})
```

### 3. **firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  }
}
```

### 4. **firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - admin access only
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
    
    // Jobs collection - admin/moderator access
    match /jobs/{jobId} {
      allow read: if isAdminOrModerator();
      allow write: if isAdmin();
    }
    
    // Events collection - admin/moderator access
    match /events/{eventId} {
      allow read: if isAdminOrModerator();
      allow write: if isAdmin();
    }
    
    // Restaurants collection - admin/moderator access
    match /restaurants/{restaurantId} {
      allow read: if isAdminOrModerator();
      allow write: if isAdmin();
    }
    
    // Cafes collection - admin/moderator access
    match /cafes/{cafeId} {
      allow read: if isAdminOrModerator();
      allow write: if isAdmin();
    }
    
    // Reports collection - admin/moderator access
    match /reports/{reportId} {
      allow read, write: if isAdminOrModerator();
    }
    
    // Analytics collection - admin access only
    match /analytics/{analyticsId} {
      allow read, write: if isAdmin();
    }
    
    // Notifications collection - admin access only
    match /notifications/{notificationId} {
      allow read, write: if isAdmin();
    }
    
    // Settings collection - super admin access only
    match /settings/{settingId} {
      allow read: if isAdmin();
      allow write: if isSuperAdmin();
    }
    
    // Categories collection - admin/content manager access
    match /categories/{categoryId} {
      allow read: if isAdminOrModerator();
      allow write: if isAdminOrContentManager();
    }
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && getUserRole() == 'super_admin';
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() in ['super_admin', 'admin'];
    }
    
    function isAdminOrModerator() {
      return isAuthenticated() && getUserRole() in ['super_admin', 'admin', 'moderator'];
    }
    
    function isAdminOrContentManager() {
      return isAuthenticated() && getUserRole() in ['super_admin', 'admin', 'content_manager'];
    }
  }
}
```

### 5. **storage.rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Admin uploads
    match /admin/{allPaths=**} {
      allow read, write: if isAdmin();
    }
    
    // Job images
    match /jobs/{jobId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminOrModerator();
    }
    
    // Event images
    match /events/{eventId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminOrModerator();
    }
    
    // Restaurant images
    match /restaurants/{restaurantId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminOrModerator();
    }
    
    // Cafe images
    match /cafes/{cafeId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdminOrModerator();
    }
    
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isAdmin() {
      return isAuthenticated() && getUserRole() in ['super_admin', 'admin'];
    }
    
    function isAdminOrModerator() {
      return isAuthenticated() && getUserRole() in ['super_admin', 'admin', 'moderator'];
    }
  }
}
```

### 6. **firestore.indexes.json**
```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "role",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "restaurants",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "verified",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "cafes",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "verified",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "reports",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "priority",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

### 7. **.env.example**
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# App Configuration
VITE_APP_NAME=Iranian Community Admin
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# API Configuration
VITE_API_BASE_URL=https://api.iraniancommunitycanda.ca
VITE_ADMIN_EMAIL=admin@iraniancommunitycanda.ca

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REPORTS=true

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_SENTRY_DSN=your_sentry_dsn
```

### 8. **.gitignore**
```bash
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase
.firebase
firebase-debug.log
firestore-debug.log

# Build
build/
dist/

# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

### 9. **README.md**
```markdown
# Iranian Community Canada - Admin Panel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

### Installation
1. Clone the repository
```bash
git clone <repository-url>
cd iranian-community-admin
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. Start development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

6. Deploy to Firebase
```bash
npm run deploy
```

## 📁 Project Structure
- `/src/components` - Reusable UI components
- `/src/pages` - Page components
- `/src/services` - Firebase and API services
- `/src/hooks` - Custom React hooks
- `/src/store` - Redux store and slices
- `/src/utils` - Utility functions

## 🔐 Admin Roles
- **Super Admin** - Full system access
- **Admin** - Content and user management
- **Moderator** - Content approval and reports
- **Content Manager** - Content CRUD operations

## 📊 Features
- User management
- Content moderation
- Analytics dashboard
- Notification system
- Reports handling
- Settings configuration

## 🛠️ Development
- React 18 + Vite
- Material-UI components
- Firebase backend
- Redux state management
- React Hook Form
```

This complete structure provides everything you need to copy and paste into a new admin panel project. All configuration files, database structure, and project setup are included for immediate use.
