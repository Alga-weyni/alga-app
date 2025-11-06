# INSA Visual Diagrams - Export Instructions
## How to Convert Mermaid Diagrams to PNG/SVG

All diagrams are created in **Mermaid.js** format, which can be easily exported to PNG or SVG for INSA submission.

---

## 📊 Available Diagrams

1. **`DFD_Context_Level_0.md`** - Data Flow Diagram (External View)
2. **`DFD_Detailed_Level_1.md`** - Data Flow Diagram (Internal Processes)
3. **`System_Architecture.md`** - Technical Infrastructure
4. **`ERD_Database_Schema.md`** - Database Entity Relationships

---

## 🖼️ Export Methods

### Method 1: Mermaid Live Editor (Easiest)
**Website:** https://mermaid.live

**Steps:**
1. Open https://mermaid.live in your browser
2. Copy the entire Mermaid code block from any `.md` file (between the ` ```mermaid` markers)
3. Paste into the editor (left panel)
4. Preview appears automatically (right panel)
5. Click **Actions** → **Export PNG** or **Export SVG**
6. Download high-resolution image

**Recommended Settings:**
- Theme: Default or Forest (professional)
- Resolution: 300 DPI (for printing)
- Background: Transparent or White

---

### Method 2: VS Code Extension
**Extension:** Markdown Preview Mermaid Support

**Steps:**
1. Install extension in VS Code
2. Open any diagram `.md` file
3. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac) to preview
4. Right-click on diagram → **Copy as Image** or **Export**

---

### Method 3: GitHub Rendering (Quick Preview)
**Steps:**
1. Push diagrams to GitHub repository
2. Open any `.md` file on GitHub
3. Mermaid renders automatically
4. Screenshot or use browser extensions to export

---

### Method 4: Command Line (Advanced)
**Tool:** Mermaid CLI (`@mermaid-js/mermaid-cli`)

**Installation:**
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Export All Diagrams:**
```bash
# Navigate to diagrams folder
cd docs/diagrams

# Export to PNG (high quality)
mmdc -i DFD_Context_Level_0.md -o DFD_Context_Level_0.png -t forest -b transparent -w 3000

mmdc -i DFD_Detailed_Level_1.md -o DFD_Detailed_Level_1.png -t forest -b transparent -w 3000

mmdc -i System_Architecture.md -o System_Architecture.png -t forest -b transparent -w 3000

mmdc -i ERD_Database_Schema.md -o ERD_Database_Schema.png -t forest -b transparent -w 3000

# Export to SVG (vector, scalable)
mmdc -i DFD_Context_Level_0.md -o DFD_Context_Level_0.svg -t forest -b transparent

mmdc -i DFD_Detailed_Level_1.md -o DFD_Detailed_Level_1.svg -t forest -b transparent

mmdc -i System_Architecture.md -o System_Architecture.svg -t forest -b transparent

mmdc -i ERD_Database_Schema.md -o ERD_Database_Schema.svg -t forest -b transparent
```

**Options:**
- `-t forest` - Theme (default, forest, dark, neutral)
- `-b transparent` - Transparent background
- `-w 3000` - Width in pixels (high resolution)

---

## 📦 INSA Submission Package

After exporting, organize files as follows:

```
INSA_Submission/
└── 2_Architecture_Diagrams/
    ├── DFD_Context_Level_0.pdf (converted from PNG)
    ├── DFD_Detailed_Level_1.pdf (converted from PNG)
    ├── System_Architecture.pdf (converted from PNG)
    └── ERD_Database_Schema.pdf (converted from PNG)
```

**Converting PNG to PDF:**
- Use Adobe Acrobat, Preview (Mac), or online tools
- Ensure high quality (300 DPI minimum)
- Add INSA header/footer if required

---

## 🎨 Diagram Customization

### Changing Colors
Edit the Mermaid code's `classDef` sections:

```mermaid
classDef securityClass fill:#ffebee,stroke:#c62828,stroke-width:3px
```

**Common Color Schemes:**
- Security: Red (`#ffebee` / `#c62828`)
- Application: Blue (`#e3f2fd` / `#1976d2`)
- Database: Yellow (`#fff9c4` / `#f57f17`)
- External: Purple (`#f3e5f5` / `#7b1fa2`)

### Changing Layout
Mermaid uses automatic layout, but you can adjust:
- `flowchart TB` - Top to Bottom (vertical)
- `flowchart LR` - Left to Right (horizontal)
- `flowchart TD` - Top Down (alias for TB)

---

## ✅ Quality Checklist

Before submitting to INSA:

- [ ] All diagrams exported at 300 DPI or higher
- [ ] Background is white or transparent (not gray)
- [ ] Text is readable when zoomed out
- [ ] Colors are professional (not too bright)
- [ ] All arrows and connections are clear
- [ ] Converted to PDF format
- [ ] File size < 5MB per diagram
- [ ] Filenames match INSA requirements

---

## 📝 Diagram Contents Summary

### DFD Context Level 0
- **Entities:** 5 user roles, 9 external systems
- **Flows:** 30+ data flows
- **Focus:** External view of Alga platform

### DFD Detailed Level 1
- **Processes:** 7 core processes (Authentication, Property, Booking, Payment, Commission, etc.)
- **Data Stores:** 7 databases
- **Focus:** Internal process flows and data movement

### System Architecture
- **Layers:** 5 architectural layers (Internet → Security → Application → Storage → External)
- **Components:** 40+ components
- **Focus:** Technical infrastructure and technology stack

### ERD Database Schema
- **Tables:** 20+ entities
- **Relationships:** 30+ connections
- **Fields:** 200+ columns documented
- **Focus:** Database structure and relationships

---

## 🆘 Troubleshooting

### Issue: Diagram Not Rendering
**Solution:** Verify Mermaid syntax:
```bash
# Test syntax online
https://mermaid.live
```

### Issue: Export Quality Too Low
**Solution:** Increase width parameter:
```bash
mmdc -i diagram.md -o diagram.png -w 4000  # Increase from 3000 to 4000
```

### Issue: File Size Too Large
**Solution:** Use SVG format (vector) or compress PNG:
```bash
# Use pngquant to compress
pngquant diagram.png --quality=80-100
```

---

## 📧 INSA Submission

**Email to:** tilahune@insa.gov.et  
**Portal:** https://cyberaudit.insa.gov.et/sign-up

**File Naming Convention:**
- `Alga_DFD_Context_L0.pdf`
- `Alga_DFD_Detailed_L1.pdf`
- `Alga_System_Architecture.pdf`
- `Alga_ERD_Database.pdf`

---

**Last Updated:** November 6, 2025  
**Created By:** Alga Development Team  
**Standard:** INSA OF/AEAD/001
