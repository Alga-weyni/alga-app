# 📊 Complete Visual Diagram Export Guide
## INSA Submission - Alga Platform

**Company:** ALGA ONE MEMBER PLC  
**TIN:** 0101809194  
**Required:** 4 Architecture Diagrams in PNG/PDF format  
**Time Required:** 15-20 minutes  
**Method:** Web-based (No software installation needed!)

---

## 🎯 Goal

Export 4 professional architecture diagrams from Mermaid code to high-quality PNG/PDF files for INSA submission.

**Diagrams to Export:**
1. ✅ DFD Context Level 0 (External System View)
2. ✅ DFD Detailed Level 1 (Internal Processes)
3. ✅ System Architecture (5-Layer Infrastructure)
4. ✅ ERD Database Schema (20+ Tables)

---

## 🚀 Quick Start (Step-by-Step for Each Diagram)

### **DIAGRAM 1: DFD Context Level 0**

#### **Step 1: Open Mermaid Live Editor**

1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: **https://mermaid.live**
3. You'll see a two-panel interface:
   - **Left Panel:** Code editor (where you paste)
   - **Right Panel:** Live preview (diagram appears automatically)

#### **Step 2: Get the Diagram Code**

1. In this Replit project, open file: `docs/diagrams/DFD_Context_Level_0.md`
2. Scroll down to find the code block that starts with ` ```mermaid`
3. Copy EVERYTHING between ` ```mermaid` and the closing ` ``` `
4. The code should start with: `flowchart TB` (TB = Top to Bottom)

**What to Copy (Example Start):**
```mermaid
flowchart TB
    %% External Entities (Users)
    Guest[Guest User<br/>Browse & Book]
    Host[Property Owner<br/>List & Manage]
    ...
```

**Important:** 
- ✅ Copy ONLY the diagram code (starts with `flowchart TB`)
- ❌ Do NOT copy the ` ```mermaid` markers themselves
- ❌ Do NOT copy explanatory text above/below the code

#### **Step 3: Paste into Mermaid Live**

1. Go back to https://mermaid.live
2. **Clear** the existing sample code in the left panel (Select All → Delete)
3. **Paste** your copied code into the left panel
4. **Wait 2 seconds** - the diagram will auto-render on the right side

**Expected Result:**
- Right panel shows a colorful flowchart
- Boxes, arrows, and labels are clearly visible
- No error messages appear

**If You See Errors:**
- Check you copied the complete code (from `flowchart TB` to the end)
- Verify no stray characters were copied
- Make sure ` ```mermaid` markers were NOT included

#### **Step 4: Configure Export Settings**

1. Click the **Actions** button (top-right of right panel)
2. Select **Export** from dropdown menu
3. A settings panel appears with options:

**Recommended Settings:**
- **Theme:** `forest` (professional green/brown - matches Alga branding)
  - Alternatives: `default`, `dark`, `neutral`
  - Forest theme has good contrast and looks professional
- **Background:** `white` (clean, print-friendly)
  - Don't use transparent (may show poorly in documents)
- **Format:** `PNG` (recommended) or `SVG` (vector, infinitely scalable)
- **Width:** `3000 pixels` (high resolution for printing)
  - Minimum: 2000px
  - Maximum: 4000px (for very detailed diagrams)
- **Scale:** `2x` or `3x` (for retina displays)

#### **Step 5: Export the Diagram**

1. After setting options, click **Download PNG** or **Download SVG**
2. Your browser will download the file (usually to `Downloads` folder)
3. The file will be named something like: `mermaid-diagram-2025-11-06-123456.png`

#### **Step 6: Rename and Save**

1. Locate the downloaded file in your `Downloads` folder
2. **Rename** to: `1_DFD_Context_Level_0.png` (or `.svg`)
   - Prefix with `1_` for sorting order
   - Use descriptive name matching INSA requirement
3. **Move** file to: `INSA_Submission/2_Architecture_Diagrams/`

**Folder Structure After Export:**
```
INSA_Submission/
└── 2_Architecture_Diagrams/
    └── 1_DFD_Context_Level_0.png ✅
