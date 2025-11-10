# How to Export INSA Diagrams in A4 Size

## 📄 A4 Paper Specifications
- **Size:** 210mm × 297mm (8.27" × 11.69")
- **Orientation:** Portrait (vertical) or Landscape (horizontal)
- **Resolution:** 300 DPI (professional print quality)
- **Pixel Dimensions:** 2480 × 3508 pixels (Portrait) or 3508 × 2480 pixels (Landscape)

---

## 🎨 METHOD 1: Mermaid Live Editor (Recommended)

### **Step 1: Open Mermaid Live Editor**
Go to: https://mermaid.live/

### **Step 2: Paste Your Diagram Code**

1. **Open:** `docs/insa/INSA_MOBILE_DIAGRAMS.md`
2. **Copy** one complete diagram (everything between ` ```mermaid ` and ` ``` `)
3. **Paste** into the left panel of Mermaid Live Editor
4. The diagram appears on the right

### **Step 3: Export as SVG (Vector - Best Quality)**

1. Click **"Actions"** dropdown (top-right)
2. Select **"Download SVG"**
3. Save the file (e.g., `diagram-1-business-architecture.svg`)

### **Step 4: Convert SVG to A4 PDF**

**Option A: Use Online Converter (Free)**
1. Go to: https://www.adobe.com/express/feature/image/convert/svg-to-pdf
2. Upload your SVG file
3. Download PDF
4. **Set A4 size:**
   - Open PDF in Preview (Mac) or Adobe Reader
   - Go to **File** → **Print**
   - Paper Size: **A4**
   - Fit to Page: **Scale to Fit**
   - Save as PDF

**Option B: Use Mac Preview**
1. Double-click the SVG (opens in Preview)
2. **File** → **Export as PDF**
3. Click **Show Details**
4. Paper Size: **A4**
5. Scale: **100%** (or **Scale to Fit**)
6. Click **Save**

### **Step 5: Repeat for All 14 Diagrams**

From `INSA_MOBILE_DIAGRAMS.md`, export:
1. Business Architecture Diagram
2. Business Process Flow
3. Business Model Canvas
4. Commission & Tax Calculation
5. Mobile Application Architecture
6. Data Flow Diagram
7. Database ER Diagram
8. Authentication & Session Flow
9. Payment Processing Flow
10. OWASP Mobile Top 10 Threat Model
11. ID Verification Workflow
12. User Role & Permission Matrix
13. Lemlem Operations Dashboard Architecture
14. Offline-First Architecture

---

## 🖥️ METHOD 2: HTML Export with A4 Sizing (Advanced)

I can create an HTML file that renders all diagrams at perfect A4 size for printing.

### **Step 1: Create HTML File**

Save this as `export-diagrams-a4.html` in your project:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>INSA Diagrams - A4 Export</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm;
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto 10mm;
            background: white;
            box-shadow: 0 0 5px rgba(0,0,0,0.1);
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: auto;
        }
        
        h1 {
            font-size: 18pt;
            margin-bottom: 10mm;
            color: #333;
        }
        
        .mermaid {
            width: 100%;
            max-height: 250mm;
            overflow: visible;
        }
        
        @media print {
            body {
                margin: 0;
            }
            .page {
                margin: 0;
                box-shadow: none;
                page-break-after: always;
            }
        }
    </style>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ 
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true
            }
        });
    </script>
</head>
<body>

<!-- Page 1: Business Architecture -->
<div class="page">
    <h1>1. Business Architecture Diagram</h1>
    <div class="mermaid">
        <!-- PASTE DIAGRAM 1 CODE HERE -->
    </div>
</div>

<!-- Page 2: Business Process Flow -->
<div class="page">
    <h1>2. Business Process Flow</h1>
    <div class="mermaid">
        <!-- PASTE DIAGRAM 2 CODE HERE -->
    </div>
</div>

<!-- Add more pages for each diagram... -->

</body>
</html>
```

### **Step 2: Fill in Diagrams**

1. Copy each diagram code from `INSA_MOBILE_DIAGRAMS.md`
2. Paste between the `<div class="mermaid">` tags
3. Remove the ` ```mermaid ` wrapper (just paste the raw code)

### **Step 3: Open in Browser**

1. Double-click `export-diagrams-a4.html`
2. Opens in your default browser
3. Wait for diagrams to render (10-20 seconds)

### **Step 4: Print to PDF**

1. **Press** Command + P (Mac) or Ctrl + P (Windows)
2. **Destination:** Save as PDF
3. **Paper Size:** A4
4. **Margins:** Default or Custom (15mm recommended)
5. **Scale:** 100%
6. Click **Save**

---

## 📊 METHOD 3: Batch Export Script (All 14 at Once)

Want me to create an **automated script** that exports all 14 diagrams as A4 PDFs automatically?

I can create:
- Node.js script using Puppeteer (headless browser)
- Exports all diagrams in one command
- Perfect A4 sizing
- Professional 300 DPI quality

---

## 🎯 RECOMMENDED WORKFLOW FOR INSA SUBMISSION

### **For Highest Quality (Professional):**

1. ✅ **Export from Mermaid Live as SVG** (vector, infinite quality)
2. ✅ **Convert SVG to PDF** at A4 size
3. ✅ **Combine all PDFs** into one document
4. ✅ **Print or include in submission**

### **For Speed (Quick):**

1. ✅ **Use HTML method** (all diagrams in one file)
2. ✅ **Print to PDF** (A4, all at once)
3. ✅ **Done in 5 minutes**

---

## 📐 A4 SIZE REFERENCE

### **Portrait (Vertical):**
```
┌─────────────────┐
│                 │
│   210mm wide    │
│                 │
│   297mm tall    │
│                 │
│                 │
│                 │
└─────────────────┘
```

### **Landscape (Horizontal):**
```
┌───────────────────────────────┐
│                               │
│   297mm wide × 210mm tall     │
│                               │
└───────────────────────────────┘
```

**Use Portrait for:** Most diagrams (flowcharts, architecture)  
**Use Landscape for:** Wide diagrams (timeline, process flow)

---

## ✅ QUALITY CHECKLIST

Before submitting to INSA, verify:

- [ ] All diagrams exported at **A4 size**
- [ ] Text is **readable** (not too small)
- [ ] Arrows and connections are **clear**
- [ ] Colors are **visible** (not washed out)
- [ ] File format is **PDF** (not PNG/JPG for print)
- [ ] Resolution is **300 DPI** minimum
- [ ] All 14 diagrams included
- [ ] Each diagram has a **title/label**

---

## 🆘 TROUBLESHOOTING

### **Problem: Diagram is too large for A4**

**Solution:**
- In Mermaid Live, click **Actions** → **Configuration**
- Add this at the top of your diagram:
  ```
  %%{init: {'theme':'default', 'themeVariables': { 'fontSize':'12px'}}}%%
  ```
- Reduces text size to fit more content

### **Problem: Text is too small to read**

**Solution:**
- Split large diagrams into 2 pages
- Or use **A3 size** for complex diagrams (double the area)

### **Problem: SVG won't open**

**Solution:**
- Use a modern browser (Chrome, Firefox, Safari)
- Or convert directly to PNG at high resolution:
  - Mermaid Live → **Download PNG** → Choose **4x Scale**

---

## 📞 NEED HELP?

I can create the automated export script or HTML file for you. Just ask!

Options:
1. **HTML file with all 14 diagrams** (ready to print as A4 PDF)
2. **Node.js batch export script** (automates everything)
3. **Pre-rendered PDF** (all diagrams combined, A4 size)

---

**Quick Start:** Go to https://mermaid.live/ and start exporting! 🚀
