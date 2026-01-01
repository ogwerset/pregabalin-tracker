# Pregabalina Tracker Dashboard v2.5

Modern, modularny dashboard do wizualizacji dawkowania pregabaliny i efektów leczenia GAD/ADHD.

## ✨ Nowości w v2.5

- 🎨 **Przeprojektowane przyciski**: Ciemne guziki z kolorowymi akcentami (teal/coral)
- 📱 **Naprawione wykresy mobile**: Stałe wysokości, bez ucinania
- 📊 **Naprawiony raport dla lekarza**: Poprawione wyświetlanie macierzy korelacji
- 🔤 **Lepsza czytelność**: Jaśniejsze tytuły wykresów
- 📋 **Poprawiona tabela mobile**: Równe szerokości kolumn
- 🏷️ **Numer wersji**: Widoczny w stopce strony

## Poprzednie wersje

### v2.4
- Usunięty dark/light mode toggle (domyślnie ciemny motyw)
- Naprawione skalowanie wykresów w druku PDF
- Poprawiona logika kolorów trendów w raporcie
- Naprawione dane macierzy korelacji (Klarowność)

### v2.1-2.3
- Nowa typografia (Merriweather + Inter)
- Responsywne wykresy z fullscreen overlay
- Edytowalny wpis leków w raporcie
- Hamburger menu z theme toggle

### v2.0
- Modularna struktura kodu
- Medyczny design system
- Naprawione event handling na mobile

## Funkcje

- 📊 **12 wykresów analitycznych**: 
  - Trajektoria GAD
  - Profil Dobowy
  - Stabilność ADHD
  - Stacked Area
  - Pozytywne vs Negatywne
  - Metryki per Pora Dnia
  - Analiza Snu
  - Macierz Korelacji
  - Sen vs Lęk
  - Rolling Average
  - Porównanie Tygodniowe

- 📈 **Raport dla Lekarza**: 
  - Automatycznie generowany raport
  - Analiza statystyczna
  - Tabela okresów 3-dniowych
  - Macierz korelacji
  - Eksport do PDF

- 💾 **Import Danych**: 
  - Format CSV
  - Format tekstowy z walidacją
  - Edytowalny wpis leków

- 📱 **Responsywny Design**: 
  - Hamburger menu na mobile
  - Fullscreen wykresy
  - Touch-friendly controls

- 🖨️ **Eksport**: 
  - PNG dla wykresów
  - PDF dla raportu
  - CSV dla danych

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
├── vercel.json             # Konfiguracja Vercel
└── README.md               # Dokumentacja
```

## Technologie

- **Plotly.js** - Wykresy interaktywne
- **jStat** - Obliczenia statystyczne (korelacje, regresja)
- **LocalStorage** - Persystencja danych
- **Vanilla JavaScript** - Zero zależności buildowych
- **CSS Variables** - Dynamiczne motywy

## Design System

Aplikacja używa ciepłego, medycznego design systemu:

### Kolory
- **Tło**: Ciepłe szarości (#1C1917 - #FAF9F7)
- **Akcent główny**: Warm Teal (#0D9488)
- **Akcent dodatkowy**: Coral (#F97316)
- **Info**: Medical Blue (#3B82F6)

### Typografia
- **Nagłówki**: Merriweather (serif)
- **UI/Body**: Inter (sans-serif)
- **Dane/Kod**: JetBrains Mono (monospace)

### Komponenty
- Border-radius: 8px (sm), 12px (md), 16px (lg)
- Shadows: Subtelne cienie dla głębi
- Transitions: 150-500ms ease

## Deploy

### Vercel (Zalecane)

```bash
git push origin main
```

Vercel automatycznie wykryje zmiany i wdroży nową wersję.

### Lokalny Development

```bash
# Po prostu otwórz w przeglądarce
open index.html

# Lub użyj lokalnego serwera
python -m http.server 8000
```

## Użycie

1. Otwórz aplikację w przeglądarce
2. Przejdź do zakładki **"Import Danych"**
3. Wklej dane w formacie CSV lub tekstowym
4. Kliknij **"Importuj"**
5. Przejrzyj wykresy w zakładce **"Dashboard"**
6. Wygeneruj raport w zakładce **"Raport dla Lekarza"**
7. Eksportuj wykresy lub raport do PDF

## Licencja

Prywatny projekt - do użytku osobistego.
