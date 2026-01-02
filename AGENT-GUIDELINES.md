# PREGABALINA TRACKER - WSKAZÓWKI DLA AGENTÓW

## Kontekst Projektu

Budujesz **modularny HTML dashboard** do wizualizacji danych o działaniu pregabaliny.
- Użytkownik przyjmuje pregabalinę (75mg rano + 150mg wieczorem) od 22/12/2025
- Równolegle przyjmuje Elvanse 70mg (ADHD)
- Dane zbierane są przez Apple Shortcut do notatnika
- Dashboard ma pozwolić na import danych, wizualizację i generowanie raportu dla lekarza

## Pliki Referencyjne

| Plik | Opis |
|------|------|
| `REQUIREMENTS.md` | Techniczne wymagania, format danych, paleta kolorów |
| `references/dataset.md` | Przykładowe dane - używaj do testowania |
| `references/evaluation.txt` | Wzorcowa analiza Python - logika obliczeń i format raportów |
| `old/pregabalin-dashboard.html` | Stara wersja z gotowymi wykresami Plotly - referencja stylu |
| `CURSOR-CONTEXT.md` | Kontekst dla nowych sesji AI - aktualny stan projektu |

## Struktura Modułów JS (Modular Architecture)

Projekt używa **modularnej architektury** z osobnymi plikami JS:

```
js/
├── config.js           # CONFIG - stałe konfiguracyjne (localStorage keys)
├── data-parser.js      # DataParser - parsowanie i walidacja danych CSV/RAW
├── data-store.js       # DataStore - localStorage CRUD, eksport CSV
├── stats-engine.js     # StatsEngine - obliczenia statystyczne (regresja, korelacje)
├── chart-renderer.js   # ChartRenderer - renderowanie wykresów Plotly
├── table-manager.js    # TableManager - zarządzanie tabelą danych (sort, filter)
├── doctor-report.js    # DoctorReport - generowanie HTML raportu dla lekarza
├── ui-controller.js    # UIController - kontroler UI, event handling, nawigacja
└── app.js              # Inicjalizacja aplikacji (DOMContentLoaded)
```

### Cache Busting

Wszystkie importy JS w `index.html` używają wersjonowania query params:
```html
<script src="js/config.js?v=3.0.0"></script>
```
**WAŻNE**: Przy każdej zmianie kodu JS, zaktualizuj wersję w `index.html` aby wymusić odświeżenie cache przeglądarki.

### Moduły jako Obiekty

Każdy moduł jest obiektem JavaScript z metodami:
```javascript
// Przykład: js/data-store.js
const DataStore = {
    STORAGE_KEY: CONFIG.STORAGE_KEY,
    save: function(data) { /* ... */ },
    load: function() { /* ... */ },
    append: function(newData) { /* ... */ },
    // ...
};
```

---

# AGENT 1: Core Structure & Layout

## Zakres
Stwórz szkielet HTML + CSS bez logiki JS (puste moduły).

## Zadania
1. **HTML5 semantyczny** z sekcjami:
   - Header z tytułem i nawigacją tabami
   - 4 sekcje tab-content: Import, Dashboard, Tabela, Raport
   - Toast container
   - Footer z metadanymi

2. **CSS Grid layout**:
   - Sidebar nav (opcjonalnie) lub top tabs
   - Main content area
   - Charts grid (2x2 + 1 full-width)

3. **CSS custom properties** dla theming:
   - Wszystkie kolory jako `--var-name`
   - `[data-theme="dark"]` selector dla dark mode

4. **Dark mode toggle**:
   - Przycisk w headerze
   - localStorage persistence dla preferencji
   - Transition animacje

5. **Responsive breakpoints**:
   - Mobile: < 640px (1 kolumna)
   - Tablet: 640-1024px (2 kolumny)
   - Desktop: > 1024px (pełny layout)

6. **Print stylesheet**:
   - Ukryj nawigację i przyciski
   - Białe tło
   - Wykresy w pełnej szerokości
   - `[data-print-hidden="true"] { display: none !important; }` - ukryj niewybranie segmenty

