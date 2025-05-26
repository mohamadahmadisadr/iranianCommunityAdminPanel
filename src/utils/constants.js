// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CONTENT_MANAGER: 'content_manager',
  USER: 'user',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING: 'pending',
};

// Content Status
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
};

// Job Categories
export const JOB_CATEGORIES = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Engineering',
  'Marketing',
  'Sales',
  'Customer Service',
  'Administration',
  'Construction',
  'Transportation',
  'Food Service',
  'Retail',
  'Other',
];

// Event Categories
export const EVENT_CATEGORIES = [
  'Cultural',
  'Educational',
  'Social',
  'Religious',
  'Business',
  'Sports',
  'Arts',
  'Music',
  'Food',
  'Community',
  'Charity',
  'Other',
];

// Restaurant Categories
export const RESTAURANT_CATEGORIES = [
  'Persian',
  'Middle Eastern',
  'Mediterranean',
  'Fast Food',
  'Fine Dining',
  'Casual Dining',
  'Cafe',
  'Bakery',
  'Dessert',
  'Vegetarian',
  'Halal',
  'Other',
];

// Canadian Provinces
export const PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

// Major Canadian Cities
export const CITIES = [
  'Toronto',
  'Montreal',
  'Vancouver',
  'Calgary',
  'Edmonton',
  'Ottawa',
  'Winnipeg',
  'Quebec City',
  'Hamilton',
  'Kitchener',
  'London',
  'Victoria',
  'Halifax',
  'Oshawa',
  'Windsor',
  'Saskatoon',
  'Regina',
  'Sherbrooke',
  'St. Johns',
  'Barrie',
];

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// API Endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  JOBS: '/jobs',
  EVENTS: '/events',
  RESTAURANTS: '/restaurants',
  CAFES: '/cafes',
  REPORTS: '/reports',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  EVENTS: 'events',
  RESTAURANTS: 'restaurants',
  CAFES: 'cafes',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  CATEGORIES: 'categories',
  ANALYTICS: 'analytics',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
  INPUT_WITH_TIME: 'YYYY-MM-DDTHH:mm',
};

// Chart Colors
export const CHART_COLORS = [
  '#1976d2',
  '#dc004e',
  '#4caf50',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
  '#795548',
  '#607d8b',
  '#e91e63',
  '#3f51b5',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Permission Actions
export const PERMISSIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  SUSPEND: 'suspend',
  EXPORT: 'export',
};

export default {
  USER_ROLES,
  USER_STATUS,
  CONTENT_STATUS,
  JOB_CATEGORIES,
  EVENT_CATEGORIES,
  RESTAURANT_CATEGORIES,
  PROVINCES,
  CITIES,
  PAGINATION,
  FILE_UPLOAD,
  API_ENDPOINTS,
  COLLECTIONS,
  DATE_FORMATS,
  CHART_COLORS,
  NOTIFICATION_TYPES,
  PERMISSIONS,
};
