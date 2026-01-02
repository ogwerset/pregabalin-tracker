# CURSOR CONTEXT - Pregabalina Tracker

> **Dokument dla nowych sesji AI**: Ten plik zawiera kontekst projektu, aktualny stan i wskazówki dla przyszłych interakcji z AI.

## 📋 Project Overview

**Pregabalina Tracker** to dashboard do wizualizacji i analizy danych o działaniu pregabaliny w leczeniu GAD (Generalized Anxiety Disorder) przy równoległym leczeniu ADHD (Elvanse 70mg).

### Cel Aplikacji
- Import danych z Apple Shortcut (format CSV/tekstowy)
- Wizualizacja 12 wykresów analitycznych
- Generowanie automatycznego raportu dla lekarza
- Eksport wykresów (PNG) i raportu (PDF)

### Użytkownik
- Przyjmuje pregabalinę: 75mg rano + 150mg wieczorem (od 22/12/2025)
- Przyjmuje Elvanse 70mg (ADHD)
- Zbiera dane przez Apple Shortcut do notatnika

---

## 🏗️ Architecture

### Current State: v4.0.0

**Deployment**: Vercel (automatyczny deploy z GitHub)

**Architecture Pattern**: Modular JavaScript (9 plików JS) + 2 pliki CSS + 1 HTML entry point

**New Libraries**: html2canvas 1.4.1, jsPDF 2.5.1 + autoTable plugin

### File Structure
```
pregabalin-tracker/
├── index.html              # Entry point, ~467 lines
├── css/
│   ├── variables.css       # Design tokens (colors, spacing)
│   └── styles.css          # Component styles (~1260 lines)
├── js/
│   ├── config.js           # Configuration constants
│   ├── data-parser.js      # CSV/RAW parsing & validation
│   ├── data-store.js       # localStorage CRUD operations
│   ├── stats-engine.js     # Statistical calculations (regression, correlation)
│   ├── chart-renderer.js   # Plotly.js chart rendering (~1365 lines)
│   ├── table-manager.js    # Data table (sort, filter)
│   ├── doctor-report.js    # HTML report generation
│   ├── ui-controller.js    # UI event handling, navigation
│   └── app.js              # App initialization
├── README.md               # User documentation
├── REQUIREMENTS.md         # Technical requirements
├── AGENT-GUIDELINES.md     # Development guidelines
└── CURSOR-CONTEXT.md       # This file
```

### Key Technologies
- **Plotly.js Basic 2.27.0** (CDN) - Interactive charts
- **jStat 1.9.6** (CDN) - Statistical calculations (p-values, t-tests)
- **LocalStorage** - Data persistence
- **Vanilla JavaScript** - No build tools, zero dependencies
- **CSS Variables** - Theming system

### Module Dependencies
```
app.js
  └──> UIController.init()
        ├──> DataStore.load()
        ├──> StatsEngine.computeAll()
        ├──> ChartRenderer.renderAllCharts()
        ├──> TableManager.render()
        └──> DoctorReport.generate()
```

---

## 🔧 Recent Session Summary (v4.0.0)

### Major Features Added
1. **Liquid Glass UI** (iOS 26 style)
   - Glassmorphism effects on menu, export panel, cards
   - Backdrop blur with saturation
   - Smooth animations and transitions

2. **Landing Page**
   - Beautiful welcome screen for new users
   - Feature cards with icons
   - Auto-hides when data is imported

3. **Improved Import UI**
   - Tabs: Paste text vs File upload
   - Drag & drop file support
   - Better visual feedback

4. **Pharmacokinetics Chart**
   - New chart showing medication concentration over 24h
   - Based on actual dose times from data
   - Visual therapeutic windows

5. **Long Image Export**
   - Export all charts + report as single PNG
   - High quality (scale: 2)
   - Uses html2canvas

6. **PDF Export**
   - Professional PDF report for doctor
   - Includes tables, statistics, conclusions
   - Auto-pagination

### Bugs Fixed
1. **iOS Safari Viewport Bug** (110% zoom)
   - **Issue**: Viewport too wide on iOS Safari
   - **Fix**: Changed `100vw` to `100%`, added safe-area-inset support
   - **Impact**: Proper display on all iOS devices

2. **Hamburger Menu Padding**
   - **Issue**: Menu didn't inherit container padding
   - **Fix**: Changed `left: 0; right: 0` to match container padding
   - **Impact**: Menu properly aligned with content

3. **Chart Legends in Fullscreen**
   - **Issue**: Legends overlapped content in fullscreen view
   - **Fix**: Adjusted margins and legend position
   - **Impact**: Clean fullscreen display

4. **Weekly Comparison Sorting**
   - **Issue**: Weeks 0,1 appeared before weeks 52,53 at year boundary
   - **Fix**: Implemented ISO week calculation with year
   - **Impact**: Chronological sorting across year boundaries

### Privacy & Anonymization
- All hardcoded medication names moved to CONFIG
- Generic chart titles (no disease-specific references)
- Configurable disease context via UI or CSV
- App renamed to "Symptom Tracker" (generic)

### Code Quality
- Updated version to v4.0.0
- All JS imports versioned (`?v=4.0.0`)
- Added iOS safe-area-inset support
- Improved error handling

---

## 📁 Key Files Quick Reference

