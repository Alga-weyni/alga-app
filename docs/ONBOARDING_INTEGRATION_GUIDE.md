# Alga Onboarding System - Integration Guide

## Overview
The Alga Onboarding System is a **100% FREE browser-native** solution that welcomes new users with animated, role-specific guidance. Built with Framer Motion animations, Gemini AI-generated welcome images (free with Replit credits), and progressive enhancement for 2G Ethiopian networks.

## Architecture

### Database Schema
- **Table**: `user_onboarding`
- **Tracks**: Completion status, step progress, skip counts, last interaction
- **Fields**: `onboardingCompleted`, `completedAt`, `stepWelcome`, `stepTour`, `stepComplete`, etc.

### Backend API Endpoints
1. **GET /api/onboarding/status** - Fetch user's onboarding status (requires authentication)
2. **POST /api/onboarding/track** - Track onboarding step completion (body: `{ step, value }`)
3. **POST /api/onboarding/complete** - Mark onboarding as complete

### Storage Layer
Located in `server/storage.ts`:
- `getOnboardingStatus(userId)` - Get current onboarding record
- `trackOnboardingStep(userId, step, value)` - Update step progress
- `completeOnboarding(userId)` - Mark onboarding done

## Component Usage

### WelcomeOnboarding Component
**Location**: `client/src/components/onboarding/WelcomeOnboarding.tsx`

**Props**:
```typescript
interface WelcomeOnboardingProps {
  role: 'guest' | 'host' | 'dellala' | 'operator' | 'admin';
  userName?: string;
  onComplete: () => void;
}
```

**Example Integration**:
```tsx
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data: user } = useQuery({ queryKey: ['/api/auth/user'] });
  const { data: onboardingStatus } = useQuery({ 
    queryKey: ['/api/onboarding/status'],
    enabled: !!user 
  });
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && onboardingStatus && !onboardingStatus.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [user, onboardingStatus]);

  if (showOnboarding) {
    return (
      <WelcomeOnboarding
        role={user.role}
        userName={user.fullName}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return <div>Your main dashboard content...</div>;
}
```

## Role-Specific Content

### Guest Role
- **Step 1**: Welcome to Alga (አልጋ)
  - "Discover unique stays across Ethiopia"
  - Focus: Browse and book properties
- **Step 2**: Tour highlights (bookings, reviews, favorites)
- **Step 3**: Get Started button

### Host Role
- **Step 1**: Welcome hosts
  - "List your property and earn income"
  - Focus: Property management
- **Step 2**: Tour highlights (listings, bookings, earnings)
- **Step 3**: Get Started button

### Dellala (Agent) Role
- **Step 1**: Welcome agents
  - "Earn 5% commission for 36 months on every booking"
  - Focus: Commission system
- **Step 2**: Tour highlights (commission tracking, withdrawals, referrals)
- **Step 3**: Get Started button

### Operator Role
- **Step 1**: Welcome operators
  - "Verify properties, manage IDs, ensure quality"
  - Focus: Platform operations
- **Step 2**: Tour highlights (verification dashboard, ID reviews, property approvals)
- **Step 3**: Get Started button

### Admin Role
- **Step 1**: Welcome admins
  - "Full control over platform operations"
  - Focus: Administrative oversight
- **Step 2**: Tour highlights (user management, agent oversight, INSA compliance)
- **Step 3**: Get Started button

## Integration Points

### 1. After Registration
Immediately after user registration, redirect to onboarding:
```tsx
// In registration success handler
if (registrationSuccess) {
  navigate('/onboarding');
}
```

### 2. First Login Detection
Check onboarding status on login:
```tsx
const { data: user } = useQuery({ queryKey: ['/api/auth/user'] });
const { data: onboardingStatus } = useQuery({ 
  queryKey: ['/api/onboarding/status'],
  enabled: !!user 
});

if (user && !onboardingStatus?.onboardingCompleted) {
  // Show onboarding modal or redirect to onboarding page
}
```

