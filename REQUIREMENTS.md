# PREGABALINA TRACKER - REQUIREMENTS

## CDN Dependencies

```html
<!-- Plotly.js Basic (wykresy) -->
<script src="https://cdn.plot.ly/plotly-basic-2.27.0.min.js"></script>

<!-- jStat (statystyki: p-value, t-test) -->
<script src="https://cdn.jsdelivr.net/npm/jstat@1.9.6/dist/jstat.min.js"></script>

<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Rozmiary bibliotek
| Biblioteka | Rozmiar (gzipped) | Cel |
|------------|-------------------|-----|
| plotly-basic-2.27.0.min.js | ~1MB | Wykresy interaktywne |
| jstat.min.js | ~25KB | Statystyki (regresja, p-value) |
| Google Fonts | ~30KB | Typografia |

---

## Format Danych Wejściowych

### Struktura CSV (15 kolumn)
```
Data,Czas,JakośćSnu,GodzinySnu,Lęk,Napięcie,BrainFog,Energia,Fokus,PoraDnia,Notatki,Elvanse,ElvanseGodzina,Pregabalina,PregabalinaGodzina
```

### Typy danych per kolumna
| Kolumna | Typ | Wartości | Przykład |
|---------|-----|----------|----------|
| Data | string | DD/MM/YYYY | `22/12/2025` |
| Czas | string | HH:MM | `11:32` |
| JakośćSnu | number/null | 1-10, "N/A" | `7`, `N/A` |
| GodzinySnu | number/null | 1-12, "N/A" | `6`, `N/A` |
| Lęk | number | 1-10 | `3` |
| Napięcie | number | 1-10 | `4` |
| BrainFog | number | 1-10 | `7` |
| Energia | number | 1-10 | `6` |
| Fokus | number | 1-10 | `5` |
| PoraDnia | enum | RANO/POŁUDNIE/POPOŁUDNIE/WIECZÓR | `RANO` |
| Notatki | string/null | tekst, "-", "BRAK" | `joint i dwa piwa` |
| Elvanse | string/null | "TAK(XXmg)", "-", "N/A", "NIE", "nie" | `TAK(70MG)` |
| ElvanseGodzina | string/null | HH:MM, "-", "N/A" | `10:43` |
| Pregabalina | string/null | "TAK(XXmg)", "-", "N/A", "NIE" | `TAK(75MG)` |
| PregabalinaGodzina | string/null | HH:MM, "-", "N/A" | `10:43` |

### Edge cases do obsłużenia
- Wartości `N/A` dla snu w pomiarach nie-porannych
- Różne pisownie: `NIE`, `nie`, `BRAK`, `-`
- Spacje przed czasem: `31/12/2025, 14:29`
- Polskie znaki w notatkach
- Pusta linia na końcu pliku

---

## Wymagane Wykresy (5)

### Wykres 1: GAD Treatment Trajectory
- **Typ**: Line chart z trendlines
- **Dane**: Średnie dzienne Lęku i Napięcia
- **Elementy**: Linie trendu (regresja liniowa), adnotacja epizodu używek, strefa niskiego lęku
- **Statystyki**: slope, r, p-value dla każdej linii

### Wykres 2: Intraday Anxiety Profile
- **Typ**: Box plots
- **Dane**: Rozkład Lęku i Napięcia wg pory dnia (RANO/POŁUDNIE/POPOŁUDNIE/WIECZÓR)
- **Elementy**: Mediany, kwartyle, outliers

### Wykres 3: ADHD Stability Check
- **Typ**: Multi-line chart
- **Dane**: Średnie dzienne Fokus, Energia, BrainFog
- **Elementy**: Strefa optymalnego funkcjonowania (4-8)

### Wykres 4: Heatmapa Dni × Pora Dnia
- **Typ**: Heatmap
- **Dane**: Wartości Lęku (lub Napięcia - toggle) per dzień i pora dnia
- **Osie**: X = daty, Y = RANO/POŁUDNIE/POPOŁUDNIE/WIECZÓR
- **Elementy**: Kolorskala (niski=zielony, wysoki=czerwony), wartości w komórkach
- **Cel**: Identyfikacja wzorców czasowych (np. "lęk zawsze wysoki wieczorem")

### Wykres 5: Correlation Heatmap
- **Typ**: Heatmap (macierz korelacji)
- **Dane**: Korelacje Pearsona między zmiennymi
- **Zmienne**: Lęk, Napięcie, JakośćSnu, BrainFog, Energia, Fokus, Pregabalina(mg/d)

---

## Funkcjonalności Wymagane

### Import danych
- [ ] Pole tekstowe do wklejenia RAW z notatnika
- [ ] Upload pliku CSV
- [ ] Automatyczna detekcja formatu
- [ ] Walidacja per-linia z raportem błędów
- [ ] Append mode (dodawanie do istniejących)
- [ ] Deduplikacja po timestamp

### Persistence
- [ ] localStorage CRUD
- [ ] Eksport danych do CSV
- [ ] Potwierdzenie przed usunięciem

### UI/UX
- [ ] Dark/Light mode toggle z persistence
- [ ] Nawigacja tabami (Import / Dashboard / Tabela / Raport)
- [ ] Responsywność (mobile, tablet, desktop)
- [ ] Komunikaty błędów po polsku
- [ ] Skeleton loaders podczas ładowania
- [ ] Toast notifications

### Export
- [ ] PNG per wykres (Plotly.downloadImage)
- [ ] Print/PDF z dedykowanym @media print CSS
- [ ] **Wybór segmentów do eksportu** - checkboxy przy każdym wykresie
- [ ] Eksport zbiorczy wybranych wykresów (np. 3 z 5)
- [ ] Ukrywanie niewybranch sekcji w print view

### Raport dla lekarza
- [ ] Statystyki: slope, p-value, % zmiana
- [ ] Porównanie pierwsza/druga połowa okresu
- [ ] Interpretacje tekstowe po polsku
- [ ] Sekcje: Skuteczność GAD, Stabilność ADHD, Czynniki zakłócające, Wnioski

---

## Paleta Kolorów

### Light Mode
```css
--bg-primary: #F8FAFC;
--bg-card: #FFFFFF;
--bg-hover: #F1F5F9;
--text-primary: #1E293B;
--text-secondary: #64748B;
--border: #E2E8F0;
--accent-blue: #3B82F6;
--accent-green: #10B981;
--accent-red: #EF4444;
--accent-amber: #F59E0B;
--accent-purple: #8B5CF6;
```

### Dark Mode
```css
--bg-primary: #0F172A;
--bg-card: #1E293B;
--bg-hover: #334155;
--text-primary: #F1F5F9;
--text-secondary: #94A3B8;
--border: #334155;
/* accenty bez zmian */
```

---

## Browser Support
- Chrome (ostatnie 2 wersje)
- Safari (ostatnie 2 wersje)
- Firefox (ostatnie 2 wersje)

## Constraints
- **JEDEN plik HTML** (wszystko inline)
- **100% lokalnie** (zero server calls)
- CDN dla bibliotek (internet wymagany przy pierwszym ładowaniu)

