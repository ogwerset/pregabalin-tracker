# Pregabalin Tracker Dashboard v2.0

Modern, modular dashboard do wizualizacji dawkowania pregabaliny i efektów leczenia GAD/ADHD.

## ✨ Nowości w v2.0

- 🎨 **Nowy Design System**: Medyczny, czysty design z paletą szarości i medycznego teal/niebieskiego
- 📱 **Naprawione Problemy Mobilne**: Wszystkie przyciski działają poprawnie na urządzeniach dotykowych
- 🏗️ **Modularna Struktura**: Kod podzielony na osobne pliki (CSS, JS) dla lepszej utrzymywalności
- 📊 **Responsywne Wykresy**: Automatyczne dostosowanie do zmiany rozmiaru okna (ResizeObserver)
- 🎯 **Ulepszona Kolorystyka**: Wykresy używają medycznej palety kolorów

## Funkcje

- 📊 **12 wykresów analitycznych**: Trajektoria GAD, Profil Dobowy, Stabilność ADHD, Stacked Area, Korelacje, Sen vs Objawy, Rolling Average, Porównanie Tygodniowe, Pozytywne vs Negatywne, Metryki per Pora Dnia
- 📈 **Raport dla Lekarza**: Automatycznie generowany raport z analizą statystyczną i tabelą okresów 3-dniowych
- 💾 **Import Danych**: Wsparcie dla CSV i tekstowego formatu z walidacją
- 🎨 **Dark/Light Mode**: Przełączanie motywów z zapisem preferencji
- 📱 **Responsywny Design**: W pełni funkcjonalny na desktop i mobile
- 🖨️ **Eksport**: PNG dla wykresów, PDF dla raportu, CSV dla danych

## Struktura Projektu

```
pregabalin-tracker/
├── index.html              # Główny plik HTML
├── css/
│   ├── variables.css       # Design tokens (kolory, spacing, shadows)
│   └── styles.css          # Style komponentów
├── js/
│   ├── config.js           # Konfiguracja
│   ├── data-parser.js      # Parsowanie danych
│   ├── data-store.js       # Zarządzanie localStorage
│   ├── stats-engine.js     # Obliczenia statystyczne
│   ├── chart-renderer.js   # Renderowanie wykresów Plotly
│   ├── table-manager.js    # Zarządzanie tabelą danych
│   ├── doctor-report.js    # Generowanie raportu
│   ├── ui-controller.js    # Kontroler UI i event handling
│   └── app.js              # Inicjalizacja aplikacji
└── vercel.json              # Konfiguracja Vercel
```

## Użycie

1. Otwórz `index.html` w przeglądarce lub wdróż na Vercel
2. Zaimportuj dane w zakładce "Import Danych"
3. Przejrzyj wykresy w zakładce "Dashboard"
4. Wygeneruj raport w zakładce "Raport dla Lekarza"

## Technologie

- **Plotly.js** - Wykresy interaktywne
- **jStat** - Obliczenia statystyczne
- **LocalStorage** - Persystencja danych
- **Vanilla JavaScript** - Zero zależności buildowych
- **CSS Variables** - Dynamiczne motywy

## Design System

Aplikacja używa nowoczesnego, medycznego design systemu:

- **Kolory podstawowe**: Szarości (neutralne) + Medyczny Teal (#14B8A6) + Medyczny Niebieski (#3B82F6)
- **Typografia**: Outfit (UI) + JetBrains Mono (dane)
- **Spacing**: Systematyczny spacing scale
- **Shadows**: Subtelne cienie dla głębi
- **Responsywność**: Mobile-first approach

## Deploy

### Vercel (Zalecane)

Projekt jest skonfigurowany do automatycznego deploy na Vercel:

```bash
git push origin main
```

Vercel automatycznie wykryje zmiany i wdroży nową wersję.

### Lokalny Development

Po prostu otwórz `index.html` w przeglądarce. Wszystkie zależności są ładowane z CDN.

## Changelog

### v2.0 (2025)
- Refaktoryzacja do modułowej struktury
- Nowy design system z medyczną paletą kolorów
- Naprawione problemy z event handling na mobile
- Dodany ResizeObserver dla responsywnych wykresów
- Ulepszona kolorystyka wykresów
- Poprawione CSS dla hamburger menu

### v1.0
- Początkowa wersja single-file HTML

## Licencja

Prywatny projekt - do użytku osobistego.