### 3. Dashboard Guards
Add onboarding guards to dashboards:
```tsx
function DellalaDashboard() {
  const { data: onboardingStatus } = useQuery({ 
    queryKey: ['/api/onboarding/status'] 
  });
  
  if (!onboardingStatus?.onboardingCompleted) {
    return <WelcomeOnboarding role="dellala" onComplete={() => {}} />;
  }
  
  return <DashboardContent />;
}
```

## Animations & Performance

### Framer Motion Effects
- **Slide-in animations**: Smooth entrance from bottom
- **Fade transitions**: Elegant step-by-step progression
- **Scale effects**: Welcome text scaling for emphasis
- **Stagger animations**: List items animate sequentially

### 2G Network Optimization
- **Progressive enhancement**: Animations degrade gracefully
- **Static fallback**: Works without animations if needed
- **Lazy-loaded images**: Welcome images load after critical content
- **Minimal payload**: < 50KB total component size

## AI-Generated Welcome Images (Optional)

### Gemini Integration
**Location**: `server/gemini.ts`

**Free Credits**: Uses Replit's free Gemini AI credits
**Fallback**: Emoji-based welcome if image generation fails

**Example**:
```typescript
// Generate welcome image for role
const image = await generateWelcomeImage('dellala');
// Returns: Base64 image or null
```

## Analytics Tracking

### Tracked Events
- `step_welcome`: User sees welcome screen
- `step_tour`: User views tour
- `step_complete`: User completes final step
- `skip_count`: User skips onboarding

### Usage
All events are automatically tracked via the `trackOnboarding()` function in the component.

## Testing

### Manual Testing Steps
1. **Register new user** with any role
2. **Verify onboarding shows** with role-specific content
3. **Navigate through steps** using "Next" button
4. **Test skip functionality** via "Skip for now" link
5. **Verify completion** marks onboarding as done in database
6. **Confirm no re-trigger** after completion

### Test Accounts
- Guest: Register new phone number
- Host: Register new phone number, set role to 'host' in admin panel
- Dellala: Use `/become-agent` flow
- Operator/Admin: Set via admin user management

## Color Palette

### Guest Theme
- Primary: Blue gradient (`from-blue-600 to-blue-500`)
- Background: Cream to blue gradient

### Host Theme
- Primary: Purple gradient (`from-purple-600 to-purple-500`)
- Background: Cream to purple gradient

### Dellala Theme
- Primary: Emerald gradient (`from-emerald-600 to-emerald-500`)
- Background: Cream to emerald gradient

### Operator Theme
- Primary: Orange gradient (`from-orange-600 to-orange-500`)
- Background: Cream to orange gradient

### Admin Theme
- Primary: Red gradient (`from-red-600 to-red-500`)
- Background: Cream to red gradient

## Maintenance

### Adding New Steps
To add a new onboarding step:
1. Add new boolean field to `userOnboarding` schema (e.g., `stepNewFeature`)
2. Run `npm run db:push --force` to sync schema
3. Update `WelcomeOnboarding.tsx` content array
4. Add tracking call: `trackOnboarding('step_new_feature', true)`

### Analytics Dashboard (Future)
Consider building an admin analytics dashboard to view:
- Completion rates by role
- Average time to complete
- Skip rates
- Most dropped-off steps

## Accessibility

- **Keyboard navigation**: Full Tab/Enter support
- **ARIA labels**: All interactive elements labeled
- **Screen reader friendly**: Semantic HTML structure
- **High contrast**: Dark mode support
- **Mobile optimized**: Touch-friendly buttons

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Framer Motion | FREE | Client-side animation library |
| Database Storage | FREE | Uses existing Neon PostgreSQL |
| Gemini AI Images | FREE | Replit provides free credits |
| Backend API | FREE | Express.js routes on existing server |
| Total | **$0.00** | 100% free solution |

## Future Enhancements

1. **Video welcome messages** (when paid API budget allows)
2. **Interactive product tours** with Shepherd.js
3. **Personalized recommendations** based on user preferences
4. **Multi-language support** (Amharic, Oromo, Tigrinya)
5. **Onboarding analytics dashboard** for admins

---

**Built with ❤️ by Alga One Member PLC (Women-run, Women-owned, Women-operated)**
