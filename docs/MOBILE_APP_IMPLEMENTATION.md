# Mobile App Implementation Guide

## Overview
This document describes the mobile-specific implementation for the Alga native mobile app (Android/iOS via Capacitor).

## Features Implemented

### 1. **Sign-In Requirement**
- Mobile app requires authentication before accessing any features
- Beautiful welcome screen with branding and benefits
- Passwordless OTP authentication flow
- Persistent sessions across app restarts

### 2. **Bottom Navigation**
- Icon-based navigation bar at the bottom (mobile-standard UX)
- 4 main sections:
  - **Stays** (Home icon) - Browse properties
  - **Services** (Wrench icon) - Access marketplace
  - **Me** (User icon) - Profile and bookings
  - **Help** (HelpCircle icon) - Support and Lemlem AI

### 3. **Mobile-Specific Layout**
- Minimal header with "Alga" branding only
- Content area optimized for mobile screens
- Bottom navigation fixed at screen bottom
- Safe area insets support for notched devices

### 4. **Platform Detection**
- Automatic detection of native vs web platform
- Web users see header navigation (unchanged)
- Mobile users see bottom navigation
- Shared codebase, different UX patterns

### 5. **Lemlem Chat Positioning**
- Adjusted floating button position for mobile
- Positioned above bottom navigation (bottom-20 vs bottom-6)
- Full-width chat card on mobile devices
- No duplicate chat instances

## Technical Implementation

### Files Created

1. **`client/src/utils/platform.ts`**
   - Platform detection utilities
   - Uses Capacitor API to identify native apps

2. **`client/src/components/mobile/bottom-nav.tsx`**
   - Bottom navigation component
   - Icon-based navigation with active states
   - Visual feedback with top border indicator

3. **`client/src/components/mobile/mobile-layout.tsx`**
   - Mobile app layout wrapper
   - Includes minimal header and bottom nav
   - Wraps all content appropriately

4. **`client/src/components/mobile/mobile-auth-guard.tsx`**
   - Authentication gate for mobile app
   - Beautiful sign-in screen
   - Prevents unauthorized access

### Files Modified

1. **`client/src/App.tsx`**
   - Added platform detection
   - Conditional layout wrapping based on platform
   - Mobile routes wrapped in MobileAuthGuard + MobileLayout
   - Web routes remain unchanged

2. **`client/src/components/lemlem-chat.tsx`**
   - Added mobile-specific positioning
   - Adjusted bottom offset to avoid navigation bar
   - Full-width chat on mobile devices

## Architecture

```
┌─────────────────────────────────────────┐
│         Platform Detection              │
│    (isMobileApp() from platform.ts)     │
└───────────┬─────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
┌────▼────┐   ┌───▼────┐
│   Web   │   │ Mobile │
└────┬────┘   └───┬────┘
     │            │
┌────▼────┐   ┌───▼─────────────┐
│ Header  │   │ Mobile Auth     │
│  Nav    │   │     Guard       │
└─────────┘   └───┬─────────────┘
                  │
              ┌───▼─────────────┐
              │  Mobile Layout  │
              │  - Mini Header  │
              │  - Content      │
              │  - Bottom Nav   │
              └─────────────────┘
```

## User Flow (Mobile App)

1. **App Launch**
   - Platform detection identifies native app
   - MobileAuthGuard checks authentication
   
2. **Unauthenticated**
   - Beautiful welcome screen displays
   - Shows Alga branding and benefits
   - "Sign In to Continue" button
   - Opens passwordless OTP dialog
   
3. **Authenticated**
   - Main app interface loads
   - Bottom navigation visible
   - User navigates via icons
   - Lemlem chat accessible

## Navigation Structure

### Bottom Nav Items

| Icon | Route | Label | Description |
|------|-------|-------|-------------|
| 🏠 | `/properties` | Stays | Browse accommodations |
| 🧰 | `/services` | Services | Service marketplace |
| 👤 | `/my-alga` | Me | Profile, bookings, favorites |
| ❓ | `/support` | Help | Support & Lemlem AI |

## Styling Details

### Colors
- Active: `#3C2313` (dark brown)
- Inactive: `#9CA3AF` (gray)
- Background: `#F8F1E7` (cream)
- Border: `#E5D9C8` (light brown)

### Spacing
- Bottom nav height: `64px` (h-16)
- Icon size: `24px` (w-6 h-6)
- Lemlem button offset: `80px` (bottom-20)

### Safe Areas
- Uses `safe-area-inset-bottom` for notched devices
- Ensures navigation doesn't overlap system UI

## Testing Notes

### Web Browser
- Should see normal header navigation
- No bottom navigation bar
- Lemlem chat at bottom-6

### Mobile App (Capacitor)
- Requires sign-in on launch
- Bottom navigation visible
- No header navigation
- Lemlem chat at bottom-20 (above nav)

## Future Enhancements

1. **Tab Persistence**
   - Remember last active tab
   - Restore on app relaunch

2. **Gestures**
   - Swipe between tabs
   - Pull-to-refresh on lists

3. **Notifications**
   - Badge counts on nav icons
   - Booking updates
   - New messages

4. **Deep Linking**
   - Open specific property from notification
   - Share links that open in app

## Build Commands

```bash
# Web (unchanged)
npm run dev

# Android APK
npx cap sync android
npx cap open android
# Then build in Android Studio

# iOS App
npx cap sync ios
npx cap open ios
# Then build in Xcode
```

## Testing Checklist

- [ ] Sign-in required on app launch
- [ ] Bottom navigation visible on mobile
- [ ] Header navigation hidden on mobile
- [ ] Tab switching works smoothly
- [ ] Active tab indicator displays correctly
- [ ] Lemlem chat doesn't overlap bottom nav
- [ ] All routes accessible via bottom nav
- [ ] Authentication persists across app restarts
- [ ] Safe area insets work on notched devices

## Notes

- **Single Codebase**: One React app serves both web and mobile
- **Progressive Enhancement**: Web users unaffected by mobile changes
- **Native Feel**: Mobile UI follows platform conventions
- **Ethiopian Optimization**: Fast, lightweight for Ethiopian networks