```

---

### **DIAGRAM 2: DFD Detailed Level 1**

**Repeat the same process:**

#### **Files to Use:**
- **Source:** `docs/diagrams/DFD_Detailed_Level_1.md`
- **Code starts with:** `flowchart TB` or `flowchart LR`
- **Output filename:** `2_DFD_Detailed_Level_1.png`

#### **Special Notes for This Diagram:**
- **This diagram is LARGE** (30+ nodes, 50+ connections)
- Use **width: 4000px** for better readability
- May take 5-10 seconds to render (be patient!)
- Zoom in on the right panel to inspect details

#### **Quality Check:**
- ✅ All 7 processes visible (Authentication, Property Management, Booking, Payment, etc.)
- ✅ All connections between processes shown
- ✅ Database cylinders clearly labeled
- ✅ Text is readable when zoomed to 100%

#### **Export Settings:**
```
Theme: forest
Background: white
Format: PNG
Width: 4000px (larger for this complex diagram!)
Scale: 2x
```

#### **Save As:**
`INSA_Submission/2_Architecture_Diagrams/2_DFD_Detailed_Level_1.png`

---

### **DIAGRAM 3: System Architecture**

#### **Files to Use:**
- **Source:** `docs/diagrams/System_Architecture.md`
- **Code starts with:** `flowchart TB`
- **Output filename:** `3_System_Architecture.png`

#### **What This Diagram Shows:**
- 5 architectural layers (Internet → Security → Application → Storage → External)
- 40+ components
- Color-coded by function
- Clear separation of concerns

#### **Special Notes:**
- **Very vertical diagram** (5 layers stacked)
- May appear narrow on screen but exports well
- Text is small - use high resolution (3000-4000px width)

#### **Export Settings:**
```
Theme: forest
Background: white
Format: PNG
Width: 3000px
Scale: 2x
```

#### **Quality Check After Export:**
- Open the exported PNG in image viewer
- Zoom to 100%
- Verify ALL layer names are readable:
  - Internet Layer (Top)
  - Security Layer
  - Application Layer
  - Storage Layer
  - External Services Layer (Bottom)
- Check component labels are legible

#### **Save As:**
`INSA_Submission/2_Architecture_Diagrams/3_System_Architecture.png`

---

### **DIAGRAM 4: ERD Database Schema**

#### **Files to Use:**
- **Source:** `docs/diagrams/ERD_Database_Schema.md`
- **Code starts with:** `erDiagram` (different format!)
- **Output filename:** `4_ERD_Database_Schema.png`

#### **Important Differences:**
- ✅ This is an **ERD** (Entity Relationship Diagram), not a flowchart
- ✅ Code starts with `erDiagram` (not `flowchart`)
- ✅ Shows database tables and relationships
- ✅ Special notation: `||--||`, `||--o{`, `o{--o{` (cardinality)

#### **What to Copy:**
```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : owns
    USERS ||--o{ BOOKINGS : makes
    PROPERTIES ||--o{ BOOKINGS : receives
    ...
```

**Copy everything from `erDiagram` to the last closing brace.**

#### **Rendering Notes:**
- ERD diagrams render differently than flowcharts
- Tables appear as boxes with columns listed inside
- Relationship lines show cardinality (one-to-many, many-to-many)
- May take 10-15 seconds to render (20+ tables)

#### **Export Settings:**
```
Theme: forest
Background: white
Format: PNG
Width: 4000px (LARGE diagram - 20+ tables!)
Scale: 2x
```

#### **Quality Check:**
- ✅ All 20+ table names visible
- ✅ Relationship lines connect correctly
- ✅ Sensitive fields marked (🔒 symbols visible)
- ✅ Cardinality notation clear (||, o{, etc.)

#### **Save As:**
`INSA_Submission/2_Architecture_Diagrams/4_ERD_Database_Schema.png`

---

## 🎨 Export Themes Comparison

### **Theme Options:**

1. **forest (Recommended)** ✅
   - Professional green/brown palette
   - Matches Alga branding (Ethiopian nature theme)
   - High contrast for printing
   - Looks formal and polished

2. **default**
   - Blue/gray standard theme
   - Very clean and simple
   - Good for technical documentation

3. **dark**
   - Dark background, light text
   - Modern tech aesthetic
   - NOT recommended (poor printing quality)

4. **neutral**
   - Grayscale only
   - Minimal colors
   - Good for black & white printing

**Recommendation:** Use **forest** for all 4 diagrams (consistency)

---

## 🖼️ Converting PNG to PDF (Optional)

INSA may prefer PDF format. After exporting PNG, convert to PDF:

### **Method 1: Online Converter (Easiest)**

1. Go to: **https://png2pdf.com** or **https://www.ilovepdf.com/png_to_pdf**
2. Upload your PNG file
3. Click "Convert to PDF"
4. Download converted PDF
5. Rename to match: `1_DFD_Context_Level_0.pdf`

**Advantages:**
- ✅ No software installation
- ✅ Free and fast
- ✅ Maintains image quality

### **Method 2: Adobe Acrobat / Preview (Mac)**

**On Mac:**
1. Open PNG in Preview app
2. File → Export as PDF
3. Save with same filename (change extension to .pdf)

**On Windows (Adobe Acrobat):**
1. Open PNG in Acrobat
2. File → Save As → PDF
3. Save with same filename

### **Method 3: LibreOffice (Free Software)**

1. Download LibreOffice (free): https://www.libreoffice.org
2. Open LibreOffice Impress (presentation software)
3. Insert → Image → Select your PNG
4. Resize to fill page
5. File → Export as PDF
6. Save

### **Method 4: Command Line (Linux/Mac)**

```bash
# Install ImageMagick (if not already installed)
# Mac: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Convert PNG to PDF
convert 1_DFD_Context_Level_0.png 1_DFD_Context_Level_0.pdf

# Batch convert all 4 diagrams
cd INSA_Submission/2_Architecture_Diagrams/
for file in *.png; do convert "$file" "${file%.png}.pdf"; done
```

---

## ✅ Final Checklist

After exporting all 4 diagrams, verify:

### **File Existence:**
- [ ] `1_DFD_Context_Level_0.png` (or .pdf)
- [ ] `2_DFD_Detailed_Level_1.png` (or .pdf)
- [ ] `3_System_Architecture.png` (or .pdf)
- [ ] `4_ERD_Database_Schema.png` (or .pdf)

### **File Quality:**
- [ ] All files are 2-5 MB in size (high resolution)
- [ ] All diagrams use consistent theme (forest)
- [ ] All diagrams have white background (not transparent)
- [ ] All text is readable when zoomed to 100%
- [ ] No rendering errors (missing boxes, broken arrows)

### **File Location:**
- [ ] All files in `INSA_Submission/2_Architecture_Diagrams/`
- [ ] Files properly named (numbered 1-4 for order)
- [ ] Both PNG and PDF versions available (if INSA requires PDF)

### **Content Verification:**

**Diagram 1 (DFD Context Level 0):**
- [ ] Shows 5 user types (Guest, Host, Agent, Operator, Admin)
- [ ] Shows 9 external systems (Chapa, Stripe, Fayda ID, etc.)
- [ ] Shows Alga System as central node
- [ ] All data flows labeled and directed

**Diagram 2 (DFD Detailed Level 1):**
- [ ] Shows 7 core processes
- [ ] Shows 7 databases (Users, Properties, Bookings, etc.)
- [ ] All process-to-database connections visible
- [ ] External entities connected to processes

**Diagram 3 (System Architecture):**
- [ ] 5 layers clearly separated (Internet, Security, App, Storage, External)
- [ ] All components listed within layers
- [ ] Security controls visible (Helmet, CORS, Rate Limit, INSA Hardening)
- [ ] External integrations shown

**Diagram 4 (ERD Database Schema):**
- [ ] 20+ tables visible
- [ ] Relationship lines connect tables correctly
- [ ] Sensitive fields marked with 🔒
- [ ] Cardinality notation visible (||, o{)

---

## 🆘 Troubleshooting

### **Problem 1: Diagram Too Small / Text Unreadable**

**Solution:**
- Increase width to 4000px or 5000px
- Try SVG format instead (vector, infinitely scalable)
- Change scale to 3x

### **Problem 2: Diagram Doesn't Render**

**Possible Causes:**
1. **Syntax error in code**
   - Check for typos when copying
   - Verify you copied complete code
   - Look for error message in Mermaid Live (red text)

2. **Code markers included**
   - Make sure you didn't copy ` ```mermaid`
   - Code should start directly with `flowchart` or `erDiagram`

3. **Browser compatibility**
   - Try Chrome or Firefox (best support)
   - Clear browser cache
   - Disable browser extensions

### **Problem 3: Colors Look Wrong**

**Solution:**
- Try different themes (forest, default, neutral)
- Check "Background: white" is selected
- Some themes override colors for consistency

### **Problem 4: Downloaded File Has Random Name**

**Solution:**
- Browser saves with auto-generated name
- Just rename after download
- Use descriptive names matching INSA requirements

### **Problem 5: PNG to PDF Conversion Looks Blurry**

**Solution:**
- Export at higher resolution (4000px+)
- Use SVG instead of PNG (then convert SVG → PDF)
- Check PDF export quality settings (high/maximum quality)

---

## 📏 Recommended Specifications

### **For INSA Submission:**

| Specification | Recommended Value | Notes |
|---------------|-------------------|-------|
| **Format** | PNG or PDF | PNG for web, PDF for print |
| **Width** | 3000-4000px | Ensures text readability |
| **Background** | White | Professional, print-friendly |
| **Theme** | Forest | Matches Alga branding |
| **Scale** | 2x or 3x | Retina display quality |
| **File Size** | 2-10 MB | High quality without bloat |
| **Resolution** | 300 DPI | Print-quality standard |

### **File Naming Convention:**

```
[Order]_[Diagram Type]_[Detail Level].png

Examples:
1_DFD_Context_Level_0.png
2_DFD_Detailed_Level_1.png
3_System_Architecture.png
4_ERD_Database_Schema.png
```

**Why number them?**
- ✅ Ensures correct order when listed alphabetically
- ✅ Matches INSA requirements document structure
- ✅ Makes it easy for auditors to navigate

---

## 🎓 Understanding the Diagrams

### **What is a Data Flow Diagram (DFD)?**

DFDs show how data moves through a system.

**Components:**
- **Rectangles:** External entities (users, systems)
- **Rounded boxes:** Processes (actions the system performs)
- **Cylinders:** Data stores (databases)
- **Arrows:** Data flows (direction of information)

**Why INSA Requires It:**
- Identifies data entry points (attack vectors)
- Shows sensitive data paths
- Reveals security boundaries
- Maps data storage locations

### **What is a System Architecture Diagram?**

Shows the technical infrastructure and components.

**Components:**
- **Layers:** Separation of concerns (UI, logic, data)
- **Boxes:** Individual components (servers, services, APIs)
- **Lines:** Communication paths
- **Colors:** Component categories

**Why INSA Requires It:**
- Reveals deployment model (cloud, on-premise)
- Shows security layers (firewalls, WAF, encryption)
- Identifies dependencies
- Maps attack surface

### **What is an ERD (Entity Relationship Diagram)?**

Shows database structure and table relationships.

**Components:**
- **Boxes:** Database tables (entities)
- **Lines:** Relationships (foreign keys)
- **Notation:** `||` = one, `o{` = many
- **Fields:** Column names inside boxes

**Why INSA Requires It:**
- Reveals sensitive data locations
- Shows data access patterns
- Identifies encryption needs
- Maps data relationships for security review

---

## 🌐 Alternative Export Methods

### **Method A: Mermaid CLI (Advanced - Requires Node.js)**

**Only if you have programming experience:**

```bash
# Install Mermaid CLI globally
npm install -g @mermaid-js/mermaid-cli

# Export diagram
mmdc -i docs/diagrams/DFD_Context_Level_0.md \
     -o INSA_Submission/2_Architecture_Diagrams/1_DFD_Context_Level_0.png \
     -w 3000 -b white -t forest
```

**Advantages:**
- ✅ Batch export all 4 diagrams
- ✅ Scriptable and repeatable
- ✅ Consistent quality

**Disadvantages:**
- ❌ Requires Node.js and npm
- ❌ May have library dependencies
- ❌ More complex for non-developers

### **Method B: VS Code Extension**

If you use VS Code:

1. Install "Markdown Preview Mermaid Support" extension
2. Open `.md` file with diagram
3. Click preview button
4. Right-click diagram → "Save Image As"
5. Save as PNG

**Advantages:**
- ✅ Works within your code editor
- ✅ No external website needed

**Disadvantages:**
- ❌ Lower export quality than Mermaid Live
- ❌ Limited theme options

---

## 📊 Expected Results

### **After Export, Your Folder Should Look Like:**

```
INSA_Submission/
└── 2_Architecture_Diagrams/
    ├── 1_DFD_Context_Level_0.png (2.5 MB)
    ├── 2_DFD_Detailed_Level_1.png (4.8 MB)
    ├── 3_System_Architecture.png (3.2 MB)
    └── 4_ERD_Database_Schema.png (5.1 MB)

    Total: ~15-20 MB (all diagrams)
```

**With PDF versions:**
```
INSA_Submission/
└── 2_Architecture_Diagrams/
    ├── 1_DFD_Context_Level_0.png
    ├── 1_DFD_Context_Level_0.pdf ✅
    ├── 2_DFD_Detailed_Level_1.png
    ├── 2_DFD_Detailed_Level_1.pdf ✅
    ├── 3_System_Architecture.png
    ├── 3_System_Architecture.pdf ✅
    ├── 4_ERD_Database_Schema.png
    └── 4_ERD_Database_Schema.pdf ✅

    Total: ~30-40 MB (PNG + PDF)
```

---

## ⏱️ Time Estimate

| Task | Time per Diagram | Total Time |
|------|------------------|------------|
| Copy code from file | 1 min | 4 min |
| Paste into Mermaid Live | 30 sec | 2 min |
| Configure export settings | 1 min | 4 min |
| Download and rename | 1 min | 4 min |
| Move to correct folder | 30 sec | 2 min |
| Quality check | 1 min | 4 min |
| **TOTAL** | **5 min** | **20 minutes** |

**With PDF conversion:** Add 5-10 minutes (total: 25-30 minutes)

---

## 🎉 Completion

### **When All 4 Diagrams Are Exported:**

1. ✅ **Verify files exist** in `INSA_Submission/2_Architecture_Diagrams/`
2. ✅ **Open each diagram** to check quality
3. ✅ **Update SUBMISSION_STATUS.md** to mark diagrams as complete
4. ✅ **Notify INSA contact** that submission is ready

### **Final Package:**

```
INSA_Submission/ (100% COMPLETE!)
├── 1_Legal_Documents/ ✅ (6 PDFs)
├── 2_Architecture_Diagrams/ ✅ (4 PNGs/PDFs)
├── 3_Security_Documentation/ ✅ (3 MD files)
├── 4_Threat_Model/ ✅ (1 MD file)
├── 5_Test_Credentials/ ✅ (3 files)
└── 6_Mobile_Builds/ ✅ (Documentation + APK)
```

---

**Document Prepared By:** Alga Development Team  
**Last Updated:** November 6, 2025  
**Estimated Time:** 20 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Easy - No technical skills required!)

🇪🇹 **Visual Diagrams Ready for Professional INSA Submission** ✨
