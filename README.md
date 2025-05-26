# Iranian Community Canada - Admin Panel

A comprehensive admin panel for managing the Iranian Community Canada platform. Built with React, Material-UI, Firebase, and Redux.

## 🚀 Features

### Core Features
- **User Management** - Manage community members, roles, and permissions
- **Content Management** - Oversee jobs, events, restaurants, and cafes
- **Analytics Dashboard** - Real-time insights and metrics
- **Reports & Moderation** - Handle user reports and content moderation
- **Notification System** - Send announcements and updates
- **Settings Configuration** - Manage app settings and features

### Technical Features
- **Google Authentication** - Firebase Auth with Google Sign-In and role-based access control
- **Real-time Data** - Firestore real-time updates
- **Responsive Design** - Mobile-first Material-UI components
- **State Management** - Redux Toolkit for predictable state updates
- **Form Validation** - React Hook Form with Yup validation
- **File Upload** - Firebase Storage integration
- **Charts & Analytics** - Chart.js integration for data visualization

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Material-UI (MUI)** - Modern React component library
- **Redux Toolkit** - Efficient Redux development
- **React Router v6** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **Chart.js** - Beautiful charts and graphs
- **Day.js** - Lightweight date manipulation
- **Vite** - Fast build tool and dev server

### Backend & Services
- **Firebase Auth** - Authentication and user management
- **Firestore** - NoSQL document database
- **Firebase Storage** - File storage and CDN
- **Firebase Hosting** - Static site hosting

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components
│   │   ├── Layout/      # Layout components (Header, Sidebar, etc.)
│   │   ├── DataTable/   # Data grid components
│   │   ├── Forms/       # Form components
│   │   ├── Charts/      # Chart components
│   │   ├── Modals/      # Modal components
│   │   └── UI/          # Basic UI components
│   ├── dashboard/       # Dashboard specific components
│   ├── users/          # User management components
│   ├── jobs/           # Job management components
│   ├── events/         # Event management components
│   ├── restaurants/    # Restaurant management components
│   ├── cafes/          # Cafe management components
│   ├── reports/        # Report management components
│   ├── analytics/      # Analytics components
│   ├── notifications/  # Notification components
│   └── settings/       # Settings components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and Firebase services
├── store/              # Redux store and slices
├── utils/              # Utility functions and constants
├── styles/             # Theme and global styles
└── firebaseConfig.js   # Firebase configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd iranian-community-admin
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

