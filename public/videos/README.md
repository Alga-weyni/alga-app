# Welcome Videos Directory

This directory contains role-specific welcome videos for the Alga onboarding system.

## Video Files

Place your welcome videos here:

- ✅ `guest_welcome.mp4` - Guest (traveler) welcome video
- ✅ `host_welcome.mp4` - Property owner welcome video
- ✅ `dellala_welcome.mp4` - Agent (ደላላ) welcome video
- ✅ `admin_welcome.mp4` - Administrator welcome video
- 📝 `operator_welcome.mp4` - Operator welcome video (optional)

## Video Specifications

**Recommended Settings**:
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1280x720 (720p)
- **Duration**: 15-30 seconds
- **File Size**: < 5MB per video
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30fps

## Poster Images (Optional)

You can also add poster/thumbnail images that show before the video loads:

- `guest_welcome_poster.jpg`
- `host_welcome_poster.jpg`
- `dellala_welcome_poster.jpg`
- `admin_welcome_poster.jpg`

**Poster Specs**:
- Format: JPG or PNG
- Resolution: 1280x720
- File Size: < 500KB

## 2G Network Optimization

The video player is configured for Ethiopian networks:
- `preload="metadata"` - Only loads video metadata initially
- User-controlled playback - Videos don't auto-play
- Native controls - Allows users to pause/skip to save data
- Graceful fallback - Works perfectly without videos

## How It Works

1. When a new user completes registration, they see the onboarding screen
2. The system automatically detects their role (guest, host, dellala, admin, operator)
3. If a welcome video exists for that role, it displays on the welcome screen
4. If no video exists, the animated text-only version displays (still beautiful!)

## Example Content Ideas

### Guest Welcome Video (15-20 seconds)
- Opening: "Welcome to Alga, Ethiopia's trusted property booking platform"
- Show: Beautiful Ethiopian properties, happy travelers
- Highlight: "Smart lockbox access, verified hosts, secure payments"
- Close: "Let's find your perfect stay!"

### Host Welcome Video (20-25 seconds)
- Opening: "Welcome property owner! Start earning with Alga"
- Show: Dashboard interface, booking notifications
- Highlight: "Keep 92.5% of bookings, instant payouts"
- Close: "List your property today!"

### Dellala Welcome Video (20-25 seconds)
- Opening: "እንኳን ደህና መጡ! Welcome agent!"
- Show: Commission dashboard, withdrawal interface
- Highlight: "Earn 5% recurring commission for 36 months"
- Close: "Start referring properties now!"

### Admin Welcome Video (15-20 seconds)
- Opening: "Welcome to Lemlem Operations Dashboard"
- Show: Admin panels, analytics, controls
- Highlight: "Full platform control, 5 operational pillars"
- Close: "Manage Alga with confidence!"

## Testing

To test videos locally:
1. Place your MP4 files in this directory
2. Navigate to `/onboarding` in your browser
3. Login with a test account
4. The appropriate video will display based on your role

## Status

This directory is ready to receive your welcome videos. The system works perfectly without them using beautiful Framer Motion animations and Ethiopian gradients.

---

**Built by Alga One Member PLC** - Women-run, Women-owned, Women-operated 🇪🇹
