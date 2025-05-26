# Iranian Community Canada - Admin Panel Structure

## 🗄️ Database Structure (Firebase Firestore)

### Collections & Documents

#### 1. **users** Collection
```javascript
{
  id: "user_id_123",
  telegramId: "123456789",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
  phone: "+1234567890",
  role: "user", // user, moderator, admin
  status: "active", // active, suspended, banned
  profileImage: "https://...",
  languageCode: "en",
  isPremium: false,
  registrationDate: timestamp,
  lastLogin: timestamp,
  loginCount: 0,
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

#### 2. **jobs** Collection
```javascript
{
  id: "job_id_123",
  title: "Software Developer",
  description: "Job description...",
  company: "Tech Corp",
  location: {
    city: "Toronto",
    province: "Ontario",
    country: "Canada",
    address: "123 Main St"
  },
  salary: {
    min: 60000,
    max: 80000,
    currency: "CAD",
    type: "annual" // annual, hourly, contract
  },
  jobType: "full-time", // full-time, part-time, contract, internship
  category: "Technology",
  requirements: ["React", "Node.js", "MongoDB"],
  benefits: ["Health Insurance", "Dental"],
  contactEmail: "hr@techcorp.com",
  contactPhone: "+1234567890",
  applicationLink: "https://...",
  image: "https://...",
  status: "active", // active, inactive, expired, pending
  featured: false,
  views: 0,
  applications: 0,
  expiryDate: timestamp,
  postedBy: "user_id_123",
  approvedBy: "admin_id_456",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. **events** Collection
```javascript
{
  id: "event_id_123",
  title: "Persian New Year Celebration",
  description: "Event description...",
  category: "Cultural", // Cultural, Educational, Social, Business
  date: timestamp,
  time: "19:00",
  endTime: "23:00",
  location: {
    name: "Community Center",
    address: "123 Event St",
    city: "Toronto",
    province: "Ontario",
    coordinates: {
      lat: 43.6532,
      lng: -79.3832
    }
  },
  organizer: {
    name: "Iranian Cultural Association",
    email: "info@ica.ca",
    phone: "+1234567890"
  },
  price: "Free", // Free or amount
  capacity: 200,
  registeredCount: 0,
  registrationLink: "https://...",
  image: "https://...",
  images: ["https://...", "https://..."],
  status: "active", // active, cancelled, completed, pending
  featured: false,
  tags: ["persian", "culture", "celebration"],
  ageRestriction: "all", // all, 18+, 21+
  requirements: ["Bring ID"],
  postedBy: "user_id_123",
  approvedBy: "admin_id_456",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. **restaurants** Collection
```javascript
{
  id: "restaurant_id_123",
  name: "Persian Palace",
  description: "Authentic Persian cuisine...",
  cuisine: "Persian",
  category: "Restaurant",
  location: {
    address: "123 Food St",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M1M 1M1",
    coordinates: {
      lat: 43.6532,
      lng: -79.3832
    }
  },
  contact: {
    phone: "+1234567890",
    email: "info@persianpalace.ca",
    website: "https://persianpalace.ca"
  },
  hours: {
    monday: "11:00-22:00",
    tuesday: "11:00-22:00",
    wednesday: "11:00-22:00",
    thursday: "11:00-22:00",
    friday: "11:00-23:00",
    saturday: "11:00-23:00",
    sunday: "12:00-21:00"
  },
  priceRange: "$$", // $, $$, $$$, $$$$
  rating: 4.5,
  reviewCount: 120,
  features: ["takeout", "delivery", "dine-in", "parking"],
  paymentMethods: ["cash", "card", "interac"],
  image: "https://...",
  images: ["https://...", "https://..."],
  menu: "https://menu-link.com",
  status: "active", // active, inactive, closed, pending
  verified: true,
  featured: false,
  views: 0,
  postedBy: "user_id_123",
  approvedBy: "admin_id_456",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 5. **cafes** Collection
```javascript
{
  id: "cafe_id_123",
  name: "Persian Coffee House",
  description: "Traditional Persian tea and coffee...",
  specialty: "Persian Tea",
  category: "Cafe",
  location: {
    address: "123 Cafe St",
    city: "Vancouver",
    province: "British Columbia",
    postalCode: "V1V 1V1",
    coordinates: {
      lat: 49.2827,
      lng: -123.1207
    }
  },
  contact: {
    phone: "+1234567890",
    email: "info@persiancoffee.ca",
    website: "https://persiancoffee.ca"
  },
  hours: {
    monday: "07:00-20:00",
    tuesday: "07:00-20:00",
    wednesday: "07:00-20:00",
    thursday: "07:00-20:00",
    friday: "07:00-21:00",
    saturday: "08:00-21:00",
    sunday: "08:00-19:00"
  },
  priceRange: "$$",
  rating: 4.3,
  reviewCount: 85,
  features: {
    hasWifi: true,
    hasOutdoorSeating: true,
    hasParking: false,
    petFriendly: true,
    hasDelivery: false,
    hasTakeout: true
  },
  amenities: ["free-wifi", "outdoor-seating", "pet-friendly"],
  paymentMethods: ["cash", "card", "interac"],
  image: "https://...",
  images: ["https://...", "https://..."],
  menu: "https://menu-link.com",
  status: "active",
  verified: true,
  featured: false,
  views: 0,
  postedBy: "user_id_123",
  approvedBy: "admin_id_456",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 6. **categories** Collection
```javascript
{
  id: "category_id_123",
  name: "Technology",
  type: "job", // job, event, restaurant, cafe
  description: "Technology related items",
  icon: "computer",
  color: "#667eea",
  isActive: true,
  sortOrder: 1,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 7. **reports** Collection
```javascript
{
  id: "report_id_123",
  type: "inappropriate_content", // spam, inappropriate_content, fake_listing, other
  targetType: "job", // job, event, restaurant, cafe, user
  targetId: "job_id_123",
  reportedBy: "user_id_456",
  reason: "Spam content",
  description: "This job posting appears to be spam...",
  status: "pending", // pending, reviewed, resolved, dismissed
  priority: "medium", // low, medium, high, urgent
  assignedTo: "admin_id_789",
  resolution: "Content removed",
  createdAt: timestamp,
  resolvedAt: timestamp
}
```

#### 8. **analytics** Collection
```javascript
{
  id: "analytics_date_2024_01_15",
  date: "2024-01-15",
  metrics: {
    totalUsers: 1250,
    newUsers: 45,
    activeUsers: 320,
    totalJobs: 89,
    newJobs: 12,
    totalEvents: 23,
    newEvents: 3,
    totalRestaurants: 156,
    newRestaurants: 2,
    totalCafes: 78,
    newCafes: 1,
    pageViews: 5420,
    uniqueVisitors: 1890
  },
  topPages: [
    { page: "/jobs", views: 1200 },
    { page: "/events", views: 890 },
    { page: "/dining", views: 750 }
  ],
  topSearches: [
    { query: "software developer", count: 45 },
    { query: "persian restaurant", count: 32 }
  ],
  userActivity: {
    registrations: 45,
    logins: 320,
    jobApplications: 78,
    eventRegistrations: 34
  },
  createdAt: timestamp
}
```

#### 9. **notifications** Collection
```javascript
{
  id: "notification_id_123",
  type: "new_job", // new_job, new_event, system_update, promotion
  title: "New Job Posted",
  message: "A new software developer position has been posted",
  targetUsers: ["all"], // ["all"] or ["user_id_1", "user_id_2"]
  targetUserRoles: ["user"], // ["user", "moderator", "admin"]
  data: {
    jobId: "job_id_123",
    deepLink: "/job/job_id_123"
  },
  status: "sent", // draft, scheduled, sent, failed
  scheduledFor: timestamp,
  sentAt: timestamp,
  readBy: ["user_id_1", "user_id_2"],
  clickCount: 0,
  createdBy: "admin_id_456",
  createdAt: timestamp
}
```

#### 10. **settings** Collection
```javascript
{
  id: "app_settings",
  app: {
    name: "Iranian Community Canada",
    version: "1.0.0",
    maintenanceMode: false,
    maintenanceMessage: "App is under maintenance...",
    minAppVersion: "1.0.0",
    forceUpdate: false
  },
  features: {
    jobPosting: true,
    eventPosting: true,
    restaurantListing: true,
    cafeListingEnabled: true,
    userRegistration: true,
    guestAccess: true
  },
  moderation: {
    autoApproveJobs: false,
    autoApproveEvents: false,
    autoApproveRestaurants: false,
    autoApproveCafes: false,
    requireEmailVerification: true,
    requirePhoneVerification: false
  },
  limits: {
    maxJobsPerUser: 5,
    maxEventsPerUser: 3,
    maxRestaurantsPerUser: 2,
    maxCafesPerUser: 2,
    maxImagesPerListing: 5,
    maxImageSizeMB: 5
  },
  contact: {
    supportEmail: "support@iraniancommunitycanda.ca",
    adminEmail: "admin@iraniancommunitycanda.ca",
    phone: "+1234567890"
  },
  social: {
    telegram: "https://t.me/iraniancommunitycanda",
    instagram: "https://instagram.com/iraniancommunitycanda",
    facebook: "https://facebook.com/iraniancommunitycanda"
  },
  updatedAt: timestamp,
  updatedBy: "admin_id_123"
}
```

## 🛠️ Technology Stack

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (for images)
- **Hosting**: Firebase Hosting
- **Functions**: Firebase Cloud Functions (for admin operations)

### Frontend (Admin Panel)
- **Framework**: React.js with Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit or Zustand
- **Routing**: React Router v6
- **Charts**: Chart.js or Recharts
- **Data Tables**: MUI DataGrid
- **Forms**: React Hook Form with Yup validation
- **Date Handling**: Day.js
- **HTTP Client**: Axios

### Additional Tools
- **Code Editor**: Monaco Editor (for content editing)
- **Image Upload**: React Dropzone
- **Notifications**: React Hot Toast
- **Icons**: Material Icons + Lucide React
- **Styling**: Emotion (comes with MUI)

## 📁 Project Structure

```
iranian-community-admin/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── DataTable/
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── TableFilters.jsx
│   │   │   │   └── TableActions.jsx
│   │   │   ├── Forms/
│   │   │   │   ├── FormField.jsx
│   │   │   │   ├── ImageUpload.jsx
│   │   │   │   ├── RichTextEditor.jsx
│   │   │   │   └── DateTimePicker.jsx
│   │   │   ├── Charts/
│   │   │   │   ├── LineChart.jsx
│   │   │   │   ├── BarChart.jsx
│   │   │   │   ├── PieChart.jsx
│   │   │   │   └── StatsCard.jsx
│   │   │   ├── Modals/
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── ViewModal.jsx
│   │   │   │   └── EditModal.jsx
│   │   │   └── UI/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       └── PageHeader.jsx
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   └── AnalyticsCharts.jsx
│   │   ├── users/
│   │   │   ├── UsersList.jsx
│   │   │   ├── UserDetail.jsx
│   │   │   ├── UserForm.jsx
│   │   │   └── UserActions.jsx
│   │   ├── jobs/
│   │   │   ├── JobsList.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── JobForm.jsx
│   │   │   └── JobModeration.jsx
│   │   ├── events/
│   │   │   ├── EventsList.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── EventForm.jsx
│   │   │   └── EventModeration.jsx
│   │   ├── restaurants/
│   │   │   ├── RestaurantsList.jsx
│   │   │   ├── RestaurantDetail.jsx
│   │   │   ├── RestaurantForm.jsx
│   │   │   └── RestaurantModeration.jsx
│   │   ├── cafes/
│   │   │   ├── CafesList.jsx
│   │   │   ├── CafeDetail.jsx
│   │   │   ├── CafeForm.jsx
│   │   │   └── CafeModeration.jsx
│   │   ├── reports/
│   │   │   ├── ReportsList.jsx
│   │   │   ├── ReportDetail.jsx
│   │   │   └── ReportActions.jsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── UserAnalytics.jsx
│   │   │   ├── ContentAnalytics.jsx
│   │   │   └── PerformanceMetrics.jsx
│   │   ├── notifications/
│   │   │   ├── NotificationsList.jsx
│   │   │   ├── NotificationForm.jsx
│   │   │   ├── NotificationTemplates.jsx
│   │   │   └── SendNotification.jsx
│   │   └── settings/
│   │       ├── AppSettings.jsx
│   │       ├── UserRoles.jsx
│   │       ├── Categories.jsx
│   │       └── SystemConfig.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Users.jsx
│   │   ├── Jobs.jsx
│   │   ├── Events.jsx
│   │   ├── Restaurants.jsx
│   │   ├── Cafes.jsx
│   │   ├── Reports.jsx
│   │   ├── Analytics.jsx
│   │   ├── Notifications.jsx
│   │   ├── Settings.jsx
│   │   └── Profile.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFirestore.js
│   │   ├── usePagination.js
│   │   ├── useFilters.js
│   │   ├── useAnalytics.js
│   │   └── useNotifications.js
│   ├── services/
│   │   ├── firebase.js
│   │   ├── auth.js
│   │   ├── firestore.js
│   │   ├── storage.js
│   │   ├── analytics.js
│   │   └── notifications.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── permissions.js
│   ├── store/
│   │   ├── index.js
│   │   ├── authSlice.js
│   │   ├── usersSlice.js
│   │   ├── jobsSlice.js
│   │   ├── eventsSlice.js
│   │   ├── restaurantsSlice.js
│   │   ├── cafesSlice.js
│   │   └── settingsSlice.js
│   ├── styles/
│   │   ├── theme.js
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── firebase.json
├── firestore.rules
├── storage.rules
└── README.md
```

## 📄 Admin Panel Pages & Features

### 1. **Dashboard Page**
```javascript
// Features:
- Overview statistics (users, jobs, events, restaurants, cafes)
- Recent activity feed
- Quick action buttons
- Analytics charts (daily/weekly/monthly)
- System health status
- Pending approvals count
- Top performing content
- User growth metrics
```

### 2. **Users Management**
```javascript
// Features:
- User list with search, filter, sort
- User details view
- User role management (user, moderator, admin)
- User status control (active, suspended, banned)
- User activity history
- Bulk actions (export, delete, suspend)
- User registration analytics
- Communication tools (send message/notification)

// Filters:
- Registration date range
- User role
- User status
- Location (city, province)
- Activity level
- Telegram premium status
```

### 3. **Jobs Management**
```javascript
// Features:
- Jobs list with advanced filters
- Job approval/rejection workflow
- Job details view and edit
- Job performance analytics
- Featured jobs management
- Expired jobs cleanup
- Bulk operations
- Job categories management

// Moderation:
- Pending jobs queue
- Approve/reject with reasons
- Edit job details
- Flag inappropriate content
- Set expiry dates
- Feature/unfeature jobs
```

### 4. **Events Management**
```javascript
// Features:
- Events list with calendar view
- Event approval workflow
- Event details and editing
- Event registration tracking
- Featured events management
- Event categories management
- Recurring events setup
- Event analytics

// Calendar Features:
- Monthly/weekly/daily views
- Event status indicators
- Quick event creation
- Drag-and-drop rescheduling
- Event conflicts detection
```

### 5. **Restaurants Management**
```javascript
// Features:
- Restaurant list with map view
- Restaurant verification system
- Menu management
- Hours management
- Photo gallery management
- Reviews and ratings oversight
- Featured restaurants
- Restaurant analytics

// Verification:
- Business license verification
- Contact information validation
- Photo authenticity check
- Operating hours verification
- Menu accuracy review
```

### 6. **Cafés Management**
```javascript
// Features:
- Café list with amenities filter
- Café verification process
- Features management (WiFi, parking, etc.)
- Photo management
- Reviews oversight
- Featured cafés
- Café analytics

// Amenities Management:
- WiFi availability
- Outdoor seating
- Parking options
- Pet-friendly status
- Delivery/takeout options
```

### 7. **Reports & Moderation**
```javascript
// Features:
- Reports queue with priority levels
- Report investigation tools
- Content moderation actions
- User behavior tracking
- Automated flagging system
- Resolution tracking
- Appeal process management

// Report Types:
- Spam content
- Inappropriate content
- Fake listings
- Harassment
- Copyright violation
- Other violations
```

### 8. **Analytics Dashboard**
```javascript
// Metrics:
- User engagement metrics
- Content performance analytics
- Geographic distribution
- Device and platform analytics
- Search analytics
- Conversion tracking
- Revenue analytics (if applicable)

// Charts:
- User growth over time
- Content creation trends
- Popular categories
- Geographic heat maps
- User activity patterns
- Seasonal trends
```

### 9. **Notifications Center**
```javascript
// Features:
- Push notification composer
- Notification templates
- Scheduled notifications
- Targeted messaging
- Notification analytics
- Delivery tracking
- A/B testing for notifications

// Targeting Options:
- All users
- User roles
- Geographic location
- User activity level
- Registration date
- Custom user segments
```

### 10. **Settings & Configuration**
```javascript
// App Settings:
- Maintenance mode toggle
- Feature flags
- Version management
- Force update controls
- API rate limits

// Content Settings:
- Auto-approval settings
- Content moderation rules
- Image upload limits
- Text content limits
- Spam detection settings

// User Settings:
- Registration requirements
- Verification settings
- Role permissions
- Account limits
```

## 🔐 Authentication & Permissions

### Admin Roles
```javascript
// Super Admin
- Full system access
- User role management
- System settings
- Analytics access
- All CRUD operations

// Admin
- Content management
- User management (limited)
- Reports handling
- Analytics viewing
- Moderation actions

// Moderator
- Content approval/rejection
- Report handling
- Basic analytics
- Limited user actions

// Content Manager
- Content CRUD operations
- Basic moderation
- Content analytics
- Category management
```

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
  jobs: {
    view: ['super_admin', 'admin', 'moderator', 'content_manager'],
    create: ['super_admin', 'admin', 'content_manager'],
    edit: ['super_admin', 'admin', 'content_manager'],
    delete: ['super_admin', 'admin'],
    approve: ['super_admin', 'admin', 'moderator'],
    feature: ['super_admin', 'admin']
  },
  // ... similar for events, restaurants, cafes
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

## 🚀 Quick Start Commands

### 1. **Project Setup**
```bash
# Create new React project
npm create vite@latest iranian-community-admin -- --template react
cd iranian-community-admin

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-data-grid @mui/x-date-pickers
npm install firebase react-router-dom @reduxjs/toolkit react-redux
npm install react-hook-form @hookform/resolvers yup
npm install chart.js react-chartjs-2 dayjs axios
npm install react-hot-toast react-dropzone monaco-editor
npm install @monaco-editor/react lucide-react

# Development dependencies
npm install -D @types/react @types/react-dom
```

### 2. **Firebase Configuration**
```javascript
// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
```

### 3. **Environment Variables**
```bash
# .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_APP_NAME=Iranian Community Admin
VITE_APP_VERSION=1.0.0
```

### 4. **Package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy"
  }
}
```

## 📊 Key Features Implementation

### 1. **Data Table Component**
```javascript
// Reusable data table with:
- Sorting, filtering, pagination
- Bulk actions
- Export functionality
- Custom column rendering
- Row selection
- Search integration
```

### 2. **Form Components**
```javascript
// Standardized forms with:
- Validation (Yup schemas)
- Error handling
- File uploads
- Rich text editing
- Date/time pickers
- Auto-save functionality
```

### 3. **Analytics Integration**
```javascript
// Analytics features:
- Real-time metrics
- Custom date ranges
- Data export
- Chart visualizations
- Comparative analysis
- Trend identification
```

### 4. **Notification System**
```javascript
// Notification features:
- Push notifications
- Email notifications
- In-app notifications
- Notification templates
- Scheduling
- Targeting
```

This structure provides everything needed to build a comprehensive admin panel for the Iranian Community Canada app. You can copy this structure and start implementing each component based on your specific requirements.
