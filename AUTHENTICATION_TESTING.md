# FrontalMinds DRS - Role-Based Authentication Testing Guide

## Overview
The FrontalMinds DRS now includes a fully functional role-based authentication system with three user roles: **Officer**, **Chief**, and **Admin**.

## Testing the Authentication System

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Access the System
1. Navigate to `http://localhost:3000`
2. You will be automatically redirected to the login page if not authenticated
3. Or go directly to `http://localhost:3000/login`

### Step 3: Test Different User Roles

#### 🟦 Officer Role (Limited Permissions)
**Login Credentials:**
- Email: `officer@npf.gov.ng` (or any email containing "officer")
- Password: `demo123`
- Select Role: **Officer**

**What Officers Can Do:**
- ✅ View all case files
- ✅ Edit case files 
- ✅ Create new cases
- ✅ Print case reports
- ❌ **Cannot delete cases** (button shows "RESTRICTED")

#### 🟨 Chief Role (Enhanced Permissions)
**Login Credentials:**
- Email: `chief@npf.gov.ng` (or any email containing "chief")
- Password: `demo123`
- Select Role: **Chief**

**What Chiefs Can Do:**
- ✅ All Officer permissions
- ✅ **Delete cases** (full permissions)
- ✅ Access to restricted actions

#### 🟣 Admin Role (Full Permissions)
**Login Credentials:**
- Email: `admin@npf.gov.ng` (or any email containing "admin")
- Password: `demo123`
- Select Role: **Admin**

**What Admins Can Do:**
- ✅ All Chief permissions
- ✅ **Delete cases** (full permissions)
- ✅ Complete system access

### Step 4: Test Role Restrictions

1. **Login as Officer** and navigate to Case Files (`/cases`)
   - Notice the access level indicator at the top
   - Try to delete a case - you'll see a "RESTRICTED" button instead
   - The system shows "Limited permissions - View and Edit only"

2. **Login as Chief or Admin** and navigate to Case Files
   - Notice "Full permissions - View, Edit, Delete" message
   - Delete buttons are fully functional
   - Access level shows the current role

### Step 5: Test Navigation Protection

1. **While logged in**, all pages are accessible through the sidebar
2. **User information** is displayed in the navbar with role badge
3. **Logout** through the user dropdown to return to login screen
4. **Session persistence** - refresh the page and you stay logged in
5. **Session expiry** - sessions expire after 24 hours automatically

### Step 6: Verify Real-Time Features

1. The **System Activity Log** continues to work with role-based access
2. Activity logging now includes the logged-in user's information
3. All CRUD operations are tracked with proper user attribution

## Key Features Implemented

### 🔐 Authentication System
- **Mock authentication** with role-based login
- **Session management** with 24-hour expiry
- **Automatic redirects** for unauthorized access
- **Loading states** during authentication checks

### 👥 Role-Based Access Control
- **Officer**: View and edit permissions only
- **Chief**: Full permissions including delete
- **Admin**: Complete system access

### 🖥️ User Interface
- **Sci-fi themed** login page matching the police tech aesthetic
- **Role indicators** in navbar and throughout the system
- **Permission warnings** for restricted actions
- **Visual feedback** for different access levels

### 🛡️ Security Features
- **Protected routes** with automatic redirects
- **Session validation** on page load
- **Role checking** before sensitive operations
- **Error handling** for authentication failures

## Testing Different Scenarios

### Scenario 1: Officer Trying Restricted Action
1. Login as Officer
2. Go to Cases page
3. Try to delete a case
4. See "RESTRICTED" button with lock icon
5. Notice warning message about contacting Chief/Admin

### Scenario 2: Role-Based Navigation
1. Login as any role
2. Check navbar shows correct user name and role
3. Role indicator shows with appropriate color:
   - 🔵 Blue for Officer
   - 🟡 Yellow for Chief  
   - 🟣 Purple for Admin

### Scenario 3: Session Management
1. Login and use the system
2. Close browser and reopen (session persists)
3. Wait 24+ hours (in production) for automatic logout
4. Try accessing protected page without login (redirects to /login)

### Scenario 4: Authentication Flow
1. Go to root URL (`http://localhost:3000`)
2. System checks authentication status
3. Redirects to `/dashboard` if authenticated
4. Redirects to `/login` if not authenticated

## Technical Implementation Notes

### Files Modified/Created:
- `app/providers/AuthProvider.tsx` - Main authentication context
- `app/login/page.tsx` - Role-based login page
- `hooks/useRoleProtection.ts` - Custom hook for route protection
- `app/cases/page.tsx` - Example of role-based permissions
- `components/layout/navbar.tsx` - User role display
- `app/layout.tsx` - AuthProvider integration

### Mock Users:
The system includes three predefined users (one for each role) with realistic Nigerian police officer information:
- Officer Adaeze Musa (Badge: NPF-12345)
- Chief Inspector Bola Adebayo (Badge: NPF-67890)  
- Admin Chinedu Okafor (Badge: NPF-99999)

### Backend Integration Ready:
The code is structured to easily replace mock authentication with real API calls:
- `// TODO: Replace with actual API call` comments mark integration points
- Authentication logic is centralized in AuthProvider
- Role checking is abstracted into reusable hooks

## Troubleshooting

### Issue: "Cannot access pages"
**Solution**: Make sure you're logged in. The system now requires authentication for all pages except login.

### Issue: "Delete button not working"
**Solution**: Check your role. Only Chiefs and Admins can delete cases.

### Issue: "Login not working"
**Solution**: Use the demo credentials provided above, or use `demo123` as the universal password.

### Issue: "Session lost on refresh"
**Solution**: Check browser console for any JavaScript errors. The session should persist in localStorage.

## Production Deployment Notes

To deploy this system for actual use:
1. Replace mock authentication with real backend API
2. Implement proper password hashing
3. Add JWT or session token management
4. Set up secure HTTPS connections
5. Configure proper session timeouts
6. Add audit logging for authentication events

The system is designed to make these transitions seamless without major code rewrites.