7. **Segment selection UI**:
   - Checkbox przy każdym wykresie/sekcji
   - Panel "Wybierz segmenty do eksportu" przed przyciskiem drukuj
   - `.segment-hidden { opacity: 0.3; }` - wizualny feedback

7. **Komponenty UI**:
   - Skeleton loaders (pulsujące placeholdery)
   - Toast notifications (success/error/warning)
   - Card component z shadow i border

## Output
Plik HTML z kompletnym CSS i pustymi modułami JS.

## Referencja stylu
Użyj `old/pregabalin-dashboard.html` jako inspiracji dla:
- Gradient hero section
- Card styling z accent border-top
- Accordion component
- Progress bars

---

# AGENT 2: Data Handling & Validation

## Zakres
Implementuj `DataParser` i `DataStore` moduły.

## DataParser API

```javascript
const DataParser = {
    // Parsuj RAW tekst z notatnika
    parseRAW(rawText) {
        // Returns: { data: [], errors: [], skipped: number }
    },
    
    // Parsuj plik CSV
    parseCSV(csvContent) {
        // Returns: { data: [], errors: [], skipped: number }
    },
    
    // Waliduj pojedynczą linię
    validateLine(line, lineNumber) {
        // Returns: { valid: boolean, data: object|null, error: string|null }
    },
    
    // Normalizuj wartości
    normalize(record) {
        // N/A → null
        // TAK(75MG) → 75
        // "-" → null
        // Zwraca znormalizowany obiekt
    },
    
    // Ekstrakcja dawki z tekstu
    extractDose(text) {
        // "TAK(75MG)" → 75
        // "-" → null
        // Returns: number|null
    }
};
```

## DataStore API

```javascript
const DataStore = {
    STORAGE_KEY: 'pregabalin-tracker-data',
    
    // Zapisz dane (nadpisz)
    save(data) {
        // localStorage.setItem
    },
    
    // Wczytaj dane
    load() {
        // Returns: array lub []
    },
    
    // Dodaj nowe dane (append, deduplikacja)
    append(newData) {
        // Deduplikuj po Data+Czas
        // Returns: { added: number, duplicates: number }
    },
    
    // Wyczyść dane
    clear() {
        // Zwróć true/false
    },
    
    // Eksportuj do CSV
    exportCSV() {
        // Returns: string (CSV content)
    },
    
    // Statystyki danych
    getStats() {
        // Returns: { count, dateRange, daysCount, avgPerDay }
    }
};
```

## Walidacja per-linia

Dla każdej linii sprawdź:
1. Czy ma dokładnie 15 kolumn (po splitcie na `,`)
2. Czy Data jest w formacie DD/MM/YYYY
3. Czy Czas jest w formacie HH:MM
4. Czy metryki (Lęk, Napięcie, etc.) są liczbami 1-10
5. Czy PoraDnia jest jednym z: RANO, POŁUDNIE, POPOŁUDNIE, WIECZÓR

## Komunikaty błędów (PL)

```javascript
const ERRORS = {
    INVALID_COLUMNS: 'Linia {n}: Nieprawidłowa liczba kolumn (oczekiwano 15, otrzymano {x})',
    INVALID_DATE: 'Linia {n}: Nieprawidłowy format daty (oczekiwano DD/MM/YYYY)',
    INVALID_TIME: 'Linia {n}: Nieprawidłowy format czasu (oczekiwano HH:MM)',
    INVALID_METRIC: 'Linia {n}: Wartość {kolumna} musi być liczbą od 1 do 10',
    INVALID_TIME_OF_DAY: 'Linia {n}: Nieznana pora dnia (dozwolone: RANO, POŁUDNIE, POPOŁUDNIE, WIECZÓR)'
};
```

## Edge cases

- Pusta linia → pomiń (nie error)
- Linia z samymi spacjami → pomiń
- Nagłówek CSV → rozpoznaj i pomiń
- Spacja przed czasem → trim

---

# AGENT 3: Statistics Engine

