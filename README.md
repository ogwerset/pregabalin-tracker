# Symptom Tracker Dashboard v4.5.0

Modern, modularny dashboard do wizualizacji i analizy danych zdrowotnych z zaawansowanymi wykresami i raportami.

## ✨ Nowości w v4.5.0

- ⏱️ **Przełączniki czasowe**: Dropdown do wyboru zakresu czasowego (Dzisiaj / Ten tydzień / Ten miesiąc / Cały okres)
- 📊 **Selektywne filtrowanie**: Niektóre wykresy reagują na filtr czasowy (trajektoria, stacked area, trend), inne zawsze pokazują cały okres (korelacje, porównania)
- 🎯 **Inteligentna logika**: Wykresy wymagające dużej próbki (korelacje, porównania) zawsze używają pełnych danych
- 🔄 **Dynamiczne odświeżanie**: Wykresy automatycznie aktualizują się przy zmianie zakresu czasowego
- 📍 **Selektor w headerze**: Selektor zakresu czasu przeniesiony do headera (widoczny tylko na dashboardzie)
- 📅 **Ukryta data/czas na dashboardzie**: Data i czas są ukryte na dashboardzie, widoczne na innych podstronach
- 📌 **Sticky header**: Header pozostaje na górze ekranu podczas przewijania na wszystkich podstronach

## Poprzednie wersje

### v4.4.0

- 🌿 **Cannabis Tracking**: Nowe pole Weed w CSV do śledzenia marihuany
- 📊 **Nowy wykres**: Korelacja marihuany z objawami (porównanie dni z/bez)
- 📋 **Templatka CSV**: Rozwijana sekcja z instrukcją i pobieraniem templatki
- 🕐 **Live datetime**: Wyświetlacz daty i godziny w headerze (polski format)
- 📈 **Naprawiony wykres**: Stacked Area teraz używa overlay zamiast sumowania
- 🐛 **Naprawiony PDF**: Poprawiony błąd inicjalizacji jsPDF
- 🔘 **Mniejszy przycisk PDF**: Kompaktowy przycisk eksportu w raporcie
- 📊 **Pełna analiza ADHD**: Dodana logika oceniania energii i fokusu dla lekarza w raporcie

## Poprzednie wersje

### v4.3.0