| File | Purpose | Key Methods/Properties |
|------|---------|----------------------|
| `index.html` | Entry point, HTML structure | Tab navigation, chart containers |
| `js/config.js` | Configuration | `STORAGE_KEY`, `THEME_KEY`, `MEDS_KEY` |
| `js/data-parser.js` | Data parsing | `parseRAW()`, `validateLine()`, `normalize()` |
| `js/data-store.js` | Data persistence | `save()`, `load()`, `append()`, `exportCSV()` |
| `js/stats-engine.js` | Statistics | `computeAll()`, `linearRegression()`, `correlationMatrix()` |
| `js/chart-renderer.js` | Chart rendering | `renderAllCharts()`, `renderGADTrajectory()`, etc. |
| `js/table-manager.js` | Table management | `render()`, `sort()`, `filter()` |
| `js/doctor-report.js` | Report generation | `generate()`, `renderCorrelationMatrix()` |
| `js/ui-controller.js` | UI control | `init()`, `switchTab()`, `handleImport()`, `refreshDashboard()` |
| `js/app.js` | Initialization | `DOMContentLoaded` handler |

---

## 🐛 Known Issues

**None currently** - All bugs fixed in v3.0.0

---

## 🚀 Common Tasks

### Adding a New Feature
1. Identify which module handles the feature (see Key Files table)
2. Add method to appropriate module
3. Update `ui-controller.js` if UI interaction needed
4. Update `index.html` if new UI elements needed
5. Test locally: `open index.html` or `python -m http.server 8000`
6. Update version in `index.html` (footer + JS imports)
7. Commit: `git add . && git commit -m "feat: description" && git push`

### Fixing a Bug
1. Reproduce the bug
2. Check browser console for errors
3. Identify affected module(s)
4. Fix the issue
5. Test thoroughly
6. Update version in `index.html`
7. Commit: `git add . && git commit -m "fix: description" && git push`

### Deploying
- **Automatic**: Push to `main` branch → Vercel auto-deploys
- **Manual**: `git push origin main`
- **No build step required** - static files only

### Testing Locally
```bash
# Option 1: Direct file open
open index.html

# Option 2: Local server (recommended for CORS)
python -m http.server 8000
# Then open http://localhost:8000
```

### Version Bumping
When making changes:
1. Update footer version in `index.html` (line ~452): `v3.0.0` → `v3.0.1`
2. Update all JS import query params (lines 456-464): `?v=3.0.0` → `?v=3.0.1`
3. Update `README.md` changelog
4. Commit with version in message: `v3.0.1: description`

---

## 📝 Development Guidelines

### Code Style
- **Indentation**: 4 spaces
- **Comments**: Section headers: `/* ===== SECTION NAME ===== */`
- **Naming**: camelCase for variables/functions, PascalCase for modules
- **Error Handling**: Try-catch blocks with console.error for debugging

### Module Pattern
Each JS file exports a single object:
```javascript
const ModuleName = {
    property: value,
    method: function() {
        // implementation
    }
};
```

### Cache Busting
**IMPORTANT**: When modifying JS files, update version query params in `index.html`:
```html
<script src="js/module.js?v=3.0.0"></script>
```
This forces browser to reload updated files.

### Debugging
- Use browser DevTools Console
- Check `localStorage` for data: `localStorage.getItem('pregabalin-tracker-data')`
- Plotly charts: Right-click → Inspect → Check Plotly data structure

---

## 🔍 Data Format

### Input Format (CSV)
```
Data,Czas,JakośćSnu,GodzinySnu,Lęk,Napięcie,BrainFog,Energia,Fokus,PoraDnia,Notatki,Elvanse,ElvanseGodzina,Pregabalina,PregabalinaGodzina
22/12/2025,11:32,3,5,2,6,8,6,6,RANO,-,TAK(70MG),-,TAK(75MG),-
```

### Data Storage
- **Format**: JSON array in localStorage
- **Key**: `pregabalin-tracker-data` (from `CONFIG.STORAGE_KEY`)
- **Structure**: Array of objects with normalized field names

---

## 🎨 Design System

### Colors (CSS Variables)
- **Primary Accent**: `--accent` = `#0D9488` (Warm Teal)
- **Background**: `--bg-primary` = `#1C1917` (Dark grey)
- **Text**: `--text-primary` = `#D6D3CE` (Light grey)
- See `css/variables.css` for full palette

### Typography
- **Headings**: Merriweather (serif)
- **Body/UI**: Inter (sans-serif)
- **Data/Code**: JetBrains Mono (monospace)

---

## 📚 Additional Documentation

- **README.md**: User-facing documentation, features, usage
- **REQUIREMENTS.md**: Technical requirements, data format specs
- **AGENT-GUIDELINES.md**: Development guidelines for AI agents (legacy, but useful)

---

## 💡 Tips for AI Sessions

1. **Always check version**: Look at footer in `index.html` to know current version
2. **Module boundaries**: Each JS file is self-contained - changes should stay within module
3. **Cache issues**: If changes don't appear, check version query params in `index.html`
4. **Data flow**: `DataStore.load()` → `StatsEngine.computeAll()` → `ChartRenderer.renderAllCharts()`
5. **Error patterns**: Most errors are method name mismatches (e.g., `getAll()` vs `load()`)
6. **Testing**: Always test with real data - use import feature to load sample data

---

## 🔄 Version History

- **v4.0.0** (Current): Liquid Glass UI, landing page, pharmacokinetics chart, PDF export, iOS fixes, anonymization
- **v3.0.0**: Bug fixes (DataStore, selectors, ResizeObserver)
- **v2.5**: UI improvements, mobile fixes
- **v2.4**: Dark mode removal, print fixes
- **v2.0**: Modular architecture

---

**Last Updated**: v4.0.0 release
**Maintainer**: User (ogwerset)
**Repository**: GitHub (auto-deployed to Vercel)