## Zakres
Implementuj `StatsEngine` z użyciem jStat.

## StatsEngine API

```javascript
const StatsEngine = {
    // Agregacja danych dziennych
    aggregateDaily(data) {
        // Grupuj po Data
        // Oblicz średnie dla każdej metryki
        // Returns: [{ date, lek, napiecie, fokus, energia, brainFog, jakoscSnu, godzinySnu, pregabalinaMg }]
    },
    
    // Agregacja po porze dnia
    aggregateByTimeOfDay(data) {
        // Grupuj po PoraDnia
        // Oblicz mean, std, count
        // Returns: { RANO: {...}, POLUDNIE: {...}, ... }
    },
    
    // Regresja liniowa
    linearRegression(x, y) {
        // x: array of numbers (np. dzień leczenia 1,2,3...)
        // y: array of values
        // Returns: { slope, intercept, r, rSquared, pValue, standardError }
        // Użyj jStat.linearRegression + jStat.ttest
    },
    
    // Korelacja Pearsona
    pearsonCorrelation(x, y) {
        // Returns: number (-1 to 1)
    },
    
    // Macierz korelacji
    correlationMatrix(data, variables) {
        // variables: ['lek', 'napiecie', 'fokus', ...]
        // Returns: 2D array
    },
    
    // Porównanie połów
    compareHalves(dailyData) {
        // Podziel na pierwszą i drugą połowę
        // Oblicz średnie, różnicę procentową
        // Returns: { firstHalf: {...}, secondHalf: {...}, change: {...} }
    },
    
    // Przygotuj dane do heatmapy Dni × Pora Dnia
    prepareDayTimeMatrix(data, metric) {
        // metric: 'lek' | 'napiecie' | 'fokus' | etc.
        // Returns: { dates: [], timeOfDay: ['RANO', 'POŁUDNIE', ...], matrix: [[...], [...]] }
        // matrix[timeOfDayIndex][dateIndex] = średnia wartość metryki
    }
};
```

## Użycie jStat

```javascript
// Regresja liniowa
const result = jStat.models.ols(y, jStat.utils.identity(x.length).map((row, i) => [1, x[i]]));

// Korelacja
const r = jStat.corrcoeff(x, y);

// P-value dla regresji (t-test)
const tStat = slope / standardError;
const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 2));
```

## Output dla raportu

```javascript
// Przykład output dla DoctorReport
{
    period: { start: '22/12/2025', end: '31/12/2025', days: 10, measurements: 52 },
    gadTrend: {
        lek: { slope: -0.137, r: -0.779, pValue: 0.008, significant: true },
        napiecie: { slope: -0.176, r: -0.779, pValue: 0.008, significant: true }
    },
    comparison: {
        lek: { first: 2.35, second: 1.70, changePercent: -27.5 },
        napiecie: { first: 4.12, second: 3.12, changePercent: -24.3 }
    },
    adhdStability: {
        fokus: { trend: 'stable', firstHalf: 4.2, secondHalf: 4.8 },
        energia: { trend: 'stable', firstHalf: 5.6, secondHalf: 6.0 }
    },
    intradayPatterns: {
        worstTimeOfDay: 'WIECZÓR',
        bestTimeOfDay: 'POŁUDNIE',
        avgByTime: { RANO: 2.2, POLUDNIE: 1.55, POPOLUDNIE: 2.28, WIECZOR: 2.15 }
    }
}
```

---

# AGENT 4: Visualization Engine

## Zakres
Implementuj `ChartRenderer` z Plotly.js.

## ChartRenderer API

