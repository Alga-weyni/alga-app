# 📊 How to Export Diagrams for INSA Submission
## Quick 15-Minute Guide

**Issue:** Mermaid CLI requires Chrome libraries not available in this environment.  
**Solution:** Use the web-based export tool (easier and faster!)

---

## 🚀 **METHOD 1: Mermaid Live Editor** (Recommended - 5 min per diagram)

### Step-by-Step for Each Diagram:

#### **Diagram 1: DFD Context Level 0**

1. **Open:** https://mermaid.live in your browser
2. **Open file:** `docs/diagrams/DFD_Context_Level_0.md` in this project
3. **Copy the Mermaid code:** 
   - Find the code between ` ```mermaid` and ` ``` ` markers
   - Copy ONLY the code (starts with `flowchart TB`)
4. **Paste** into Mermaid Live (left panel)
5. **Preview** appears on right (auto-rendered)
6. **Click Actions** → **Export PNG** (or SVG)
7. **Settings:**
   - Theme: Forest (professional)
   - Background: White
   - Width: 3000px (high quality)
8. **Download** as: `1_DFD_Context_Level_0.png`
9. **Save to:** `INSA_Submission/2_Architecture_Diagrams/`

---

#### **Diagram 2: DFD Detailed Level 1**

1. Open `docs/diagrams/DFD_Detailed_Level_1.md`
2. Copy Mermaid code (between ` ```mermaid` markers)
3. Paste into https://mermaid.live
4. Export PNG (3000px, white background)
5. Save as: `2_DFD_Detailed_Level_1.png`

---

#### **Diagram 3: System Architecture**

1. Open `docs/diagrams/System_Architecture.md`
2. Copy Mermaid code
3. Paste into https://mermaid.live
4. Export PNG (3000px, white background)
5. Save as: `3_System_Architecture.png`

---

#### **Diagram 4: ERD Database Schema**

1. Open `docs/diagrams/ERD_Database_Schema.md`
2. Copy Mermaid code (starts with `erDiagram`)
3. Paste into https://mermaid.live
4. Export PNG (3000px, white background)
5. Save as: `4_ERD_Database_Schema.png`

---

## 🖼️ **METHOD 2: GitHub Rendering** (Alternative)

If you push this project to GitHub:

1. View any `.md` file on GitHub
2. Mermaid renders automatically
3. Right-click diagram → **Save Image As...**
4. Or use browser screenshot tool for high quality

---

## 📄 **Converting PNG to PDF** (INSA Requirement)

INSA may require PDF format. After exporting PNG:

### Option A: Online Converter
- https://png2pdf.com
- Upload each PNG
- Download PDF
- Rename to match diagram

### Option B: Adobe Acrobat / Preview (Mac)
1. Open PNG file
2. File → Export as PDF
3. Save with descriptive name

### Option C: Command Line (if available)
```bash
# Install ImageMagick
convert diagram.png diagram.pdf
```

---

## ✅ **Final File Structure:**

After exporting, your submission folder should look like:

```
INSA_Submission/
├── 1_Legal_Documents/
│   ├── Alga_Trade_License_Software.pdf ✅
│   ├── Alga_Trade_License_Ecommerce.pdf ✅
│   ├── Alga_Trade_License_Commission.pdf ✅
│   ├── Commercial_Registration.pdf ✅
│   └── TIN_Certificate.pdf ✅
│
├── 2_Architecture_Diagrams/
│   ├── 1_DFD_Context_Level_0.png (or .pdf)
│   ├── 2_DFD_Detailed_Level_1.png (or .pdf)
│   ├── 3_System_Architecture.png (or .pdf)
│   └── 4_ERD_Database_Schema.png (or .pdf)
│
└── 3_Security_Documentation/
    ├── INSA_Security_Audit_Submission.md ✅
    └── INSA_COMPLIANCE_GAP_ANALYSIS.md ✅
```

---

## 📋 **Quick Checklist:**

- [ ] Exported DFD Context Level 0
- [ ] Exported DFD Detailed Level 1
- [ ] Exported System Architecture
- [ ] Exported ERD Database Schema
- [ ] All diagrams at 300 DPI / 3000px width
- [ ] White background (professional)
- [ ] Converted to PDF (if required)
- [ ] Files named clearly
- [ ] Saved to `INSA_Submission/2_Architecture_Diagrams/`

---

## 🆘 **Troubleshooting:**

**Q: Diagram too large / text too small?**
- Increase width to 4000px in export settings
- Or use SVG (vector format, infinitely scalable)

**Q: Colors look wrong?**
- Try different themes: forest, default, dark, neutral
- Forest theme recommended for professional look

**Q: Can't see all elements?**
- Some diagrams are very large - scroll in preview
- Export at maximum width (4000px)
- Use SVG format for best quality

---

## 📧 **INSA Submission Contact:**

**Email:** tilahune@insa.gov.et  
**Portal:** https://cyberaudit.insa.gov.et/sign-up  
**Phone:** +251 937 456 374

---

**Total Time Required:** 15-20 minutes (4 diagrams × 5 minutes each)

**You're almost there!** 🇪🇹✨