6. **Deploy to Firebase**
```bash
npm run deploy
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

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

### Firebase Setup

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com)

2. **Enable Google Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains

3. **Create Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Deploy the security rules from `firestore.rules`

4. **Setup Storage**
   - Go to Storage
   - Get started with default rules
   - Deploy the security rules from `storage.rules`

5. **Configure Hosting** (optional)
   - Go to Hosting
   - Follow setup instructions
   - Deploy using `npm run deploy`

## 🔐 Admin Roles & Permissions

### User Roles
- **Super Admin** - Full system access and user role management
- **Admin** - Content and user management, system settings
- **Moderator** - Content approval and user reports
- **Content Manager** - Content CRUD operations

### Permission Matrix
```javascript
const permissions = {
  users: {
    view: ['super_admin', 'admin', 'moderator'],
    create: ['super_admin', 'admin'],
    edit: ['super_admin', 'admin'],
    delete: ['super_admin'],
    suspend: ['super_admin', 'admin'],
    change_role: ['super_admin']
  },
  content: {
    view: ['super_admin', 'admin', 'moderator', 'content_manager'],
    create: ['super_admin', 'admin', 'content_manager'],
    edit: ['super_admin', 'admin', 'content_manager'],
    delete: ['super_admin', 'admin'],
    approve: ['super_admin', 'admin', 'moderator'],
    feature: ['super_admin', 'admin']
  },
  analytics: {
    view: ['super_admin', 'admin'],
    export: ['super_admin', 'admin']
  },
  settings: {
    view: ['super_admin', 'admin'],
    edit: ['super_admin']
  }
};
```

## 📊 Database Structure

### Collections Overview

#### Users Collection
```javascript
{
  id: "user_id_123",
  telegramId: "123456789",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
  phone: "+1234567890",
  role: "user", // user, moderator, admin, super_admin
  status: "active", // active, suspended, banned
  profileImage: "https://...",
  languageCode: "en",
  isPremium: false,
  registrationDate: timestamp,
  lastLogin: timestamp,
  location: {
    city: "Toronto",
    province: "Ontario",
    country: "Canada"
  },
  preferences: {
    notifications: true,
    darkMode: false,
    language: "en"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Jobs Collection
```javascript
{
  id: "job_id_123",
  title: "Software Developer",
  description: "Full-stack developer position...",
  company: "Tech Company Inc.",
  location: {
    city: "Toronto",
    province: "Ontario",
    remote: false
  },
  category: "Technology",
  type: "full-time", // full-time, part-time, contract, internship
  salary: {
    min: 70000,
    max: 90000,
    currency: "CAD",
    period: "yearly"
  },
  requirements: ["React", "Node.js", "MongoDB"],
  benefits: ["Health insurance", "Dental coverage"],
  contactEmail: "hr@company.com",
  contactPhone: "+1234567890",
  applicationUrl: "https://company.com/apply",
  userId: "user_id_123",
  status: "approved", // draft, pending, approved, rejected, expired
  featured: false,
  expiryDate: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 UI Components

### Layout Components
- **AdminLayout** - Main layout wrapper with sidebar and header
- **Header** - Top navigation with user menu and notifications
- **Sidebar** - Navigation menu with role-based access control

### Data Components
- **DataTable** - Advanced data grid with sorting, filtering, and pagination
- **StatsCard** - Dashboard statistics display
- **Charts** - Various chart types for analytics

### Form Components
- **FormField** - Standardized form input with validation
- **ImageUpload** - Drag-and-drop image upload component
- **RichTextEditor** - WYSIWYG text editor
- **DateTimePicker** - Date and time selection

### Modal Components
- **ConfirmDialog** - Confirmation dialogs for destructive actions
- **ViewModal** - Display detailed information
- **EditModal** - Edit forms in modal format

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Deployment
npm run deploy              # Deploy everything to Firebase
npm run deploy:hosting      # Deploy only hosting
npm run deploy:functions    # Deploy only functions
npm run deploy:rules        # Deploy only Firestore/Storage rules
```

### Code Style

This project uses ESLint for code linting. The configuration includes:
- React hooks rules
- React refresh rules
- Modern JavaScript standards

### Project Conventions

1. **File Naming**
   - Components: PascalCase (e.g., `UsersList.jsx`)
   - Utilities: camelCase (e.g., `helpers.js`)
   - Constants: UPPER_SNAKE_CASE (e.g., `USER_ROLES`)

2. **Component Structure**
   - Use functional components with hooks
   - Implement proper prop validation
   - Follow Material-UI theming guidelines

3. **State Management**
   - Use Redux Toolkit for global state
   - Local state for component-specific data
   - Custom hooks for reusable logic

## 🚀 Deployment

### Firebase Hosting

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Firebase**
```bash
npm run deploy
```

### Environment-specific Deployments

```bash
# Development
firebase use development
npm run deploy

# Production
firebase use production
npm run deploy
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- User registration trends
- Content creation metrics
- User engagement statistics
- System performance monitoring

### External Integrations
- Google Analytics (optional)
- Sentry for error tracking
- Firebase Performance Monitoring

## 🔒 Security

### Authentication
- Firebase Auth with Google Sign-In
- Email-based access control (whitelist)
- Role-based permissions system
- Automatic user provisioning

### Data Security
- Firestore security rules
- Storage security rules
- Input validation and sanitization
- XSS protection

### Best Practices
- Environment variables for sensitive data
- HTTPS enforcement
- Regular security updates
- Audit logs for admin actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: admin@iraniancommunitycanda.ca
- Documentation: [Project Wiki](link-to-wiki)
- Issues: [GitHub Issues](link-to-issues)

## 🙏 Acknowledgments

- [Material-UI](https://mui.com/) for the component library
- [Firebase](https://firebase.google.com/) for backend services
- [React](https://reactjs.org/) for the frontend framework
- [Vite](https://vitejs.dev/) for the build tool