```javascript
const ChartRenderer = {
    // Plotly templates
    lightTemplate: { /* ... */ },
    darkTemplate: { /* ... */ },
    
    // Aktualny theme
    currentTheme: 'light',
    
    // Ustaw theme
    setTheme(theme) {
        this.currentTheme = theme;
        this.updateAllCharts();
    },
    
    // Wykres 1: GAD Trajectory
    renderGADTrajectory(containerId, dailyData, stats) {
        // Line chart: Lęk, Napięcie + trendlines
        // Adnotacja używek
        // Strefa niskiego lęku
    },
    
    // Wykres 2: Intraday Profile
    renderIntradayProfile(containerId, intradayData) {
        // Box plots dla Lęku i Napięcia
        // X: RANO, POŁUDNIE, POPOŁUDNIE, WIECZÓR
    },
    
    // Wykres 3: ADHD Stability
    renderADHDStability(containerId, dailyData) {
        // Multi-line: Fokus, Energia, BrainFog
        // Strefa optymalnego funkcjonowania
    },
    
    // Wykres 4: Heatmapa Dni × Pora Dnia
    renderDayTimeHeatmap(containerId, data, metric = 'lek') {
        // Heatmap: X = daty, Y = pory dnia (RANO, POŁUDNIE, POPOŁUDNIE, WIECZÓR)
        // metric: 'lek' | 'napiecie' (toggle)
        // Kolorskala: zielony (niski) → czerwony (wysoki)
        // Wartości w komórkach
    },
    
    // Wykres 5: Correlation Heatmap
    renderCorrelationHeatmap(containerId, correlationMatrix, labels) {
        // Heatmap z wartościami
        // Kolorskala: czerwony (negatywna) → zielony (pozytywna)
    },
    
    // Render wszystkich wykresów
    renderAllCharts(data, stats) {
        // Wywołaj wszystkie render*
    },
    
    // Aktualizuj theme wszystkich wykresów
    updateAllCharts() {
        // Plotly.relayout dla każdego wykresu
    },
    
    // Eksport do PNG
    exportChart(containerId, filename) {
        Plotly.downloadImage(containerId, {
            format: 'png',
            width: 1200,
            height: 600,
            filename: filename
        });
    }
};
```

## Plotly Templates

```javascript
const lightTemplate = {
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor: '#FFFFFF',
    font: { color: '#1E293B', family: 'Outfit, sans-serif' },
    xaxis: { gridcolor: '#E2E8F0', linecolor: '#E2E8F0' },
    yaxis: { gridcolor: '#E2E8F0', linecolor: '#E2E8F0' }
};

const darkTemplate = {
    paper_bgcolor: '#1E293B',
    plot_bgcolor: '#1E293B',
    font: { color: '#F1F5F9', family: 'Outfit, sans-serif' },
    xaxis: { gridcolor: '#334155', linecolor: '#334155' },
    yaxis: { gridcolor: '#334155', linecolor: '#334155' }
};
```

## Kolory wykresów

```javascript
const CHART_COLORS = {
    lek: '#EF4444',        // czerwony
    napiecie: '#3B82F6',   // niebieski
    fokus: '#10B981',      // zielony
    energia: '#F59E0B',    // amber
    brainFog: '#8B5CF6',   // fioletowy
    trendLek: '#DC2626',   // ciemniejszy czerwony
    trendNapiecie: '#2563EB' // ciemniejszy niebieski
};
```

## Referencja
Zobacz `old/pregabalin-dashboard.html` linie 722-1170 dla gotowych implementacji wykresów.

---

# AGENT 5: Interactive Features & Doctor Report

## Zakres
Implementuj `TableManager`, `DoctorReport` i integrację UI.

## TableManager API

```javascript
const TableManager = {
    currentData: [],
    sortColumn: 'Data',
    sortDirection: 'desc',
    filters: { dateFrom: null, dateTo: null, timeOfDay: null },
    
    // Render tabeli
    render(containerId, data) {
        // Generuj <table> z nagłówkami i danymi
        // Sortowalne nagłówki (kliknięcie)
    },
    
    // Sortowanie
    sort(column) {
        // Toggle direction jeśli ta sama kolumna
        // Re-render
    },
    
    // Filtrowanie
    filter(filters) {
        // Zastosuj filtry
        // Re-render
    },
    
    // Formatowanie komórki
    formatCell(value, column) {
        // Kolorowanie wartości (niski lęk = zielony)
        // Formatowanie dat
    }
};
```

## DoctorReport API

