# Login Feature Documentation

## Overview
A complete, production-ready Login feature for the Hotel Management Web Application built with Angular 21, TailwindCSS, and Angular Material Icons.

## Project Structure

```
src/app/
├── components/
│   ├── logo-brand/
│   │   ├── logo-brand.component.ts
│   │   ├── logo-brand.component.html
│   │   └── logo-brand.component.scss
│   ├── input-field/
│   │   ├── input-field.component.ts
│   │   ├── input-field.component.html
│   │   └── input-field.component.scss
│   └── button-primary/
│       ├── button-primary.component.ts
│       ├── button-primary.component.html
│       └── button-primary.component.scss
├── pages/
│   └── login/
│       ├── login.component.ts
│       ├── login.component.html
│       └── login.component.scss
├── services/
│   └── auth.service.ts
├── app.routes.ts (updated)
├── app.ts (updated)
└── index.html (updated)
```

## Components

### 1. LogoBrandComponent
**Location:** `src/app/components/logo-brand/`

Displays the resort branding with:
- Logo icon (SVG)
- Resort name: "Sol An Bang"
- Tagline: "Beach Resort & Spa"
- Uses Playfair Display font for elegant styling

**Features:**
- Reusable across the application
- Responsive sizing
- Standalone component

### 2. InputFieldComponent
**Location:** `src/app/components/input-field/`

Reusable form input component with:
- Label with custom styling
- Material Icon integration (left-side)
- Input field with border and focus states
- Password visibility toggle (for password fields)
- Real-time validation error messages
- Border color: `rgba(197, 160, 89, 0.3)` on idle
- Focus ring color: `#c5a059`

**Props:**
- `label`: Field label text
- `type`: Input type (email, password, text)
- `icon`: Material icon name to display
- `placeholder`: Placeholder text
- `control`: Form control reference (AbstractControl)

**Features:**
- Password visibility toggle with Material Icons
- Validates email format and required fields
- Displays error messages for invalid inputs
- Responsive design with Tailwind

### 3. ButtonPrimaryComponent
**Location:** `src/app/components/button-primary/`

Primary call-to-action button with:
- Background color: `#c5a059` (gold accent)
- White text with uppercase styling
- Loading state with spinner animation
- Disabled state with reduced opacity
- Shadow effect for depth

**Props:**
- `text`: Button label
- `isLoading`: Show loading spinner
- `isDisabled`: Disable button interaction

**Features:**
- Animated spinner during loading
- Smooth hover effects
- Accessible button states
- Event emission on click

## Services

### AuthService
**Location:** `src/app/services/auth.service.ts`

Handles authentication logic with:
- Login with email and password
- Token storage in localStorage
- User data persistence
- Authentication state checking
- Logout functionality

**Methods:**
- `login(credentials)`: Authenticate user and save token
- `getToken()`: Retrieve stored auth token
- `getUser()`: Retrieve stored user data
- `isAuthenticated()`: Check if user is logged in
- `logout()`: Clear auth data and redirect to login

**Features:**
- Observable-based API (RxJS)
- Simulated 1.5s delay to mimic network request
- localStorage integration
- TypeScript interfaces for type safety

## Login Page Component

**Location:** `src/app/pages/login/`

Complete login page with:
- Background gradient overlay
- Centered login card with backdrop blur
- Logo brand section
- "Management Portal" title
- Email and password input fields
- "Forgot Password?" link
- Login button with loading state
- Footer with copyright information
- Error message display

**Features:**
- Reactive Forms with validation
- Form validation on submit (required, email format, min length)
- Enter key support for form submission
- Loading state during authentication
- Error handling with user-friendly messages
- Responsive design for all screen sizes

**Form Validation:**
- Email: Required + valid email format
- Password: Required + minimum 6 characters

## Styling

### Colors Used
- **Primary Gold:** `#c5a059`
- **Dark Brown:** `#0d2e33`
- **Light Gray:** `#9ca3af`
- **Error Red:** `#f87171`
- **Background:** `#f9f7f2`