- 🎨 **Ciemniejsze tło**: Cursor-like dark theme (#252525) dla lepszej czytelności
- ⬅️ **Przycisk powrotu**: Strzałka powrotu do startu (tylko ikona, bez tekstu)
- 💊 **Nowe logo**: Abstrakcyjna kapsułka zamiast krzyża medycznego
- 📥 **Redesign importu**: Textarea jako główny element, przycisk pliku poniżej
- 📤 **Panel eksportu**: Przyciski szybkiego wyboru (Zaznacz wszystkie/Odznacz wszystkie)
- 📊 **Dwa nowe wykresy**: Zależność objawów od Elvanse i Pregabaliny
- 📋 **Zamrożone kolumny**: Data i Czas w tabeli pozostają widoczne przy przewijaniu
- 🖼️ **Pełnoekranowe wykresy**: Pełne tło, ukryty pasek narzędzi Plotly, auto-ukrywanie podpowiedzi o obrocie
- 🐛 **Naprawione podświetlanie**: Poprawiona logika kolorów w raporcie dla lekarza

## Poprzednie wersje

### v4.2.0
- 🐛 **Naprawione renderowanie**: Dodany brakujący catch block w wykresie farmakokinetyki
- 🔗 **Naprawiona nawigacja**: Poprawiony link z landing page do tabeli danych
- 🍔 **Menu backdrop**: Dodany element backdrop dla menu mobilnego
- ⬅️ **Pozycjonowanie przycisku**: Przycisk powrotu przeniesiony na prawo od hamburgera

### v4.0.0
- 🎨 **Liquid Glass UI**: Nowa estetyka inspirowana iOS 26 z glassmorphism i blur effects
- 📱 **Naprawiony iOS Safari**: Poprawiony viewport bug (110% zoom) i overflow issues
- 🍔 **Ulepszone menu mobilne**: Animacje, backdrop overlay, lepsze pozycjonowanie
- 📊 **Wykres Farmakokinetyki**: Nowy wykres pokazujący profil stężenia leków w czasie (0-24h)
- 📄 **Eksport Long Image**: Eksport wszystkich wykresów jako jeden długi obraz PNG
- 📑 **Eksport PDF**: Profesjonalny raport PDF dla lekarza z tabelami i statystykami
- 🏠 **Landing Page**: Piękna strona powitalna dla nowych użytkowników
- 📥 **Ulepszony Import**: Tabs (wklej/plik), drag & drop, lepsze feedback
- 🔒 **Anonimizacja**: Generyczne tytuły wykresów, konfigurowalny kontekst choroby
- 🐛 **Naprawione tygodnie**: Poprawione sortowanie tygodni na przełomie roku (ISO week)
- 📐 **Naprawione legendy**: Poprawione wyświetlanie legend w fullscreen view

### v2.5
- 🎨 **Przeprojektowane przyciski**: Ciemne guziki z kolorowymi akcentami (teal/coral)
- 📱 **Naprawione wykresy mobile**: Stałe wysokości, bez ucinania
- 📊 **Naprawiony raport dla lekarza**: Poprawione wyświetlanie macierzy korelacji
- 🔤 **Lepsza czytelność**: Jaśniejsze tytuły wykresów
- 📋 **Poprawiona tabela mobile**: Równe szerokości kolumn
- 🏷️ **Numer wersji**: Widoczny w stopce strony

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

- 📊 **15 wykresów analitycznych**: 
  - Trajektoria Głównych Objawów
  - Profil Dobowy Nasilenia
  - Stabilność Funkcjonowania Poznawczego
  - Stacked Area (Objawy w ciągu dnia)
  - Profil Stężenia Leków (farmakokinetyka - bazuje na rzeczywistych czasach przyjęcia)
  - **Zależność Objawów od Elvanse** (NOWY - Energia, Fokus, Klarowność)
  - **Zależność Objawów od Pregabaliny** (NOWY - Lęk, Napięcie)
  - **Wpływ Marihuany na Objawy** (NOWY v4.4.0 - porównanie dni z/bez)
  - Pozytywne vs Negatywne
  - Metryki per Pora Dnia
  - Analiza Snu
  - Macierz Korelacji
  - Sen vs Objawy Następnego Dnia
  - Trend z Wygładzeniem
  - Porównanie Tygodniowe (naprawione sortowanie)

- 📈 **Raport dla Lekarza**: 
  - Automatycznie generowany raport HTML
  - Analiza statystyczna (regresja, korelacje, p-values)
  - Tabela okresów 3-dniowych
  - Macierz korelacji
  - **Eksport do PDF** (NOWY - profesjonalny format)

- 💾 **Import Danych**: 
  - Format CSV z walidacją
  - Format tekstowy (RAW)
  - **Textarea jako główny element** (v4.3.0)
  - **Przycisk wczytywania pliku** (v4.3.0)
  - Auto-focus na textarea przy przejściu do zakładki
  - Edytowalny wpis leków i kontekstu choroby

- 📱 **Responsywny Design**: 
  - **Liquid Glass UI** (NOWY - iOS 26 style)
  - Hamburger menu z animacjami
  - Fullscreen wykresy (naprawione legendy)
  - Touch-friendly controls
  - **iOS safe-area support** (NOWY)

- 🖨️ **Eksport**: 
  - PNG dla pojedynczych wykresów
  - **Long Image PNG** (NOWY - wszystkie wykresy razem)
  - PDF dla raportu (z tabelami)
  - CSV dla danych
  - Print-friendly layout

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

- **Plotly.js Basic 2.27.0** - Wykresy interaktywne
- **jStat 1.9.6** - Obliczenia statystyczne (korelacje, regresja, p-values)
- **html2canvas 1.4.1** - Eksport długich obrazów (NOWY)
- **jsPDF 2.5.1 + autoTable** - Generowanie PDF (NOWY)
- **LocalStorage** - Persystencja danych
- **Vanilla JavaScript** - Zero zależności buildowych
- **CSS Variables + Glassmorphism** - Dynamiczne motywy z Liquid Glass

## Design System

Aplikacja używa ciepłego, medycznego design systemu:

### Kolory
- **Tło**: Ciemnoszare (#252525 - Cursor-like) z ciepłymi odcieniami
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