```javascript
const DoctorReport = {
    // Generuj pełny raport HTML
    generate(data, stats) {
        // Returns: HTML string
    },
    
    // Sekcja: Informacje o pacjencie
    renderPatientInfo(stats) {
        // Okres obserwacji, liczba pomiarów, leki
    },
    
    // Sekcja: Skuteczność GAD
    renderGADEffectiveness(stats) {
        // Trendy, p-values, % zmiana
    },
    
    // Sekcja: Stabilność ADHD
    renderADHDStability(stats) {
        // Fokus, Energia - porównanie połów
    },
    
    // Sekcja: Wzorce dobowe
    renderIntradayPatterns(stats) {
        // Która pora dnia najgorsza/najlepsza
        // Sugestie dot. dawkowania
    },
    
    // Sekcja: Wnioski i rekomendacje
    renderConclusions(stats) {
        // Tekstowe podsumowanie
    },
    
    // Interpretacja odpowiedzi na leczenie
    interpretResponse(stats) {
        // Returns: 'POZYTYWNA' | 'CZĘŚCIOWO POZYTYWNA' | 'NIEJEDNOZNACZNA'
    },
    
    // Formatowanie p-value
    formatPValue(p) {
        // p < 0.01 → "0.008 (istotne)"
        // p < 0.05 → "0.042 (istotne)"
        // p >= 0.05 → "0.234 (nieistotne)"
    }
};
```

## UIController (integracja)

```javascript
const UIController = {
    // Inicjalizacja
    init() {
        this.initTheme();
        this.bindEvents();
        this.loadData();
    },
    
    // Theme
    initTheme() {
        const saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    },
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        ChartRenderer.setTheme(next);
    },
    
    // Nawigacja
    switchTab(tabId) {
        // Ukryj wszystkie, pokaż wybrane
        // Lazy render wykresów przy pierwszym pokazaniu
    },
    
    // Import
    handleImport(mode) {
        // mode: 'replace' | 'append'
        const raw = document.getElementById('raw-input').value;
        const result = DataParser.parseRAW(raw);
        
        if (result.errors.length > 0) {
            this.showToast('error', result.errors.join('\n'));
            return;
        }
        
        if (mode === 'replace') {
            DataStore.save(result.data);
        } else {
            DataStore.append(result.data);
        }
        
        this.showToast('success', `Zaimportowano ${result.data.length} wpisów`);
        this.refreshDashboard();
    },
    
    // Toast
    showToast(type, message) {
        // type: 'success' | 'error' | 'warning'
        // Auto-hide po 5s
    },
    
    // Refresh dashboard
    refreshDashboard() {
        const data = DataStore.load();
        const stats = StatsEngine.computeAll(data);
        ChartRenderer.renderAllCharts(data, stats);
        TableManager.render('data-table', data);
        document.getElementById('doctor-report').innerHTML = DoctorReport.generate(data, stats);
    },
    
    // ===== SEGMENT SELECTION (EXPORT) =====
    
    // Stan checkboxów dla segmentów
    selectedSegments: {
        'chart-gad': true,
        'chart-intraday': true,
        'chart-adhd': true,
        'chart-heatmap': true,
        'chart-correlation': true,
        'report': true
    },
    
    // Toggle segment visibility
    toggleSegment(segmentId) {
        this.selectedSegments[segmentId] = !this.selectedSegments[segmentId];
        const el = document.getElementById(segmentId);
        el.classList.toggle('segment-hidden', !this.selectedSegments[segmentId]);
    },
    
    // Eksport wybranych segmentów
    exportSelected() {
        // Ukryj niewybranie, wywołaj print, przywróć
        const hidden = [];
        Object.entries(this.selectedSegments).forEach(([id, selected]) => {
            if (!selected) {
                const el = document.getElementById(id);
                el.setAttribute('data-print-hidden', 'true');
                hidden.push(el);
            }
        });
        
        window.print();
        
        // Przywróć po wydruku
        hidden.forEach(el => el.removeAttribute('data-print-hidden'));
    },
    
    // Eksport wszystkich wykresów jako PNG (zip)
    async exportAllChartsPNG() {
        const selectedCharts = Object.entries(this.selectedSegments)
            .filter(([id, selected]) => selected && id.startsWith('chart-'))
            .map(([id]) => id);
        
        for (const chartId of selectedCharts) {
            await ChartRenderer.exportChart(chartId, chartId);
        }
    }
};
```