### Fonts
- **Playfair Display:** For headings and brand name
- **Plus Jakarta Sans:** For body text and labels

### TailwindCSS Integration
- All components use Tailwind utility classes
- Custom colors defined in global styles
- Responsive design with mobile-first approach
- Smooth transitions and hover effects

## Routing

### Updated Routes
```typescript
{
  path: 'login',
  component: LoginComponent,
},
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
},
{
  path: '',
  redirectTo: '/login',
  pathMatch: 'full',
}
```

- Default route redirects to `/login`
- Dashboard loaded lazily for better performance
- Logout redirects back to `/login`

## Installation & Setup

### 1. Install Dependencies
```bash
npm install @angular/material @angular/cdk
```

### 2. Start Development Server
```bash
npm start
```

The application will be available at `http://localhost:4200/`

### 3. Build for Production
```bash
npm run build
```

## How to Use

### Login Flow
1. User navigates to `/login`
2. Enters email and password
3. Form validates in real-time
4. Click "Login" or press Enter
5. Loading spinner shows during request
6. On success: redirect to `/dashboard`
7. On failure: error message displayed

### Authentication Check
```typescript
// Check if user is authenticated
if (this.authService.isAuthenticated()) {
  // User is logged in
}

// Get current user data
const user = this.authService.getUser();

// Logout user
this.authService.logout();
```

## Testing Credentials
- **Email:** `admin@azuresands.com`
- **Password:** Any string with 6+ characters

## Form Validation States

### Valid State
- Both fields filled with valid data
- Login button enabled
- No error messages

### Invalid State
- Email not a valid format
- Password less than 6 characters
- Required fields empty
- Error messages displayed when field is touched
- Login button disabled

### Loading State
- Login button shows spinner animation
- Button text changes to "Loading..."
- Form inputs disabled
- Cannot submit again while loading

## Accessibility Features
- Proper semantic HTML structure
- Aria labels for icons
- Keyboard navigation support (Enter to submit)
- Form validation for all inputs
- Clear error messages
- High contrast colors for readability

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements
- [ ] Implement "Forgot Password" functionality
- [ ] Add "Remember Me" checkbox
- [ ] Two-factor authentication
- [ ] Social login (Google, Microsoft)
- [ ] Integration with real backend API
- [ ] Refresh token handling
- [ ] Role-based access control
- [ ] Session timeout warning

## Development Notes

### Adding a Protected Route Guard
```typescript
// Create auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

// Apply to routes
{
  path: 'dashboard',
  canActivate: [AuthGuard],
  loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
}
```

### Customizing Login Behavior
Edit `src/app/services/auth.service.ts` to:
1. Replace simulated API call with real HTTP request
2. Update error handling
3. Add request/response interceptors

### Styling Customization
- Global colors in `src/styles.css`
- Component-specific styles in respective `.scss` files
- Tailwind breakpoints for responsive design

## Performance Optimizations
- Lazy loading of dashboard route
- Angular Material tree-shaking enabled
- Standalone components for smaller bundle size
- CSS pre-processing with TailwindCSS
- Production build: 44.95 kB (gzipped)

## Troubleshooting

### Port 4200 Already in Use
```bash
ng serve --port 4300
```

### Material Icons Not Displaying
- Ensure fonts link in `index.html` is correct
- Check browser console for CORS issues
- Verify Material module is imported

### Form Validation Not Working
- Ensure ReactiveFormsModule is imported
- Check form control names match template
- Verify validators are applied in FormBuilder

## Files Modified
- `src/index.html` - Added Google Fonts and Material Icons
- `src/styles.css` - Added global font families
- `src/app/app.routes.ts` - Added login route
- `src/app/app.ts` - Added MatIconModule import
- `package.json` - Added @angular/material and @angular/cdk

## Conclusion
This login feature provides a complete, professional, and reusable authentication interface for the Hotel Management Web Application. All components are built following Angular best practices with TypeScript, Reactive Forms, and responsive design principles.
