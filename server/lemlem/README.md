# Lemlem Template Modules

This directory contains modular, multilingual response templates for Lemlem, your AI Assistant.

## 📁 Structure

```
server/lemlem/
├── lockbox.ts       # Lockbox/access code responses
└── README.md        # This file
```

## 🔑 Lockbox Template (lockbox.ts)

### Functions

#### `getLockboxReply(property, lang)`
Used when lockbox code is **NOT available** yet.

**Parameters:**
- `property`: Property object (any)
- `lang`: Language code (default: 'en-US')

**Supported Languages:**
- `en-US` - English
- `am-ET` - Amharic (አማርኛ)
- `ti-ER` - Tigrinya (ትግርኛ)
- `om-ET` - Afaan Oromoo
- `zh-CN` - Chinese (中文)

**Example:**
```typescript
import { getLockboxReply } from './lemlem/lockbox';

const response = getLockboxReply(property, 'am-ET');
// Returns: "ልጄ ሆይ፣ የዚህን ቤት ቁልፍ ኮድ አላስታወስሁም እንደምትመስል 🗝️
//           በተለምዶ ኮድ ከመግቢያው ቀደም በ24 ሰዓት ይልካል..."
```

#### `getLockboxCodeReply(code, location, lang, instructions?)`
Used when lockbox code **IS available**.

**Parameters:**
- `code`: The lockbox code (string)
- `location`: Where the lockbox is located (string)
- `lang`: Language code (default: 'en-US')
- `instructions`: Optional special instructions (string)

**Example:**
```typescript
import { getLockboxCodeReply } from './lemlem/lockbox';

const response = getLockboxCodeReply(
  '1234',
  'At the main entrance',
  'en-US',
  'Turn the dial clockwise'
);
// Returns: "🔑 Here's your lockbox information, dear:
//           Code: 1234
//           Location: At the main entrance
//           Instructions: Turn the dial clockwise..."
```

## 🗣️ Voice Integration

All responses are optimized for browser Text-to-Speech (TTS):
- Natural, conversational tone
- No technical jargon or "AI" mentions
- Grandmother-like warmth in all languages
- Clean text without excessive markdown

### Voice Behavior
- **Voice ON + User asks:** Lemlem speaks the response in warm voice
- **Voice OFF / Text display:** Shows as friendly text in chat
- **Language-aware:** Browser TTS automatically uses native pronunciation

## 🌍 Language Support

Each template includes 5 complete translations:

| Code | Language | Native Script | Voice Quality |
|------|----------|---------------|---------------|
| en-US | English | Latin | Excellent |
| am-ET | Amharic | Ge'ez (አማርኛ) | Good |
| ti-ER | Tigrinya | Ge'ez (ትግርኛ) | Good |
| om-ET | Afaan Oromoo | Latin | Good |
| zh-CN | Chinese | Simplified (中文) | Excellent |

## 📝 Design Principles

1. **Warm & Personal**: Like a caring Ethiopian grandmother
2. **No AI Tags**: Never mentions "AI", "bot", or technical terms
3. **Culturally Appropriate**: Respects Ethiopian hospitality norms
4. **Multilingual First**: All responses available in 5 languages
5. **Voice-Ready**: Natural phrasing for TTS pronunciation
6. **Emoji-Enhanced**: Gentle use of relevant emojis (🗝️, 💚, 🔑)

## 🔧 Integration Example

```typescript
// In your Lemlem chat handler
import { getLockboxReply, getLockboxCodeReply } from './lemlem/lockbox';

function handleLockboxQuestion(property, lang) {
  // Check if property has lockbox info
  if (property.lockboxCode) {
    return getLockboxCodeReply(
      property.lockboxCode,
      property.lockboxLocation,
      lang,
      property.lockboxInstructions
    );
  } else {
    return getLockboxReply(property, lang);
  }
}
```

## 🚀 Future Templates

Planned modules for this directory:
- `wifi.ts` - WiFi credentials and troubleshooting
- `emergency.ts` - Emergency contacts and safety info
- `checkin.ts` - Check-in times and procedures
- `checkout.ts` - Check-out times and instructions
- `host.ts` - Host contact information
- `amenities.ts` - Property amenities and features

## 💡 Usage Notes

- Always pass the language code from the user's chat session
- Fallback to `en-US` if language not supported
- Templates return plain strings (no React components)
- Safe to use on backend or frontend
- No external dependencies required

---

**Version:** 4.3.3  
**Last Updated:** October 25, 2025  
**Maintainer:** Alga Platform Team