---

# AGENT 6: Polish, Integration & Testing

## Zakres
Integracja wszystkich modułów, testy, cleanup.

## Checklist integracji

- [ ] Wszystkie moduły komunikują się poprawnie
- [ ] Event listeners podpięte
- [ ] Error handling na każdym poziomie
- [ ] Loading states działają

## Test cases

### Happy path
1. Wklej dane z `references/dataset.md`
2. Kliknij "Importuj"
3. → Toast sukcesu
4. → Przejdź do Dashboard
5. → 5 wykresów wyświetlonych
6. → Przejdź do Tabela
7. → Dane w tabeli, sortowanie działa
8. → Przejdź do Raport
9. → Raport wygenerowany z statystykami

### Error handling
1. Wklej "lorem ipsum" → Toast z błędem
2. Wklej puste pole → Toast "Brak danych do zaimportowania"
3. Wklej częściowo błędne dane → Toast "Zaimportowano X, pominięto Y"

### Persistence
1. Import danych → F5 → Dane nadal są
2. Toggle dark mode → F5 → Theme zachowany

### Export
1. Kliknij "Pobierz PNG" na wykresie → Plik pobiera się
2. Kliknij "Drukuj" → Print preview z czytelnym layoutem
3. Odznacz 2 wykresy → "Drukuj" → Tylko 3 wykresy w preview
4. "Eksportuj wybrane PNG" → Pobiera tylko zaznaczone

## Performance

- Lazy loading wykresów (render przy pierwszym pokazaniu tabu)
- Debounce dla filtrów tabeli
- Nie re-renderuj jeśli dane się nie zmieniły

## Code cleanup

- Usunięcie console.log (zostaw tylko w try/catch)
- Komentarze sekcyjne: `/* ===== SECTION ===== */`
- Consistent formatting (2 spaces indent)
- Usunięcie dead code

## Final structure check

### Plik HTML (index.html)
```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pregabalina Tracker</title>
    <!-- Google Fonts -->
    <link rel="stylesheet" href="css/variables.css">
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- ~450 lines HTML structure -->
    
    <!-- CDN Libraries -->
    <script src="https://cdn.plot.ly/plotly-basic-2.27.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jstat@1.9.6/dist/jstat.min.js"></script>
    
    <!-- Modular JS Files -->
    <script src="js/config.js?v=3.0.0"></script>
    <script src="js/data-parser.js?v=3.0.0"></script>
    <script src="js/data-store.js?v=3.0.0"></script>
    <script src="js/stats-engine.js?v=3.0.0"></script>
    <script src="js/chart-renderer.js?v=3.0.0"></script>
    <script src="js/table-manager.js?v=3.0.0"></script>
    <script src="js/doctor-report.js?v=3.0.0"></script>
    <script src="js/ui-controller.js?v=3.0.0"></script>
    <script src="js/app.js?v=3.0.0"></script>
</body>
</html>
```

### Struktura plików
```
pregabalin-tracker/
├── index.html              # ~467 lines - główny HTML
├── css/
│   ├── variables.css       # ~98 lines - design tokens
│   └── styles.css          # ~1260 lines - style komponentów
├── js/
│   ├── config.js           # ~8 lines
│   ├── data-parser.js      # ~213 lines
│   ├── data-store.js       # ~120 lines
│   ├── stats-engine.js     # ~503 lines
│   ├── chart-renderer.js   # ~1365 lines
│   ├── table-manager.js    # ~140 lines
│   ├── doctor-report.js    # ~361 lines
│   ├── ui-controller.js    # ~618 lines
│   └── app.js              # ~5 lines
└── README.md
```

**Łączna estymacja: ~5000+ linii kodu (modularna architektura)**

