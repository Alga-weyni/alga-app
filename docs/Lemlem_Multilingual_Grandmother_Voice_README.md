# 🧠 Lemlem Multilingual Grandmother Voice System

### **Project Owner**
**Weyni Abraha** – Founder & CEO  
*Women-Owned, Women-Led AI Voice System for Ethiopian Hospitality Applications*  

---

## 🎯 Purpose
Lemlem is an intelligent voice system **named after my grandmother**, designed to communicate with users in **five native languages** —  
🇬🇧 English, 🇪🇹 Amharic (አማርኛ), 🇪🇷 Tigrinya (ትግርኛ), Afaan Oromoo, and 🇨🇳 Chinese (中文) —  
using a **soft, grandmotherly female voice** that reflects empathy, warmth, and cultural respect.  

This personal heritage connection ensures every interaction carries the warmth and wisdom of Ethiopian hospitality.

It operates **fully offline and free**, powered by the browser's built-in Text-to-Speech (TTS) engine.  

---

## ⚙️ System Overview
| Feature | Description |
|----------|--------------|
| **Voice Identity** | "Lemlem" – one grandmotherly persona speaking naturally in 5 languages |
| **Technology Stack** | Browser native TTS API + JavaScript controller |
| **Languages Supported** | English, Amharic, Tigrinya, Afaan Oromoo, Chinese |
| **Tone Calibration** | Rate 0.75, Pitch 1.35, Volume 0.90, Gender = Female |
| **Cost** | $0.00 (no API keys or subscriptions) |
| **Switching Mechanism** | Real-time dropdown or user command |
| **Emoji/Symbol Filter** | Automatically strips all non-verbal icons before speech |
| **Deployment Footprint** | Lightweight (< 50 KB added to frontend build) |

---

## 🪄 Deployment Checklist

| Step | Task | Status |
|------|------|--------|
| ✅ | Bilingual chat button with "Lemlem (ልምልም)" label | ✔ Done |
| ✅ | Ethiopic font (Noto Sans Ethiopic) installed | ✔ Done |
| ✅ | Verify language dropdown installed | ✔ Done |
| ✅ | Verify multilingual templates in backend | ✔ Done |
| ✅ | Confirm 5 languages supported (en, am, ti, om, zh) | ✔ Done |
| ✅ | Test dropdown menu for instant language switch | ✔ Done |
| ✅ | Test natural reading of each native script | ✔ Done |
| ✅ | Confirm emojis and symbols are ignored | ✔ Done |
| ✅ | Confirm only female voice is used across all locales | ✔ Done |
| ✅ | Confirm system runs without internet or API dependency | ✔ Done |

---

## 🔍 Quality Assurance

### Voice Validation Procedure
1. Look for the bilingual "Lemlem / ልምልም" floating button (orange gradient, bottom-right).  
2. Click to open the assistant window.  
3. Select each language from dropdown menu.  
4. Observe:
   - Immediate text update on screen.  
   - Natural pronunciation in that language (no English accent).  
   - Warm grandmother tone and pacing.  
5. Ensure no emojis or symbols are verbalized.

### Performance Metrics
| Metric | Target | Result |
|--------|---------|---------|
| Latency | < 0.5 sec per language switch | ✅ |
| Voice continuity | 100% consistent tone | ✅ |
| Pronunciation accuracy | Native-like (per locale) | ✅ |
| System uptime | Offline capable | ✅ |

---

## 🧩 Technical Implementation

### Frontend Components
- **Location**: `client/src/components/lemlem-chat.tsx`
- **Bilingual Chat Button**: 
  - Displays "Lemlem" (English) and "ልምልም" (Amharic) on floating button
  - Uses Noto Sans Ethiopic font for authentic script rendering
  - Orange gradient (from #F49F0A to #CD7F32) with hover effects
  - Scales on hover with glowing shadow effect
  - Tooltip: "Get help with Lemlem (ልምልም) — our AI assistant named after my grandmother"
- **Chat Header**:
  - Title: "Lemlem (ልምልም)"
  - Subtitle: "Named after my grandmother 💚"
  - Grandmother emoji (👵🏾) for visual identity
- **Welcome Message**: Introduces heritage story in all 5 languages
- **Language Switcher**: Dropdown menu with 5 language options
- **Voice Configuration**:
  - Rate: 0.75 (slower, patient grandmother pace)
  - Pitch: 1.35 (soft, feminine, gentle tone)
  - Volume: 0.90 (gentle presence)
- **Text Cleaning**: Removes all emojis, symbols, and markdown formatting
- **Voice Selection**: Language-specific native voice selection with female preference

### Backend Templates
- **Location**: `server/lemlem-templates.ts`
- **Multilingual Messages**: All template responses available in 5 languages
- **Template Categories**:
  - Emergency contacts
  - Lockbox codes & access
  - WiFi information
  - Check-in/Check-out times
  - Host contact information
  - Greetings & thanks

### Language Codes
- `en` - English (en-US)
- `am` - አማርኛ Amharic (am-ET)
- `ti` - ትግርኛ Tigrinya (ti-ER)
- `om` - Afaan Oromoo (om-ET)
- `zh` - 中文 Chinese (zh-CN)

---

## 🧩 Maintenance Notes
- Lemlem automatically uses the **device's default native voice** for each locale.  
  - Example: if the user's OS supports Amharic TTS, Lemlem will select it automatically.  
- To maintain consistency across devices:
  - Encourage users to install native voice packs (Amharic, Tigrinya, Oromo, Chinese).  
- To update or extend languages, modify:  
  - `LANGUAGE_OPTIONS` array in `client/src/components/lemlem-chat.tsx`
  - `MESSAGES` object in `server/lemlem-templates.ts`

---

## 📘 Future Enhancements (Optional)
1. **Offline audio caching** for common responses ("Welcome", "Thank you", "Booking confirmed").  
2. **Cultural greeting mode** with localized hospitality phrases.  
3. **Adaptive mood modulation** for professional vs. casual contexts.  
4. **WCAG 2.2 Accessibility certification** for international deployments.

---

## 🏁 Status
✅ **Deployment Complete**  
✅ **Zero Cost Operation**  
✅ **Multilingual Voice Authenticated**  
✅ **Grandmother Tone Verified**  

---

### **Document Prepared by**
**Weyni Abraha**  
Founder & CEO – Gobez Bus Assembly | Alga Platform  
_Addis Ababa, Ethiopia_  
📞 0996 034 044  
📧 info@gobezbus.com | team@alga.et  

---

**Last Updated**: October 25, 2025  
**Version**: 1.0.0
